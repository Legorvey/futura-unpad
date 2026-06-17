"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { signupSchema, type RegisterFormValues } from "@/lib/validation";
import { cn } from "@/lib/utils";

export default function RegisterForm() {
    const router = useRouter();
    const { refreshAuth } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const passwordValue = watch("password");

    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length > 0) score = 1; // Very Weak
        if (pwd.length >= 6) score = 2; // Weak
        if (pwd.length >= 8 && /[A-Za-z]/.test(pwd) && /[0-9]/.test(pwd)) score = 3; // Strong
        if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score = 4; // Very Strong
        return score;
    };

    const passwordStrength = getPasswordStrength(passwordValue);

    const onSubmit = async (values: RegisterFormValues) => {
        setIsSubmitting(true);
        setSubmitError("");
        setSuccessMessage("");

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
            }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
            setSubmitError(data?.error ?? "Registration failed.");
            setIsSubmitting(false);
            return;
        }

        if (data?.authenticated) {
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
            return;
        }

        setSuccessMessage("Registration successful. Please check your email if confirmation is required.");
        setIsSubmitting(false);
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
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    {...register("password")}
                />
                
                {/* Password Strength Indicator */}
                <div className="mt-1 flex gap-1">
                    {[1, 2, 3, 4].map((bar) => (
                        <div
                            key={bar}
                            className={cn(
                                "h-1 flex-1 rounded-full transition-all duration-300",
                                passwordStrength >= bar
                                    ? passwordStrength === 1
                                        ? "bg-destructive"
                                        : passwordStrength === 2
                                        ? "bg-orange-500"
                                        : passwordStrength === 3
                                        ? "bg-yellow-500"
                                        : "bg-emerald-500"
                                    : "bg-muted"
                            )}
                        />
                    ))}
                </div>
                {passwordStrength > 0 && (
                    <p className={cn(
                        "text-xs font-medium text-right transition-colors duration-300",
                        passwordStrength === 1 ? "text-destructive" :
                        passwordStrength === 2 ? "text-orange-500" :
                        passwordStrength === 3 ? "text-yellow-500" :
                        "text-emerald-500"
                    )}>
                        {passwordStrength === 1 ? "Very Weak" : passwordStrength === 2 ? "Weak" : passwordStrength === 3 ? "Strong" : "Very Strong"}
                    </p>
                )}

                {errors.password ? (
                    <FieldError id="password-error">{errors.password.message}</FieldError>
                ) : null}
            </Field>

            <Field className="gap-2">
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <Input
                    id="confirmPassword"
                    type="password"
                    className="h-11 rounded-[8px]"
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                    {...register("confirmPassword")}
                />
                {errors.confirmPassword ? (
                    <FieldError id="confirmPassword-error">{errors.confirmPassword.message}</FieldError>
                ) : null}
            </Field>

            {submitError && <FieldError>{submitError}</FieldError>}
            {successMessage && <div className="text-sm font-medium text-emerald-600">{successMessage}</div>}

            <Field className="gap-2">
                <Button
                    type="submit"
                    className="h-11 rounded-[8px]"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
            </Field>
            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href={
                        typeof window !== "undefined" &&
                        new URL(window.location.href).searchParams.get("next")
                            ? `/login?next=${new URL(window.location.href).searchParams.get("next")}`
                            : "/login"
                    }
                    className="text-blue-600"
                >
                    Log in
                </Link>
            </p>
        </FieldGroup>
    </form>
  );
}
