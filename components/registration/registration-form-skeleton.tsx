import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type RegistrationFormSkeletonProps = {
  stepCount?: number;
  titleWidthClassName?: string;
  descriptionWidthClassName?: string;
  className?: string;
};

export default function RegistrationFormSkeleton({
  stepCount = 3,
  titleWidthClassName = "w-80 max-w-full",
  descriptionWidthClassName = "w-[30rem] max-w-full",
  className,
}: RegistrationFormSkeletonProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-3xl items-start space-y-12 px-6 py-16 sm:px-8",
        className
      )}
    >
      <span className="sr-only">Loading registration form...</span>

      <section className="space-y-3">
        <Skeleton className={cn("h-11 sm:h-14", titleWidthClassName)} />
        <div className="space-y-2">
          <Skeleton className={cn("h-4", descriptionWidthClassName)} />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </section>

      <section className="space-y-8">
        <SkeletonStepProgress stepCount={stepCount} />

        <SkeletonFormPanel />
      </section>
    </main>
  );
}

function SkeletonStepProgress({ stepCount }: { stepCount: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        {Array.from({ length: stepCount }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <Skeleton className="hidden h-4 w-16 sm:block" />
          </div>
        ))}
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

function SkeletonFormPanel() {
  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-[26rem] max-w-full" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-[8px]" />
          </div>
        ))}
      </div>

      <SkeletonActions />
    </div>
  );
}

function SkeletonActions() {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
      <Skeleton className="h-11 w-full rounded-xl sm:w-28" />
      <Skeleton className="h-11 w-full rounded-xl sm:w-32" />
    </div>
  );
}
