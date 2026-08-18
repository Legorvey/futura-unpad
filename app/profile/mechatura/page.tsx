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
    .limit(1)
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
    <div data-full-width className="w-full flex flex-col items-center pb-32 mechatura-wrapper text-white">
      <style dangerouslySetInnerHTML={{ __html: `
          .mechatura-wrapper {
              --background: #f1f5f9;
              --foreground: #0f172a;
              --card: #f8fafc;
              --card-foreground: #0f172a;
              --popover: #f8fafc;
              --popover-foreground: #0f172a;
              --primary: #fbbf24;
              --primary-foreground: #0f172a;
              --secondary: #e2e8f0;
              --secondary-foreground: #0f172a;
              --muted: #e2e8f0;
              --muted-foreground: #64748b;
              --accent: #e2e8f0;
              --accent-foreground: #0f172a;
              --border: #cbd5e1;
              --input: #cbd5e1;
              --ring: #fbbf24;
          }
      `}} />
      <div className="relative w-full max-w-[90rem] px-4 sm:px-8 space-y-6">
          <section className="space-y-1.5 px-2">
              <h1 className="text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl text-white">
                  Mechatura Dashboard
              </h1>
              <p className="max-w-2xl text-sm tracking-tight leading-relaxed text-blue-100/80 sm:text-base">
                  Kelola pendaftaran dan dokumen tim Anda.
              </p>
          </section>
          
          <section className="relative rounded-2xl border border-transparent lg:border-border bg-card text-card-foreground p-0 lg:p-8 lg:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#307FE2]/5 via-transparent to-amber-500/5 pointer-events-none hidden lg:block rounded-[inherit]" />
              <div className="relative">
                  <MechaturaProfileClient 
                      currentUserMembership={membership}
                      team={membership.mechatura_teams}
                      allMembers={teamMembers}
                  />
              </div>
          </section>
      </div>
    </div>
  );
}
