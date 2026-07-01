import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import PaymentProgress from "@/components/registration/payment-progress";
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
  syncMechaturaPaymentStatus,
} from "@/lib/mechatura/payment";
import { getCachedAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import ReceiptImage, { type ReceiptData } from "./receipt-image";

type SuccessSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

type VerificationOrder = {
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
  };
};

const findOrder = findMechaturaOrder;

async function verifyPayment(orderId: string) {
  const supabase = createAdminClient();
  await syncMechaturaPaymentStatus(supabase, orderId).catch((error) => {
    console.error("Midtrans payment sync failed", error.message);
  });

  const order = await findOrder(supabase, orderId);

  if (!order) {
    return { status: "invalid" as const };
  }

  if (order.userId) {
    const { user } = await getCachedAuth();

    if (order.userId !== user?.id) {
      return { status: "invalid" as const };
    }
  }

  if (order.paymentStatus === "paid" || order.paymentStatus === "settled") {
    return {
      status: "paid" as const,
      program: order.program,
      receipt: createReceipt(order),
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
  const Icon = isPaid ? CheckCircle2 : Clock;

  return (
    <main className="mx-auto w-full max-w-3xl space-y-12 px-6 py-16 sm:px-8">
      <PaymentProgress program={"program" in result ? result.program : undefined} />

      <section className="rounded-xl p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon className="h-7 w-7 text-foreground" />
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          {isPaid ? "Payment Successful" : "Payment Verification Pending"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {isPaid
            ? "Thank you. Your Futura registration payment has been completed and verified."
            : "We received the payment redirect, but the payment has not been verified yet. Please wait a moment or refresh this page."}
        </p>

        <div className="mt-8 flex justify-center">
          <Button asChild className="h-11 rounded-xl px-4 py-5">
            <Link href={isPaid ? "/" : "/registration"}>
              {isPaid ? "Back to Home" : "Back to Registration"}
            </Link>
          </Button>
        </div>
      </section>

      {isPaid && result.receipt ? <ReceiptImage receipt={result.receipt} /> : null}
    </main>
  );
}
