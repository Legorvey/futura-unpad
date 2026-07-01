"use client";

import Link from "next/link";
import GoogleLoginButton from "../login/google-login";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";

import { useAuth } from "@/components/auth-provider";
import { signupSchema, type RegisterFormValues } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { FormTextField } from "@/components/form/form-text-field";

type LegalDialogType = "terms" | "privacy";

export default function RegisterForm() {
    const router = useRouter();
    const { refreshAuth } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [legalDialog, setLegalDialog] = useState<LegalDialogType | null>(null);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            termsAccepted: false,
        },
    });

    const {
        setValue,
        setError,
        clearErrors,
        handleSubmit,
        watch,
        formState: { errors },
    } = form;

    const passwordValue = watch("password");
    const termsAccepted = watch("termsAccepted");

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
                username: values.username,
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
                termsAccepted: values.termsAccepted,
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
            return;
        }

        setSuccessMessage("Registration successful. Please check your email if confirmation is required.");
        setIsSubmitting(false);
    };

    const requireLegalAgreement = () => {
        if (termsAccepted) {
            return true;
        }

        setError("termsAccepted", {
            type: "manual",
            message: "Please agree to the Terms and Privacy Policy.",
        });
        return false;
    };

    return (
        <>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <FieldGroup className="gap-6">
                    <FormTextField<RegisterFormValues>
                        name="username"
                        label="Username"
                        placeholder="e.g. johndoe123"
                        autoComplete="username"
                    />

                    <FormTextField<RegisterFormValues>
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="e.g. johndoe@gmail.com"
                        autoComplete="email"
                    />

                    <Field className="gap-2">
                        <FormTextField<RegisterFormValues>
                            name="password"
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="new-password"
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
                                            : "bg-muted-foreground/20"
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
                    </Field>

                    <FormTextField<RegisterFormValues>
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                    />

                <Field orientation="horizontal" className="items-start gap-3">
                    <Checkbox
                        id="termsAccepted"
                        checked={termsAccepted}
                        aria-invalid={!!errors.termsAccepted}
                        aria-describedby={errors.termsAccepted ? "termsAccepted-error" : undefined}
                        onCheckedChange={(checked) => {
                            const accepted = checked === true;
                            setValue("termsAccepted", accepted, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                            });
                            if (accepted) {
                                clearErrors("termsAccepted");
                            }
                        }}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm leading-5 text-muted-foreground">
                            I agree with the{" "}
                            <button
                                type="button"
                                className="cursor-pointer font-medium text-blue-600 underline-offset-4 hover:underline"
                                onClick={() => setLegalDialog("terms")}
                            >
                                Terms
                            </button>{" "}
                            and{" "}
                            <button
                                type="button"
                                className="cursor-pointer font-medium text-blue-600 underline-offset-4 hover:underline"
                                onClick={() => setLegalDialog("privacy")}
                            >
                                Privacy Policy
                            </button>
                            .
                        </p>
                        {errors.termsAccepted ? (
                            <FieldError id="termsAccepted-error">{errors.termsAccepted.message}</FieldError>
                        ) : null}
                    </div>
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

                    <GoogleLoginButton onBeforeLogin={requireLegalAgreement} />
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
            </FormProvider>

            <LegalDialog
                type={legalDialog ?? "terms"}
                open={legalDialog !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setLegalDialog(null);
                    }
                }}
            />
        </>
    );
}

function LegalDialog({
    type,
    open,
    onOpenChange,
}: {
    type: LegalDialogType;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const isTerms = type === "terms";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isTerms ? "Terms" : "Privacy Policy"}</DialogTitle>
                    <DialogDescription>
                        {isTerms
                            ? "These draft terms describe how participants use Futura registration and event services."
                            : "This draft policy describes how Futura handles account, registration, and event-related information."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 text-sm leading-6 text-muted-foreground">
                    {isTerms ? <TermsContent /> : <PrivacyContent />}
                </div>

                <DialogFooter showCloseButton />
            </DialogContent>
        </Dialog>
    );
}

function TermsContent() {
    return (
        <>
            <section className="space-y-2">
                <h3 className="font-medium text-foreground">Account Use</h3>
                <p>
                    You agree to provide accurate registration details, keep your account access secure, and use the Futura website only for lawful event registration, payment, and participation purposes.
                </p>
            </section>
            <section className="space-y-2">
                <h3 className="font-medium text-foreground">Registration and Attendance</h3>
                <p>
                    Event seats, competition entries, certificates, attendance records, and payment status may depend on the information you submit. Futura may contact you to verify details or resolve registration issues.
                </p>
            </section>
            <section className="space-y-2">
                <h3 className="font-medium text-foreground">Payments and Event Changes</h3>
                <p>
                    Fees, payment deadlines, event schedules, and participation requirements may change while the final event information is being prepared. Any official updates should be followed as published by the organizer.
                </p>
            </section>
            <section className="space-y-2">
                <h3 className="font-medium text-foreground">Responsible Conduct</h3>
                <p>
                    You agree not to misuse the website, submit false data, disrupt other users, attempt unauthorized access, or interfere with Futura systems and event operations.
                </p>
            </section>
        </>
    );
}

function PrivacyContent() {
    return (
        <>
            <section className="space-y-2">
                <h3 className="font-medium text-foreground">Information We Collect</h3>
                <p>
                    Futura may collect account details, contact information, registration data, institution details, payment references, attendance status, and messages you submit through the website.
                </p>
            </section>
            <section className="space-y-2">
                <h3 className="font-medium text-foreground">How We Use Information</h3>
                <p>
                    Information is used to create accounts, manage registrations, process payments, verify attendance, issue event records, communicate updates, and improve event operations.
                </p>
            </section>
            <section className="space-y-2">
                <h3 className="font-medium text-foreground">Service Providers</h3>
                <p>
                    Some information may be processed by trusted services used for authentication, payments, email delivery, analytics, hosting, and operational support.
                </p>
            </section>
            <section className="space-y-2">
                <h3 className="font-medium text-foreground">Data Requests</h3>
                <p>
                    You may contact the organizer to request corrections or deletion where appropriate. Some records may need to be retained for payment, attendance, certificate, or administrative purposes.
                </p>
            </section>
        </>
    );
}
