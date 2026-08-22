"use client";

import Link from "next/link";
import { motion } from "motion/react";
import GoogleLoginButton from "../login/google-login";
import { useState, useEffect, useRef } from "react";
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

import { useRegisterMutation } from "@/hooks/mutations/use-auth-mutations";
import { toast } from "sonner";
import { signupSchema, type RegisterFormValues } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { getSafeRedirectPath } from "@/lib/navigation";
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
    const [otpErrorMessage, setOtpErrorMessage] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const otpInputRef = useRef<HTMLInputElement>(null);

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
        if (!verifyEmail || step !== 3) return;

        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            const channel = new window.BroadcastChannel("auth-sync");
            channel.onmessage = (event) => {
                if (event.data === "email_verified") {
                    toast.success("Email diverifikasi di tab lain!");
                    setVerifyEmail(null);
                    router.push(loginHref);
                }
            };

            return () => channel.close();
        }
    }, [verifyEmail, step, router, loginHref]);

    // Explicitly lock body scroll when legal dialog is open
    useEffect(() => {
        if (legalDialog !== null) {
            document.documentElement.style.setProperty("overflow", "hidden", "important");
            document.body.style.setProperty("overflow", "hidden", "important");
        } else {
            document.documentElement.style.removeProperty("overflow");
            document.body.style.removeProperty("overflow");
        }
        return () => {
            document.documentElement.style.removeProperty("overflow");
            document.body.style.removeProperty("overflow");
        };
    }, [legalDialog]);

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
            const errorMsg = error instanceof Error ? error.message : "Registrasi gagal.";
            setSubmitError(errorMsg);
            toast.error("Registrasi gagal", {
                description: errorMsg,
            });
            return null;
        });

        if (!data) {
            return;
        }

        if (data?.authenticated) {
            toast.success("Berhasil mendaftar dan masuk");
            const currentUrl = new URL(window.location.href);
            const safeNext = getSafeRedirectPath(currentUrl.searchParams.get("next"));

            router.replace(safeNext);
            return;
        }

        setVerifyEmail(values.email);
        setStep(3);
        toast.success("Pendaftaran berhasil", {
            description: "Silakan masukkan kode OTP yang dikirim ke email Anda untuk mengaktifkan akun.",
        });
    };

    const handleVerifyOtp = async () => {
        if (!verifyEmail || otp.length < 8 || isVerifying) return;

        setIsVerifying(true);
        setOtpErrorMessage("");

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: verifyEmail,
                    token: otp,
                    type: "signup",
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Kode verifikasi tidak valid atau telah kedaluwarsa.");
            }

            toast.success("Email berhasil diverifikasi! Silakan masuk ke akun Anda.");
            router.push(loginHref);
        } catch (err: unknown) {
            let msg = err instanceof Error ? err.message : "Kode verifikasi tidak valid atau telah kedaluwarsa.";
            if (
                msg.toLowerCase().includes("expired") ||
                msg.toLowerCase().includes("invalid") ||
                msg.toLowerCase().includes("token")
            ) {
                msg = "Kode OTP tidak valid atau telah kedaluwarsa. Silakan periksa kembali email Anda.";
            } else if (
                msg.toLowerCase().includes("rate limit") ||
                msg.toLowerCase().includes("too many")
            ) {
                msg = "Terlalu banyak percobaan. Silakan tunggu beberapa saat.";
            }
            setOtpErrorMessage(msg);
            toast.error("Verifikasi gagal", { description: msg });
        } finally {
            setIsVerifying(false);
        }
    };


    return (
        <>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Step Indicator */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex items-center gap-1.5">
                            <div
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    step === 1 ? "w-8 bg-[#00205B]" : "w-4 bg-[#00205B]/20",
                                    step === 2 && "cursor-pointer hover:bg-[#00205B]/40"
                                )}
                                onClick={() => {
                                    if (step === 2) setStep(1);
                                }}
                            />
                            <div
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    step === 2 ? "w-8 bg-[#00205B]" : "w-4 bg-[#00205B]/20"
                                )}
                            />
                            <div
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    step === 3 ? "w-8 bg-[#00205B]" : "w-4 bg-[#00205B]/20"
                                )}
                            />
                        </div>
                        <span className="text-sm font-medium text-zinc-500">
                            {step === 1
                                ? "Informasi Akun (1/3)"
                                : step === 2
                                ? "Kata Sandi (2/3)"
                                : "Verifikasi Email (3/3)"}
                        </span>
                    </div>

                    <FieldGroup className="gap-6">
                        {/* STEP 1: Account Info */}
                        {step === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-6"
                            >
                                <FormTextField<RegisterFormValues>
                                    name="username"
                                    label="Username"
                                    placeholder="contoh: johndoe123"
                                    autoComplete="username"
                                />

                                <FormTextField<RegisterFormValues>
                                    name="email"
                                    label="Email"
                                    type="email"
                                    placeholder="contoh: johndoe@gmail.com"
                                    autoComplete="email"
                                />

                                <Field className="gap-2">
                                    <Button
                                        type="button"
                                        onClick={async () => {
                                            const isValid = await form.trigger(["username", "email"]);
                                            if (isValid) setStep(2);
                                        }}
                                        className="h-11 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm sm:text-base transition-all shadow-sm w-full"
                                    >
                                        Selanjutnya
                                    </Button>

                                    <div className="flex items-center gap-4 my-2">
                                        <div className="h-px flex-1 bg-black/10"></div>
                                        <span className="text-sm text-zinc-500 font-medium lowercase">atau</span>
                                        <div className="h-px flex-1 bg-black/10"></div>
                                    </div>

                                    <GoogleLoginButton />
                                </Field>
                                <p className="text-center text-sm text-zinc-500">
                                    Sudah punya akun?{" "}
                                    <Link
                                        href={loginHref}
                                        prefetch={false}
                                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                </p>
                            </motion.div>
                        )}

                        {/* STEP 2: Password & Terms */}
                        {step === 2 && (
                            <motion.div
                                key="step-2"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-6"
                            >
                                <Field className="gap-2">
                                    <FormTextField<RegisterFormValues>
                                        name="password"
                                        label="Kata Sandi"
                                        type="password"
                                        placeholder="Masukkan kata sandi Anda"
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
                                        <p
                                            className={cn(
                                                "text-xs font-medium text-right transition-colors duration-300",
                                                passwordStrength === 1
                                                    ? "text-destructive"
                                                    : passwordStrength === 2
                                                    ? "text-orange-500"
                                                    : passwordStrength === 3
                                                    ? "text-yellow-500"
                                                    : "text-emerald-500"
                                            )}
                                        >
                                            {passwordStrength === 1
                                                ? "Sangat Lemah"
                                                : passwordStrength === 2
                                                ? "Lemah"
                                                : passwordStrength === 3
                                                ? "Kuat"
                                                : "Sangat Kuat"}
                                        </p>
                                    )}
                                </Field>

                                <FormTextField<RegisterFormValues>
                                    name="confirmPassword"
                                    label="Konfirmasi Kata Sandi"
                                    type="password"
                                    placeholder="Konfirmasi kata sandi Anda"
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
                                        <p className="text-sm leading-5 text-zinc-500">
                                            Saya setuju dengan{" "}
                                            <button
                                                type="button"
                                                className="cursor-pointer font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors"
                                                onClick={() => setLegalDialog("terms")}
                                            >
                                                Syarat
                                            </button>{" "}
                                            dan{" "}
                                            <button
                                                type="button"
                                                className="cursor-pointer font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors"
                                                onClick={() => setLegalDialog("privacy")}
                                            >
                                                Kebijakan Privasi
                                            </button>
                                            .
                                        </p>
                                        {errors.termsAccepted ? (
                                            <FieldError id="termsAccepted-error">{errors.termsAccepted.message}</FieldError>
                                        ) : null}
                                    </div>
                                </Field>

                                {submitError && <FieldError>{submitError}</FieldError>}
                                {successMessage && (
                                    <div className="text-sm font-medium text-emerald-600">{successMessage}</div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                    <Button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="h-11 rounded-xl font-semibold flex-1 bg-white text-black border border-zinc-200 hover:bg-zinc-50 shadow-sm transition-all"
                                    >
                                        Kembali
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="h-11 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm sm:text-base transition-all shadow-sm flex-1"
                                        disabled={registerAccount.isPending}
                                    >
                                        {registerAccount.isPending ? "Membuat akun..." : "Buat Akun"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Email OTP Verification (Simple & Elegant Segmented Design) */}
                        {step === 3 && (
                            <motion.div
                                key="step-3"
                                initial={{ opacity: 0, scale: 0.98, y: 6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -6 }}
                                className="space-y-6"
                            >
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">
                                        Verifikasi Email
                                    </h2>
                                    <p className="text-sm text-zinc-500 leading-relaxed">
                                        Kode 8 digit telah dikirim ke{" "}
                                        <span className="font-semibold text-neutral-900 break-all">
                                            {verifyEmail}
                                        </span>
                                    </p>
                                </div>

                                <div className="space-y-3 py-1">
                                    {/* Segmented OTP Input */}
                                    <div
                                        className="relative flex flex-col items-center justify-center cursor-text py-2"
                                        onClick={() => otpInputRef.current?.focus()}
                                    >
                                        <input
                                            ref={otpInputRef}
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            pattern="[0-9]*"
                                            maxLength={8}
                                            value={otp}
                                            onChange={(e) => {
                                                setOtpErrorMessage("");
                                                setOtp(e.target.value.replace(/\D/g, "").slice(0, 8));
                                            }}
                                            onFocus={() => setIsInputFocused(true)}
                                            onBlur={() => setIsInputFocused(false)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && otp.length === 8 && !isVerifying) {
                                                    e.preventDefault();
                                                    handleVerifyOtp();
                                                }
                                            }}
                                            aria-label="Kode verifikasi 8 digit"
                                            className="absolute inset-0 opacity-0 pointer-events-auto cursor-text w-full h-full"
                                            disabled={isVerifying}
                                            autoFocus
                                        />

                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                {[0, 1, 2, 3].map((index) => {
                                                    const char = otp[index] || "";
                                                    const isCurrent =
                                                        isInputFocused &&
                                                        (otp.length === index || (otp.length === 8 && index === 7));
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={cn(
                                                                "w-8 sm:w-10 h-11 sm:h-12 rounded-xl flex items-center justify-center font-mono text-lg sm:text-xl font-semibold transition-all duration-150 select-none",
                                                                isCurrent
                                                                    ? "border-2 border-[#00205B] ring-2 ring-[#00205B]/15 bg-white text-neutral-900 shadow-xs"
                                                                    : char
                                                                    ? "border border-zinc-300 bg-white text-neutral-900"
                                                                    : "border border-zinc-200 bg-zinc-50/70 text-transparent",
                                                                otpErrorMessage &&
                                                                    "border-destructive ring-2 ring-destructive/15 bg-destructive/[0.02]"
                                                            )}
                                                        >
                                                            {char ||
                                                                (isCurrent && !char ? (
                                                                    <span className="inline-block w-0.5 h-5 bg-[#00205B] animate-pulse" />
                                                                ) : (
                                                                    ""
                                                                ))}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <span className="text-zinc-300 font-bold select-none text-xs sm:text-sm px-0.5">
                                                –
                                            </span>

                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                {[4, 5, 6, 7].map((index) => {
                                                    const char = otp[index] || "";
                                                    const isCurrent = isInputFocused && otp.length === index;
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={cn(
                                                                "w-8 sm:w-10 h-11 sm:h-12 rounded-xl flex items-center justify-center font-mono text-lg sm:text-xl font-semibold transition-all duration-150 select-none",
                                                                isCurrent
                                                                    ? "border-2 border-[#00205B] ring-2 ring-[#00205B]/15 bg-white text-neutral-900 shadow-xs"
                                                                    : char
                                                                    ? "border border-zinc-300 bg-white text-neutral-900"
                                                                    : "border border-zinc-200 bg-zinc-50/70 text-transparent",
                                                                otpErrorMessage &&
                                                                    "border-destructive ring-2 ring-destructive/15 bg-destructive/[0.02]"
                                                            )}
                                                        >
                                                            {char ||
                                                                (isCurrent && !char ? (
                                                                    <span className="inline-block w-0.5 h-5 bg-[#00205B] animate-pulse" />
                                                                ) : (
                                                                    ""
                                                                ))}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {otpErrorMessage && (
                                        <div
                                            className="text-xs text-destructive font-medium text-center bg-destructive/10 py-2 px-3 rounded-lg border border-destructive/20"
                                            role="alert"
                                        >
                                            {otpErrorMessage}
                                        </div>
                                    )}

                                    <p className="text-xs text-zinc-400 text-center">
                                        Tidak menerima kode? Periksa folder spam.
                                    </p>
                                </div>

                                <div className="space-y-3 pt-1">
                                    <Button
                                        type="button"
                                        className="w-full h-11 text-sm font-semibold tracking-wide rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white transition-all shadow-sm"
                                        disabled={otp.length < 8 || isVerifying}
                                        onClick={handleVerifyOtp}
                                    >
                                        {isVerifying ? "Memverifikasi..." : "Verifikasi"}
                                    </Button>

                                    <p className="text-center text-sm text-zinc-500">
                                        Sudah terverifikasi?{" "}
                                        <Link
                                            href={loginHref}
                                            prefetch={false}
                                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                        >
                                            Masuk
                                        </Link>
                                    </p>
                                </div>
                            </motion.div>
                        )}
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
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl dark bg-[#00205B] border border-white/20 text-white custom-scrollbar rounded-2xl shadow-2xl p-6 sm:p-8">
                <DialogHeader>
                    <DialogTitle className="text-white">{isTerms ? "Syarat" : "Kebijakan Privasi"}</DialogTitle>
                    <DialogDescription className="text-white/70">
                        {isTerms
                            ? "Syarat dan Ketentuan ini mengatur akses dan penggunaan Anda terhadap layanan registrasi Futura Universitas Padjadjaran."
                            : "Kebijakan Privasi ini menjelaskan bagaimana Futura Universitas Padjadjaran mengumpulkan, menggunakan, dan melindungi Informasi Pribadi Anda."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 text-sm font-medium leading-relaxed text-white/80">
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
            <div className="space-y-3">
                <p>
                    Selamat datang di website resmi Futura Universitas Padjadjaran (futuraunpad.com). Syarat dan Ketentuan ini mengatur akses dan penggunaan Anda terhadap website dan layanan registrasi kami untuk acara lomba Robot Sumo, lomba Robot Transporter, Seminar Nasional, dan Lomba Esai.
                </p>
                <p>
                    Dengan mengakses atau menggunakan website ini, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda tidak diperkenankan untuk menggunakan layanan kami.
                </p>
            </div>

            <section className="space-y-2 pt-2">
                <h3 className="font-medium text-white">Pendaftaran dan Akun Pengguna</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Untuk mendaftar acara atau kompetisi, Anda diwajibkan untuk membuat akun dan memberikan informasi yang akurat, lengkap, dan terbaru.</li>
                    <li>Anda bertanggung jawab penuh untuk menjaga kerahasiaan kata sandi dan akun Anda.</li>
                    <li>Panitia berhak menangguhkan atau menghapus akun jika ditemukan indikasi pemalsuan data, pendaftaran ganda yang melanggar aturan, atau tindakan curang lainnya.</li>
                </ul>
            </section>
            
            <section className="space-y-2 pt-2">
                <h3 className="font-medium text-white">Ketentuan Pendaftaran Acara dan Kompetisi</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Seluruh peserta wajib mematuhi Guidebook (Buku Panduan) resmi dari masing-masing acara yang didaftarkan.</li>
                    <li>Bagi peserta di bawah umur (di bawah 18 tahun), pendaftaran wajib menyertakan data dan dokumen identitas (KTP) dari Orang Tua, Wali yang sah, atau Guru Pembina sebagai penanggung jawab.</li>
                    <li>Pendaftaran baru dianggap sah dan selesai setelah proses verifikasi dokumen atau pembayaran berhasil dikonfirmasi oleh sistem.</li>
                </ul>
            </section>

            <section className="space-y-2 pt-2">
                <h3 className="font-medium text-white">Pembayaran dan Kebijakan Pengembalian Dana</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Pembayaran pendaftaran diproses melalui sistem payment gateway pihak ketiga yang terintegrasi di website kami.</li>
                    <li>Anda wajib membayar sesuai dengan nominal tagihan yang tertera pada sistem sebelum batas waktu yang ditentukan.</li>
                    <li>Seluruh pembayaran yang telah berhasil dikonfirmasi bersifat final dan tidak dapat dikembalikan (non-refundable), kecuali acara dibatalkan secara sepihak oleh panitia Futura Universitas Padjadjaran.</li>
                </ul>
            </section>

            <section className="space-y-2 pt-2">
                <h3 className="font-medium text-white">Kewajiban Pengguna</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Menggunakan website ini untuk tujuan legal dan tidak melanggar hukum.</li>
                    <li>Tidak mengunggah dokumen yang mengandung virus, malware, atau kode berbahaya lainnya.</li>
                    <li>Tidak mencoba meretas, melakukan spamming, menembus sistem keamanan (bypass), atau membebani infrastruktur kami secara tidak wajar.</li>
                    <li>Tidak menggunakan identitas orang lain tanpa izin.</li>
                </ul>
            </section>

            <section className="space-y-2 pt-2">
                <h3 className="font-medium text-white">Tiket dan Akses Acara</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Peserta yang telah tervalidasi akan menerima tiket elektronik (QR Code) melalui sistem kami atau email terdaftar.</li>
                    <li>Tiket elektronik wajib ditunjukkan pada saat proses daftar ulang (check-in) di lokasi acara dan tidak dapat dipindahtangankan tanpa persetujuan resmi.</li>
                </ul>
            </section>
        </>
    );
}

function PrivacyContent() {
    return (
        <>
            <div className="space-y-3">
                <p>
                    Futura Universitas Padjadjaran mengoperasikan website futuraunpad.com yang menyediakan layanan registrasi dan informasi terkait acara.
                </p>
                <p>
                    Jika Anda memilih untuk menggunakan layanan kami, maka Anda menyetujui pengumpulan dan penggunaan informasi sehubungan dengan kebijakan ini. Kami tidak akan menggunakan atau membagikan informasi Anda dengan siapa pun kecuali seperti yang dijelaskan dalam Kebijakan Privasi ini.
                </p>
            </div>

            <section className="space-y-2 pt-2">
                <h3 className="font-medium text-white">Pengumpulan dan Penggunaan Informasi</h3>
                <p>
                    Untuk pengalaman yang lebih baik saat menggunakan layanan kami, kami mungkin meminta Anda untuk memberikan kami informasi pengenal pribadi tertentu, termasuk namun tidak terbatas pada nama, nomor telepon, dan alamat email Anda. Informasi yang kami kumpulkan akan digunakan untuk menghubungi atau mengidentifikasi Anda.
                </p>
            </section>

            <section className="space-y-2 pt-2">
                <h3 className="font-medium text-white">Data Log & Cookies</h3>
                <p>
                    Kami mengumpulkan Data Log yang dikirimkan browser Anda (seperti alamat IP, versi browser, halaman yang dikunjungi, dan waktu kunjungan). Kami juga menggunakan &quot;cookies&quot; untuk mengumpulkan informasi guna meningkatkan layanan kami.
                </p>
            </section>

            <section className="space-y-2 pt-2">
                <h3 className="font-medium text-white">Penyedia Layanan Pihak Ketiga</h3>
                <p>
                    Kami mempekerjakan pihak ketiga untuk memfasilitasi layanan kami (termasuk autentikasi dan payment gateway). Pihak ketiga ini memiliki akses ke Informasi Pribadi Anda hanya untuk melakukan tugas atas nama kami dan berkewajiban untuk tidak mengungkapkannya.
                </p>
            </section>

            <section className="space-y-2 pt-2">
                <h3 className="font-medium text-white">Privasi Peserta di Bawah Umur</h3>
                <p>
                    Pengumpulan informasi pribadi dari peserta di bawah umur (di bawah 18 tahun) hanya dapat dilakukan dengan sepengetahuan dan persetujuan dari orang tua, wali yang sah, atau guru pembina. Apabila kami menemukan data anak di bawah umur yang dikirimkan tanpa persetujuan, panitia berhak membatalkan pendaftaran.
                </p>
            </section>
            
            <section className="space-y-2 pt-2">
                <h3 className="font-medium text-white">Keamanan Data</h3>
                <p>
                    Kami menggunakan cara yang dapat diterima secara komersial untuk melindungi Informasi Pribadi Anda, namun tidak ada metode transmisi melalui internet atau penyimpanan elektronik yang 100% aman.
                </p>
            </section>
        </>
    );
}
