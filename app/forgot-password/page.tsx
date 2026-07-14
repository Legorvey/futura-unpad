"use client"

import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForgotPasswordMutation } from "@/hooks/mutations/use-auth-mutations"
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validation"

export default function ForgotPasswordPage() {
    const [successMessage, setSuccessMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const forgotPassword = useForgotPasswordMutation()

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
        setSuccessMessage("")
        setErrorMessage("")

        try {
            await forgotPassword.mutateAsync(values)
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Please try again later.")
            return
        }

        setSuccessMessage(`Email has been successfully sent to ${values.email}`)
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center space-y-10 px-6 pb-16 pt-32 sm:px-8">
            <section className="space-y-2">
                <h1 className="text-3xl sm:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance">
                    Reset your password
                </h1>
                <p className="text-sm font-medium leading-relaxed text-neutral-500">
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

                    {errorMessage ? (
                        <p className="rounded-[8px] border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                            {errorMessage === "User with this email not found" 
                                ? "Email doesn't exist." 
                                : errorMessage}
                        </p>
                    ) : null}

                    {successMessage ? (
                        <p className="rounded-[8px] border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {successMessage}
                        </p>
                    ) : null}

                    <Field className="gap-2">
                        <Button
                            type="submit"
                            className="h-11 rounded-[8px]"
                            disabled={forgotPassword.isPending}
                        >
                            {forgotPassword.isPending ? "Sending link..." : "Send reset link"}
                        </Button>
                        <Button asChild variant="outline" className="h-11 rounded-[8px]">
                            <Link href="/login" prefetch={false}>Back to login</Link>
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </main>
    )
}
