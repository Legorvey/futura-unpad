import type { Metadata } from "next"

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentErrorState from "@/components/registration/payment-error-state";
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
  getLatestMechaturaRegistration,
  isMechaturaPaymentExpired,
} from "@/lib/mechatura/registration";
import { getCachedAuth } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import PaymentActions from "./payment-actions";
import MechaturaPaymentLayout from "./mechatura-payment-layout";

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


const findMechaturaOrder = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
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

export const metadata: Metadata = {
  title: "Pembayaran"
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
    return (
      <PaymentErrorState
        iconType="alert"
        badgeTone="destructive"
        title="Tautan Pembayaran Tidak Valid"
        description="Format tautan pembayaran tidak dikenali atau parameter hilang. Silakan kembali untuk mengisi formulir pendaftaran lagi."
        primaryAction={{ label: "Kembali ke Beranda", href: "/" }}
        secondaryAction={{ label: "Daftar Mechatura", href: "/mechatura/form" }}
      />
    );
  }

  const supabase = await createClient();
  let order = await findOrder(supabase, orderId).catch((error) => {
    console.error("Payment order lookup failed", error.message);
    return null;
  });

  const { user } = await getCachedAuth();

  // Fallback: If order not found by order_id, check if authenticated user owns an active mechatura registration
  if (!order && user) {
    const latest = await getLatestMechaturaRegistration(supabase, user.id).catch(() => null);
    if (latest && latest.paymentOrderId !== orderId) {
      order = await findOrder(supabase, latest.paymentOrderId).catch(() => null);
    }
  }

  if (!order) {
    return (
      <PaymentErrorState
        iconType="alert"
        badgeTone="destructive"
        title="Pesanan Pembayaran Tidak Ditemukan"
        description="Data tagihan pendaftaran tidak dapat ditemukan di sistem kami. Pastikan Anda membuka tautan yang benar dari akun Anda."
        primaryAction={{ label: "Lihat Profil Saya", href: "/profile" }}
        secondaryAction={{ label: "Kembali ke Beranda", href: "/" }}
      />
    );
  }

  if (!user || order.userId !== user.id) {
    return (
      <PaymentErrorState
        iconType="shield"
        badgeTone="warning"
        title="Akses Pembayaran Ditolak"
        description="Pesanan pembayaran ini terhubung dengan akun lain. Silakan masuk dengan akun yang sesuai untuk mengakses dan menyelesaikan tagihan ini."
        primaryAction={{
          label: "Masuk ke Akun",
          href: `/login?next=${encodeURIComponent(`/payment?order_id=${orderId}`)}`,
        }}
        secondaryAction={{ label: "Kembali ke Beranda", href: "/" }}
      />
    );
  }

  const paymentStatus = isPaymentStatus(order.paymentStatus)
    ? order.paymentStatus
    : "unpaid";
  const isPaid = isCompletedMechaturaPaymentStatus(paymentStatus);
  const isExpired = isMechaturaPaymentExpired({
    createdAt: order.createdAt,
    paymentStatus,
  });

  if (paymentStatus === "cancelled" && !isPaid) {
    return (
      <PaymentErrorState
        iconType="cancel"
        badgeTone="warning"
        title="Pembayaran Dibatalkan"
        description="Transaksi pembayaran untuk pendaftaran ini telah dibatalkan. Silakan kembali ke formulir pendaftaran untuk mendaftar ulang atau periksa profil Anda."
        primaryAction={{ label: "Daftar Mechatura Ulang", href: "/mechatura/form" }}
        secondaryAction={{ label: "Lihat Profil Akun", href: "/profile" }}
      />
    );
  }

  if (paymentStatus === "failed" && !isPaid) {
    return (
      <PaymentErrorState
        iconType="failed"
        badgeTone="destructive"
        title="Pembayaran Gagal"
        description="Transaksi pembayaran Anda tidak berhasil atau dibatalkan. Silakan coba lakukan pembayaran ulang atau hubungi panitia jika membutuhkan bantuan."
        primaryAction={{ label: "Daftar Mechatura Ulang", href: "/mechatura/form" }}
        secondaryAction={{ label: "Lihat Profil Akun", href: "/profile" }}
      />
    );
  }

  if (isExpired && !isPaid) {
    return (
      <PaymentErrorState
        iconType="clock"
        badgeTone="warning"
        title="Batas Waktu Pembayaran Kedaluwarsa"
        description="Batas waktu pembayaran Mechatura telah berakhir. Silakan kembali ke halaman pendaftaran Mechatura untuk memulai pendaftaran baru."
        primaryAction={{ label: "Daftar Mechatura Ulang", href: "/mechatura/form" }}
        secondaryAction={{ label: "Lihat Profil Akun", href: "/profile" }}
      />
    );
  }

  const isMechatura = order.program === "mechatura";

  const statusBadge = {
    paid: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30",
    settled: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30",
    pending: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30",
    unpaid: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30",
    failed: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30",
    expired: "bg-neutral-500/15 text-neutral-800 dark:text-neutral-300 border border-neutral-500/30",
    cancelled: "bg-neutral-500/15 text-neutral-800 dark:text-neutral-300 border border-neutral-500/30",
    pending_verification: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30",
    verified: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30",
  }[paymentStatus] || "bg-muted text-muted-foreground";

  const content = (
    <div className="space-y-12 w-full max-w-3xl mx-auto">
      <section className={`overflow-hidden rounded-xl border ${isMechatura ? 'bg-card text-card-foreground border-border' : 'border-border bg-card'}`}>
        <div className="border-b border-border p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </span>
            <div>
              <h2 className="font-semibold">Ringkasan Pesanan</h2>
              <p className="text-sm text-muted-foreground">{order.title}</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          <div className="p-5">
            <h3 className="text-sm font-semibold">Detail Pendaftaran</h3>
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
              <span className="text-muted-foreground">Status pembayaran</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge}`}>
                {paymentStatusLabels[paymentStatus]}
              </span>
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
        <Button asChild className="h-11 rounded-xl w-full">
          <Link href={`/payment/success?order_id=${order.externalId}`} prefetch={false}>
            Lihat bukti pembayaran
          </Link>
        </Button>
      ) : (
        <PaymentActions orderId={order.externalId} />
      )}
    </div>
  );

  if (isMechatura) {
    return (
      <MechaturaPaymentLayout>
        {content}
      </MechaturaPaymentLayout>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center space-y-12 px-4 pb-16 pt-32 sm:px-8">
      <section className="space-y-2">
        <h1 className="max-w-xl text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-balance">
          Selesaikan Pembayaran.
        </h1>
        <p className="max-w-lg text-sm font-medium leading-relaxed text-neutral-500">
          Tinjau pesanan {registrationProgramLabels[order.program]} Anda sebelum
          melanjutkan ke pembayaran.
        </p>
      </section>

      {content}
    </main>
  );
}
