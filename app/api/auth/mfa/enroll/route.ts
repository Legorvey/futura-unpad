import { NextResponse } from "next/server";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { z } from "zod";

const noCacheHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

const enrollMfaSchema = z.object({
  password: z.string().min(1).optional(),
});

export async function POST(request: Request) {
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

  // Compound rate limiting bound to user ID
  const limit = await rateLimit(request, {
    key: `auth-mfa-enroll:${user.id}`,
    limit: 5,
    windowSeconds: 300,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
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

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.password,
    });

    if (reauthError) {
      return NextResponse.json(
        { error: "Kata sandi saat ini salah" },
        { status: 403, headers: noCacheHeaders }
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
    console.error("Error cleaning up previous unverified MFA factors:", cleanUpError);
  }

  // Enroll new TOTP factor
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    issuer: "Futura Unpad",
    friendlyName: user.email,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: noCacheHeaders }
    );
  }

  return NextResponse.json({ ok: true, data }, { headers: noCacheHeaders });
}
