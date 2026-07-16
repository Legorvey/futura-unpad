import "server-only";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

export const requireAdmin = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, adminAccess: false };
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    user,
    adminAccess: !error && !!data,
  };
};

export const getCachedAuth = cache(requireAdmin);

export const requireAdminOrRedirect = async () => {
  const { user, adminAccess } = await getCachedAuth();
  if (!user) {
    redirect("/login?next=/admin");
  }
  if (!adminAccess) {
    redirect("/");
  }
  return { user };
};
