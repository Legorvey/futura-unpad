import { NextResponse } from "next/server";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "auth-forgot-password",
    limit: 4,
    windowSeconds: 300,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return body.response;
  }

  const parsed = forgotPasswordSchema.safeParse(body.data);

  if (!parsed.success) {
    return invalidRequest();
  }

  const requestUrl = new URL(request.url);
  const redirectUrl = new URL(
    "/auth/callback?next=/reset-password",
    process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin
  );

  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: redirectUrl.toString(),
  });

  if (error) {
    if (error.message.includes("User not found") || error.status === 404) {
      // Prevent user enumeration by silently returning success
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
