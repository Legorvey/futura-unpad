import Link from "next/link"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/password-recovery"
import { getCachedAuth } from "@/lib/auth"
import ResetPasswordForm from "./reset-password-form"

function ExpiredResetLink() {
    return (
        <main className="mx-auto w-full max-w-xl space-y-6 px-6 py-16 sm:px-8">
            <section className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight text-balance">
                    Reset link expired
                </h1>
                <p className="text-sm leading-6 text-muted-foreground">
                    Please request a new password reset link and open it from your email.
                </p>
            </section>
            <Button asChild className="h-11 rounded-xl">
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
