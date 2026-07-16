"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";

type PaymentDeadlineProps = {
  expiresAt: string;
};

const getRemainingMs = (expiresAt: string) =>
  Math.max(0, new Date(expiresAt).getTime() - Date.now());

const formatRemainingTime = (remainingMs: number) => {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
};
const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function PaymentDeadline({ expiresAt }: PaymentDeadlineProps) {
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(expiresAt));
  const isExpired = remainingMs <= 0;
  const [formattedDeadline, setFormattedDeadline] = useState("");

  useEffect(() => {
    setFormattedDeadline(dateTimeFormatter.format(new Date(expiresAt)));
  }, [expiresAt]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRemainingMs(getRemainingMs(expiresAt));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [expiresAt]);

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </span>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Payment due time</h2>
          <p className="text-2xl font-semibold tracking-tight" suppressHydrationWarning>
            {isExpired ? "Expired" : formatRemainingTime(remainingMs)}
          </p>
          <p className="text-sm font-medium leading-relaxed text-neutral-500">
            Complete your payment before {formattedDeadline}. If the due time
            expires, your Mechatura team registration will be reset and you will
            need to register again.
          </p>
        </div>
      </div>
    </section>
  );
}
