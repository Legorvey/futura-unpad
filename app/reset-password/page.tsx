import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/password-recovery";
import { ArrowLeft } from "lucide-react";
import ResetPasswordForm from "./reset-password-form";

function ExpiredResetLink() {
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

      {/* Left side: Content */}
      <div className="flex flex-col items-center justify-center px-6 lg:px-12 pt-24 pb-12 w-full h-full lg:min-h-screen relative">
        <div className="absolute top-8 left-6 lg:left-12 z-50">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Halaman Masuk
          </Link>
        </div>

        <div className="relative z-10 w-full max-w-[420px] space-y-8">
          <section className="space-y-2">
            <h1 className="text-black text-2xl md:text-3xl font-semibold tracking-tighter text-balance font-sans">
              Tautan Tidak Valid atau Kedaluwarsa
            </h1>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed tracking-tight font-sans">
              Sesi verifikasi atau tautan reset kata sandi Anda telah kedaluwarsa. Silakan minta kode atau tautan baru.
            </p>
          </section>

          <div className="space-y-3 pt-2">
            <Button
              asChild
              className="h-11 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm sm:text-base transition-all shadow-sm w-full"
            >
              <Link href="/forgot-password" prefetch={false} className="flex items-center justify-center">
                Minta Kode Baru
              </Link>
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                prefetch={false}
                className="text-sm font-medium text-zinc-500 hover:text-neutral-900 transition-colors"
              >
                Kembali ke Halaman Masuk
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Rounded Blue Box */}
      <div className="hidden lg:block p-4 lg:p-6 relative">
        <div className="w-full h-full min-h-[500px] bg-[#00205B] rounded-[2.5rem] sticky top-6 max-h-[calc(100vh-3rem)] overflow-hidden shadow-2xl flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#307FE2]/20 to-transparent pointer-events-none" />
        </div>
      </div>
    </main>
  );
}

type ResetPasswordSearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Reset Kata Sandi",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: ResetPasswordSearchParams;
}) {
  const params = await searchParams;

  if (params.error === "oauth_failed") {
    return <ExpiredResetLink />;
  }

  const cookieStore = await cookies();
  const hasRecoveryContext = cookieStore.has(PASSWORD_RECOVERY_COOKIE);

  if (!hasRecoveryContext) {
    return <ExpiredResetLink />;
  }

  return <ResetPasswordForm />;
}
