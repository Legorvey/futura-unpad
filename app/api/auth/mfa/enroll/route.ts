import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import {
  PASSWORD_RECOVERY_COOKIE,
  verifyPasswordRecoveryToken,
} from "@/lib/password-recovery";
import { rateLimit } from "@/lib/rate-limit";
import {
  createClient,
  createAdminClient,
  createStatelessClient,
} from "@/utils/supabase/server";
import { z } from "zod";

const noCacheHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

const enrollMfaSchema = z.object({
  password: z.string().min(1).max(128).optional(),
});

export async function POST(request: Request) {
  // IP-level rate limiting against flood attacks
  const ipLimit = await rateLimit(request, {
    key: "auth-mfa-enroll-ip",
    limit: 10,
    windowSeconds: 300,
  });

  if (!ipLimit.success) {
    return rateLimited(ipLimit.retryAfter);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json(
      { error: "Sesi tidak valid atau telah berakhir" },
      { status: 401, headers: noCacheHeaders }
    );
  }

  const cookieStore = await cookies();
  const recoveryCookie = cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value;
  if (verifyPasswordRecoveryToken(recoveryCookie, user.id)) {
    return NextResponse.json(
      {
        error:
          "Pendaftaran MFA tidak diizinkan selama sesi pemulihan kata sandi.",
      },
      { status: 403, headers: noCacheHeaders }
    );
  }

  // Account-level rate limiting bound strictly to user ID (anti-distributed brute force)
  const accountLimit = await rateLimit(user.id, {
    key: "auth-mfa-enroll-account",
    limit: 5,
    windowSeconds: 300,
  });

  if (!accountLimit.success) {
    return rateLimited(accountLimit.retryAfter);
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const parsed = enrollMfaSchema.safeParse(body.data);
  if (!parsed.success) {
    return invalidRequest();
  }

  // Verify the user is an admin
  const { data: adminRecord, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    return NextResponse.json(
      { error: "Hanya akun administrator yang dapat mendaftarkan MFA" },
      { status: 403, headers: noCacheHeaders }
    );
  }

  // CRITICAL SECURITY CHECK (Anti-hijacking / anti-overwrite):
  // If an active verified factor already exists, reject enrollment.
  // The user must unenroll their existing factor from an active AAL2 session first.
  const { data: aalData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalData?.nextLevel === "aal2") {
    return NextResponse.json(
      {
        error:
          "Akun ini sudah memiliki MFA aktif. Harap atur ulang MFA melalui profil admin jika ingin menggantinya.",
      },
      { status: 409, headers: noCacheHeaders }
    );
  }

  // If user signed up/logs in with password, require password re-authentication
  // using an isolated stateless client so active session cookies are not overwritten.
  const isPasswordUser =
    user.app_metadata?.provider === "email" ||
    user.identities?.some((id) => id.provider === "email");

  if (isPasswordUser) {
    if (!parsed.data.password) {
      return NextResponse.json(
        {
          error:
            "Kata sandi saat ini wajib diisi untuk verifikasi keamanan",
        },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const statelessSupabase = createStatelessClient();
    const { error: reauthError } =
      await statelessSupabase.auth.signInWithPassword({
        email: user.email,
        password: parsed.data.password,
      });

    if (reauthError) {
      return NextResponse.json(
        { error: "Kata sandi saat ini salah" },
        { status: 403, headers: noCacheHeaders }
      );
    }
  } else {
    // Enforce session freshness: for federated (e.g. Google OAuth) accounts without passwords,
    // ensure the authentication session was established recently (within the last 15 minutes).
    // This removes the window where a long-lived stolen session cookie can bind a permanent credential.
    const lastSignIn = user.last_sign_in_at
      ? new Date(user.last_sign_in_at).getTime()
      : 0;
    const isSessionFresh = Date.now() - lastSignIn < 15 * 60 * 1000;

    if (!isSessionFresh) {
      return NextResponse.json(
        {
          error:
            "Sesi autentikasi Anda telah kedaluwarsa untuk tindakan sensitif ini. Silakan keluar dan masuk kembali sebelum mendaftarkan MFA.",
        },
        { status: 401, headers: noCacheHeaders }
      );
    }
  }

  // Clean up ONLY dangling unverified factors from abandoned enrollment attempts.
  // NEVER delete verified factors!
  const adminClient = createAdminClient();
  try {
    const { data: adminFactors } = await adminClient.auth.admin.mfa.listFactors({
      userId: user.id,
    });

    if (adminFactors?.factors) {
      for (const factor of adminFactors.factors) {
        if (factor.status === "unverified") {
          await adminClient.auth.admin.mfa.deleteFactor({
            id: factor.id,
            userId: user.id,
          });
        }
      }
    }
  } catch (cleanUpError) {
    console.error(
      "Error cleaning up previous unverified MFA factors:",
      cleanUpError
    );
  }

  // Enroll new TOTP factor
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    issuer: "Futura Unpad",
    friendlyName: user.email,
  });

  if (error) {
    console.error("MFA enrollment failed:", error.message);
    return NextResponse.json(
      { error: "Gagal memulai pendaftaran MFA. Silakan coba lagi." },
      { status: 400, headers: noCacheHeaders }
    );
  }

  return NextResponse.json({ ok: true, data }, { headers: noCacheHeaders });
}
