import "server-only";

import type { createAdminClient } from "@/lib/supabase-admin";
import {
  createRegistrationToken,
  isMechaturaCompetitionType,
  isMidtransCompatibleOrderId,
  isCompletedPaymentStatus,
  mechaturaCompetitionLabels,
  mechaturaPaymentAmount,
  completedPaymentStatuses,
  type MechaturaCompetitionType,
  type PaymentStatus,
} from "@/lib/payment";
import {
  getMidtransTransactionStatus,
  mapMidtransPaymentStatus,
} from "@/lib/midtrans";

type SupabaseAdminClient = ReturnType<typeof createAdminClient>;

type MechaturaRegistrationPaymentRow = {
  id: string;
  team_name: string;
  institution: string;
  competition_type: unknown;
  robot_name: string;
  payment_status: string | null;
  payment_amount: number | null;
  midtrans_order_id: string;
  user_id: string | null;
  created_at: string | null;
  paid_at?: string | null;
  mechatura_members?: {
    full_name: string;
    email: string | null;
    phone: string | null;
  }[];
};

export type MechaturaPaymentOrder = {
  id: string;
  teamName: string;
  institution: string;
  competitionType: MechaturaCompetitionType;
  robotName: string;
  paymentStatus: string | null;
  paymentAmount: number;
  paymentOrderId: string;
  userId: string | null;
  createdAt: string | null;
  paidAt: string | null;
  leader: {
    name: string;
    email: string;
    phone: string;
  };
  members: { name: string }[];
};

export const mechaturaPaymentOrderSelect =
  "id,team_name,institution,competition_type,robot_name,payment_status,payment_amount,midtrans_order_id,user_id,created_at,paid_at";

export async function findMechaturaPaymentOrder(
  supabase: SupabaseAdminClient,
  orderId: string
): Promise<MechaturaPaymentOrder | null> {
  const { data: registration, error } = await supabase
    .from("mechatura_registrations")
    .select(`${mechaturaPaymentOrderSelect},mechatura_members(full_name,email,phone,is_leader)`)
    .eq("midtrans_order_id", orderId)
    .maybeSingle<any>();

  if (error) {
    throw error;
  }

  if (
    !registration ||
    !isMechaturaCompetitionType(registration.competition_type)
  ) {
    return null;
  }

  const members = Array.isArray(registration.mechatura_members) 
    ? registration.mechatura_members 
    : [];
    
  const leader = members.find((m: any) => m.is_leader);

  if (!leader?.email || !leader.phone) {
    return null;
  }

  return {
    id: registration.id,
    teamName: registration.team_name,
    institution: registration.institution,
    competitionType: registration.competition_type,
    robotName: registration.robot_name,
    paymentStatus: registration.payment_status,
    paymentAmount: registration.payment_amount ?? mechaturaPaymentAmount,
    paymentOrderId: registration.midtrans_order_id,
    userId: registration.user_id,
    createdAt: registration.created_at,
    paidAt: registration.paid_at ?? null,
    leader: {
      name: leader.full_name,
      email: leader.email,
      phone: leader.phone,
    },
    members: members.filter((m: any) => !m.is_leader).map((m: any) => ({ name: m.full_name })),
  };
}

export function getMechaturaPaymentItemName(order: MechaturaPaymentOrder) {
  return `Mechatura ${mechaturaCompetitionLabels[order.competitionType]}`;
}

export function isCompletedMechaturaPaymentStatus(status: string | null) {
  return isCompletedPaymentStatus(status);
}

export async function ensureMidtransCompatibleMechaturaOrder(
  supabase: SupabaseAdminClient,
  order: MechaturaPaymentOrder
): Promise<MechaturaPaymentOrder> {
  if (isMidtransCompatibleOrderId(order.paymentOrderId)) {
    return order;
  }

  const nextOrderId = createRegistrationToken();
  const { data, error } = await supabase
    .from("mechatura_registrations")
    .update({ midtrans_order_id: nextOrderId })
    .eq("id", order.id)
    .eq("midtrans_order_id", order.paymentOrderId)
    .select("midtrans_order_id")
    .maybeSingle<{ midtrans_order_id: string }>();

  if (error) {
    throw error;
  }

  if (!data?.midtrans_order_id) {
    throw new Error("Unable to rotate Midtrans order id");
  }

  return {
    ...order,
    paymentOrderId: data.midtrans_order_id,
  };
}

export async function updateMechaturaPaymentStatus(
  supabase: SupabaseAdminClient,
  orderId: string,
  status: PaymentStatus,
  paymentType?: string
) {
  const completed = isCompletedPaymentStatus(status);

  // Use a conditional update to safely enforce idempotency without refetching first
  let query = supabase
    .from("mechatura_registrations")
    .update({
      payment_status: status,
      payment_type: paymentType ?? null,
      paid_at: completed ? new Date().toISOString() : null,
      registration_status: completed ? "registered" : "waiting_payment",
    })
    .eq("midtrans_order_id", orderId);

  query = query.not("payment_status", "in", `(${completedPaymentStatuses.join(",")})`);

  const { error } = await query;

  if (error) {
    throw error;
  }
}

export async function syncMechaturaPaymentStatus(
  supabase: SupabaseAdminClient,
  orderId: string,
  existingOrder?: MechaturaPaymentOrder | null
) {
  const order = existingOrder !== undefined ? existingOrder : await findMechaturaPaymentOrder(supabase, orderId);

  if (
    order &&
    isCompletedMechaturaPaymentStatus(order.paymentStatus)
  ) {
    return order.paymentStatus as PaymentStatus;
  }

  const status = await getMidtransTransactionStatus(orderId);

  if (!status) {
    return null;
  }

  const paymentStatus = mapMidtransPaymentStatus(
    status.transaction_status,
    status.fraud_status
  );

  await updateMechaturaPaymentStatus(supabase, orderId, paymentStatus, status.payment_type);

  return paymentStatus;
}
