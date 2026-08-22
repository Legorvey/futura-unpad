import { getCachedAuth } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase-admin";
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

  // Supabase sometimes returns many-to-one relations as arrays depending on the schema definition
  const teamObj = Array.isArray(membership.mechatura_teams) 
    ? membership.mechatura_teams[0] 
    : membership.mechatura_teams;

  if (!teamObj) {
    redirect("/mechatura");
  }

  const { data: teamMembers, error: teamMembersError } = await supabase
    .from("mechatura_members")
    .select("*")
    .eq("team_id", membership.team_id);

  if (teamMembersError) {
    throw new Error(teamMembersError.message);
  }

  const adminSupabase = createAdminClient();
  const enrichedTeamMembers = await Promise.all(
    (teamMembers || []).map(async (m) => {
      let fallback_name = null;
      if (m.user_id) {
        try {
          const { data: userData } = await adminSupabase.auth.admin.getUserById(m.user_id);
          if (userData?.user) {
            const meta = userData.user.user_metadata || {};
            fallback_name = meta.display_name || meta.username || userData.user.email || null;
          }
        } catch {
          // ignore error
        }
      }
      return {
        ...m,
        fallback_name
      };
    })
  );

  const lightThemeVars = {
    '--background': '#f8fafc',
    '--foreground': '#0f172a',
    '--card': '#ffffff',
    '--card-foreground': '#0f172a',
    '--popover': '#ffffff',
    '--popover-foreground': '#0f172a',
    '--primary': '#fbbf24',
    '--primary-foreground': '#0f172a',
    '--secondary': '#f1f5f9',
    '--secondary-foreground': '#0f172a',
    '--muted': '#f8fafc',
    '--muted-foreground': '#64748b',
    '--accent': '#f1f5f9',
    '--accent-foreground': '#0f172a',
    '--border': '#e2e8f0',
    '--input': '#e2e8f0',
    '--ring': '#fbbf24',
    '--radius': '0.75rem',
  } as React.CSSProperties;

  return (
    <div data-full-width className="w-full flex flex-col items-center pb-32 text-foreground" style={lightThemeVars}>
      <div className="relative w-full max-w-[90rem] px-4 sm:px-8 space-y-6">
          <section className="space-y-1.5 px-2">
              <h1 className="text-3xl font-semibold text-white">
                  Mechatura Dashboard
              </h1>
              <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                  Kelola pendaftaran dan dokumen tim Anda.
              </p>
          </section>
          
          <section className="relative rounded-2xl border border-transparent lg:border-border bg-card text-card-foreground p-0 lg:p-8 lg:shadow-sm">
              <div className="relative">
                  <MechaturaProfileClient 
                      currentUserMembership={membership}
                      team={teamObj}
                      allMembers={enrichedTeamMembers}
                  />
              </div>
          </section>
      </div>
    </div>
  );
}
