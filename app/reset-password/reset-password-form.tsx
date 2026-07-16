"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { useResetPasswordMutation } from "@/hooks/mutations/use-auth-mutations"

export default function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const resetPassword = useResetPasswordMutation()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [isComplete, setIsComplete] = useState(false)

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage("")
        setSuccessMessage("")

        if (password.length < 8) {
            setErrorMessage("Password must be at least 8 characters.")
            return
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.")
            return
        }

        try {
            await resetPassword.mutateAsync({
                password,
                confirmPassword,
            })
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Password update failed. Please request a new reset link.")
            return
        }

        setIsComplete(true)
        setSuccessMessage("Password updated successfully. Please sign in with your new password.")
        setTimeout(() => {
            router.replace("/login")
        }, 2000)
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center space-y-10 px-6 pb-16 pt-32 sm:px-8">
            <section className="space-y-2">
                <h1 className="text-3xl sm:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance">
                    Create a new password
                </h1>
                <p className="text-sm font-medium leading-relaxed text-neutral-500">
                    Use at least 8 characters. After updating, you will sign in again.
                </p>
            </section>

            <form onSubmit={handleUpdatePassword}>
                <FieldGroup className="gap-5">
                    <Field className="gap-2">
                        <FieldLabel htmlFor="password">New password</FieldLabel>
                        <Input
                            id="password"
                            type="password"
                            className="h-11 rounded-xl"
                            autoComplete="new-password"
                            placeholder="Enter a new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            disabled={isComplete}
                            aria-invalid={!!errorMessage}
                        />
                    </Field>

                    <Field className="gap-2">
                        <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                        <Input
                            id="confirm-password"
                            type="password"
                            className="h-11 rounded-xl"
                            autoComplete="new-password"
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            disabled={isComplete}
                            aria-invalid={!!errorMessage}
                        />
                    </Field>

                    {errorMessage ? (
                        <p className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                            {errorMessage}
                        </p>
                    ) : null}
                    
                    {successMessage ? (
                        <p className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {successMessage}
                        </p>
                    ) : null}

                    <Field className="gap-3">
                        {isComplete ? (
                            <Button asChild className="h-11 rounded-xl">
                                <Link href="/login" prefetch={false}>Back to login</Link>
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                className="h-11 rounded-xl"
                                disabled={resetPassword.isPending}
                            >
                                {resetPassword.isPending ? "Updating password..." : "Update password"}
                            </Button>
                        )}
                    </Field>
                </FieldGroup>
            </form>
        </main>
    )
}
