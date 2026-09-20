import { getCachedAuth } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LombaEsaiClient } from "./client-page";

import { createAdminClient } from "@/lib/supabase-admin";

export default async function LombaEsaiProfilePage() {
  const { user } = await getCachedAuth();

  if (!user) {
    redirect("/login?next=/profile/lomba-esai");
  }

  const supabase = createAdminClient();

  const { data: registration, error } = await supabase
    .from("esai_registrations")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Database Error: ${error.message}`);
  }

  if (!registration) {
    redirect("/lomba-esai");
  }

  return (
    <div data-full-width className="w-full flex flex-col items-center pb-32 text-foreground esai-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
          .esai-wrapper {
              --background: #f8fafc;
              --foreground: #0f172a;
              --card: #ffffff;
              --card-foreground: #0f172a;
              --popover: #ffffff;
              --popover-foreground: #0f172a;
              --primary: #fbbf24;
              --primary-foreground: #0f172a;
              --secondary: #f1f5f9;
              --secondary-foreground: #0f172a;
              --muted: #f8fafc;
              --muted-foreground: #64748b;
              --accent: #f1f5f9;
              --accent-foreground: #0f172a;
              --border: #e2e8f0;
              --input: #e2e8f0;
              --ring: #fbbf24;
              --radius: 0.75rem;
          }
      `}} />
      <div className="relative w-full max-w-[90rem] px-4 sm:px-8 space-y-6">
          <section className="space-y-1.5 px-2">
              <h1 className="text-3xl font-semibold text-white">
                  Lomba Esai Dashboard
              </h1>
              <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                  Lengkapi data diri dan unggah dokumen pendaftaran Anda.
              </p>
          </section>
          
          <section className="relative rounded-2xl border border-transparent lg:border-border bg-card text-card-foreground p-0 lg:p-8 lg:shadow-sm">
              <div className="relative">
                  <LombaEsaiClient 
                      registration={registration} 
                      userEmail={user.email} 
                      userName={user.user_metadata?.full_name || user.user_metadata?.name} 
                  />
              </div>
          </section>
      </div>
    </div>
  );
}
