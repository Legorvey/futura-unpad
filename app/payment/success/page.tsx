

import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

import PaymentProgress from "@/components/registration/payment-progress";
import { ReceiptImage, type ReceiptData } from "@/components/registration/mechatura-invoice";
import { MechaturaSuccessModal } from "./mechatura-success-modal";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  isRegistrationToken,
  mechaturaCompetitionLabels,
  registrationProgramLabels,
  type RegistrationProgram,
} from "@/lib/payment";
import {
  findMechaturaPaymentOrder,
  isCompletedMechaturaPaymentStatus,
  syncMechaturaPaymentStatus,
} from "@/lib/mechatura/payment";
import { getCachedAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export const metadata: Metadata = {
  title: "Payment Complete | Futura",
};

type SuccessSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

type VerificationOrder = {
  id: string;
  program: RegistrationProgram;
  table: "mechatura_registrations";
  name: string;
  email: string;
  phone: string;
  institution: string;
  ticket: string;
  amount: number;
  paidAt: string | null;
  paymentStatus: string | null;
  externalId: string;
  userId: string | null;
  rawOrder?: import("@/lib/mechatura/payment").MechaturaPaymentOrder;
};

const createReceipt = (order: VerificationOrder): ReceiptData => ({
  title: `${registrationProgramLabels[order.program]} Payment Receipt`,
  name: order.name,
  email: order.email,
  phone: order.phone,
  institution: order.institution,
  program: registrationProgramLabels[order.program],
  ticket: order.ticket,
  amount: formatCurrency(order.amount),
  paidAt: order.paidAt ? new Date(order.paidAt).toLocaleString("id-ID") : "-",
  invoiceId: order.externalId,
  referenceId: order.externalId,
});

const findMechaturaOrder = async (
  supabase: ReturnType<typeof createAdminClient>,
  orderId: string
): Promise<VerificationOrder | null> => {
  const order = await findMechaturaPaymentOrder(supabase, orderId);

  if (!order) {
    return null;
  }

  return {
    id: order.id,
    program: "mechatura",
    table: "mechatura_registrations",
    name: `${order.teamName} / ${order.leader.name}`,
    email: order.leader.email,
    phone: order.leader.phone,
    institution: order.institution,
    ticket: `${mechaturaCompetitionLabels[order.competitionType]} - ${order.robotName}`,
    amount: order.paymentAmount,
    paidAt: order.paidAt,
    paymentStatus: order.paymentStatus,
    externalId: order.paymentOrderId,
    userId: order.userId,
    rawOrder: order,
  };
};

const findOrder = findMechaturaOrder;

async function verifyPayment(orderId: string) {
  const supabase = createAdminClient();
  let order = await findOrder(supabase, orderId);

  if (!order) {
    return { status: "invalid" as const };
  }

  if (order.userId) {
    const { user } = await getCachedAuth();

    if (order.userId !== user?.id) {
      return { status: "invalid" as const };
    }
  }

  if (!isCompletedMechaturaPaymentStatus(order.paymentStatus)) {
    const newStatus = await syncMechaturaPaymentStatus(supabase, orderId, order.rawOrder).catch((error) => {
      console.error("Midtrans payment sync failed", error.message);
      return null;
    });

    if (newStatus && newStatus !== order.paymentStatus) {
      order.paymentStatus = newStatus;
      if (isCompletedMechaturaPaymentStatus(newStatus)) {
         order.paidAt = new Date().toISOString(); // Predictively mark as paid for receipt
      }
    }

    if (!order) {
      return { status: "invalid" as const };
    }
  }

  if (isCompletedMechaturaPaymentStatus(order.paymentStatus)) {
    return {
      status: "paid" as const,
      program: order.program,
      receipt: createReceipt(order),
      order: order,
    };
  }

  return { status: "pending" as const, program: order.program };
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: SuccessSearchParams;
}) {
  const params = await searchParams;
  const orderIdParam = Array.isArray(params.order_id)
    ? params.order_id[0]
    : params.order_id;
  const result = isRegistrationToken(orderIdParam)
    ? await verifyPayment(orderIdParam)
    : { status: "invalid" as const };

  const isPaid = result.status === "paid";
  const paymentHref = isRegistrationToken(orderIdParam)
    ? `/payment?order_id=${encodeURIComponent(orderIdParam)}`
    : "/registration";
  const isInvalid = result.status === "invalid";
  const Icon = isPaid ? CheckCircle2 : Clock;
  const title = isPaid
    ? "Payment Complete."
    : isInvalid
      ? "Payment Not Found."
      : "Payment Verification Pending.";
  const description = isPaid
    ? "Your Mechatura registration payment is verified. Keep the receipt below for committee validation."
    : isInvalid
      ? "We could not find a valid payment order for this link. Please return to your registration flow."
      : "We received the payment redirect, but the gateway confirmation is not final yet. Please wait a moment, then refresh once.";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col justify-center space-y-8 px-6 pb-32 pt-28 sm:px-8">
      <section>
        <div className="space-y-2">
          <h1 className="max-w-xl text-3xl sm:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-lg text-sm font-medium leading-relaxed text-neutral-500">
            {description}
          </p>
        </div>
      </section>

      <section className="space-y-8">
        <PaymentProgress program={"program" in result ? result.program : undefined} />
      </section>

      {isPaid && result.receipt ? (
        <section className="space-y-8">
          <ReceiptImage 
            receipt={result.receipt} 
            mechaturaOrder={result.program === "mechatura" ? result.order?.rawOrder : undefined} 
          />

          {result.program === "mechatura" && result.order?.rawOrder && (
            <MechaturaSuccessModal />
          )}
        </section>
      ) : null}
    </main>
  );
}


