import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PaymentPageSkeletonProps = {
  className?: string;
};

export default function PaymentPageSkeleton({
  className,
}: PaymentPageSkeletonProps) {
  return (
    <>

      {/* Static Aurora Ribbons Background */}
      <div className="fixed inset-0 z-[-2] pointer-events-none overflow-hidden bg-[#00205B]">
        <div className="absolute top-[20%] left-[-10vw] w-[120vw] h-[15vh] bg-[#307FE2] blur-[60px] rounded-[100%] opacity-20 transform translate-y-0 rotate-[-2deg] skew-y-[2deg]" />
        <div className="absolute top-[45%] right-[-10vw] w-[130vw] h-[12vh] bg-[#307FE2] blur-[50px] rounded-[100%] opacity-20 transform translate-y-[2vh] rotate-[3deg] skew-y-[-2deg]" />
        <div className="absolute bottom-[25%] left-[-15vw] w-[140vw] h-[18vh] bg-[#307FE2] blur-[70px] rounded-[100%] opacity-20 transform translate-y-[-3vh] rotate-[-1deg] skew-y-[1deg]" />
      </div>

      <main
        className={cn(
          "mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 pb-16 pt-28 sm:px-8",
          className
        )}
      >
        <span className="sr-only">Memuat rincian pembayaran...</span>

        <div className="w-full space-y-8 animate-pulse">
          <section className="text-center space-y-3">
            <Skeleton className="mx-auto h-10 w-72 max-w-full rounded-xl bg-white/10" />
            <Skeleton className="mx-auto h-4 w-96 max-w-full rounded-lg bg-white/10" />
          </section>

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-xl">
            <div className="border-b border-white/10 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl bg-white/10" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40 rounded-md bg-white/10" />
                  <Skeleton className="h-4 w-60 max-w-full rounded-md bg-white/10" />
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3 w-24 rounded-md bg-white/10" />
                  <Skeleton className="h-5 w-44 rounded-md bg-white/10" />
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <Skeleton className="h-5 w-28 rounded-md bg-white/10" />
              <Skeleton className="h-8 w-36 rounded-md bg-white/10" />
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-11 w-full rounded-xl bg-white/10" />
            <Skeleton className="h-11 w-full rounded-xl bg-white/10" />
          </div>
        </div>
      </main>
    </>
  );
}

