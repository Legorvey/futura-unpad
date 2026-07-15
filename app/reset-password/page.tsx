export const runtime = 'edge';

import Link from "next/link"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/password-recovery"
import { getCachedAuth } from "@/lib/auth"
import ResetPasswordForm from "./reset-password-form"
import { KeyRound } from "lucide-react"

function ExpiredResetLink() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center space-y-6 px-6 pb-16 pt-32 sm:px-8">
            <KeyRound size={150} strokeWidth={1.2} className="mx-auto"/>
            <section className="space-y-2 text-center">
                <h1 className="text-3xl sm:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance">
                    Reset link expired or invalid
                </h1>
                <p className="text-sm font-medium leading-relaxed text-neutral-500">
                    Please request a new password reset link and open it from your email.
                </p>
            </section>
            <Button asChild className="h-11 rounded-xl w-fit mx-auto px-8">
                <Link href="/forgot-password" prefetch={false}>Request new link</Link>
            </Button>
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
