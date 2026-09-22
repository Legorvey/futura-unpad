"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { ESAI_REG_START_DATE, IS_ESAI_REGISTRATION_OPEN } from "@/lib/landing/helper";

export async function registerEsai() {
  if (!IS_ESAI_REGISTRATION_OPEN) {
    return { success: false, error: "Pendaftaran Lomba Esai belum dibuka." };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Silakan login terlebih dahulu untuk mendaftar." };
  }

  const supabaseAdmin = createAdminClient();

  // Use upsert to atomically handle concurrent registration attempts.
  // Requires a UNIQUE constraint on user_id in the esai_registrations table.
  const { error: insertError } = await supabaseAdmin
    .from("esai_registrations")
    .upsert(
      { user_id: user.id, submission_status: "draft" },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

  if (insertError) {
    console.error("Esai registration error:", insertError);
    return { success: false, error: `Gagal mendaftar. Error: ${insertError.message}` };
  }

  revalidatePath("/profile", "layout");
  return { success: true };
}

import { z } from "zod";

import { UpdateEsaiSchema } from "@/lib/validation/esai";

export async function updateEsaiRegistration(registrationId: string, values: z.infer<typeof UpdateEsaiSchema>) {
  if (!IS_ESAI_REGISTRATION_OPEN) {
    return { success: false, error: "Pendaftaran Lomba Esai belum dibuka." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const validatedFields = UpdateEsaiSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: "Data tidak valid." };
  }

  const supabaseAdmin = createAdminClient();

  // Ensure the user owns this registration and it is not locked
  const { data: reg } = await supabaseAdmin
    .from("esai_registrations")
    .select("*")
    .eq("id", registrationId)
    .single();

  if (!reg || reg.user_id !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (reg.submission_status === "submitted" || reg.submission_status === "approved") {
    return { success: false, error: "Pendaftaran sudah disubmit dan tidak dapat diubah." };
  }

  // FIX #2: Enforce that all submitted file URLs belong to the user's own storage directory
  const fileFields = ["instagram_twibbon_url", "identity_card_url", "essay_paper_url", "payment_proof_url"] as const;
  for (const field of fileFields) {
    const url = validatedFields.data[field];
    if (url && !url.startsWith(`${user.id}/`)) {
      return { success: false, error: "File URL tidak valid atau bukan milik Anda." };
    }
  }

  // Prevent submitting an incomplete registration
  if (validatedFields.data.submission_status === "submitted") {
    const checkData = { ...reg, ...validatedFields.data };

    // FIX #5: Enforce twibbon date restriction on the server
    const isTwibbonOpen = new Date() >= new Date("2026-10-05T00:00:00+07:00");

    const isComplete = checkData.full_name && checkData.institution_category && checkData.institution && checkData.city && checkData.phone_number &&
                       (!isTwibbonOpen || checkData.instagram_twibbon_url) && checkData.identity_card_url &&
                       checkData.essay_paper_url && checkData.payment_proof_url && checkData.paper_title && checkData.sub_theme;
    if (!isComplete) {
      return { success: false, error: "Data belum lengkap. Silakan lengkapi semua form dan dokumen." };
    }
  }

  const { error } = await supabaseAdmin
    .from("esai_registrations")
    .update({
      ...validatedFields.data,
      updated_at: new Date().toISOString()
    })
    .eq("id", registrationId);

  if (error) {
    console.error("Esai update error:", error);
    return { success: false, error: "Gagal menyimpan data pendaftaran." };
  }

  revalidatePath("/profile", "layout");
  return { success: true };
}

export async function removeEsaiFile(registrationId: string, field: "instagram_twibbon_url" | "identity_card_url" | "essay_paper_url" | "payment_proof_url") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const supabaseAdmin = createAdminClient();
  
  // Verify ownership
  const { data: reg } = await supabaseAdmin.from("esai_registrations").select("*").eq("id", registrationId).single();
  if (!reg || reg.user_id !== user.id) return { success: false, error: "Unauthorized" };

  if (reg.submission_status === "submitted" || reg.submission_status === "approved") {
    return { success: false, error: "Pendaftaran sudah disubmit, file tidak dapat dihapus." };
  }

  const filePath = reg[field];
  if (filePath) {
    // FIX #1: Ensure the file path belongs to the requesting user before deleting
    if (!filePath.startsWith(`${user.id}/`)) {
      return { success: false, error: "Unauthorized file access." };
    }
    await supabaseAdmin.storage.from("esai_documents").remove([filePath]);
  }
  
  await supabaseAdmin.from("esai_registrations").update({ [field]: null }).eq("id", registrationId);
  revalidatePath("/profile", "layout");
  return { success: true };
}
