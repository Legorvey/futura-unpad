"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { useResetPasswordMutation } from "@/hooks/mutations/use-auth-mutations"

export default function ResetPasswordForm() {
    const router = useRouter()
    const { refreshAuth } = useAuth()
    const resetPassword = useResetPasswordMutation()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")
    const [isComplete, setIsComplete] = useState(false)

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage("")

        if (password.length < 8) {
            setMessage("Password must be at least 8 characters.")
            return
        }

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.")
            return
        }

        try {
            await resetPassword.mutateAsync({
                password,
                confirmPassword,
            })
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Password update failed. Please request a new reset link.")
            return
        }

        await refreshAuth()
        setIsComplete(true)
        setMessage("Password updated successfully. Please sign in with your new password.")
        router.replace("/login")
    }

    return (
        <main className="mx-auto w-full max-w-xl space-y-10 px-6 py-16 sm:px-8">
            <section className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight text-balance">
                    Create a new password
                </h1>
                <p className="text-sm leading-6 text-muted-foreground">
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
                        />
                    </Field>

                    {message ? (
                        <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                            {message}
                        </p>
                    ) : null}

                    <Field className="gap-3">
                        {isComplete ? (
                            <Button asChild className="h-11 rounded-xl">
                                <Link href="/login">Back to login</Link>
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
