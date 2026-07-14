import { cn } from "@/lib/utils";
import type { StepDefinition } from "@/lib/registration-steps";

type StepProgressProps<TStep extends string> = {
  steps: readonly StepDefinition<TStep>[];
  currentStep: TStep;
  ariaLabel: string;
  className?: string;
  labelVisibility?: "always" | "responsive" | "hidden";
};

export default function StepProgress<TStep extends string>({
  steps,
  currentStep,
  ariaLabel,
  className,
  labelVisibility = "responsive",
}: StepProgressProps<TStep>) {
  const activeStepIndex = Math.max(
    0,
    steps.findIndex((item) => item.id === currentStep)
  );
  const labelClassName =
    labelVisibility === "hidden"
      ? "sr-only"
      : labelVisibility === "responsive"
        ? "hidden font-medium sm:inline"
        : "font-medium";

  return (
    <nav aria-label={ariaLabel} className={cn("space-y-3", className)}>
      <ol className="flex items-center justify-between gap-3 text-xs sm:text-sm">
        {steps.map((item, index) => {
          const isActive = index <= activeStepIndex;

          return (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-2",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
              aria-current={index === activeStepIndex ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background"
                )}
              >
                {index + 1}
              </span>
              <span className={labelClassName}>{item.label}</span>
            </li>
          );
        })}
      </ol>

      <div
        className="h-2 w-full rounded-full bg-muted"
        role="progressbar"
        aria-label={`${ariaLabel} completion`}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={activeStepIndex + 1}
      >
        <div
          className="h-full rounded-full bg-foreground transition-all"
          style={{
            width: `${((activeStepIndex + 1) / steps.length) * 100}%`,
          }}
        />
      </div>
    </nav>
  );
}

