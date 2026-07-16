import { Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentSpinnerLoaderProps = {
  message?: string;
  className?: string;
};

export default function PaymentSpinnerLoader({
  message = "Processing...",
  className,
}: PaymentSpinnerLoaderProps) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-[60vh] w-full flex-col items-center justify-center px-6 pb-16 pt-32 sm:px-8",
        className
      )}
    >
      <div className="flex max-w-sm flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {message}
          </h2>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Secure connection established
          </p>
        </div>
      </div>
    </main>
  );
}
