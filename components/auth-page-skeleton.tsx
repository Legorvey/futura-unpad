/* eslint-disable */
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type AuthPageSkeletonProps = {
  variant: "login" | "register";
};

const authSkeletonConfig = {
  login: {
    titleClassName: "w-[25rem] max-w-full",
    descriptionClassName: "w-44",
    fields: [
      { labelClassName: "w-32" },
      { labelClassName: "w-24", withInlineAction: true },
    ],
    showKeepSignedIn: true,
    footerClassName: "w-56",
  },
  register: {
    titleClassName: "w-[22rem] max-w-full",
    descriptionClassName: "w-40",
    fields: [
      { labelClassName: "w-20" },
      { labelClassName: "w-14" },
      { labelClassName: "w-20", withStrengthMeter: true },
      { labelClassName: "w-32" },
    ],
    showTerms: true,
    footerClassName: "w-48",
  },
} as const;

export default function AuthPageSkeleton({ variant }: AuthPageSkeletonProps) {
  const config = authSkeletonConfig[variant];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center space-y-12 px-6 pb-16 pt-32 sm:px-8">
      <span className="sr-only">Loading authentication form...</span>

      <section className="space-y-2">
        <Skeleton className={cn("h-10 sm:h-9 md:h-10", config.titleClassName)} />
        <Skeleton className={cn("h-4", config.descriptionClassName)} />
      </section>

      <section>
        <div className="space-y-6">
          <div className="space-y-6">
            {config.fields.map((field, index) => {
              const keyId = `field-skeleton-${index}`;
              return (
              <SkeletonAuthField
                key={keyId}
                labelClassName={field.labelClassName}
                withInlineAction={"withInlineAction" in field && field.withInlineAction}
                withStrengthMeter={"withStrengthMeter" in field && field.withStrengthMeter}
              />
              )
            })}
          </div>

          {"showKeepSignedIn" in config && config.showKeepSignedIn ? (
            <SkeletonCheckboxRow labelClassName="w-28" />
          ) : null}

          {"showTerms" in config && config.showTerms ? (
            <SkeletonCheckboxRow labelClassName="w-64 max-w-[calc(100%-2rem)]" alignTop />
          ) : null}

          <div className="space-y-2">
            <Skeleton className="h-11 w-full rounded-[8px]" />
            <div className="flex items-center gap-3 py-1">
              <Skeleton className="h-px flex-1 rounded-none" />
              <Skeleton className="h-4 w-5" />
              <Skeleton className="h-px flex-1 rounded-none" />
            </div>
            <Skeleton className="h-11 w-full rounded-[8px]" />
          </div>

          <div className="flex justify-center">
            <Skeleton className={cn("h-4", config.footerClassName)} />
          </div>
        </div>
      </section>
    </main>
  );
}

function SkeletonAuthField({
  labelClassName,
  withInlineAction = false,
  withStrengthMeter = false,
}: {
  labelClassName: string;
  withInlineAction?: boolean;
  withStrengthMeter?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className={cn("h-4", labelClassName)} />
        {withInlineAction ? <Skeleton className="h-4 w-28" /> : null}
      </div>
      <Skeleton className="h-11 w-full rounded-[8px]" />
      {withStrengthMeter ? (
        <div className="flex gap-1 pt-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-1 flex-1 rounded-full" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SkeletonCheckboxRow({
  labelClassName,
  alignTop = false,
}: {
  labelClassName: string;
  alignTop?: boolean;
}) {
  return (
    <div className={cn("flex gap-2", alignTop ? "items-start" : "items-center")}>
      <Skeleton className="h-4 w-4 shrink-0 rounded-[4px]" />
      <Skeleton className={cn("h-4", labelClassName)} />
    </div>
  );
}
