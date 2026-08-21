import "server-only";

import { isCompletedPaymentStatus } from "@/lib/payment";
import { SupabaseClient } from "@supabase/supabase-js";

type DbClient = SupabaseClient<any>;

const MECHATURA_DOCUMENT_BUCKET = "mechatura-documents";
const MECHATURA_PAYMENT_DUE_HOURS = 24;
const MECHATURA_PAYMENT_DUE_MS = MECHATURA_PAYMENT_DUE_HOURS * 60 * 60 * 1000;

export type LatestMechaturaRegistration = {
  id: string;
  teamName: string;
  paymentStatus: string | null;
  paymentOrderId: string;
  createdAt: string | null;
};

type LatestMechaturaRegistrationRow = {
  id: string;
  team_name: string;
  payment_status: string | null;
  midtrans_order_id: string;
  created_at: string | null;
};

type MechaturaDeleteTarget = {
  id: string;
  user_id: string;
  payment_status: string | null;
  member_document_path: string | null;
  robot_document_path: string | null;
};

const latestMechaturaRegistrationSelect =
  "id,team_name,payment_status,midtrans_order_id,created_at";

const expiredPaymentStatuses = new Set(["expired", "failed", "cancelled"]);

export { MECHATURA_PAYMENT_DUE_HOURS };

export async function findLatestMechaturaRegistrationForUser(
  supabase: DbClient,
  userId: string
): Promise<LatestMechaturaRegistration | null> {
  const { data, error } = await supabase
    .from("mechatura_registrations")
    .select(latestMechaturaRegistrationSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<LatestMechaturaRegistrationRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    teamName: data.team_name,
    paymentStatus: data.payment_status,
    paymentOrderId: data.midtrans_order_id,
    createdAt: data.created_at,
  };
}

export const getLatestMechaturaRegistration = findLatestMechaturaRegistrationForUser;

export function getMechaturaPaymentExpiresAt(createdAt: string | null) {
  if (!createdAt) {
    return null;
  }

  const createdTime = new Date(createdAt).getTime();

  if (!Number.isFinite(createdTime)) {
    return null;
  }

  return new Date(createdTime + MECHATURA_PAYMENT_DUE_MS);
}

export function getMechaturaPaymentRemainingMs(
  registration: Pick<LatestMechaturaRegistration, "createdAt" | "paymentStatus">,
  now = new Date()
) {
  if (isCompletedPaymentStatus(registration.paymentStatus)) {
    return null;
  }

  const expiresAt = getMechaturaPaymentExpiresAt(registration.createdAt);

  if (!expiresAt) {
    return null;
  }

  return Math.max(0, expiresAt.getTime() - now.getTime());
}

export function isMechaturaPaymentExpired(
  registration: Pick<LatestMechaturaRegistration, "createdAt" | "paymentStatus">,
  now = new Date()
) {
  if (isCompletedPaymentStatus(registration.paymentStatus)) {
    return false;
  }

  if (
    registration.paymentStatus &&
    expiredPaymentStatuses.has(registration.paymentStatus)
  ) {
    return true;
  }

  const remainingMs = getMechaturaPaymentRemainingMs(registration, now);

  return remainingMs !== null && remainingMs <= 0;
}

export function getMechaturaRegistrationStepHref(
  registration: LatestMechaturaRegistration
) {
  const orderId = encodeURIComponent(registration.paymentOrderId);

  if (isCompletedPaymentStatus(registration.paymentStatus)) {
    return `/payment/success?order_id=${orderId}`;
  }

  return `/payment?order_id=${orderId}`;
}

export type DeleteMechaturaResult =
  | { success: true }
  | { success: false; reason: "not_found" | "is_paid" };

export async function deleteMechaturaRegistration(
  supabase: DbClient,
  registrationId: string,
  userId?: string,
  options: { allowPaid?: boolean } = {}
): Promise<DeleteMechaturaResult> {
  let query = supabase
    .from("mechatura_teams")
    .select("id, payment_status, leader_id")
    .eq("id", registrationId);

  const { data: team, error: lookupError } = await query.maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (!team) {
    return { success: false, reason: "not_found" };
  }

  // Security guard: Never delete completed paid registrations unless explicitly authorized (e.g. by admin)
  if (!options.allowPaid && isCompletedPaymentStatus(team.payment_status)) {
    return { success: false, reason: "is_paid" };
  }

  // If a specific userId is requested, ensure they are the leader of the team
  if (userId && team.leader_id !== userId) {
      return { success: false, reason: "not_found" };
  }

  // Delete members first to avoid foreign key constraints (if no ON DELETE CASCADE)
  const { error: membersError } = await supabase
    .from("mechatura_members")
    .delete()
    .eq("team_id", registrationId);

  if (membersError) {
    throw membersError;
  }

  const { error: teamError } = await supabase
    .from("mechatura_teams")
    .delete()
    .eq("id", registrationId);

  if (teamError) {
    throw teamError;
  }

  return { success: true };
}
