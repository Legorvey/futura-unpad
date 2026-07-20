import type { Metadata } from "next"
export const runtime = 'edge';

import Link from "next/link"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/password-recovery"
import { getCachedAuth } from "@/lib/auth"
import ResetPasswordForm from "./reset-password-form"
import { KeyRound } from "lucide-react"

import { ErrorState } from "@/components/ui/error-state"

function ExpiredResetLink() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 pb-16 pt-32 sm:px-8">
            <ErrorState 
                icon={KeyRound}
                title="Tautan reset kedaluwarsa atau tidak valid"
                description="Silakan minta tautan reset kata sandi baru dan buka dari email Anda."
                actionHref="/forgot-password"
                actionLabel="Minta tautan baru"
            />
        </main>
    )
}

type ResetPasswordSearchParams = Promise<Record<string, string | string[] | undefined>>

export const metadata: Metadata = {
  title: "Reset Kata Sandi"
}

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: ResetPasswordSearchParams
}) {
    const params = await searchParams;

    if (params.error === "oauth_failed") {
        return <ExpiredResetLink />
    }

    const cookieStore = await cookies()
    const hasRecoveryContext = cookieStore.has(PASSWORD_RECOVERY_COOKIE)

    if (!hasRecoveryContext) {
        return <ExpiredResetLink />
    }

    return <ResetPasswordForm />
}
