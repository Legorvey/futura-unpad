"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateMidtransPaymentMutation } from "@/hooks/mutations/use-payment-mutations";
import { ApiError } from "@/lib/query/fetch-json";
import { toInternalAppHref } from "@/lib/navigation";

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
      if (error instanceof ApiError) {
        const body = error.body;

        if (
          body &&
          typeof body === "object"
        ) {
          if ("redirect_url" in body && typeof body.redirect_url === "string") {
            return { redirect_url: body.redirect_url };
          }
          
          if ("order_id" in body && typeof body.order_id === "string" && body.order_id !== orderId) {
            router.replace(`/payment?order_id=${body.order_id}`);
            return null;
          }
        }
      }

      setErrorMessage(error instanceof Error ? error.message : "Unable to start payment. Please try again.");
      return null;
    });

    if (data?.redirect_url) {
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
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild variant="outline" className="h-11 rounded-xl">
          <Link href="/registration" prefetch={false}>
            <ArrowLeft className="h-4 w-4" />
            Back to registration
          </Link>
        </Button>
        <Button
          onClick={handlePay}
          className="h-11 rounded-xl"
          disabled={createPayment.isPending}
        >
          {createPayment.isPending ? "Preparing payment..." : "Continue Payment"}
        </Button>
      </div>
    </section>
  );
}
