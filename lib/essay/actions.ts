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

  // Check if user is already registered
  const { data: existingRegistration } = await supabaseAdmin
    .from("esai_registrations")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingRegistration) {
    // Already registered, just return success
    return { success: true };
  }

  // Create new registration
  const { error: insertError } = await supabaseAdmin
    .from("esai_registrations")
    .insert({
      user_id: user.id,
      submission_status: "draft"
    });

  if (insertError) {
    console.error("Esai registration error:", insertError);
    return { success: false, error: `Gagal mendaftar. Error: ${insertError.message}` };
  }

  revalidatePath("/profile", "layout");
  return { success: true };
}

import { z } from "zod";

const UpdateEsaiSchema = z.object({
  full_name: z.string().min(2).max(255).optional(),
  institution_category: z.string().optional(),
  institution: z.string().min(3).max(255).optional(),
  city: z.string().optional(),
  email: z.string().email().max(255).optional(),
  phone_number: z.string().min(10).max(50).optional(),
  instagram_twibbon_url: z.string().max(1000).optional().nullable(),
  identity_card_url: z.string().max(1000).optional().nullable(),
  essay_paper_url: z.string().max(1000).optional().nullable(),
  payment_proof_url: z.string().max(1000).optional().nullable(),
  submission_status: z.enum(["draft", "submitted"]).optional(),
});

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

  // Prevent submitting an incomplete registration
  if (validatedFields.data.submission_status === "submitted") {
    const checkData = { ...reg, ...validatedFields.data };
    const isComplete = checkData.full_name && checkData.institution && checkData.city && checkData.phone_number &&
                       checkData.instagram_twibbon_url && checkData.identity_card_url &&
                       checkData.essay_paper_url && checkData.payment_proof_url;
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
