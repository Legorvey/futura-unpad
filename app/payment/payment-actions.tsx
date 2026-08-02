"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateMidtransPaymentMutation } from "@/hooks/mutations/use-payment-mutations";
import { ApiError } from "@/lib/query/fetch-json";
import { toInternalAppHref } from "@/lib/navigation";
import { isRegistrationToken } from "@/lib/payment";

type PaymentActionsProps = {
  orderId: string;
};

export default function PaymentActions({ orderId }: PaymentActionsProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const createPayment = useCreateMidtransPaymentMutation();

  const handlePay = async () => {
    if (createPayment.isPending) {
      return;
    }

    setErrorMessage("");

    const data = await createPayment.mutateAsync({ order_id: orderId }).catch((error) => {
      let customErrorMessage = "";

      if (error instanceof ApiError) {
        const body = error.body as Record<string, unknown> | null | undefined;

        if (body && typeof body === "object") {
          const redirectUrl =
            "redirect_url" in body && typeof body.redirect_url === "string"
              ? body.redirect_url
              : undefined;

          const rotatedOrderId =
            "order_id" in body &&
            typeof body.order_id === "string" &&
            isRegistrationToken(body.order_id)
              ? body.order_id
              : undefined;

          if (rotatedOrderId && rotatedOrderId !== orderId) {
            router.replace(`/payment?order_id=${encodeURIComponent(rotatedOrderId)}`);
          }

          if (redirectUrl) {
            return {
              redirect_url: redirectUrl,
              order_id: rotatedOrderId,
            };
          }

          if ("error" in body && typeof body.error === "string") {
            customErrorMessage = body.error;
          }
        }
      }

      setErrorMessage(
        customErrorMessage ||
          (error instanceof Error
            ? error.message
            : "Terjadi kendala saat menyiapkan pembayaran. Silakan coba beberapa saat lagi atau muat ulang halaman.")
      );
      return null;
    });

    if (data?.redirect_url) {
      if (data.order_id && data.order_id !== orderId) {
        router.replace(`/payment?order_id=${encodeURIComponent(data.order_id)}`);
      }

      const appHref = toInternalAppHref(data.redirect_url, window.location.origin);

      if (appHref) {
        router.push(appHref);
        return;
      }

      window.location.assign(data.redirect_url);
      return;
    }
  };

  return (
    <section className="space-y-3">
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-3.5 rounded-2xl border border-red-200/80 bg-red-50/90 p-4 text-sm animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 mt-0.5">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="font-semibold text-red-800 text-sm tracking-tight">Gagal Memulai Pembayaran</p>
            <p className="text-xs sm:text-sm font-normal text-red-800 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild variant="outline" className="h-11 rounded-xl">
          <Link href="/mechatura/form" prefetch={false}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke pendaftaran
          </Link>
        </Button>
        <Button
          onClick={handlePay}
          className="h-11 rounded-xl"
          disabled={createPayment.isPending}
        >
          {createPayment.isPending ? "Menyiapkan pembayaran..." : "Lanjutkan Pembayaran"}
        </Button>
      </div>
    </section>
  );
}
