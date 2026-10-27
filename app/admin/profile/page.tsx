import type { Metadata } from "next";
import { requireAdminOrRedirect } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { AdminProfileClient } from "./admin-profile-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Profil Admin - Futura",
  description: "Pengaturan profil administrator Futura Unpad",
};

export default async function AdminProfilePage() {
  const { user } = await requireAdminOrRedirect();
  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verifiedTotp = factors?.totp?.find((f) => f.status === "verified");

  const isPasswordUser =
    user.app_metadata?.provider === "email" ||
    user.identities?.some((id) => id.provider === "email");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 min-w-0">
      <AdminProfileClient
        user={user}
        verifiedTotp={
          verifiedTotp
            ? {
                id: verifiedTotp.id,
                friendly_name: verifiedTotp.friendly_name,
                created_at: verifiedTotp.created_at,
                last_challenged_at: (
                  verifiedTotp as { last_challenged_at?: string }
                ).last_challenged_at,
              }
            : null
        }
        isPasswordUser={!!isPasswordUser}
      />
    </div>
  );
}
