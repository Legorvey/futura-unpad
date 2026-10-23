import "server-only";
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";

export type AdminAuthResult = {
  user: User | null;
  adminAccess: boolean;
  needsMfaVerification: boolean;
  needsMfaEnrollment: boolean;
};

export const requireAdmin = async (): Promise<AdminAuthResult> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      adminAccess: false,
      needsMfaVerification: false,
      needsMfaEnrollment: false,
    };
  }

  const { data: adminRecord, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !adminRecord) {
    return {
      user,
      adminAccess: false,
      needsMfaVerification: false,
      needsMfaEnrollment: false,
    };
  }

  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const isAAL2 = aalData?.currentLevel === "aal2";
  const hasMfaEnrolled = aalData?.nextLevel === "aal2";

  return {
    user,
    adminAccess: isAAL2,
    needsMfaVerification: hasMfaEnrolled && !isAAL2,
    needsMfaEnrollment: !hasMfaEnrolled,
  };
};

export const getCachedAuth = cache(requireAdmin);

export const requireAdminOrRedirect = async () => {
  const { user, adminAccess, needsMfaVerification, needsMfaEnrollment } = await getCachedAuth();

  if (!user) {
    redirect("/login");
  }

  if (needsMfaEnrollment) {
    redirect("/login/mfa-enroll");
  }

  if (needsMfaVerification) {
    redirect("/login/mfa-verify?next=/admin");
  }

  if (!adminAccess) {
    notFound();
  }

  return { user };
};
