import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { readJsonBody, invalidRequest } from "@/lib/http";
import { z } from "zod";
import { sendSecurityEmail } from "@/lib/email";

const resetTargetSchema = z.object({
  targetUserId: z.string().uuid("ID pengguna tidak valid"),
});

export async function POST(request: Request) {
  // CRITICAL ACCESS CONTROL:
  // Only an active administrator session at AAL2 can invoke administrative MFA resets.
  const { user: operatorUser, adminAccess } = await requireAdmin();

  if (!adminAccess || !operatorUser) {
    return NextResponse.json(
      { error: "Akses ditolak. Tindakan ini memerlukan otentikasi administrator tingkat tinggi (AAL2)." },
      { status: 403 }
    );
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const parsed = resetTargetSchema.safeParse(body.data);
  if (!parsed.success) {
    return invalidRequest();
  }

  const adminClient = createAdminClient();

  // Verify that target user is an administrator
  const { data: targetAdmin, error: adminQueryError } = await adminClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", parsed.data.targetUserId)
    .maybeSingle();

  if (adminQueryError || !targetAdmin) {
    return NextResponse.json(
      { error: "Pengguna target bukan administrator atau tidak ditemukan." },
      { status: 404 }
    );
  }

  // Fetch target user's email for notification
  const { data: targetUserData } = await adminClient.auth.admin.getUserById(
    parsed.data.targetUserId
  );

  // List and delete all existing MFA factors for target administrator
  const { data: factorsData, error: factorsError } =
    await adminClient.auth.admin.mfa.listFactors({
      userId: parsed.data.targetUserId,
    });

  if (factorsError) {
    console.error("Failed to list target admin MFA factors:", factorsError.message);
    return NextResponse.json(
      { error: "Gagal mengambil daftar faktor MFA target." },
      { status: 500 }
    );
  }

  let deletedCount = 0;
  if (factorsData?.factors) {
    for (const factor of factorsData.factors) {
      await adminClient.auth.admin.mfa.deleteFactor({
        id: factor.id,
        userId: parsed.data.targetUserId,
      });
      deletedCount++;
    }
  }

  // Send security notification to target administrator
  const targetEmail = targetUserData?.user?.email;
  if (targetEmail) {
    const appOrigin =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://futuraunpad.com";

    sendSecurityEmail({
      to: targetEmail,
      subject: "Pemberitahuan: MFA Administrator Telah Direset oleh Operator",
      title: "MFA Direset oleh Operator Sistem",
      message: `Autentikasi Dua Faktor (Google Authenticator) pada akun administrator Anda (${targetEmail}) telah direset oleh operator sistem (${operatorUser.email}). Anda wajib mendaftarkan autentikator baru pada saat masuk berikutnya.`,
      actionText: "Masuk ke Futura",
      actionUrl: `${appOrigin}/login`,
    }).catch((err) => console.error("Error sending operator reset notification:", err));
  }

  return NextResponse.json({
    ok: true,
    deletedFactors: deletedCount,
    message: "Faktor MFA administrator berhasil direset.",
  });
}
