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
    // Note: in a real production environment, you might want a transaction via RPC here.
    throw new Error(memberError.message);
  }

  revalidatePath("/profile/mechatura");
  return { success: true, teamId: team.id, joinCode };
}

/**
 * Join an existing team using a join code.
 */
export async function joinTeam(joinCode: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to join a team.");
  }

  // 1. Find team
  const { data: team, error: findError } = await supabase
    .from("mechatura_teams")
    .select("id")
    .eq("join_code", joinCode.toUpperCase())
    .single();

  if (findError || !team) {
    throw new Error("Invalid join code or team not found.");
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
