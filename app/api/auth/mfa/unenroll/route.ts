import { NextResponse } from "next/server";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { z } from "zod";

const noCacheHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

const unenrollMfaSchema = z.object({
  factorId: z.string().uuid("ID faktor tidak valid"),
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
    key: `auth-mfa-unenroll:${user.id}`,
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

  // Re-verify password if email/password user
  const isPasswordUser =
    user.app_metadata?.provider === "email" ||
    user.identities?.some((id) => id.provider === "email");

  if (isPasswordUser) {
    if (!parsed.data.password) {
      return NextResponse.json(
        {
          error:
            "Kata sandi saat ini wajib diisi untuk mereset MFA",
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

  // Use service_role admin client to delete the factor cleanly
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.mfa.deleteFactor({
    id: parsed.data.factorId,
    userId: user.id,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: noCacheHeaders }
    );
  }

  return NextResponse.json({ ok: true, data }, { headers: noCacheHeaders });
}
