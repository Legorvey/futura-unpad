import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type AuthPageSkeletonProps = {
  variant: "login" | "register" | "forgot-password" | "reset-password";
};

export default function AuthPageSkeleton({ variant }: AuthPageSkeletonProps) {
  const isLogin = variant === "login";
  const isRegister = variant === "register";
  const isForgotPassword = variant === "forgot-password";
  const isResetPassword = variant === "reset-password";

  return (
    <main className="bg-white min-h-screen w-full relative grid lg:grid-cols-2 font-sans overflow-x-hidden">
      <style
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
            body {
              background-color: white !important;
            }
          `,
        }}
      />

      {/* Left side: Form Skeleton */}
      <div className="flex flex-col items-center justify-center px-6 lg:px-12 pt-24 pb-12 w-full h-full lg:min-h-screen relative">
        {/* Back Link Placeholder */}
        <div className="absolute top-8 left-6 lg:left-12 z-50">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <ArrowLeft className="w-4 h-4 text-zinc-300" />
            <Skeleton className="h-4 w-32 bg-zinc-200" />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[420px] space-y-8">
          <span className="sr-only">
            {isLogin
              ? "Memuat halaman masuk..."
              : isRegister
              ? "Memuat halaman pendaftaran..."
              : isForgotPassword
              ? "Memuat halaman lupa kata sandi..."
              : "Memuat halaman reset kata sandi..."}
          </span>

          {/* Title & Subtitle */}
          <section className="space-y-1">
            <Skeleton
              className={cn(
                "h-8 sm:h-9 bg-zinc-200 rounded-lg",
                isLogin
                  ? "w-64"
                  : isRegister
                  ? "w-56"
                  : isForgotPassword
                  ? "w-52"
                  : "w-60"
              )}
            />
            <Skeleton
              className={cn(
                "h-4 bg-zinc-200 rounded-md mt-2",
                isLogin
                  ? "w-56"
                  : isRegister
                  ? "w-44"
                  : isForgotPassword
                  ? "w-64"
                  : "w-52"
              )}
            />
          </section>

          {/* Form Content */}
          <section className="font-sans">
            {isLogin ? (
              <div className="space-y-8">
                {/* Identifier Field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36 bg-zinc-200" />
                  <Skeleton className="h-11 w-full rounded-xl bg-zinc-100 border border-zinc-200/70" />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between w-full">
                    <Skeleton className="h-4 w-20 bg-zinc-200" />
                    <Skeleton className="h-4 w-24 bg-zinc-200" />
                  </div>
                  <Skeleton className="h-11 w-full rounded-xl bg-zinc-100 border border-zinc-200/70" />

                  {/* Keep Signed In Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <Skeleton className="h-4 w-4 rounded-sm bg-zinc-200" />
                    <Skeleton className="h-4 w-36 bg-zinc-200" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Skeleton className="h-11 w-full rounded-xl bg-zinc-900/80" />

                  <div className="flex items-center gap-4 my-2">
                    <div className="h-px flex-1 bg-black/10"></div>
                    <span className="text-sm text-zinc-400 font-medium lowercase">
                      atau
                    </span>
                    <div className="h-px flex-1 bg-black/10"></div>
                  </div>

                  <Skeleton className="h-11 w-full rounded-xl bg-white border border-zinc-200 shadow-sm" />
                </div>

                {/* Footer Link */}
                <div className="flex justify-center pt-2">
                  <Skeleton className="h-4 w-44 bg-zinc-200" />
                </div>
              </div>
            ) : isRegister ? (
              <div className="space-y-6">
                {/* Step Indicator Skeleton */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-8 rounded-full bg-[#00205B]/40 animate-pulse" />
                    <div className="h-1.5 w-4 rounded-full bg-[#00205B]/20 animate-pulse" />
                    <div className="h-1.5 w-4 rounded-full bg-[#00205B]/20 animate-pulse" />
                  </div>
                  <Skeleton className="h-4 w-40 bg-zinc-200" />
                </div>

                {/* Username Field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-zinc-200" />
                  <Skeleton className="h-11 w-full rounded-xl bg-zinc-100 border border-zinc-200/70" />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-14 bg-zinc-200" />
                  <Skeleton className="h-11 w-full rounded-xl bg-zinc-100 border border-zinc-200/70" />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-11 w-full rounded-xl bg-zinc-900/80" />

                  <div className="flex items-center gap-4 my-2">
                    <div className="h-px flex-1 bg-black/10"></div>
                    <span className="text-sm text-zinc-400 font-medium lowercase">
                      atau
                    </span>
                    <div className="h-px flex-1 bg-black/10"></div>
                  </div>

                  <Skeleton className="h-11 w-full rounded-xl bg-white border border-zinc-200 shadow-sm" />
                </div>

                {/* Footer Link */}
                <div className="flex justify-center pt-2">
                  <Skeleton className="h-4 w-44 bg-zinc-200" />
                </div>
              </div>
            ) : isForgotPassword ? (
              <div className="space-y-6">
                {/* Step Indicator Skeleton */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-8 rounded-full bg-[#00205B]/40 animate-pulse" />
                    <div className="h-1.5 w-4 rounded-full bg-[#00205B]/20 animate-pulse" />
                  </div>
                  <Skeleton className="h-4 w-36 bg-zinc-200" />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-zinc-200" />
                  <Skeleton className="h-11 w-full rounded-xl bg-zinc-100 border border-zinc-200/70" />
                </div>

                {/* Action Button */}
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-11 w-full rounded-xl bg-zinc-900/80" />
                </div>

                {/* Footer Link */}
                <div className="flex justify-center pt-2">
                  <Skeleton className="h-4 w-44 bg-zinc-200" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Password Field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 bg-zinc-200" />
                  <Skeleton className="h-11 w-full rounded-xl bg-zinc-100 border border-zinc-200/70" />
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36 bg-zinc-200" />
                  <Skeleton className="h-11 w-full rounded-xl bg-zinc-100 border border-zinc-200/70" />
                </div>

                {/* Action Button */}
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-11 w-full rounded-xl bg-zinc-900/80" />
                </div>

                {/* Footer Link */}
                <div className="flex justify-center pt-2">
                  <Skeleton className="h-4 w-44 bg-zinc-200" />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Right side: Rounded Blue Box Placeholder */}
      <div className="hidden lg:block p-4 lg:p-6 relative">
        <div className="w-full h-full min-h-[500px] bg-[#00205B] rounded-[2.5rem] sticky top-6 max-h-[calc(100vh-3rem)] overflow-hidden shadow-2xl flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#307FE2]/20 to-transparent pointer-events-none" />
        </div>
      </div>
    </main>
  );
}
