import { Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentSpinnerLoaderProps = {
  message?: string;
  className?: string;
};

export default function PaymentSpinnerLoader({
  message = "Memproses...",
  className,
}: PaymentSpinnerLoaderProps) {
  return (
    <>
      <div className="fixed inset-0 z-[-2] pointer-events-none overflow-hidden bg-[#00205B]">
          <div className="absolute top-[20%] left-[-10vw] w-[120vw] h-[15vh] bg-[#307FE2] blur-[60px] rounded-[100%] opacity-20 transform translate-y-0 rotate-[-2deg] skew-y-[2deg]" />
          <div className="absolute top-[45%] right-[-10vw] w-[130vw] h-[12vh] bg-[#307FE2] blur-[50px] rounded-[100%] opacity-20 transform translate-y-[2vh] rotate-[3deg] skew-y-[-2deg]" />
          <div className="absolute bottom-[25%] left-[-15vw] w-[140vw] h-[18vh] bg-[#307FE2] blur-[70px] rounded-[100%] opacity-20 transform translate-y-[-3vh] rotate-[-1deg] skew-y-[1deg]" />
      </div>

      <main
        className={cn(
          "mx-auto flex min-h-[60vh] w-full flex-col items-center justify-center px-4 pb-16 pt-32 sm:px-8",
          className
        )}
      >
        <div className="flex max-w-sm flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              {message}
            </h2>
            <p className="text-sm text-blue-100/80 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Koneksi aman terjalin
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
