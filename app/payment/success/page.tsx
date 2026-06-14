import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import RegistrationProgress from "@/components/registration-progress";
import { Button } from "@/components/ui/button";
import {
  attendanceLabels,
  formatCurrency,
  getPaymentAmount,
  getXenditPaidAt,
  isAcademicStatus,
  isAttendanceMethod,
  isRegistrationToken,
  normalizeXenditInvoiceStatus,
  statusLabels,
} from "@/lib/payment";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/utils/supabase/server";
import { getXenditInvoice } from "@/lib/xendit";
import ReceiptImage, { type ReceiptData } from "./receipt-image";

type SuccessSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

type PaymentVerificationRow = {
  nama_lengkap: string;
  email: string;
  no_telepon: string;
  asal_institusi: string;
  status_akademika: unknown;
  presentasi_riset: unknown;
  payment_amount: number | null;
  paid_at: string | null;
  payment_status: string | null;
  xendit_external_id: string;
  xendit_invoice_id: string | null;
  xendit_invoice_url: string | null;
  user_id: string | null;
};

function createReceipt(data: PaymentVerificationRow): ReceiptData | null {
  if (
    !isAcademicStatus(data.status_akademika) ||
    !isAttendanceMethod(data.presentasi_riset)
  ) {
    return null;
  }

  const amount =
    data.payment_amount ??
    getPaymentAmount(data.status_akademika, data.presentasi_riset);

  return {
    name: data.nama_lengkap,
    email: data.email,
    phone: data.no_telepon,
    institution: data.asal_institusi,
    academicStatus: statusLabels[data.status_akademika],
    attendance: attendanceLabels[data.presentasi_riset],
    amount: formatCurrency(amount),
    paidAt: data.paid_at
      ? new Date(data.paid_at).toLocaleString("id-ID")
      : "-",
    invoiceId: data.xendit_invoice_id ?? "-",
    referenceId: data.xendit_external_id,
  };
}

async function verifyPayment(orderId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("seminar_registrations")
    .select(
      "nama_lengkap,email,no_telepon,asal_institusi,status_akademika,presentasi_riset,payment_amount,paid_at,payment_status,xendit_external_id,xendit_invoice_id,xendit_invoice_url,user_id"
    )
    .eq("xendit_external_id", orderId)
    .maybeSingle<PaymentVerificationRow>();

  if (error || !data) {
    return { status: "invalid" as const };
  }

  if (data.user_id) {
    const authSupabase = await createClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (data.user_id !== user?.id) {
      return { status: "invalid" as const };
    }
  }

  if (data.payment_status === "paid" || data.payment_status === "settled") {
    return { status: "paid" as const, receipt: createReceipt(data) };
  }

  if (!data.xendit_invoice_id) {
    return { status: "pending" as const };
  }

  const invoice = await getXenditInvoice(data.xendit_invoice_id);

  if (!invoice || invoice.external_id !== data.xendit_external_id) {
    return { status: "pending" as const };
  }

  const paymentStatus = normalizeXenditInvoiceStatus(invoice.status);
  const paidAt =
    paymentStatus === "paid" || paymentStatus === "settled"
      ? getXenditPaidAt(invoice)
      : data.paid_at;
  const { error: updateError } = await supabase
    .from("seminar_registrations")
    .update({
      payment_status: paymentStatus,
      paid_at: paidAt,
      xendit_invoice_id: invoice.id,
      xendit_invoice_url: invoice.invoice_url ?? data.xendit_invoice_url,
    })
    .eq("xendit_external_id", data.xendit_external_id);

  if (updateError) {
    console.error("Payment sync failed", updateError.message);
    return { status: "pending" as const };
  }

  if (paymentStatus !== "paid" && paymentStatus !== "settled") {
    return { status: "pending" as const };
  }

  return {
    status: "paid" as const,
    receipt: createReceipt({
      ...data,
      payment_status: paymentStatus,
      paid_at: paidAt,
      xendit_invoice_id: invoice.id,
      xendit_invoice_url: invoice.invoice_url ?? data.xendit_invoice_url,
    }),
  };
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
      <RegistrationProgress currentStep={2} />

      <section className="rounded-xl p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon className="h-7 w-7 text-foreground" />
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          {isPaid ? "Payment Successful" : "Payment Verification Pending"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {isPaid
            ? "Thank you. Your Futura seminar registration payment has been completed and verified."
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
