import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import {
  PASSWORD_RECOVERY_COOKIE,
  verifyPasswordRecoveryToken,
} from "@/lib/password-recovery";
import { rateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validation";
import {
  AUTH_PERSISTENCE_COOKIE,
  authPersistenceCookieOptions,
} from "@/utils/supabase/auth-cookies";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { sendSecurityEmail } from "@/lib/email";

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
  const recoveryCookie = cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    const response = NextResponse.json(
      { error: "Reset link is invalid or expired" },
      { status: 401 }
    );
    response.cookies.delete(PASSWORD_RECOVERY_COOKIE);
    return response;
  }

  // SECURE USER-BOUND RECOVERY VALIDATION:
  // Validate the recovery cookie against an unforgeable, user-bound HMAC token.
  // A forged client-side cookie or mismatched user ID is strictly rejected.
  if (!verifyPasswordRecoveryToken(recoveryCookie, user.id)) {
    const response = NextResponse.json(
      { error: "Reset link is invalid or expired" },
      { status: 403 }
    );
    response.cookies.delete(PASSWORD_RECOVERY_COOKIE);
    return response;
  }

  // STEP-UP REQUIRED BEFORE PASSWORD CHANGE AND FACTOR EVICTION:
  // Control of the mailbox (or of the password alone) is not proof of possession of
  // the enrolled authenticator. Without a live second-factor proof here, knowledge of
  // the password would be enough to strip MFA and bind an attacker-controlled device.
  const { data: factorsList } = await supabase.auth.mfa.listFactors();
  const verifiedFactors =
    factorsList?.all?.filter((factor) => factor.status === "verified") ?? [];

  if (verifiedFactors.length > 0) {
    const mfaCode = parsed.data.mfaCode;

    if (!mfaCode) {
      return NextResponse.json(
        { error: "Kode autentikator wajib diisi", requiresMfa: true },
        { status: 401 }
      );
    }

    const { error: mfaVerifyError } =
      await supabase.auth.mfa.challengeAndVerify({
        factorId: verifiedFactors[0].id,
        code: mfaCode,
      });

    if (mfaVerifyError) {
      return NextResponse.json(
        {
          error: "Kode autentikator salah atau telah kedaluwarsa",
          requiresMfa: true,
        },
        { status: 403 }
      );
    }
  }

  // Update password using the authenticated recovery session
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

  // SELF-SERVICE RECOVERY & FACTOR RESET:
  // Reached only after the caller has proven possession of the enrolled authenticator,
  // so an attacker holding the password alone can never evict MFA and re-enroll.
  const adminClient = createAdminClient();
  try {
    const { data: factorsData } = await adminClient.auth.admin.mfa.listFactors({
      userId: user.id,
    });

    if (factorsData?.factors) {
      for (const factor of factorsData.factors) {
        await adminClient.auth.admin.mfa.deleteFactor({
          id: factor.id,
          userId: user.id,
        });
      }
    }
  } catch (mfaCleanUpError) {
    console.error(
      "Failed to clean up MFA factors during password reset:",
      mfaCleanUpError
    );
  }

  // Invalidate all active sessions so any compromised tokens are immediately revoked
  await supabase.auth.signOut();

  // Send security notification email
  const appOrigin =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://futuraunpad.com";

  sendSecurityEmail({
    to: user.email,
    subject: "Peringatan Keamanan: Kata Sandi Futura Berhasil Direset",
    title: "Kata Sandi Berhasil Direset",
    message: `Kata sandi akun Anda (${user.email}) telah berhasil diperbarui melalui tautan pemulihan email. Semua sesi aktif telah direset untuk keamanan. Silakan masuk kembali dengan kata sandi baru Anda.`,
    actionText: "Masuk ke Futura",
    actionUrl: `${appOrigin}/login`,
  }).catch((err) => console.error("Error sending password reset alert email:", err));

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(PASSWORD_RECOVERY_COOKIE);
  response.cookies.set(AUTH_PERSISTENCE_COOKIE, "", {
    ...authPersistenceCookieOptions,
    maxAge: 0,
  });

  return response;
}
