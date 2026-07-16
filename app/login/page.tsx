export const runtime = 'edge';

import { redirect } from "next/navigation"
import LoginForm from "./form"
import { getCachedAuth } from "@/lib/auth"
import { Metadata } from "next"

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

            <section>
                <LoginForm />
            </section>
        </main>
    )
}
