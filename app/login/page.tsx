export const runtime = 'edge';

import { redirect } from "next/navigation"
import LoginForm from "./form"
import { getCachedAuth } from "@/lib/auth"
import { Metadata } from "next"
import { CheckCircle2 } from "lucide-react"
import { cookies } from "next/headers"

type LoginSearchParams = Promise<Record<string, string | string[] | undefined>>

const getSafeRedirectPath = (value: string | string[] | undefined) => {
    const next = Array.isArray(value) ? value[0] : value

    if (
        !next ||
        !next.startsWith("/") ||
        next.startsWith("//") ||
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
  title: "Log in",
  description: "Please fill your Futura account identity"
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

    const cookieStore = await cookies();
    const isVerified = cookieStore.get("email_verified_flash")?.value === "1";

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center space-y-12 px-6 pb-16 pt-32 sm:px-8">
            <section className="space-y-2">
                <h1 className="max-w-md text-3xl sm:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance">
                    Sign in to your Futura account
                </h1>
                <p className="max-w-sm text-sm font-medium leading-relaxed text-neutral-500">
                    Get notified on every seminar
                </p>
            </section>

            {isVerified && (
                <div 
                    className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200"
                    role="alert"
                    aria-live="polite"
                >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-500" />
                    <p className="text-sm font-medium">Your email has been verified successfully. Please log in to continue.</p>
                </div>
            )}

            <section>
                <LoginForm isVerified={isVerified} />
            </section>
        </main>
    )
}
