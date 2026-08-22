"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomBytes } from "crypto";

const IdentityDataSchema = z.object({
  full_name: z.string().min(2).max(255),
  institution: z.string().min(3).max(255),
  city: z.string().min(2).max(255),
  phone_number: z.string().min(10).max(50),
  instagram_username: z.string().url().max(500).optional().or(z.literal("")),
  student_id_link: z.string().url().max(1000),
});

export type IdentityData = z.infer<typeof IdentityDataSchema>;

const CreateTeamSchema = z.object({
  category: z.enum(["robot_sumo", "robot_transporter"]),
  teamName: z.string().min(3).max(50)
});

const JoinTeamSchema = z.object({
  joinCode: z.string().length(6),
  selectedCategory: z.enum(["robot_sumo", "robot_transporter"])
});

function generateJoinCode() {
  return randomBytes(3).toString("hex").toUpperCase();
}

/**
 * Create a new team and add the current user as the leader.
 */
export async function createTeam(category: string, teamName: string) {
  const parsed = CreateTeamSchema.safeParse({ category, teamName });
  if (!parsed.success) {
    return { success: false, error: "Data input tidak valid." };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be logged in to create a team." };
  }

  const supabaseAdmin = createAdminClient();
// Check if user is already in a team
  const { data: existingMembership } = await supabaseAdmin
    .from("mechatura_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMembership) {
    return { success: false, error: "Anda sudah terdaftar di sebuah tim." };
  }

  const joinCode = generateJoinCode();

  // 1. Create team
  const { data: team, error: teamError } = await supabaseAdmin
    .from("mechatura_teams")
    .insert({
      category,
      name: teamName,
      leader_id: user.id,
      join_code: joinCode,
      payment_status: "unpaid",
    })
    .select("id")
    .single();

  if (teamError) {
    console.error("Team creation error:", teamError);
    return { success: false, error: "Gagal membuat tim. Silakan coba lagi." };
  }

  // 2. Add leader to members
  const { error: memberError } = await supabaseAdmin
    .from("mechatura_members")
    .insert({
      team_id: team.id,
      user_id: user.id,
      is_leader: true,
    });

  if (memberError) {
    // Rollback: Delete the orphaned team if member insertion fails
    console.error("Member insertion error:", memberError);
    await supabaseAdmin.from("mechatura_teams").delete().eq("id", team.id);
    return { success: false, error: "Gagal menambahkan anggota. Silakan coba lagi." };
  }

  revalidatePath("/profile", "layout");
  return { success: true, teamId: team.id, joinCode };
}

/**
 * Join an existing team using a join code.
 */
export async function joinTeam(joinCode: string, selectedCategory: string) {
  const parsed = JoinTeamSchema.safeParse({ joinCode, selectedCategory });
  if (!parsed.success) {
    return { success: false, error: "Data input tidak valid." };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be logged in to join a team." };
  }

  const supabaseAdmin = createAdminClient();
// Check if user is already in a team
  const { data: existingMembership } = await supabaseAdmin
    .from("mechatura_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMembership) {
    return { success: false, error: "Anda sudah terdaftar di sebuah tim." };
  }

  // 1. Find team
  const { data: team, error: findError } = await supabaseAdmin
    .from("mechatura_teams")
    .select("id, category, submission_status")
    .eq("join_code", joinCode.toUpperCase())
    .single();

  if (findError || !team) {
    return { success: false, error: "Kode undangan tidak valid atau tim tidak ditemukan." };
  }

  if (team.submission_status !== "draft") {
    return { success: false, error: "Tim ini sudah melakukan finalisasi pendaftaran dan tidak dapat menerima anggota baru." };
  }

  if (team.category !== selectedCategory) {
    return { success: false, error: `Tim ini terdaftar di kategori ${team.category === "robot_sumo" ? "Robot Sumo" : "Robot Transporter"}, berbeda dengan pilihan Anda.` };
  }

  // Check team capacity (max 3)
  const { count } = await supabaseAdmin
    .from("mechatura_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team.id);

  if (count !== null && count >= 3) {
    return { success: false, error: "Tim ini sudah penuh (maksimal 3 anggota)." };
  }

  // 2. Add member
  const { error: memberError } = await supabaseAdmin
    .from("mechatura_members")
    .insert({
      team_id: team.id,
      user_id: user.id,
      is_leader: false,
    });

  if (memberError) {
    if (memberError.code === "23505") { // unique constraint violation
      return { success: false, error: "You are already in this team." };
    }
    console.error("Member join error:", memberError);
    return { success: false, error: "Gagal bergabung dengan tim. Silakan coba lagi." };
  }

  revalidatePath("/profile", "layout");
  return { success: true, teamId: team.id };
}

/**
 * Update the specific member's identity data.
 */
export async function updateMemberIdentity(memberId: string, data: IdentityData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const supabaseAdmin = createAdminClient();
const parsedData = IdentityDataSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error("Invalid input data: " + parsedData.error.message);
  }

  const { data: memberCheck } = await supabaseAdmin
    .from("mechatura_members")
    .select("user_id, team_id, mechatura_teams(submission_status)")
    .eq("id", memberId)
    .single();

  if (!memberCheck) {
    throw new Error("Anggota tidak ditemukan.");
  }

  if (memberCheck.user_id !== user.id) {
    throw new Error("You can only update your own details.");
  }

  const team: any = memberCheck.mechatura_teams;
  if (team && team.submission_status !== "draft") {
    throw new Error("Pendaftaran sudah disubmit. Anda tidak dapat mengubah data anggota lagi.");
  }

  const { error } = await supabaseAdmin
    .from("mechatura_members")
    .update(parsedData.data)
    .eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile", "layout");
  return { success: true };
}

/**
 * Update the team's payment proof (Google Drive link).
 */
export async function submitPaymentProof(teamId: string, paymentProofLink: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  const supabaseAdmin = createAdminClient();
// Authorization: check if user is leader
  const { data: membership } = await supabaseAdmin
    .from("mechatura_members")
    .select("is_leader")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single();

  if (!membership?.is_leader) {
    throw new Error("Only the team leader can submit payment proof.");
  }

  // Check if already verified or submitted
  const { data: team } = await supabaseAdmin
    .from("mechatura_teams")
    .select("payment_status, submission_status")
    .eq("id", teamId)
    .single();

  if (team?.payment_status === "verified") {
    throw new Error("Payment is already verified and cannot be modified.");
  }

  if (team?.submission_status !== "draft") {
    throw new Error("Pendaftaran sudah disubmit. Anda tidak dapat mengubah bukti pembayaran lagi.");
  }
  
  const parsedLink = z.string().url().safeParse(paymentProofLink);
  if (!parsedLink.success) throw new Error("Invalid URL for payment proof");

  const { error } = await supabaseAdmin
    .from("mechatura_teams")
    .update({ 
      payment_proof_link: parsedLink.data,
      payment_status: "pending_verification"
    })
    .eq("id", teamId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile", "layout");
  return { success: true };
}

/**
 * Update the team's robot documents (Google Drive link).
 */
export async function updateRobotDocuments(teamId: string, robotDocumentLink: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  const supabaseAdmin = createAdminClient();
// Authorization: check if user is leader
  const { data: membership } = await supabaseAdmin
    .from("mechatura_members")
    .select("is_leader")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single();

  if (!membership?.is_leader) {
    throw new Error("Only the team leader can submit robot documents.");
  }
  
  const { data: team } = await supabaseAdmin
    .from("mechatura_teams")
    .select("submission_status")
    .eq("id", teamId)
    .single();
    
  if (team?.submission_status !== "draft") {
    throw new Error("Pendaftaran sudah disubmit. Anda tidak dapat mengubah dokumen robot lagi.");
  }

  const parsedLink = z.string().url().safeParse(robotDocumentLink);
  if (!parsedLink.success) throw new Error("Invalid URL for robot document");

  const { error } = await supabaseAdmin
    .from("mechatura_teams")
    .update({ 
      robot_document_link: parsedLink.data
    })
    .eq("id", teamId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile", "layout");
  return { success: true };
}

/**
 * Leave the current team (for non-leader members).
 */
export async function leaveTeam(teamId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  const supabaseAdmin = createAdminClient();
const { data: membership } = await supabaseAdmin
    .from("mechatura_members")
    .select("is_leader")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single();

  if (!membership) {
    throw new Error("Anda tidak tergabung dalam tim ini.");
  }

  if (membership.is_leader) {
    throw new Error("Leader tidak dapat keluar dari tim. Silakan transfer kepemimpinan atau hapus tim.");
  }

  const { data: team } = await supabaseAdmin
    .from("mechatura_teams")
    .select("submission_status")
    .eq("id", teamId)
    .single();

  if (team?.submission_status !== "draft") {
    throw new Error("Pendaftaran sudah disubmit. Anggota tidak dapat keluar dari tim. Silakan hubungi panitia.");
  }

  const { error } = await supabaseAdmin
    .from("mechatura_members")
    .delete()
    .eq("user_id", user.id)
    .eq("team_id", teamId);

  if (error) throw new Error(error.message);

  revalidatePath("/profile", "layout");
  return { success: true };
}

/**
 * Transfer leadership to another member.
 */
export async function transferLeadership(teamId: string, newLeaderId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  const supabaseAdmin = createAdminClient();
// Verify current user is leader
  const { data: currentMembership } = await supabaseAdmin
    .from("mechatura_members")
    .select("is_leader")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single();

  if (!currentMembership?.is_leader) {
    throw new Error("Hanya leader yang dapat mentransfer kepemimpinan.");
  }

  // Verify new leader is in the team
  const { data: newLeaderMembership } = await supabaseAdmin
    .from("mechatura_members")
    .select("id")
    .eq("user_id", newLeaderId)
    .eq("team_id", teamId)
    .single();

  if (!newLeaderMembership) {
    throw new Error("Anggota baru tidak ditemukan dalam tim ini.");
  }

  const { data: team } = await supabaseAdmin
    .from("mechatura_teams")
    .select("submission_status")
    .eq("id", teamId)
    .single();

  if (team?.submission_status !== "draft") {
    throw new Error("Pendaftaran sudah disubmit. Tidak dapat mentransfer kepemimpinan.");
  }

// Update current leader to false
  const { error: err1 } = await supabaseAdmin
    .from("mechatura_members")
    .update({ is_leader: false })
    .eq("user_id", user.id)
    .eq("team_id", teamId);

  if (err1) throw new Error(err1.message);

  // Update new leader to true
  const { error: err2 } = await supabaseAdmin
    .from("mechatura_members")
    .update({ is_leader: true })
    .eq("user_id", newLeaderId)
    .eq("team_id", teamId);

  if (err2) throw new Error(err2.message);

  // Update leader_id in teams table
  const { error: err3 } = await supabaseAdmin
    .from("mechatura_teams")
    .update({ leader_id: newLeaderId })
    .eq("id", teamId);

  if (err3) throw new Error(err3.message);

  revalidatePath("/profile", "layout");
  return { success: true };
}

/**
 * Disband the team by leader.
 */
export async function initiateTeamDeletion(teamId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  const supabaseAdmin = createAdminClient();
// Verify leader using admin client to bypass any RLS errors
  const { data: membership } = await supabaseAdmin
    .from("mechatura_members")
    .select("is_leader")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single();

  if (!membership?.is_leader) {
    throw new Error("Hanya leader yang dapat menghapus tim.");
  }

  const { data: team } = await supabaseAdmin
    .from("mechatura_teams")
    .select("submission_status")
    .eq("id", teamId)
    .single();

  if (team?.submission_status !== "draft") {
    throw new Error("Pendaftaran sudah disubmit. Tim tidak dapat dihapus lagi. Silakan hubungi panitia.");
  }

  // Delete team using admin client to bypass RLS recursion error 
  // caused by deleted consent tables. Security is enforced by the manual check above.
  const { error: delError } = await supabaseAdmin
    .from("mechatura_teams")
    .delete()
    .eq("id", teamId);
  
  if (delError) throw new Error(delError.message);

  revalidatePath("/profile", "layout");
  return { success: true };
}

/**
 * Finalize the team submission.
 */
export async function finalizeSubmission(teamId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  const supabaseAdmin = createAdminClient();
// Fetch the team and its members
  const { data: teamData, error: teamError } = await supabaseAdmin
    .from("mechatura_teams")
    .select("*, mechatura_members(*)")
    .eq("id", teamId)
    .single();

  if (teamError || !teamData) {
    throw new Error("Tim tidak ditemukan.");
  }

  // Verify leader
  const membership = teamData.mechatura_members.find((m: any) => m.user_id === user.id);
  if (!membership?.is_leader) {
    throw new Error("Hanya leader yang dapat melakukan finalisasi data.");
  }

  // Validation Schemas
  const FinalizeSchema = z.object({
    payment_proof_link: z.string().url(),
    robot_document_link: z.string().url(),
    mechatura_members: z.array(z.object({
      full_name: z.string().min(1),
      institution: z.string().min(1),
      city: z.string().min(1),
      phone_number: z.string().min(1),
      student_id_link: z.string().url(),
    })).min(1),
  });

  try {
    FinalizeSchema.parse(teamData);
  } catch (err: any) {
    throw new Error("Data belum lengkap. Pastikan seluruh anggota telah mengisi profil (KTM, Twibbon), dan Anda telah mengunggah bukti pembayaran serta dokumen robot.");
  }

  // Update submission_status and reset admin_approval_status
  const { error: updateError } = await supabaseAdmin
    .from("mechatura_teams")
    .update({ 
      submission_status: "submitted",
      admin_approval_status: "pending"
    })
    .eq("id", teamId);
  
  if (updateError) throw new Error(updateError.message);

  revalidatePath("/profile", "layout");
  return { success: true };
}

/**
 * Remove (kick) a team member. Only the team leader can perform this action.
 */
export async function removeTeamMember(memberId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in.");
  }

  const supabaseAdmin = createAdminClient();

  // Get member details to find the team ID
  const { data: targetMember, error: targetError } = await supabaseAdmin
    .from("mechatura_members")
    .select("team_id, is_leader, mechatura_teams(submission_status)")
    .eq("id", memberId)
    .single();

  if (targetError || !targetMember) {
    throw new Error("Anggota tidak ditemukan.");
  }

  if (targetMember.is_leader) {
    throw new Error("Tidak dapat mengeluarkan ketua tim.");
  }

  const team: any = targetMember.mechatura_teams;
  if (team && team.submission_status !== "draft") {
    throw new Error("Pendaftaran sudah disubmit. Anda tidak dapat mengeluarkan anggota lagi.");
  }

  // Check if current user is the leader of that team
  const { data: leaderCheck, error: leaderError } = await supabaseAdmin
    .from("mechatura_members")
    .select("id")
    .eq("team_id", targetMember.team_id)
    .eq("user_id", user.id)
    .eq("is_leader", true)
    .single();

  if (leaderError || !leaderCheck) {
    throw new Error("Hanya ketua tim yang dapat mengeluarkan anggota.");
  }

  // Delete the member
  const { error: deleteError } = await supabaseAdmin
    .from("mechatura_members")
    .delete()
    .eq("id", memberId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  revalidatePath("/profile", "layout");
  return { success: true };
}

const PembinaDataSchema = z.object({
  pembina_name: z.string().min(2, "Nama minimal 2 karakter"),
  pembina_institution: z.string().min(3, "Asal institusi/sekolah minimal 3 karakter"),
  pembina_city: z.string().min(2, "Kota minimal 2 karakter"),
  pembina_phone: z.string().min(10, "Nomor WhatsApp minimal 10 karakter"),
  pembina_id_link: z.string().url("Link dokumen identitas tidak valid"),
  pembina_relationship: z.string().min(2, "Hubungan dengan tim minimal 2 karakter"),
});

export type PembinaData = z.infer<typeof PembinaDataSchema>;

async function verifyLeaderAndDraftStatus(supabase: any, teamId: string, userId: string, actionName: string = "mengubah data pembina") {
  const { data: leaderCheck, error: leaderError } = await supabase
    .from("mechatura_members")
    .select("id, mechatura_teams(submission_status)")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .eq("is_leader", true)
    .single();

  if (leaderError || !leaderCheck) {
    throw new Error(`Hanya ketua tim yang dapat ${actionName}.`);
  }

  const team = leaderCheck.mechatura_teams as unknown as { submission_status: string };
  if (team && team.submission_status !== "draft") {
    throw new Error("Pendaftaran sudah disubmit. Anda tidak dapat mengubah data lagi.");
  }
}

/**
 * Update the Pembina (advisor/parent) data for a team.
 */
export async function updatePembinaData(teamId: string, data: PembinaData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  if (!teamId || typeof teamId !== 'string') {
    throw new Error("Invalid team ID");
  }

  const parsedData = PembinaDataSchema.safeParse(data);
  
  if (!parsedData.success) {
    throw new Error("Invalid input data: " + parsedData.error.message);
  }

  await verifyLeaderAndDraftStatus(supabase, teamId, user.id, "mengubah data pembina");

  const { error } = await supabase
    .from("mechatura_teams")
    .update(parsedData.data)
    .eq("id", teamId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile", "layout");
  return { success: true };
}

/**
 * Clear the Pembina (advisor/parent) data for a team.
 */
export async function clearPembinaData(teamId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  if (!teamId || typeof teamId !== 'string') {
    throw new Error("Invalid team ID");
  }

  await verifyLeaderAndDraftStatus(supabase, teamId, user.id, "menghapus data pembina");

  const { error } = await supabase
    .from("mechatura_teams")
    .update({
      pembina_name: null,
      pembina_institution: null,
      pembina_city: null,
      pembina_phone: null,
      pembina_id_link: null,
      pembina_relationship: null
    })
    .eq("id", teamId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile", "layout");
  return { success: true };
}
