import { getCachedAuth } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { MechaturaProfileClient } from "./client-page";

export default async function MechaturaProfilePage() {
  const { user } = await getCachedAuth();

  if (!user) {
    redirect("/login?next=/profile/mechatura");
  }

  const supabase = await createClient();

  // Find the user's membership
  const { data: membership, error: memberError } = await supabase
    .from("mechatura_members")
    .select("*, mechatura_teams(*)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (memberError) {
    throw new Error(memberError.message);
  }

  if (!membership || !membership.mechatura_teams) {
    // If they aren't in a team, redirect to home or mechatura landing page
    redirect("/mechatura");
  }

  // Fetch all members of this team
  const { data: teamMembers, error: teamMembersError } = await supabase
    .from("mechatura_members")
    .select("*")
    .eq("team_id", membership.team_id);

  if (teamMembersError) {
    throw new Error(teamMembersError.message);
  }

  return (
    <div className="mx-auto w-full max-w-5xl py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Mechatura Dashboard</h1>
      <p className="text-white/60 mb-8">
        Manage your team&apos;s registration and documents.
      </p>
      
      <MechaturaProfileClient 
        currentUserMembership={membership}
        team={membership.mechatura_teams}
        allMembers={teamMembers}
      />
    </div>
  );
}
