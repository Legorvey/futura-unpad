"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        })

        if (!res.ok) {
            const data = await res.json().catch(() => null)
            setMessage(data?.error ?? "Please try again later.")
            setIsSubmitting(false)
            return
        }

        setMessage("If an account exists for that email, a reset link has been sent.")
        setIsSubmitting(false)
    }

    return (
        <main className="mx-auto w-full max-w-xl space-y-10 px-6 py-16 sm:px-8">
            <section className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight text-balance">
                    Reset your password
                </h1>
                <p className="text-sm leading-6 text-muted-foreground">
                    Enter your account email and we will send a secure reset link.
                </p>
            </section>

            <form onSubmit={handleReset}>
                <FieldGroup className="gap-5">
                    <Field className="gap-2">
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            className="h-11 rounded-xl"
                            autoComplete="email"
                            placeholder="e.g. johndoe@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Field>

                    {message ? (
                        <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                            {message}
                        </p>
                    ) : null}

                    <Field className="gap-3">
                        <Button
                            type="submit"
                            className="h-11 rounded-xl"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sending link..." : "Send reset link"}
                        </Button>
                        <Button asChild variant="outline" className="h-11 rounded-xl">
                            <Link href="/login">Back to login</Link>
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </main>
    )
}
