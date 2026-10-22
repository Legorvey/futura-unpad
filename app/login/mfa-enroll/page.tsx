import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { MfaBackButton } from "@/components/auth/mfa-back-button";
import MfaEnrollForm from "./mfa-enroll-form";

export const metadata: Metadata = {
  title: "Setup Google Authenticator - Futura",
};

export default async function MfaEnrollPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure only admins can access the MFA enrollment page
  const { data: adminRecord, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !adminRecord) {
    notFound();
  }

  // Only redirect if they actually have an active verified factor AND are at AAL2.
  // This prevents trapped redirect loops if an admin just reset/unenrolled their factor.
  const [{ data: aalData }, { data: factors }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  const hasVerifiedFactor = factors?.totp?.some((f) => f.status === "verified");
  if (hasVerifiedFactor && aalData?.currentLevel === "aal2") {
    redirect("/admin");
  }

  const isPasswordUser =
    user.app_metadata?.provider === "email" ||
    user.identities?.some((id) => id.provider === "email");

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-white font-sans relative">
      <div className="absolute top-8 left-6 lg:left-12">
        <MfaBackButton />
      </div>

      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-zinc-500">
            Memuat formulir...
          </div>
        }
      >
        <MfaEnrollForm isPasswordUser={!!isPasswordUser} />
      </Suspense>
    </main>
  );
}
