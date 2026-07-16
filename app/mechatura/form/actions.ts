"use server";

import { createAdminClient } from "@/lib/supabase-admin";
import { deleteMechaturaRegistration } from "@/lib/mechatura/registration";
import { getCachedAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteExpiredRegistration(registrationId: string) {
    const { user } = await getCachedAuth();
    if (!user) {
        throw new Error("Unauthorized");
    }

    const adminSupabase = createAdminClient();
    await deleteMechaturaRegistration(adminSupabase, registrationId);
    
    revalidatePath("/mechatura/form");
}
