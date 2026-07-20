

import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

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
  isCompletedMechaturaPaymentStatus,
  syncMechaturaPaymentStatus,
} from "@/lib/mechatura/payment";
import { getCachedAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

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
    ? "Pembayaran Selesai."
    : isInvalid
      ? "Pembayaran Tidak Ditemukan."
      : "Verifikasi Pembayaran Tertunda.";
  const description = isPaid
    ? "Pembayaran pendaftaran Mechatura Anda telah diverifikasi. Simpan bukti pembayaran di bawah ini untuk validasi panitia."
    : isInvalid
      ? "Kami tidak dapat menemukan pesanan pembayaran yang valid untuk tautan ini. Silakan kembali ke alur pendaftaran Anda."
      : "Kami menerima pengalihan pembayaran, namun konfirmasi dari gateway belum final. Silakan tunggu sebentar, lalu muat ulang halaman.";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col justify-center space-y-8 px-4 pb-32 pt-28 sm:px-8">
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

      {isPaid && result.program === "mechatura" && result.order?.rawOrder ? (
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
                <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-500">
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
            <Button type="button" variant="outline" className="h-11 rounded-[8px]" asChild>
              <Link href="/">Ke Beranda</Link>
            </Button>
            <Button type="button" className="h-11 rounded-[8px]" asChild>
              <Link href="/profile">Ke Profil</Link>
            </Button>
          </div>
        </section>
      ) : (
        <section className="space-y-8">
           <div className="grid gap-3 sm:grid-cols-2">
             <Button type="button" variant="outline" className="h-11 rounded-[8px]" asChild>
               <Link href="/">Ke Beranda</Link>
             </Button>
             <Button type="button" className="h-11 rounded-[8px]" asChild>
               <Link href={paymentHref}>Kembali ke Pembayaran</Link>
             </Button>
           </div>
        </section>
      )}
    </main>
  );
}


