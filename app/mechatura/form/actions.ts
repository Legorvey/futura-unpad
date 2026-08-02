"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-admin";
import {
  deleteMechaturaRegistration,
  findLatestMechaturaRegistrationForUser,
  isMechaturaPaymentExpired,
} from "@/lib/mechatura/registration";
import { getCachedAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const deleteExpiredRegistrationSchema = z.object({
  registrationId: z.string().uuid("Invalid registration ID format"),
});

export async function deleteExpiredRegistration(registrationId: string) {
    const { user } = await getCachedAuth();
    if (!user) {
        throw new Error("Unauthorized");
    }

    const parseResult = deleteExpiredRegistrationSchema.safeParse({ registrationId });
    if (!parseResult.success) {
        throw new Error("Format ID pendaftaran tidak valid");
    }

    const adminSupabase = createAdminClient();
    const latestRegistration = await findLatestMechaturaRegistrationForUser(
        adminSupabase,
        user.id
    );

    if (
        !latestRegistration ||
        latestRegistration.id !== parseResult.data.registrationId ||
        !isMechaturaPaymentExpired(latestRegistration)
    ) {
        throw new Error("Pendaftaran ini tidak kedaluwarsa atau tidak ditemukan.");
    }

    const result = await deleteMechaturaRegistration(
        adminSupabase,
        parseResult.data.registrationId,
        user.id
    );

    if (!result.success) {
        throw new Error("Gagal menghapus pendaftaran.");
    }
    
    revalidatePath("/mechatura/form");
}
