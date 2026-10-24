import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSafeAdminRedirectPath } from "@/lib/navigation";
import { MfaBackButton } from "@/components/auth/mfa-back-button";
import MfaVerifyForm from "./mfa-verify-form";

export const metadata: Metadata = {
  title: "Verifikasi Dua Langkah - Futura",
};

type MfaVerifySearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MfaVerifyPage({
  searchParams,
}: {
  searchParams: MfaVerifySearchParams;
}) {
  const [params, supabase] = await Promise.all([searchParams, createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure only admins can access the MFA verification page
  const { data: adminRecord, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !adminRecord) {
    notFound();
  }

  const [{ data: aalData }, { data: factors }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  const targetAdminPath = getSafeAdminRedirectPath(params.next, "/admin");

  // If already at AAL2, redirect directly to target admin destination
  if (aalData?.currentLevel === "aal2") {
    redirect(targetAdminPath);
  }

  // If no verified factor exists, redirect to enrollment
  const verifiedTotp = factors?.totp?.find((f) => f.status === "verified");
  if (!verifiedTotp) {
    redirect(`/login/mfa-enroll?next=${encodeURIComponent(targetAdminPath)}`);
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-white font-sans relative">
      <div className="absolute top-8 left-6 lg:left-12">
        <MfaBackButton />
      </div>

      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-zinc-500">
            Memuat verifikasi...
          </div>
        }
      >
        <MfaVerifyForm initialFactorId={verifiedTotp.id} />
      </Suspense>
    </main>
  );
}
