"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const IdentityDataSchema = z.object({
  full_name: z.string().min(1).max(255),
  institution: z.string().min(1).max(255),
  city: z.string().min(1).max(255),
  phone_number: z.string().min(1).max(50),
  instagram_username: z.string().max(100).optional(),
  student_id_link: z.string().url().max(1000),
});

export type IdentityData = z.infer<typeof IdentityDataSchema>;

function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Create a new team and add the current user as the leader.
 */
export async function createTeam(category: string, teamName: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to create a team.");
  }

  // Check if user is already in a team
  const { data: existingMembership } = await supabase
    .from("mechatura_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMembership) {
    throw new Error("Anda sudah terdaftar di sebuah tim.");
  }

  const joinCode = generateJoinCode();

  // 1. Create team
  const { data: team, error: teamError } = await supabase
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
    throw new Error(teamError.message);
  }

  // 2. Add leader to members
  const { error: memberError } = await supabase
    .from("mechatura_members")
    .insert({
      team_id: team.id,
      user_id: user.id,
      is_leader: true,
    });

  if (memberError) {
    // Rollback: Delete the orphaned team if member insertion fails
    await supabase.from("mechatura_teams").delete().eq("id", team.id);
    throw new Error(memberError.message);
  }

  revalidatePath("/profile/mechatura");
  return { success: true, teamId: team.id, joinCode };
}

/**
 * Join an existing team using a join code.
 */
export async function joinTeam(joinCode: string, selectedCategory: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to join a team.");
  }

  // Check if user is already in a team
  const { data: existingMembership } = await supabase
    .from("mechatura_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMembership) {
    throw new Error("Anda sudah terdaftar di sebuah tim.");
  }

  // 1. Find team
  const { data: team, error: findError } = await supabase
    .from("mechatura_teams")
    .select("id, category")
    .eq("join_code", joinCode.toUpperCase())
    .single();

  if (findError || !team) {
    throw new Error("Kode undangan tidak valid atau tim tidak ditemukan.");
  }

  if (team.category !== selectedCategory) {
    throw new Error(`Tim ini terdaftar di kategori ${team.category === "robot_sumo" ? "Robot Sumo" : "Robot Transporter"}, berbeda dengan pilihan Anda.`);
  }

  // Check team capacity (max 3)
  const { count } = await supabase
    .from("mechatura_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team.id);

  if (count !== null && count >= 3) {
    throw new Error("Tim ini sudah penuh (maksimal 3 anggota).");
  }

  // 2. Add member
  const { error: memberError } = await supabase
    .from("mechatura_members")
    .insert({
      team_id: team.id,
      user_id: user.id,
      is_leader: false,
    });

  if (memberError) {
    if (memberError.code === "23505") { // unique constraint violation
      throw new Error("You are already in this team.");
    }
    throw new Error(memberError.message);
  }

  revalidatePath("/profile/mechatura");
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
  
  const parsedData = IdentityDataSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error("Invalid input data: " + parsedData.error.message);
  }

  // We should verify that the current user owns this member record
  // (Alternatively, use RLS in Supabase)
  const { data: memberCheck } = await supabase
    .from("mechatura_members")
    .select("user_id")
    .eq("id", memberId)
    .single();

  if (memberCheck?.user_id !== user.id) {
    throw new Error("You can only update your own details.");
  }

  const { error } = await supabase
    .from("mechatura_members")
    .update(parsedData.data)
    .eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile/mechatura");
  return { success: true };
}

/**
 * Update the team's payment proof (Google Drive link).
 */
export async function submitPaymentProof(teamId: string, paymentProofLink: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  // Authorization: check if user is leader
  const { data: membership } = await supabase
    .from("mechatura_members")
    .select("is_leader")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single();

  if (!membership?.is_leader) {
    throw new Error("Only the team leader can submit payment proof.");
  }

  // Check if already verified
  const { data: team } = await supabase
    .from("mechatura_teams")
    .select("payment_status")
    .eq("id", teamId)
    .single();

  if (team?.payment_status === "verified") {
    throw new Error("Payment is already verified and cannot be modified.");
  }
  
  const parsedLink = z.string().url().safeParse(paymentProofLink);
  if (!parsedLink.success) throw new Error("Invalid URL for payment proof");

  const { error } = await supabase
    .from("mechatura_teams")
    .update({ 
      payment_proof_link: parsedLink.data,
      payment_status: "pending_verification"
    })
    .eq("id", teamId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile/mechatura");
  return { success: true };
}

/**
 * Update the team's robot documents (Google Drive link).
 */
export async function updateRobotDocuments(teamId: string, robotDocumentLink: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  // Authorization: check if user is leader
  const { data: membership } = await supabase
    .from("mechatura_members")
    .select("is_leader")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single();

  if (!membership?.is_leader) {
    throw new Error("Only the team leader can submit robot documents.");
  }
  
  const parsedLink = z.string().url().safeParse(robotDocumentLink);
  if (!parsedLink.success) throw new Error("Invalid URL for robot document");

  const { error } = await supabase
    .from("mechatura_teams")
    .update({ 
      robot_document_link: parsedLink.data
    })
    .eq("id", teamId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile/mechatura");
  return { success: true };
}

/**
 * Leave the current team (for non-leader members).
 */
export async function leaveTeam(teamId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  const { data: membership } = await supabase
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

  const { error } = await supabase
    .from("mechatura_members")
    .delete()
    .eq("user_id", user.id)
    .eq("team_id", teamId);

  if (error) throw new Error(error.message);

  revalidatePath("/profile/mechatura");
  return { success: true };
}

/**
 * Transfer leadership to another member.
 */
export async function transferLeadership(teamId: string, newLeaderId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  // Verify current user is leader
  const { data: currentMembership } = await supabase
    .from("mechatura_members")
    .select("is_leader")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single();

  if (!currentMembership?.is_leader) {
    throw new Error("Hanya leader yang dapat mentransfer kepemimpinan.");
  }

  // Verify new leader is in the team
  const { data: newLeaderMembership } = await supabase
    .from("mechatura_members")
    .select("id")
    .eq("user_id", newLeaderId)
    .eq("team_id", teamId)
    .single();

  if (!newLeaderMembership) {
    throw new Error("Anggota baru tidak ditemukan dalam tim ini.");
  }

  // Update current leader to false
  const { error: err1 } = await supabase
    .from("mechatura_members")
    .update({ is_leader: false })
    .eq("user_id", user.id)
    .eq("team_id", teamId);

  if (err1) throw new Error(err1.message);

  // Update new leader to true
  const { error: err2 } = await supabase
    .from("mechatura_members")
    .update({ is_leader: true })
    .eq("user_id", newLeaderId)
    .eq("team_id", teamId);

  if (err2) throw new Error(err2.message);

  // Update leader_id in teams table
  const { error: err3 } = await supabase
    .from("mechatura_teams")
    .update({ leader_id: newLeaderId })
    .eq("id", teamId);

  if (err3) throw new Error(err3.message);

  revalidatePath("/profile/mechatura");
  return { success: true };
}

/**
 * Initiate team deletion by leader.
 */
export async function initiateTeamDeletion(teamId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  // Verify leader
  const { data: membership } = await supabase
    .from("mechatura_members")
    .select("is_leader")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single();

  if (!membership?.is_leader) {
    throw new Error("Hanya leader yang dapat menghapus tim.");
  }

  // Count members
  const { count: memberCount, error: countError } = await supabase
    .from("mechatura_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  if (countError) throw new Error(countError.message);

  if (memberCount === 1) {
    // Single user team, delete immediately
    const { error: delError } = await supabase
      .from("mechatura_teams")
      .delete()
      .eq("id", teamId);
    
    if (delError) throw new Error(delError.message);
  } else {
    // Multi user team, initiate request
    // Check if request already exists
    const { data: existingReq } = await supabase
      .from("team_deletion_requests")
      .select("id")
      .eq("team_id", teamId)
      .eq("status", "pending")
      .maybeSingle();

    if (existingReq) {
      throw new Error("Permintaan penghapusan tim sudah berjalan.");
    }

    const { data: newReq, error: reqError } = await supabase
      .from("team_deletion_requests")
      .insert({
        team_id: teamId,
        initiated_by: user.id,
        status: "pending"
      })
      .select("id")
      .single();

    if (reqError) throw new Error(reqError.message);

    // Auto consent for leader
    const { error: consentError } = await supabase
      .from("team_deletion_consents")
      .insert({
        request_id: newReq.id,
        member_id: user.id
      });

    if (consentError) throw new Error(consentError.message);
  }

  revalidatePath("/profile/mechatura");
  return { success: true };
}

/**
 * Submit consent for team deletion.
 */
export async function consentTeamDeletion(requestId: string, teamId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  // Verify membership
  const { data: membership } = await supabase
    .from("mechatura_members")
    .select("id")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single();

  if (!membership) {
    throw new Error("Anda tidak tergabung dalam tim ini.");
  }

  // Insert consent
  const { error: consentError } = await supabase
    .from("team_deletion_consents")
    .insert({
      request_id: requestId,
      member_id: user.id
    });

  if (consentError && consentError.code !== '23505') { // ignore duplicate consent
    throw new Error(consentError.message);
  }

  // Check unanimous consent
  const { count: totalMembers } = await supabase
    .from("mechatura_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  const { count: totalConsents } = await supabase
    .from("team_deletion_consents")
    .select("*", { count: "exact", head: true })
    .eq("request_id", requestId);

  if (totalMembers === totalConsents) {
    // Execute deletion
    const { error: delError } = await supabase
      .from("mechatura_teams")
      .delete()
      .eq("id", teamId);
    
    if (delError) throw new Error(delError.message);

    // Update request status
    await supabase
      .from("team_deletion_requests")
      .update({ status: "executed" })
      .eq("id", requestId);
  }

  revalidatePath("/profile/mechatura");
  return { success: true };
}
