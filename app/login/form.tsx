"use client";

import Link from "next/link";
import GoogleLoginButton from "./google-login";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";;
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

import { useAuth } from "@/components/auth-provider";
import { useLoginMutation } from "@/hooks/mutations/use-auth-mutations";
import { toast } from "sonner";
import { loginSchema, type LoginFormValues } from "@/lib/validation";
import { FormTextField } from "@/components/form/form-text-field";

const safeRedirect = (value: string | null) => {
    return value &&
        value.startsWith("/") &&
        !value.startsWith("//") &&
        !value.startsWith("/login") &&
        value !== "/register" &&
        !value.startsWith("/register?") &&
        !value.startsWith("/auth/callback")
        ? value
        : null;
};

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useLoginMutation();
    const [submitError, setSubmitError] = useState("");

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: "",
            keepSignedIn: true,
        },
    });
    const keepSignedIn = form.watch("keepSignedIn");
    const setKeepSignedIn = (value: boolean) => form.setValue("keepSignedIn", value);
    const { handleSubmit } = form;

    const safeNext = safeRedirect(searchParams.get("next"));

    const onSubmit = async (values: LoginFormValues) => {
        setSubmitError("");

        let result;
        try {
            result = await login.mutateAsync({ ...values, keepSignedIn });
            toast.success("Successfully logged in");
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Login failed.");
            toast.error("Login failed", { 
                description: error instanceof Error ? error.message : "Please check your credentials and try again." 
            });
            return;
        }

        const nextUrl = result.adminAccess
            ? (safeNext?.startsWith("/admin") ? safeNext : "/admin")
            : (safeNext || "/profile");
            
        router.replace(nextUrl);
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
                                <div className="flex justify-between w-full">
                                    <span>Password</span>
                                    <Link href="/forgot-password" prefetch={false} className="text-right text-sm text-muted-foreground hover:text-white transition">Forgot password?</Link>
                                </div>
                            }
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            fieldClassName="gap-2 w-full"
                        />
                        
                        <Field orientation="horizontal" className="items-center gap-2">
                            <Checkbox
                                id="keepSignedIn"
                                checked={keepSignedIn}
                                disabled={login.isPending}
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
                            disabled={login.isPending}
                        >
                            {login.isPending ? "Signing in..." : "Log in"}
                        </Button>

                        <div className="relative my-0.5">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-sm lowercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or
                                </span>
                            </div>
                        </div>

                        <GoogleLoginButton keepSignedIn={keepSignedIn} />
                    </Field>
                    <p className="text-center text-sm text-muted-foreground">
                        Do not have an account?{" "}
                        <Link
                            href={
                                safeNext
                                    ? `/register?next=${safeNext}`
                                    : "/register"
                            }
                            prefetch={false}
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
