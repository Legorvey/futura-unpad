"use client";

import Link from "next/link";
import GoogleLoginButton from "../login/google-login";
import { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
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
import { useRegisterMutation } from "@/hooks/mutations/use-auth-mutations";
import { toast } from "sonner";
import { signupSchema, type RegisterFormValues } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { FormTextField } from "@/components/form/form-text-field";

type LegalDialogType = "terms" | "privacy";

const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length > 0) score = 1; // Very Weak
    if (pwd.length >= 6) score = 2; // Weak
    if (pwd.length >= 8 && /[A-Za-z]/.test(pwd) && /[0-9]/.test(pwd)) score = 3; // Strong
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score = 4; // Very Strong
    return score;
};

export default function RegisterForm({ loginHref = "/login" }: { loginHref?: string }) {
    const router = useRouter();
    const registerAccount = useRegisterMutation();
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [legalDialog, setLegalDialog] = useState<LegalDialogType | null>(null);
    const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

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

    // Listen for cross-tab verification (e.g. user clicked Magic Link in another tab)
    useEffect(() => {
        if (!verifyEmail) return;

        const channel = new BroadcastChannel('auth-sync');
        channel.onmessage = (event) => {
            if (event.data === 'email_verified') {
                toast.success("Email verified in another tab!");
                setVerifyEmail(null);
                router.push("/login");
            }
        };

        return () => channel.close();
    }, [verifyEmail, router]);

    const passwordStrength = getPasswordStrength(passwordValue);

    const onSubmit = async (values: RegisterFormValues) => {
        setSubmitError("");
        setSuccessMessage("");

        const data = await registerAccount.mutateAsync({
                username: values.username,
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
                termsAccepted: values.termsAccepted,
        }).catch((error) => {
            setSubmitError(error instanceof Error ? error.message : "Registration failed.");
            toast.error("Registration failed", {
                description: error instanceof Error ? error.message : "An unexpected error occurred."
            });
            return null;
        });

        if (!data) {
            return;
        }

        if (data?.authenticated) {
            toast.success("Successfully registered and logged in");
            const currentUrl = new URL(window.location.href);
            const getSafeRedirectPath = (value: string | null) => {
                return value &&
                    value.startsWith("/") &&
                    !value.startsWith("//") &&
                    !value.startsWith("/login") &&
                    !value.startsWith("/register") &&
                    !value.startsWith("/auth/callback")
                    ? value
                    : "/profile";
            };

            const safeNext = getSafeRedirectPath(currentUrl.searchParams.get("next"));

            router.replace(safeNext);
            return;
        }

        setVerifyEmail(values.email);
        setSuccessMessage("Registration successful. Please verify your email.");
        toast.success("Registration successful", {
            description: "Please enter the OTP sent to your email to verify your account."
        });
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
                        disabled={registerAccount.isPending}
                    >
                        {registerAccount.isPending ? "Creating account..." : "Create Account"}
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

                    <GoogleLoginButton onBeforeLogin={requireLegalAgreement} />
                </Field>
                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href={loginHref}
                        prefetch={false}
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

            <Dialog 
                open={!!verifyEmail} 
                onOpenChange={(open) => {
                    if (!open && !isVerifying) {
                        setVerifyEmail(null);
                        setOtp("");
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold tracking-tight">Check your email</DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground pt-2">
                            We&apos;ve sent a confirmation code to <span className="font-medium text-foreground">{verifyEmail}</span>.
                            Please enter it below to activate your account. The code expires in 1 hour.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col space-y-6 py-4">
                        <input
                            type="text"
                            maxLength={8}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="00000000"
                            className="mx-auto flex h-16 w-full max-w-[320px] rounded-lg border-2 border-input bg-background px-3 py-1 text-center text-4xl font-medium tracking-[0.2em] shadow-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            className="w-full h-11 text-base rounded-[8px]"
                            disabled={otp.length < 6 || isVerifying}
                            onClick={async () => {
                                setIsVerifying(true);
                                try {
                                    const res = await fetch("/api/auth/verify-otp", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ email: verifyEmail, token: otp }),
                                    });
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.error || "Verification failed");
                                    
                                    toast.success("Email verified successfully!");
                                    router.push("/login");
                                } catch (err: any) {
                                    toast.error(err.message);
                                } finally {
                                    setIsVerifying(false);
                                }
                            }}
                        >
                            {isVerifying ? "Verifying..." : "Verify Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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

                <div className="space-y-4 text-sm font-medium leading-relaxed text-neutral-500">
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
