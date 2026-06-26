import { NextResponse } from "next/server";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";
import {
  AUTH_PERSISTENCE_COOKIE,
  SESSION_AUTH_PERSISTENCE,
  authPersistenceCookieOptions,
  getAuthCookiePersistence,
} from "@/utils/supabase/auth-cookies";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "auth-login",
    limit: 8,
    windowSeconds: 60,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return body.response;
  }

  const parsed = loginSchema.safeParse(body.data);

  if (!parsed.success) {
    return invalidRequest();
  }

  const keepSignedIn = parsed.data.keepSignedIn ?? true;

  const supabase = await createClient({
    authCookiePersistence: getAuthCookiePersistence(keepSignedIn),
  });
  
  let email = parsed.data.identifier;
  if (!email.includes('@')) {
    const { data: resolvedEmail } = await supabase.rpc('get_email_by_username', { p_username: parsed.data.identifier.toLowerCase() });
    if (!resolvedEmail) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }
    email = resolvedEmail;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const cookieStore = await cookies();

  if (keepSignedIn) {
    cookieStore.set(AUTH_PERSISTENCE_COOKIE, "", {
      ...authPersistenceCookieOptions,
      maxAge: 0,
    });
  } else {
    cookieStore.set(
      AUTH_PERSISTENCE_COOKIE,
      SESSION_AUTH_PERSISTENCE,
      authPersistenceCookieOptions
    );
  }

  return NextResponse.json({ ok: true });
}
