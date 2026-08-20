"use server";

import { createAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { Resend } from "resend";

import { z } from "zod";

const updateStatusSchema = z.object({
    id: z.string().min(1),
    status: z.enum(["pending", "approved", "revision"]),
    rejectionReason: z.string().optional(),
}).refine((data) => {
    if (data.status === "revision") {
        return data.rejectionReason && data.rejectionReason.trim().length > 0;
    }
    return true;
}, {
    message: "Catatan revisi wajib diisi saat menolak pendaftaran",
    path: ["rejectionReason"],
});

export async function updateMechaturaRegistrationStatus(
    id: string, 
    status: "pending" | "approved" | "revision",
    rejectionReason?: string
) {
    const parseResult = updateStatusSchema.safeParse({ id, status, rejectionReason });
    if (!parseResult.success) {
        return { error: parseResult.error.issues[0].message };
    }

    const { user, adminAccess } = await requireAdmin();
    if (!user || !adminAccess) {
        return { error: "Unauthorized" };
    }

    const adminSupabase = createAdminClient();
    
    // Fetch team details for the email
    const { data: teamData, error: teamFetchError } = await adminSupabase
        .from("mechatura_teams")
        .select(`
            category,
            mechatura_members (
                user_id,
                is_leader
            )
        `)
        .eq("id", id)
        .single();
        
    if (teamFetchError || !teamData) {
        console.error("Failed to fetch team data for email:", teamFetchError);
        return { error: "Gagal mengambil data tim" };
    }
    
    const leaderUserId = teamData.mechatura_members?.find((m: any) => m.is_leader)?.user_id;
    let leaderEmail: string | undefined;

    if (leaderUserId) {
        try {
            const { data: userData } = await adminSupabase.auth.admin.getUserById(leaderUserId);
            if (userData?.user?.email) {
                leaderEmail = userData.user.email;
            }
        } catch (e) {
            console.error("Failed to fetch leader email from auth:", e);
        }
    }

    const updatePayload: any = {
        admin_approval_status: status,
    };
    if (status === "approved") {
        updatePayload.payment_status = "verified";
    } else if (status === "revision") {
        updatePayload.submission_status = "draft";
        updatePayload.admin_rejection_reason = rejectionReason || null;
    }

    const { error } = await adminSupabase
        .from("mechatura_teams")
        .update(updatePayload)
        .eq("id", id);

    if (error) {
        console.error("Failed to update status:", error);
        return { error: "Failed to update team approval status" };
    }
    
    // Send email notification if a leader email exists
    if (leaderEmail && process.env.RESEND_API_KEY && (status === "approved" || status === "revision")) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const EMAIL_DOMAIN = "mail.futuraunpad.com";
        const isSumo = teamData.category === "robot_sumo";
        const competitionName = isSumo ? "Lomba Sumo" : "Lomba Transporter";
        const whatsappLink = isSumo 
            ? "https://chat.whatsapp.com/Ff7vl1HKcDRBVQAilgFfPY" 
            : "https://chat.whatsapp.com/KOPAHSahQAh9KnBgR4Ac9c";

        const baseHtml = (title: string, bodyContent: string) => `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
              body { 
                font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; 
                background-color: #f9fafb; 
                margin: 0; 
                padding: 40px 20px; 
                color: #171717; 
                -webkit-font-smoothing: antialiased;
              }
              .container { 
                max-width: 520px; 
                margin: 0 auto; 
                background: #ffffff; 
                border: 1px solid #e5e5e5;
                border-radius: 16px; 
                padding: 48px; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
              }
              .logo { 
                font-size: 28px; 
                font-weight: 800; 
                color: #000000; 
                margin-bottom: 40px; 
                letter-spacing: -0.05em; 
              }
              .content-title {
                font-size: 24px;
                font-weight: 700;
                color: #000000;
                margin-top: 0;
                margin-bottom: 16px;
                letter-spacing: -0.03em;
              }
              .content-text {
                font-size: 15px;
                line-height: 1.6;
                color: #404040;
                margin-bottom: 24px;
              }
              .footer { 
                margin-top: 48px; 
                font-size: 13px; 
                color: #737373; 
                text-align: center; 
                border-top: 1px solid #e5e5e5; 
                padding-top: 24px; 
              }
              .btn-container {
                margin: 32px 0;
              }
              .btn { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff; 
                text-decoration: none; 
                padding: 14px 28px; 
                border-radius: 8px; 
                font-weight: 600; 
                font-size: 15px;
                transition: all 0.2s ease;
              }
              .warning-box {
                background: #f8fafc; 
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
                margin-top: 24px;
                margin-bottom: 24px;
              }
              .warning-text {
                color: #334155;
                font-size: 14px;
                margin: 0;
                line-height: 1.5;
                font-style: italic;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">FUTURA</div>
              <h2 class="content-title">${title}</h2>
              ${bodyContent}
              <div class="footer">&copy; ${new Date().getFullYear()} Futura Unpad. All rights reserved.</div>
            </div>
          </body>
          </html>
        `;

        const escapeHtml = (unsafe: string) => {
            return unsafe
                 .replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;");
         };

        let emailSubject = "";
        let emailHtml = "";

        if (status === "approved") {
            emailSubject = `Pendaftaran ${competitionName} Disetujui`;
            emailHtml = baseHtml(
                `Pendaftaran Berhasil Disetujui ✨`,
                `<p class="content-text">
                    Halo! Selamat, pendaftaran kamu untuk <strong style="color:#000000;">${competitionName}</strong> sudah berhasil disetujui. ✨
                 </p>
                 <p class="content-text">
                    Langkah selanjutnya, yuk segera bergabung ke grup WhatsApp resmi peserta melalui tautan ini:
                 </p>
                 <div class="btn-container">
                    <a href="${whatsappLink}" class="btn">Gabung Grup WhatsApp</a>
                 </div>
                 <p class="content-text">
                    Biar tidak ketinggalan informasi penting lainnya, pastikan kamu selalu memantau pembaruan dari kami di kanal berikut:<br/><br/>
                    Website: <a href="https://www.futuraunpad.com/" style="color:#000000; text-decoration:underline; font-weight: 500;">futuraunpad.com</a><br/>
                    Instagram: <a href="https://www.instagram.com/futuraunpad.hmte" style="color:#000000; text-decoration:underline; font-weight: 500;">@futuraunpad.hmte</a><br/>
                    TikTok: <a href="https://www.tiktok.com/@futuraunpad" style="color:#000000; text-decoration:underline; font-weight: 500;">@futuraunpad</a>
                 </p>
                 <p class="content-text">
                    Sampai jumpa di perlombaan dan persiapkan yang terbaik!
                 </p>`
            );
        } else if (status === "revision") {
            const safeRejectionReason = rejectionReason ? escapeHtml(rejectionReason) : "Silakan cek kembali kelengkapan pendaftaran Anda.";
            emailSubject = `Revisi Pendaftaran ${competitionName}`;
            emailHtml = baseHtml(
                `Revisi Data Pendaftaran`,
                `<p class="content-text">
                    Halo! Terima kasih atas antusiasme kamu mendaftar di perlombaan kami. ✨
                 </p>
                 <p class="content-text">
                    Saat ini, pendaftaran kamu belum dapat disetujui karena ada beberapa data atau dokumen yang perlu direvisi terlebih dahulu.
                 </p>
                 <p class="content-text" style="margin-bottom: 16px;">
                    Berikut adalah catatan revisi dari tim panitia:
                 </p>
                 <div class="warning-box">
                    <p class="warning-text">${safeRejectionReason}</p>
                 </div>
                 <p class="content-text">
                    Yuk, segera perbaiki dan kirimkan ulang pendaftaran kamu sesuai dengan catatan di atas agar bisa segera kami proses kembali. Jika ada kebingungan atau kendala saat merevisi, jangan ragu untuk bertanya, ya!
                 </p>`
            );
        }

        try {
            await resend.emails.send({
                from: `Panitia Mechatura <noreply@${EMAIL_DOMAIN}>`,
                to: [leaderEmail],
                subject: emailSubject,
                html: emailHtml,
            });
        } catch (emailError) {
            console.error("Failed to send status update email:", emailError);
            // We don't throw here to avoid failing the DB update just because email failed
        }
    }

    revalidatePath("/admin/mechatura");
    revalidatePath(`/admin/mechatura/${id}`);
    
    return { success: true };
}

export async function getMechaturaDocumentUrl(path: string | null) {
    if (!path) return null;
    
    const { user, adminAccess } = await requireAdmin();
    if (!user || !adminAccess) {
        throw new Error("Unauthorized");
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase.storage
        .from("mechatura-documents")
        .createSignedUrl(path, 10 * 60);

    if (error) {
        console.error("Failed to generate signed URL:", error);
        throw new Error("Failed to generate document link");
    }

    return data.signedUrl;
}
