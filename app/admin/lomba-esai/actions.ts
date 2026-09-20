
"use server";

import { createAdminClient } from "@/lib/supabase-admin";
import { requireAdminOrRedirect } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateEsaiRegistrationStatus(
    registrationId: string,
    status: "approved" | "draft"
) {
    await requireAdminOrRedirect();

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
        .from("esai_registrations")
        .update({
            submission_status: status,
            updated_at: new Date().toISOString()
        })
        .eq("id", registrationId);

    if (error) {
        console.error("Failed to update status:", error);
        return { error: "Gagal memperbarui status pendaftaran" };
    }

    revalidatePath("/admin/lomba-esai");
    revalidatePath(`/admin/lomba-esai/${registrationId}`);
    return { success: true };
}


export async function deleteEsaiRegistration(registrationId: string) {
    await requireAdminOrRedirect();

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
        .from("esai_registrations")
        .delete()
        .eq("id", registrationId);

    if (error) {
        console.error("Failed to delete registration:", error);
        return { error: "Gagal menghapus pendaftaran" };
    }

    revalidatePath("/admin/lomba-esai");
    return { success: true };
}


export async function getEsaiDocumentUrl(path: string | null) {
    if (!path) return { error: "Path dokumen tidak tersedia" };
    await requireAdminOrRedirect();
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.storage
        .from("esai_documents")
        .createSignedUrl(path, 60 * 10); // 10 minutes
    if (error || !data) {
        return { error: "Gagal mendapatkan URL dokumen" };
    }
    return { url: data.signedUrl };
}

