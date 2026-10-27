"use server";

import { createAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateStatusSchema = z.object({
    registrationId: z.string().uuid("ID pendaftaran tidak valid"),
    status: z.enum(["approved", "draft"], { message: "Status tidak valid" }),
});

const deleteSchema = z.object({
    registrationId: z.string().uuid("ID pendaftaran tidak valid"),
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidDocumentPath(filePath: string): boolean {
    if (!filePath || typeof filePath !== "string") return false;
    // Disallow path traversal, backslashes, and URL-encoded sequences
    if (filePath.includes("..") || filePath.includes("\\") || /%[0-9a-fA-F]{2}/.test(filePath)) return false;
    const parts = filePath.split("/");
    if (parts.length !== 2) return false;
    const [userIdFolder, fileName] = parts;
    if (!UUID_REGEX.test(userIdFolder)) return false;
    if (!fileName || fileName.startsWith(".") || !/^[a-zA-Z0-9_.-]+$/.test(fileName)) return false;
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["pdf", "jpg", "jpeg", "png"].includes(ext || "");
}

export async function updateEsaiRegistrationStatus(
    registrationId: string,
    status: "approved" | "draft"
) {
    const parsed = updateStatusSchema.safeParse({ registrationId, status });
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "Input tidak valid" };
    }

    const { user, adminAccess } = await requireAdmin();
    if (!user || !adminAccess) {
        return { error: "Unauthorized" };
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
        .from("esai_registrations")
        .update({
            submission_status: parsed.data.status,
            updated_at: new Date().toISOString()
        })
        .eq("id", parsed.data.registrationId);

    if (error) {
        console.error("Failed to update status:", error);
        return { error: "Gagal memperbarui status pendaftaran" };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/lomba-esai");
    revalidatePath(`/admin/lomba-esai/${parsed.data.registrationId}`);
    return { success: true };
}

export async function deleteEsaiRegistration(registrationId: string) {
    const parsed = deleteSchema.safeParse({ registrationId });
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "ID pendaftaran tidak valid" };
    }

    const { user, adminAccess } = await requireAdmin();
    if (!user || !adminAccess) {
        return { error: "Unauthorized" };
    }

    const supabaseAdmin = createAdminClient();

    // Clean up uploaded files in storage before deleting database record
    const { data: reg } = await supabaseAdmin
        .from("esai_registrations")
        .select("essay_paper_url, identity_card_url, instagram_twibbon_url, payment_proof_url")
        .eq("id", parsed.data.registrationId)
        .maybeSingle();

    if (reg) {
        const filesToDelete = [
            reg.essay_paper_url,
            reg.identity_card_url,
            reg.instagram_twibbon_url,
            reg.payment_proof_url,
        ].filter((f): f is string => Boolean(f) && isValidDocumentPath(f));

        if (filesToDelete.length > 0) {
            try {
                await supabaseAdmin.storage.from("esai_documents").remove(filesToDelete);
            } catch (storageError) {
                console.error("Failed to remove associated esai documents:", storageError);
            }
        }
    }

    const { error } = await supabaseAdmin
        .from("esai_registrations")
        .delete()
        .eq("id", parsed.data.registrationId);

    if (error) {
        console.error("Failed to delete registration:", error);
        return { error: "Gagal menghapus pendaftaran" };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/lomba-esai");
    revalidatePath(`/admin/lomba-esai/${parsed.data.registrationId}`);
    return { success: true };
}

export async function getEsaiDocumentUrl(path: string | null) {
    if (!path) return { error: "Path dokumen tidak tersedia" };

    if (!isValidDocumentPath(path)) {
        return { error: "Path dokumen tidak valid atau mencurigakan" };
    }

    const { user, adminAccess } = await requireAdmin();
    if (!user || !adminAccess) {
        return { error: "Unauthorized" };
    }

    const supabaseAdmin = createAdminClient();

    // Verify the document path actually belongs to an existing registration
    const { data: registration, error: fetchError } = await supabaseAdmin
        .from("esai_registrations")
        .select("id")
        .or(`essay_paper_url.eq."${path}",identity_card_url.eq."${path}",instagram_twibbon_url.eq."${path}",payment_proof_url.eq."${path}"`)
        .limit(1)
        .maybeSingle();

    if (fetchError || !registration) {
        return { error: "Dokumen tidak ditemukan atau akses tidak diizinkan" };
    }

    const { data, error } = await supabaseAdmin.storage
        .from("esai_documents")
        .createSignedUrl(path, 60 * 10); // 10 minutes

    if (error || !data?.signedUrl) {
        return { error: "Gagal mendapatkan URL dokumen" };
    }

    return { url: data.signedUrl };
}
