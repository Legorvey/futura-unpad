
import Link from "next/link";
import { CreditCard } from "lucide-react";
import PaymentProgress from "@/components/registration/payment-progress";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  isPaymentStatus,
  isRegistrationToken,
  mechaturaCompetitionLabels,
  paymentStatusLabels,
  registrationProgramLabels,
  type RegistrationProgram,
} from "@/lib/payment";
import {
  findMechaturaPaymentOrder,
  isCompletedMechaturaPaymentStatus,
} from "@/lib/mechatura/payment";
import {
  getMechaturaPaymentExpiresAt,
  isMechaturaPaymentExpired,
} from "@/lib/mechatura/registration";
import { getCachedAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import PaymentActions from "./payment-actions";
import PaymentDeadline from "./payment-deadline";

type PaymentSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

type PaymentOrder = {
  program: RegistrationProgram;
  title: string;
  subtitle: string;
  buyerName: string;
  email: string;
  phone: string;
  institution: string;
  ticketLabel: string;
  paymentStatus: string | null;
  externalId: string;
  userId: string | null;
  createdAt: string | null;
  amount: number;
  details: Array<[string, string]>;
};

function InvalidPaymentState() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col justify-center space-y-8 px-6 pb-32 pt-28 sm:px-8">
      <PaymentProgress />
      <section className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Payment link is invalid.
        </h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-500">
          Please return to registration and submit the form again.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/registration" prefetch={false}>Back to registration</Link>
        </Button>
      </section>
    </main>
  );
}

const findMechaturaOrder = async (
  supabase: ReturnType<typeof createAdminClient>,
  orderId: string
): Promise<PaymentOrder | null> => {
  const order = await findMechaturaPaymentOrder(supabase, orderId);

  if (!order) {
    return null;
  }

  return {
    program: "mechatura",
    title: "Mechatura Team Registration",
    subtitle: `${mechaturaCompetitionLabels[order.competitionType]} - ${order.robotName}`,
    buyerName: order.leader.name,
    email: order.leader.email,
    phone: order.leader.phone,
    institution: order.institution,
    ticketLabel: "Mechatura Competition Fee",
    paymentStatus: order.paymentStatus,
    externalId: order.paymentOrderId,
    userId: order.userId,
    createdAt: order.createdAt,
    amount: order.paymentAmount,
    details: [
      ["Team Name", order.teamName],
      ["Category", mechaturaCompetitionLabels[order.competitionType]],
      ["Robot", order.robotName],
      ["Leader", order.leader.name],
      ["Email", order.leader.email],
      ["Phone Number", order.leader.phone],
      ["Institution", order.institution],
    ],
  };
};

const findOrder = findMechaturaOrder;

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: PaymentSearchParams;
}) {
  const params = await searchParams;
  const orderId = Array.isArray(params.order_id)
    ? params.order_id[0]
    : params.order_id;

  if (!isRegistrationToken(orderId)) {
    return <InvalidPaymentState />;
  }

  const supabase = createAdminClient();
  const order = await findOrder(supabase, orderId).catch((error) => {
    console.error("Payment order lookup failed", error.message);
    return null;
  });

  if (!order) {
    return <InvalidPaymentState />;
  }

  if (order.userId) {
    const { user } = await getCachedAuth();

    if (order.userId !== user?.id) {
      return <InvalidPaymentState />;
    }
  }

  const paymentStatus = isPaymentStatus(order.paymentStatus)
    ? order.paymentStatus
    : "unpaid";
  const isPaid = isCompletedMechaturaPaymentStatus(paymentStatus);
  const isExpired = isMechaturaPaymentExpired({
    createdAt: order.createdAt,
    paymentStatus,
  });
  const expiresAt = getMechaturaPaymentExpiresAt(order.createdAt);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center space-y-12 px-6 pb-16 pt-32 sm:px-8">
      <section className="space-y-2">
        <h1 className="max-w-xl text-3xl sm:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Complete Payment.
        </h1>
        <p className="max-w-lg text-sm font-medium leading-relaxed text-neutral-500">
          Review your {registrationProgramLabels[order.program]} order before
          continuing to payment.
        </p>
      </section>

      <PaymentProgress program={order.program} />

      {!isPaid && expiresAt ? (
        <PaymentDeadline expiresAt={expiresAt.toISOString()} />
      ) : null}

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </span>
            <div>
              <h2 className="font-semibold">Order Summary</h2>
              <p className="text-sm text-muted-foreground">{order.title}</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          <div className="p-5">
            <h3 className="text-sm font-semibold">Registration Details</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {order.details.map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 break-words text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2 p-5 sm:grid-cols-[1fr_auto] sm:items-start">
            <div>
              <p className="font-medium">{order.ticketLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">{order.subtitle}</p>
            </div>
            <p className="font-medium">{formatCurrency(order.amount)}</p>
          </div>

          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.amount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Admin fee</span>
              <span>Rp. 0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment status</span>
              <span>{paymentStatusLabels[paymentStatus]}</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-muted/40 p-5">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-semibold tracking-tight">
              {formatCurrency(order.amount)}
            </span>
          </div>
        </div>
      </section>

      {isPaid ? (
        <Button asChild className="h-11 rounded-xl">
          <Link href={`/payment/success?order_id=${order.externalId}`} prefetch={false}>
            View receipt
          </Link>
        </Button>
      ) : isExpired ? (
        <section className="space-y-3">
          <p role="alert" className="text-sm leading-6 text-destructive">
            This Mechatura payment window has expired. Please return to the
            Mechatura registration page to start a new registration.
          </p>
          <Button asChild className="h-11 rounded-xl">
            <Link href="/registration/mechatura" prefetch={false}>Register again</Link>
          </Button>
        </section>
      ) : (
        <PaymentActions orderId={order.externalId} />
      )}
    </main>
  );
}
