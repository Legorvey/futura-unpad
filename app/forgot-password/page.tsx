"use client"

import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validation"

export default function ForgotPasswordPage() {
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    const onSubmit = async (values: ForgotPasswordFormValues) => {
        setIsSubmitting(true)
        setMessage("")

        const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
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

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <FieldGroup className="gap-6">
                    <Field className="gap-2">
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            className="h-11 rounded-[8px]"
                            autoComplete="email"
                            placeholder="e.g. johndoe@gmail.com"
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? "email-error" : undefined}
                            {...register("email")}
                        />
                        {errors.email ? (
                            <FieldError id="email-error">{errors.email.message}</FieldError>
                        ) : null}
                    </Field>

                    {message ? (
                        <p className="rounded-[8px] border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                            {message}
                        </p>
                    ) : null}

                    <Field className="gap-2">
                        <Button
                            type="submit"
                            className="h-11 rounded-[8px]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sending link..." : "Send reset link"}
                        </Button>
                        <Button asChild variant="outline" className="h-11 rounded-[8px]">
                            <Link href="/login">Back to login</Link>
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </main>
    )
}
