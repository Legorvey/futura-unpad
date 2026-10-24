import { NextResponse } from "next/server";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { cookies } from "next/headers";
import {
  AUTH_PERSISTENCE_COOKIE,
  SESSION_AUTH_PERSISTENCE,
} from "@/utils/supabase/auth-cookies";
import { sendSecurityEmail } from "@/lib/email";

const noCacheHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

const verifyMfaSchema = z.object({
  factorId: z.string().uuid("ID faktor tidak valid"),
  challengeId: z.string().uuid("ID challenge tidak valid").optional(),
  code: z.string().regex(/^\d{6}$/, "Kode verifikasi harus 6 digit angka"),
});

export async function POST(request: Request) {
  // IP-level rate limiting to prevent flood attacks
  const ipLimit = await rateLimit(request, {
    key: "auth-mfa-verify-ip",
    limit: 10,
    windowSeconds: 60,
  });

  if (!ipLimit.success) {
    return rateLimited(ipLimit.retryAfter);
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const parsed = verifyMfaSchema.safeParse(body.data);
  if (!parsed.success) {
    return invalidRequest();
  }

  // Preserve user's auth cookie persistence preference (session-only vs persistent)
  const cookieStore = await cookies();
  const isSessionOnly =
    cookieStore.get(AUTH_PERSISTENCE_COOKIE)?.value === SESSION_AUTH_PERSISTENCE;

  const supabase = await createClient({
    authCookiePersistence: isSessionOnly ? "session" : "persistent",
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sesi tidak valid atau telah berakhir" },
      {
        status: 401,
        headers: noCacheHeaders,
      }
    );
  }

  // Account-level rate limiting (anti-bruteforce across distributed IPs/proxies)
  // Max 5 attempts per 5 minutes per user account
  const accountLimit = await rateLimit(user.id, {
    key: "auth-mfa-verify-account",
    limit: 5,
    windowSeconds: 300,
  });

  if (!accountLimit.success) {
    return rateLimited(accountLimit.retryAfter);
  }

  // Verify the user is an authorized administrator
  const { data: adminRecord, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    return NextResponse.json(
      { error: "Akses ditolak" },
      {
        status: 403,
        headers: noCacheHeaders,
      }
    );
  }

  let challengeId = parsed.data.challengeId;
  if (!challengeId) {
    const challenge = await supabase.auth.mfa.challenge({
      factorId: parsed.data.factorId,
    });
    if (challenge.error) {
      console.error("MFA challenge failed:", challenge.error.message);
      return NextResponse.json(
        { error: "Gagal membuat tantangan verifikasi MFA" },
        {
          status: 400,
          headers: noCacheHeaders,
        }
      );
    }
    challengeId = challenge.data.id;
  }

  const { data, error } = await supabase.auth.mfa.verify({
    factorId: parsed.data.factorId,
    challengeId,
    code: parsed.data.code,
  });

  if (error) {
    return NextResponse.json(
      { error: "Kode verifikasi salah atau telah kedaluwarsa" },
      {
        status: 401,
        headers: noCacheHeaders,
      }
    );
  }

  // Send audit alert email so unauthorized factor enrollment is immediately detected by the owner
  if (user.email) {
    const appOrigin =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://futuraunpad.com";

    sendSecurityEmail({
      to: user.email,
      subject: "Peringatan Keamanan: Autentikator MFA Baru Berhasil Didaftarkan",
      title: "Autentikator MFA Baru Didaftarkan",
      message: `Sebuah perangkat Google Authenticator baru saja berhasil didaftarkan dan diaktifkan pada akun administrator Anda (${user.email}). Jika ini dilakukan oleh Anda, Anda dapat mengabaikan email ini.`,
      actionText: "Bukan Anda? Pulihkan Akun Segera",
      actionUrl: `${appOrigin}/forgot-password`,
    }).catch((err) => console.error("Error sending MFA enrollment alert email:", err));
  }

  return NextResponse.json(
    { ok: true, data },
    { headers: noCacheHeaders }
  );
}
