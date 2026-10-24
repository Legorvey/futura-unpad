import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/password-recovery";
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

  // CRITICAL SECURITY CHECK:
  // If the account has a verified MFA factor enrolled (`nextLevel === "aal2"`),
  // require AAL2 verification before allowing a password reset so an attacker
  // with email access alone cannot take over an MFA-protected admin account.
  const { data: aalData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2") {
    const mfaCode = parsed.data.mfaCode?.trim();
    if (!mfaCode || !/^\d{6}$/.test(mfaCode)) {
      return NextResponse.json(
        {
          error:
            "Akun ini dilindungi MFA. Masukkan 6 digit kode Google Authenticator Anda untuk mereset kata sandi.",
        },
        { status: 403 }
      );
    }

    const mfaAccountLimit = await rateLimit(user.id, {
      key: "auth-reset-password-mfa",
      limit: 5,
      windowSeconds: 300,
    });

    if (!mfaAccountLimit.success) {
      return rateLimited(mfaAccountLimit.retryAfter);
    }

    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const verifiedTotp = factorsData?.totp?.find(
      (f) => f.status === "verified"
    );

    if (!verifiedTotp) {
      return NextResponse.json(
        { error: "Faktor MFA aktif tidak ditemukan" },
        { status: 403 }
      );
    }

    const { error: mfaError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: verifiedTotp.id,
      code: mfaCode,
    });

    if (mfaError) {
      return NextResponse.json(
        { error: "Kode Google Authenticator salah atau telah kedaluwarsa" },
        { status: 403 }
      );
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error("Password reset failed", error.message);
    return NextResponse.json(
      { error: "Password update failed" },
      { status: 400 }
    );
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
