"use client";

import Link from "next/link";
import GoogleLoginButton from "./google-login";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

import { useAuth } from "@/components/auth-provider";
import { loginSchema, type LoginFormValues } from "@/lib/validation";
import { FormTextField } from "@/components/form/form-text-field";

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshAuth } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [keepSignedIn, setKeepSignedIn] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    });
    const { handleSubmit } = form;

    const onSubmit = async (values: LoginFormValues) => {
        setIsSubmitting(true);
        setSubmitError("");

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...values, keepSignedIn }),
        });

        if (!res.ok) {
            console.error("Login response not ok:", res.status, res.statusText);
            const text = await res.text().catch(() => null);
            console.error("Login response text:", text);
            let data = null;
            try {
                if (text) data = JSON.parse(text);
            } catch (e) {
                console.error("JSON parse error:", e);
            }
            setSubmitError(data?.error ?? `Login failed. Status: ${res.status} Text: ${text?.substring(0, 50)}`);
            setIsSubmitting(false);
            return;
        }

        const next = searchParams.get("next");
        const safeNext =
            next &&
                next.startsWith("/") &&
                !next.startsWith("//") &&
                !next.startsWith("/login") &&
                next !== "/register" &&
                !next.startsWith("/register?") &&
                !next.startsWith("/auth/callback")
                ? next
                : "/admin";

        await refreshAuth();
        router.replace(safeNext);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <FieldGroup className="gap-6">
                    <FormTextField<LoginFormValues>
                        name="identifier"
                        label="Email or Username"
                        placeholder="e.g. johndoe@gmail.com or johndoe"
                        autoComplete="username"
                    />

                    <Field className="gap-2">
                        <FormTextField<LoginFormValues>
                            name="password"
                            label={
                                <div className="flex justify-between w-full mb-1.5">
                                    <span>Password</span>
                                    <Link href="/forgot-password" className="text-right text-sm text-muted-foreground hover:text-black transition">Forgot password?</Link>
                                </div>
                            }
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            fieldClassName="gap-0 w-full"
                        />

                        <Field orientation="horizontal" className="items-center gap-2 mt-2">
                            <Checkbox
                                id="keepSignedIn"
                                checked={keepSignedIn}
                                disabled={isSubmitting}
                                onCheckedChange={(checked) => setKeepSignedIn(checked === true)}
                            />
                            <FieldLabel
                                htmlFor="keepSignedIn"
                                className="cursor-pointer text-sm font-normal text-muted-foreground"
                            >
                                Keep me signed in
                            </FieldLabel>
                        </Field>
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

                        <div className="relative my-0.5">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-sm lowercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <GoogleLoginButton keepSignedIn={keepSignedIn} />
                    </Field>
                    <p className="text-center text-sm text-muted-foreground">
                        Do not have an account?{" "}
                        <Link
                            href={
                                searchParams.get("next")
                                    ? `/register?next=${searchParams.get("next")}`
                                    : "/register"
                            }
                            className="text-blue-600"
                        >
                            Register
                        </Link>
                    </p>
                </FieldGroup>
            </form>
        </FormProvider>
    );
}
