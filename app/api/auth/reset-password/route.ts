import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import {
  PASSWORD_RECOVERY_COOKIE,
  passwordRecoveryCookieOptions,
} from "@/lib/password-recovery";
import { rateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validation";
import {
  AUTH_PERSISTENCE_COOKIE,
  authPersistenceCookieOptions,
} from "@/utils/supabase/auth-cookies";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "auth-reset-password",
    limit: 6,
    windowSeconds: 300,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return body.response;
  }

  const parsed = resetPasswordSchema.safeParse(body.data);

  if (!parsed.success) {
    return invalidRequest();
  }

  const cookieStore = await cookies();
  const hasRecoveryContext = cookieStore.has(PASSWORD_RECOVERY_COOKIE);

  if (!hasRecoveryContext) {
    return NextResponse.json(
      { error: "Reset link is invalid or expired" },
      { status: 403 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const response = NextResponse.json(
      { error: "Reset link is invalid or expired" },
      { status: 401 }
    );
    response.cookies.delete(PASSWORD_RECOVERY_COOKIE);
    return response;
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error("Password reset failed", error.message);
    return NextResponse.json({ error: "Password update failed" }, { status: 400 });
  }

  await supabase.auth.signOut();

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(PASSWORD_RECOVERY_COOKIE);
  response.cookies.set(AUTH_PERSISTENCE_COOKIE, "", {
    ...authPersistenceCookieOptions,
    maxAge: 0,
  });

  return response;
}
