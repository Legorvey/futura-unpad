import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/password-recovery";
import { rateLimit } from "@/lib/rate-limit";
import {
  createClient,
  createAdminClient,
  createStatelessClient,
} from "@/utils/supabase/server";
import { z } from "zod";
import { sendSecurityEmail } from "@/lib/email";

const noCacheHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

const unenrollMfaSchema = z.object({
  factorId: z.string().uuid("ID faktor tidak valid"),
  password: z.string().min(1).max(128).optional(),
  code: z.string().regex(/^\d{6}$/, "Kode verifikasi harus 6 digit angka").optional(),
});

export async function POST(request: Request) {
  // IP-level rate limiting against flood attacks
  const ipLimit = await rateLimit(request, {
    key: "auth-mfa-unenroll-ip",
    limit: 10,
    windowSeconds: 300,
  });

  if (!ipLimit.success) {
    return rateLimited(ipLimit.retryAfter);
  }

  const cookieStore = await cookies();
  if (cookieStore.has(PASSWORD_RECOVERY_COOKIE)) {
    return NextResponse.json(
      {
        error:
          "Pengaturan ulang MFA tidak diizinkan selama sesi pemulihan kata sandi.",
      },
      { status: 403, headers: noCacheHeaders }
    );
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

  // Account-level rate limiting bound strictly to user ID
  const accountLimit = await rateLimit(user.id, {
    key: "auth-mfa-unenroll-account",
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

  const parsed = unenrollMfaSchema.safeParse(body.data);
  if (!parsed.success) {
    return invalidRequest();
  }

  // CRITICAL SECURITY ENFORCEMENT:
  // Only an active AAL2 session can unenroll / reset an MFA factor.
  // An attacker with only the password (AAL1) cannot unenroll MFA.
  const { data: aalData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalData?.currentLevel !== "aal2") {
    return NextResponse.json(
      {
        error:
          "Operasi ini memerlukan verifikasi dua langkah (AAL2) yang aktif.",
      },
      { status: 403, headers: noCacheHeaders }
    );
  }

  // Verify the user is an admin
  const { data: adminRecord, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    return NextResponse.json(
      { error: "Hanya akun administrator yang dapat mengubah status MFA" },
      { status: 403, headers: noCacheHeaders }
    );
  }

  // Verify the factor actually belongs to this authenticated user before step-up
  const { data: factorsData, error: factorsError } =
    await supabase.auth.mfa.listFactors();
  const ownsFactor = factorsData?.all?.some(
    (factor) => factor.id === parsed.data.factorId
  );

  if (factorsError || !ownsFactor) {
    return NextResponse.json(
      { error: "Faktor autentikasi tidak ditemukan pada akun ini" },
      { status: 404, headers: noCacheHeaders }
    );
  }

  // Re-verify credentials:
  // - Email/password admins must confirm their current password (verified via a
  //   stateless client so the active AAL2 session cookie is never downgraded).
  // - OAuth-only admins must confirm with a live 6-digit TOTP code so unenrollment
  //   never occurs with zero step-up verification.
  const isPasswordUser =
    user.app_metadata?.provider === "email" ||
    user.identities?.some((id) => id.provider === "email");

  if (isPasswordUser) {
    if (!parsed.data.password) {
      return NextResponse.json(
        {
          error: "Kata sandi saat ini wajib diisi untuk mereset MFA",
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
    if (!parsed.data.code) {
      return NextResponse.json(
        {
          error:
            "Kode 6 digit dari Google Authenticator wajib diisi untuk mereset MFA",
        },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const { error: totpError } =
      await supabase.auth.mfa.challengeAndVerify({
        factorId: parsed.data.factorId,
        code: parsed.data.code,
      });

    if (totpError) {
      return NextResponse.json(
        { error: "Kode Google Authenticator salah atau telah kedaluwarsa" },
        { status: 403, headers: noCacheHeaders }
      );
    }
  }

  // Use service_role admin client to delete the factor cleanly
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.mfa.deleteFactor({
    id: parsed.data.factorId,
    userId: user.id,
  });

  if (error) {
    console.error("MFA unenroll failed:", error.message);
    return NextResponse.json(
      { error: "Gagal mengatur ulang MFA. Silakan coba lagi." },
      { status: 400, headers: noCacheHeaders }
    );
  }

  // Send audit alert email so unauthorized factor unenrollment is immediately detected
  if (user.email) {
    const appOrigin =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://futuraunpad.com";

    sendSecurityEmail({
      to: user.email,
      subject: "Peringatan Keamanan: MFA Telah Dihapus dari Akun Anda",
      title: "Autentikasi Dua Faktor Dihapus",
      message: `Faktor Google Authenticator pada akun administrator Anda (${user.email}) telah berhasil dihapus. Anda akan diminta untuk mendaftarkan faktor baru saat masuk berikutnya.`,
      actionText: "Bukan Anda? Amankan Akun",
      actionUrl: `${appOrigin}/forgot-password`,
    }).catch((err) => console.error("Error sending MFA unenroll alert email:", err));
  }

  return NextResponse.json({ ok: true, data }, { headers: noCacheHeaders });
}
