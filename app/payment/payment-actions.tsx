"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentActions({
  orderId,
}: {
  orderId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/payment/xendit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_id: orderId }),
      });

      const data = await res.json();

      if (!res.ok || !data.invoice_url) {
        throw new Error(data.error ?? "Failed to create payment invoice");
      }

      window.location.href = data.invoice_url;
    } catch (error) {
      console.error(error);
      alert("Payment failed to start. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <Button asChild variant="outline" className="h-11 rounded-xl">
        <Link href="/registration">
          <ArrowLeft className="h-4 w-4" />
          Back to registration
        </Link>
      </Button>
      <Button onClick={handlePay} disabled={isLoading} className="h-11 rounded-xl">
        {isLoading ? "Creating invoice..." : "Continue Payment"}
      </Button>
    </section>
  );
}
