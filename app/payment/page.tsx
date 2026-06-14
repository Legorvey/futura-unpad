import Link from "next/link";
import { CreditCard } from "lucide-react";
import RegistrationProgress from "@/components/registration-progress";
import { Button } from "@/components/ui/button";
import {
  attendanceLabels,
  formatCurrency,
  getPaymentAmount,
  isAcademicStatus,
  isAttendanceMethod,
  isPaymentStatus,
  isRegistrationToken,
  paymentStatusLabels,
  statusLabels,
} from "@/lib/payment";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/utils/supabase/server";
import PaymentActions from "./payment-actions";

type PaymentSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

type RegistrationOrder = {
  nama_lengkap: string;
  email: string;
  no_telepon: string;
  asal_institusi: string;
  status_akademika: unknown;
  presentasi_riset: unknown;
  payment_status: string | null;
  xendit_external_id: string;
  user_id: string | null;
};

function InvalidPaymentState() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-16 sm:px-8">
      <RegistrationProgress currentStep={2} />
      <section className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Payment link is invalid.
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Please return to registration and submit the form again.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/registration">Back to registration</Link>
        </Button>
      </section>
    </main>
  );
}

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
  const { data: order, error } = await supabase
    .from("seminar_registrations")
    .select(
      "nama_lengkap,email,no_telepon,asal_institusi,status_akademika,presentasi_riset,payment_status,xendit_external_id,user_id"
    )
    .eq("xendit_external_id", orderId)
    .maybeSingle<RegistrationOrder>();

  if (
    error ||
    !order ||
    !isAcademicStatus(order.status_akademika) ||
    !isAttendanceMethod(order.presentasi_riset)
  ) {
    return <InvalidPaymentState />;
  }

  if (order.user_id) {
    const authSupabase = await createClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (order.user_id !== user?.id) {
      return <InvalidPaymentState />;
    }
  }

  const total = getPaymentAmount(order.status_akademika, order.presentasi_riset);
  const paymentStatus = isPaymentStatus(order.payment_status)
    ? order.payment_status
    : "unpaid";
  const isPaid = paymentStatus === "paid" || paymentStatus === "settled";

  return (
    <main className="mx-auto w-full max-w-3xl space-y-12 px-6 py-16 sm:px-8">
      <section className="space-y-2">
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Complete Payment.
        </h1>
        <p className="max-w-lg text-sm leading-6 text-muted-foreground">
          Review your seminar order before continuing to payment.
        </p>
      </section>

      <RegistrationProgress currentStep={2} />

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </span>
            <div>
              <h2 className="font-semibold">Order Summary</h2>
              <p className="text-sm text-muted-foreground">
                Futura Seminar Registration
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          <div className="p-5">
            <h3 className="text-sm font-semibold">Participant Details</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="mt-1 text-sm font-medium">{order.nama_lengkap}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="mt-1 break-all text-sm font-medium">
                  {order.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="mt-1 text-sm font-medium">{order.no_telepon}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Institution</p>
                <p className="mt-1 text-sm font-medium">
                  {order.asal_institusi}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 p-5 sm:grid-cols-[1fr_auto] sm:items-start">
            <div>
              <p className="font-medium">Futura Seminar Ticket</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {statusLabels[order.status_akademika]} -{" "}
                {attendanceLabels[order.presentasi_riset]}
              </p>
            </div>
            <p className="font-medium">{formatCurrency(total)}</p>
          </div>

          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(total)}</span>
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
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </section>

      {isPaid ? (
        <Button asChild className="h-11 rounded-xl">
          <Link href={`/payment/success?order_id=${order.xendit_external_id}`}>
            View receipt
          </Link>
        </Button>
      ) : (
        <PaymentActions orderId={order.xendit_external_id} />
      )}
    </main>
  );
}
