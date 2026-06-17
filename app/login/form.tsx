"use client";

import Link from "next/link";
import GoogleLoginButton from "./google-login";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { loginSchema, type LoginFormValues } from "@/lib/validation";

export default function LoginForm() {
    const router = useRouter();
    const { refreshAuth } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setIsSubmitting(true);
        setSubmitError("");

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null);
            setSubmitError(data?.error ?? "Login failed.");
            setIsSubmitting(false);
            return;
        }

        const currentUrl = new URL(window.location.href);
        const next = currentUrl.searchParams.get("next");
        const safeNext =
            next &&
            next.startsWith("/") &&
            !next.startsWith("//") &&
            !next.startsWith("/login") &&
            !next.startsWith("/register") &&
            !next.startsWith("/auth/callback")
                ? next
                : "/admin";

        await refreshAuth();
        router.replace(safeNext);
        router.refresh();
    };

    return (
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

                <Field className="gap-2">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        className="h-11 rounded-[8px]"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        {...register("password")}
                    />
                    {errors.password ? (
                        <FieldError id="password-error">{errors.password.message}</FieldError>
                    ) : null}
                    <Link href="/forgot-password" className="text-right text-sm text-muted-foreground hover:text-black transition">Forgot password?</Link>
                </Field>

                {submitError && <FieldError>{submitError}</FieldError>}

                <Field className="gap-2">
                    <Button
                        type="submit"
                        className="h-11 rounded-[8px]"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Signing in..." : "Log in"}
                    </Button>
                    <GoogleLoginButton />
                </Field>
                <p className="text-center text-sm text-muted-foreground">
                    Do not have an account?{" "}
                    <Link
                        href={
                            typeof window !== "undefined" &&
                            new URL(window.location.href).searchParams.get("next")
                                ? `/register?next=${new URL(window.location.href).searchParams.get("next")}`
                                : "/register"
                        }
                        className="text-blue-600"
                    >
                        Register
                    </Link>
                </p>
            </FieldGroup>
        </form>
    );
}
