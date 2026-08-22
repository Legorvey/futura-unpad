import { redirect } from "next/navigation";
import LoginForm from "./form";
import { getCachedAuth } from "@/lib/auth";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import { getSafeRedirectPath } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LoginInfoHub from "./login-info-hub";

type LoginSearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Log in",
};

function AuthStatusLayout({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <main className="bg-white min-h-screen w-full relative grid lg:grid-cols-12 font-sans overflow-x-hidden">
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
      <div className="lg:col-span-5 flex flex-col items-center justify-center px-6 lg:px-12 pt-24 pb-12 w-full h-full lg:min-h-screen relative">
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
              {title}
            </h1>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed tracking-tight font-sans">
              {description}
            </p>
          </section>

          <div className="space-y-3 pt-2">
            <Button
              asChild
              className="h-11 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm sm:text-base transition-all shadow-sm w-full"
            >
              <Link
                href={actionHref}
                prefetch={false}
                className="flex items-center justify-center"
              >
                {actionLabel}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Right side: Info Hub */}
      <div className="hidden lg:block lg:col-span-7 p-4 lg:p-6 relative">
        <div className="w-full h-full min-h-[500px] sticky top-6 max-h-[calc(100vh-3rem)] overflow-hidden shadow-2xl relative rounded-[2.5rem]">
          <LoginInfoHub />
        </div>
      </div>
    </main>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  const [params, { user }] = await Promise.all([searchParams, getCachedAuth()]);

  if (user) {
    redirect(getSafeRedirectPath(params.next));
  }

  if (params.error === "oauth_failed" || params.error === "missing_code") {
    return (
      <AuthStatusLayout
        title="Tautan Verifikasi Tidak Valid"
        description="Tautan ini telah kedaluwarsa atau sudah digunakan. Silakan masuk atau minta kode baru untuk melanjutkan."
        actionHref="/login"
        actionLabel="Ke Halaman Masuk"
      />
    );
  }

  if (params.reset === "success") {
    return (
      <AuthStatusLayout
        title="Kata Sandi Berhasil Direset"
        description="Kata sandi Anda telah diperbarui dengan aman. Anda sekarang dapat masuk menggunakan kata sandi baru Anda."
        actionHref="/login"
        actionLabel="Masuk ke Akun"
      />
    );
  }

  const cookieStore = await cookies();
  const isVerified = cookieStore.get("email_verified_flash")?.value === "1";

  return (
    <main className="bg-white min-h-screen w-full relative grid lg:grid-cols-12 font-sans overflow-x-hidden">
      <style
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
            body {
              background-color: white !important;
            }
            .light-form-fix input {
              background-color: white !important;
              border-color: rgba(0, 0, 0, 0.2) !important;
              color: black !important;
            }
            .light-form-fix input::placeholder {
              color: rgba(0, 0, 0, 0.4) !important;
            }
            .light-form-fix label {
              color: black !important;
              font-weight: 500 !important;
            }
            .light-form-fix .text-muted-foreground {
              color: rgba(0, 0, 0, 0.6) !important;
            }
            .light-form-fix button[role="checkbox"] {
              border-color: rgba(0, 0, 0, 0.3) !important;
            }
            .light-form-fix button[role="checkbox"][data-state="checked"] {
              background-color: black !important;
              border-color: black !important;
              color: white !important;
            }
            .light-form-fix button[role="checkbox"][data-state="checked"] svg {
              color: white !important;
            }
            .light-form-fix button > svg.lucide-eye, .light-form-fix button > svg.lucide-eye-off {
              color: rgba(0, 0, 0, 0.5) !important;
            }
            .light-form-fix button:hover > svg.lucide-eye, .light-form-fix button:hover > svg.lucide-eye-off {
              color: black !important;
            }
          `,
        }}
      />

      {/* Left side: Form */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center px-6 lg:px-12 pt-24 pb-12 w-full h-full lg:min-h-screen relative">
        <div className="absolute top-8 left-6 lg:left-12 z-50">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="relative z-10 w-full max-w-[420px] space-y-8">
          <section className="space-y-1">
            <h1 className="text-black text-2xl md:text-3xl font-semibold tracking-tighter text-balance font-sans">
              Masuk ke akun Futura
            </h1>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed tracking-tight font-sans">
              Masuk untuk mengelola pendaftaran Anda
            </p>
          </section>

          {isVerified && (
            <div
              className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-center"
              role="alert"
              aria-live="polite"
            >
              <p className="text-xs sm:text-sm font-medium text-emerald-800">
                Email Anda berhasil diverifikasi. Silakan masuk untuk melanjutkan.
              </p>
            </div>
          )}

          <section className="font-sans light-form-fix">
            <LoginForm isVerified={isVerified} />
          </section>
        </div>
      </div>

      {/* Right side: Info Hub */}
      <div className="hidden lg:block lg:col-span-7 p-4 lg:p-6 relative">
        <div className="w-full h-full min-h-[500px] sticky top-6 max-h-[calc(100vh-3rem)] overflow-hidden shadow-2xl relative rounded-[2.5rem]">
          <LoginInfoHub />
        </div>
      </div>
    </main>
  );
}
