import "server-only";
import { createAdminClient } from "@/lib/supabase-admin";

const DEFAULT_SEMINAR_WA_GROUP_URL =
  "https://chat.whatsapp.com/BDGFMtpiHS71Ku3WvXwOlj?s=cl&p=a&iam=2";

const escapeLikePattern = (value: string) =>
  value.replace(/[\\%_]/g, "\\$&");

/** Checks whether a normalized email already has a main-contact seminar registration. */
export async function isSeminarEmailRegistered(email: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("seminar_registrations")
    .select("id")
    .ilike("email", escapeLikePattern(email))
    .eq("is_main_contact", true)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.[0]);
}

export function getSeminarWaGroupUrl(): string | null {
  const raw =
    process.env.SEMINAR_WA_GROUP_URL?.trim() || DEFAULT_SEMINAR_WA_GROUP_URL;
  if (!raw) {
    return null;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}
