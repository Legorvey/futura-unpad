import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSafeAdminRedirectPath } from "@/lib/navigation";
import { MfaBackButton } from "@/components/auth/mfa-back-button";
import MfaEnrollForm from "./mfa-enroll-form";

export const metadata: Metadata = {
  title: "Setup Google Authenticator - Futura",
};

type MfaEnrollSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export default async function MfaEnrollPage({
  searchParams,
}: {
  searchParams: MfaEnrollSearchParams;
}) {
  const [params, supabase] = await Promise.all([searchParams, createClient()]);
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

  const [{ data: aalData }, { data: factors }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  const targetAdminPath = getSafeAdminRedirectPath(params.next, "/admin");
  const hasVerifiedFactor = factors?.totp?.some((f) => f.status === "verified");

  if (hasVerifiedFactor) {
    if (aalData?.currentLevel === "aal2") {
      redirect(targetAdminPath);
    }
    redirect(`/login/mfa-verify?next=${encodeURIComponent(targetAdminPath)}`);
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
