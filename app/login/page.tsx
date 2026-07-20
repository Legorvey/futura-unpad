export const runtime = 'edge';

import { redirect } from "next/navigation"
import LoginForm from "./form"
import { getCachedAuth } from "@/lib/auth"
import { Metadata } from "next"
import { CheckCircle2, ShieldAlert } from "lucide-react"
import { cookies } from "next/headers"
import { ErrorState } from "@/components/ui/error-state"

type LoginSearchParams = Promise<Record<string, string | string[] | undefined>>

const getSafeRedirectPath = (value: string | string[] | undefined) => {
    const next = Array.isArray(value) ? value[0] : value

    if (
        !next ||
        !next.startsWith("/") ||
        next.startsWith("//") ||
        next.startsWith("/\\") ||
        next.startsWith("/login") ||
        next === "/register" ||
        next.startsWith("/register?") ||
        next.startsWith("/auth/callback")
    ) {
        return "/profile"
    }

    return next
}

export const metadata: Metadata = {
  title: "Log in"
}

export default async function LoginPage({
    searchParams,
}: {
    searchParams: LoginSearchParams
}){
    const [params, { user }] = await Promise.all([searchParams, getCachedAuth()]);

    if (user) {
        redirect(getSafeRedirectPath(params.next))
    }

    if (params.error === "oauth_failed" || params.error === "missing_code") {
        return (
            <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 pb-16 pt-32 sm:px-8">
                <ErrorState 
                    icon={ShieldAlert}
                    title="Tautan verifikasi tidak valid atau sudah digunakan"
                    description="Tautan ini telah kedaluwarsa atau Anda sudah memverifikasi email Anda menggunakan kode OTP. Silakan masuk untuk melanjutkan."
                    actionHref="/login"
                    actionLabel="Ke Halaman Masuk"
                />
            </main>
        )
    }

    if (params.reset === "success") {
        return (
            <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 pb-16 pt-32 sm:px-8">
                <ErrorState 
                    icon={CheckCircle2}
                    title="Kata Sandi Berhasil Direset"
                    description="Kata sandi Anda telah diperbarui dengan aman. Anda sekarang dapat masuk ke akun Anda."
                    actionHref="/login"
                    actionLabel="Ke Halaman Masuk"
                    className="[&_svg]:text-emerald-500 [&_div]:bg-emerald-50 dark:[&_div]:bg-emerald-500/10"
                />
            </main>
        )
    }

    const cookieStore = await cookies();
    const isVerified = cookieStore.get("email_verified_flash")?.value === "1";

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center space-y-12 px-4 pb-16 pt-32 sm:px-8">
            <section className="space-y-2">
                <h1 className="max-w-md text-3xl sm:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance">
                    Masuk ke akun Futura Anda
                </h1>
                <p className="max-w-sm text-sm font-medium leading-relaxed text-neutral-500">
                    Masuk untuk mengelola pendaftaran Anda
                </p>
            </section>

            {isVerified && (
                <div 
                    className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200"
                    role="alert"
                    aria-live="polite"
                >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-500" />
                    <p className="text-sm font-medium">Email Anda berhasil diverifikasi. Silakan masuk untuk melanjutkan.</p>
                </div>
            )}

            <section>
                <LoginForm isVerified={isVerified} />
            </section>
        </main>
    )
}
