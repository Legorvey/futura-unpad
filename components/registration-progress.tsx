import { cn } from "@/lib/utils";

const steps = ["Registration", "Payment"];

export default function RegistrationProgress({
  currentStep,
}: {
  currentStep: 1 | 2;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;

          return (
            <div
              key={step}
              className={cn(
                "flex items-center gap-2",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background"
                )}
              >
                {stepNumber}
              </span>
              <span className="font-medium">{step}</span>
            </div>
          );
        })}
      </div>

      <div className="h-2 rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full bg-foreground transition-all",
            currentStep === 1 ? "w-1/2" : "w-full"
          )}
        />
      </div>
    </div>
  );
}
