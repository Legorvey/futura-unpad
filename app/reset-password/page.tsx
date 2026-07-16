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
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 pb-16 pt-32 sm:px-8">
            <ErrorState 
                icon={KeyRound}
                title="Reset link expired or invalid"
                description="Please request a new password reset link and open it from your email."
                actionHref="/forgot-password"
                actionLabel="Request new link"
            />
        </main>
    )
}

export default async function ResetPasswordPage() {
    const cookieStore = await cookies()
    const hasRecoveryContext = cookieStore.has(PASSWORD_RECOVERY_COOKIE)

    if (!hasRecoveryContext) {
        return <ExpiredResetLink />
    }

    const { user } = await getCachedAuth()

    if (!user) {
        return <ExpiredResetLink />
    }

    return <ResetPasswordForm />
}
