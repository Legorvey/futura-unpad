"use server";

import { createAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateMechaturaRegistrationStatus(id: string, status: "approved" | "rejected" | "registered" | "waiting_payment") {
    const { user, adminAccess } = await requireAdmin();
    if (!user || !adminAccess) {
        throw new Error("Unauthorized");
    }

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
        .from("mechatura_registrations")
        .update({ registration_status: status })
        .eq("id", id);

    if (error) {
        console.error("Failed to update status:", error);
        throw new Error("Failed to update registration status");
    }

    revalidatePath("/admin/mechatura");
    revalidatePath(`/admin/mechatura/${id}`);
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
