import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import { emailSchema } from "@/lib/validation";
import { z } from "zod";

const verifyOtpSchema = z.object({
  email: emailSchema,
  token: z.string().trim().min(1).max(32),
  type: z.enum(["signup", "recovery", "email_change"]).optional().default("signup"),
});

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "auth-verify-otp",
    limit: 10,
    windowSeconds: 300,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const parsed = verifyOtpSchema.safeParse(body.data);
  if (!parsed.success) {
    return invalidRequest();
  }

  const { email, token, type } = parsed.data;

  try {
    const emailLimit = await rateLimit(email, {
      key: "auth-verify-otp-account",
      limit: 10,
      windowSeconds: 300,
    });

    if (!emailLimit.success) {
      return rateLimited(emailLimit.retryAfter);
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });

    if (error) {
      return NextResponse.json(
        { error: "Kode OTP tidak valid atau telah kedaluwarsa" },
        { status: 400 }
      );
    }

    if (type === "signup") {
      // Successfully verified. We want them to log in manually, so we sign out the session
      await supabase.auth.signOut();

      const response = NextResponse.json({ ok: true });

      // Set a secure, short-lived flash cookie to display the success message on the login page
      // This prevents URL spoofing attacks (e.g. attacker sending /login?verified=true)
      response.cookies.set("email_verified_flash", "1", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30, // Expires in 30 seconds
        path: "/login",
      });

      return response;
    }

    // For recovery, we want them to stay signed in so they can access /reset-password
    // Do not expose raw tokens/session in JSON response body
    const response = NextResponse.json({ ok: true });

    if (type === "recovery") {
      const {
        PASSWORD_RECOVERY_COOKIE,
        PASSWORD_RECOVERY_MAX_AGE_SECONDS,
        passwordRecoveryCookieOptions,
      } = await import("@/lib/password-recovery");
      response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", {
        ...passwordRecoveryCookieOptions,
        maxAge: PASSWORD_RECOVERY_MAX_AGE_SECONDS,
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
