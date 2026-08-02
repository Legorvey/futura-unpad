

import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
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
import {
  getLatestMechaturaRegistration,
  isMechaturaPaymentExpired,
} from "@/lib/mechatura/registration";
import { getCachedAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import MechaturaPaymentLayout from "../mechatura-payment-layout";
import PaymentErrorState from "@/components/registration/payment-error-state";

export const metadata: Metadata = {
  title: "Pembayaran Berhasil"
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

  const { user } = await getCachedAuth();

  // Fallback: If order not found by order_id, check if authenticated user owns an active mechatura registration
  if (!order && user) {
    const latest = await getLatestMechaturaRegistration(supabase, user.id).catch(() => null);
    if (latest && latest.paymentOrderId !== orderId) {
      order = await findOrder(supabase, latest.paymentOrderId).catch(() => null);
    }
  }

  if (!order) {
    return { status: "invalid" as const };
  }

  if (!user || order.userId !== user.id) {
    return { status: "unauthorized" as const };
  }

  const activeOrderId = order.externalId;

  if (!isCompletedMechaturaPaymentStatus(order.paymentStatus)) {
    const newStatus = await syncMechaturaPaymentStatus(
      supabase,
      activeOrderId,
      order.rawOrder
    ).catch((error) => {
      console.error("Midtrans payment sync failed", error.message);
      return null;
    });

    if (newStatus && newStatus !== order.paymentStatus) {
      order.paymentStatus = newStatus;
      if (isCompletedMechaturaPaymentStatus(newStatus)) {
         order.paidAt = new Date().toISOString(); // Predictively mark as paid for receipt
      }
    }
  }

  if (isCompletedMechaturaPaymentStatus(order.paymentStatus)) {
    return {
      status: "paid" as const,
      program: order.program,
      order: order,
      orderId: activeOrderId,
    };
  }

  if (order.paymentStatus === "cancelled") {
    return { status: "cancelled" as const, program: order.program, orderId: activeOrderId };
  }

  if (order.paymentStatus === "failed") {
    return { status: "failed" as const, program: order.program, orderId: activeOrderId };
  }

  if (
    order.paymentStatus === "expired" ||
    isMechaturaPaymentExpired({
      createdAt: order.rawOrder?.createdAt ?? null,
      paymentStatus: order.paymentStatus,
    })
  ) {
    return { status: "expired" as const, program: order.program, orderId: activeOrderId };
  }

  return {
    status: "pending" as const,
    program: order.program,
    order: order,
    orderId: activeOrderId,
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

  if (result.status === "unauthorized") {
    const nextUrl = isRegistrationToken(orderIdParam)
      ? `/payment/success?order_id=${encodeURIComponent(orderIdParam)}`
      : "/payment/success";

    return (
      <PaymentErrorState
        iconType="shield"
        badgeTone="warning"
        title="Akses Pembayaran Ditolak"
        description="Anda harus masuk dengan akun yang melakukan pendaftaran untuk melihat rincian pembayaran ini."
        primaryAction={{
          label: "Masuk ke Akun",
          href: `/login?next=${encodeURIComponent(nextUrl)}`,
        }}
        secondaryAction={{ label: "Kembali ke Beranda", href: "/" }}
      />
    );
  }

  if (result.status === "invalid") {
    return (
      <PaymentErrorState
        iconType="alert"
        badgeTone="destructive"
        title="Pembayaran Tidak Ditemukan"
        description="Kami tidak dapat menemukan pesanan pembayaran yang valid untuk tautan ini. Silakan periksa kembali tautan Anda atau kembali ke profil Anda."
        primaryAction={{ label: "Ke Profil Akun", href: "/profile" }}
        secondaryAction={{ label: "Kembali ke Beranda", href: "/" }}
      />
    );
  }

  if (result.status === "expired") {
    return (
      <PaymentErrorState
        iconType="clock"
        badgeTone="warning"
        title="Batas Waktu Pembayaran Kedaluwarsa"
        description="Batas waktu pembayaran Mechatura telah berakhir. Silakan kembali ke halaman pendaftaran Mechatura untuk memulai pendaftaran baru."
        primaryAction={{ label: "Daftar Mechatura Ulang", href: "/mechatura/form" }}
        secondaryAction={{ label: "Ke Profil Akun", href: "/profile" }}
      />
    );
  }

  if (result.status === "cancelled") {
    return (
      <PaymentErrorState
        iconType="cancel"
        badgeTone="warning"
        title="Pembayaran Dibatalkan"
        description="Transaksi pembayaran untuk pendaftaran ini telah dibatalkan. Anda dapat mengulang proses pendaftaran dari formulir."
        primaryAction={{ label: "Daftar Mechatura Ulang", href: "/mechatura/form" }}
        secondaryAction={{ label: "Ke Profil Akun", href: "/profile" }}
      />
    );
  }

  if (result.status === "failed") {
    const targetOrderId = ("orderId" in result && result.orderId) || orderIdParam;
    return (
      <PaymentErrorState
        iconType="failed"
        badgeTone="destructive"
        title="Pembayaran Gagal Diproses"
        description="Transaksi pembayaran Anda tidak berhasil diselesaikan. Silakan coba ulangi proses pembayaran atau hubungi panitia jika membutuhkan bantuan."
        primaryAction={{
          label: "Coba Pembayaran Lagi",
          href: isRegistrationToken(targetOrderId)
            ? `/payment?order_id=${encodeURIComponent(targetOrderId)}`
            : "/mechatura/form",
        }}
        secondaryAction={{ label: "Ke Profil Akun", href: "/profile" }}
      />
    );
  }

  if (result.status === "pending") {
    const targetOrderId = ("orderId" in result && result.orderId) || orderIdParam;
    return (
      <PaymentErrorState
        iconType="clock"
        badgeTone="warning"
        title="Menunggu Konfirmasi Pembayaran"
        description="Pembayaran Anda sedang dalam proses verifikasi. Silakan tunggu beberapa saat, lalu muat ulang halaman ini atau periksa status di profil akun Anda."
        primaryAction={{
          label: "Kembali ke Pembayaran",
          href: isRegistrationToken(targetOrderId)
            ? `/payment?order_id=${encodeURIComponent(targetOrderId)}`
            : "/profile",
        }}
        secondaryAction={{ label: "Ke Profil Akun", href: "/profile" }}
      />
    );
  }

  const title = "Pembayaran Selesai.";
  const description =
    "Pembayaran pendaftaran Mechatura Anda telah diverifikasi. Simpan bukti pembayaran di bawah ini untuk validasi panitia.";

  if (result.program === "mechatura" && result.order?.rawOrder) {
    return (
      <MechaturaPaymentLayout title={title} description={description}>
        <div className="space-y-8 w-full max-w-3xl mx-auto">
          <section className="space-y-8">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-start gap-4 p-4 sm:p-6 border-b">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                  <CheckCircle2 className="h-5 w-5 text-foreground" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">
                    Pembayaran dan Pendaftaran Selesai
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                    Pendaftaran kompetisi Mechatura Anda telah diverifikasi. Di bawah ini adalah detail tim Anda.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                      {result.order.rawOrder.teamName}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {result.order.rawOrder.institution} / {mechaturaCompetitionLabels[result.order.rawOrder.competitionType]}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-medium text-muted-foreground">Jumlah yang Dibayar</p>
                    <p className="text-xl font-semibold mt-1">{formatCurrency(result.order.rawOrder.paymentAmount)}</p>
                  </div>
                </div>

                <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Nama Robot</dt>
                    <dd className="mt-1 font-medium">{result.order.rawOrder.robotName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">ID Pendaftaran</dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">{result.order.id}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Ketua Tim</dt>
                    <dd className="mt-1 font-medium">{result.order.rawOrder.leader.name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Kontak Ketua</dt>
                    <dd className="mt-1 font-medium">{result.order.rawOrder.leader.email}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Total Anggota</dt>
                    <dd className="mt-1 font-medium">{result.order.rawOrder.members.length + 1} orang</dd>
                  </div>
                </dl>

                {result.order.rawOrder.members.length > 0 && (
                  <div className="mt-5 border-t border-border pt-4">
                    <h3 className="text-sm font-medium mb-3">Anggota Tambahan</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {result.order.rawOrder.members.map((member, i) => (
                        <div
                          key={i}
                          className="rounded-[8px] border border-border p-4 flex flex-col justify-center"
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {member.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              Anggota
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" className="h-11 rounded-xl" asChild>
                <Link href="/">Ke Beranda</Link>
              </Button>
              <Button type="button" className="h-11 rounded-xl" asChild>
                <Link href="/profile">Ke Profil</Link>
              </Button>
            </div>
          </section>
        </div>
      </MechaturaPaymentLayout>
    );
  }

  return (
    <PaymentErrorState
      iconType="alert"
      badgeTone="destructive"
      title="Pesanan Tidak Ditemukan"
      description="Data rincian pendaftaran tidak dapat ditemukan. Silakan periksa kembali akun Anda."
      primaryAction={{ label: "Ke Profil Akun", href: "/profile" }}
      secondaryAction={{ label: "Kembali ke Beranda", href: "/" }}
    />
  );
}


