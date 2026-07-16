import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PaymentPageSkeletonProps = {
  stepCount?: number;
  className?: string;
};

export default function PaymentPageSkeleton({
  stepCount = 4,
  className,
}: PaymentPageSkeletonProps) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center space-y-12 px-6 pb-16 pt-32 sm:px-8",
        className
      )}
    >
      <span className="sr-only">Loading payment details...</span>

      <section className="space-y-3">
        <Skeleton className="h-11 w-80 max-w-full sm:h-14" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[30rem] max-w-full" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </section>

      <SkeletonPaymentProgress stepCount={stepCount} />

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48 max-w-full" />
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          <div className="grid gap-4 p-5 sm:p-6 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-36 max-w-full" />
              </div>
            ))}
          </div>

          <div className="grid gap-2 p-5 sm:p-6 sm:grid-cols-[1fr_auto] sm:items-start">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 max-w-full" />
              <Skeleton className="h-4 w-56 max-w-full" />
            </div>
            <Skeleton className="h-5 w-24" />
          </div>

          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 bg-muted/40 p-5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-7 w-28" />
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </main>
  );
}

function SkeletonPaymentProgress({ stepCount }: { stepCount: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        {Array.from({ length: stepCount }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <Skeleton className="hidden h-4 w-20 sm:block" />
          </div>
        ))}
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

