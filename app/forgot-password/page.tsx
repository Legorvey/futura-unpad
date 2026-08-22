"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForgotPasswordMutation } from "@/hooks/mutations/use-auth-mutations";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validation";
import { FormTextField } from "@/components/form/form-text-field";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [verifyEmail, setVerifyEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [otpErrorMessage, setOtpErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const forgotPassword = useForgotPasswordMutation();

  useEffect(() => {
    if (!verifyEmail) return;

    const channel = new window.BroadcastChannel("auth-sync");
    channel.onmessage = (event) => {
      if (event.data === "email_verified") {
        toast.success("Email berhasil diverifikasi di tab lain!");
        router.push("/reset-password");
      }
    };

    return () => channel.close();
  }, [verifyEmail, router]);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { handleSubmit } = form;

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setErrorMessage("");

    try {
      await forgotPassword.mutateAsync(values);
      toast.success("Kode reset telah dikirim ke email Anda.");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message !== "User with this email not found"
      ) {
        const msg = "Terjadi kendala saat mengirim kode. Silakan coba lagi.";
        setErrorMessage(msg);
        toast.error("Gagal mengirim kode", { description: msg });
        return;
      }
      // If error is 'User with this email not found', silently proceed to prevent email enumeration.
    }

    setVerifyEmail(values.email);
    setStep(2);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 8 || isVerifying || !verifyEmail) return;

    setIsVerifying(true);
    setOtpErrorMessage("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verifyEmail,
          token: otp,
          type: "recovery",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Kode verifikasi tidak valid atau telah kedaluwarsa"
        );
      }

      toast.success("Verifikasi berhasil!");
      router.push("/reset-password");
    } catch (err: any) {
      let msg =
        err?.message || "Kode verifikasi tidak valid atau telah kedaluwarsa.";
      if (
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("invalid") ||
        msg.toLowerCase().includes("token")
      ) {
        msg =
          "Kode OTP tidak valid atau telah kedaluwarsa. Silakan periksa kembali email Anda.";
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
    <main className="bg-white min-h-screen w-full relative grid lg:grid-cols-2 font-sans overflow-x-hidden">
      <style
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
            body {
              background-color: white !important;
            }
            .light-form-fix input {
              background-color: white !important;
              border-color: rgba(0, 0, 0, 0.2) !important;
              color: black !important;
            }
            .light-form-fix input::placeholder {
              color: rgba(0, 0, 0, 0.4) !important;
            }
            .light-form-fix label {
              color: black !important;
              font-weight: 500 !important;
            }
            .light-form-fix .text-muted-foreground {
              color: rgba(0, 0, 0, 0.6) !important;
            }
          `,
        }}
      />

      {/* Left side: Form */}
      <div className="flex flex-col items-center justify-center px-6 lg:px-12 pt-24 pb-12 w-full h-full lg:min-h-screen relative">
        <div className="absolute top-8 left-6 lg:left-12 z-50">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Halaman Masuk
          </Link>
        </div>

        <div className="relative z-10 w-full max-w-[420px] space-y-8">
          <section className="space-y-1">
            <h1 className="text-black text-2xl md:text-3xl font-semibold tracking-tighter text-balance font-sans">
              {step === 1 ? "Lupa kata sandi?" : "Verifikasi Email"}
            </h1>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed tracking-tight font-sans">
              {step === 1
                ? "Masukkan email akun Anda untuk menerima kode reset kata sandi"
                : "Masukkan 8 digit kode yang kami kirimkan ke email Anda"}
            </p>
          </section>

          <section className="font-sans light-form-fix">
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
                    if (step === 2 && !isVerifying) {
                      setStep(1);
                      setOtp("");
                      setOtpErrorMessage("");
                    }
                  }}
                  role={step === 2 ? "button" : undefined}
                  tabIndex={step === 2 ? 0 : undefined}
                  aria-label="Kembali ke langkah 1"
                />
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    step === 2 ? "w-8 bg-[#00205B]" : "w-4 bg-[#00205B]/20"
                  )}
                />
              </div>
              <span className="text-sm font-medium text-zinc-500">
                {step === 1 ? "Lupa Kata Sandi (1/2)" : "Verifikasi Email (2/2)"}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FormProvider {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                      <FieldGroup className="gap-6">
                        {errorMessage && (
                          <div
                            className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-destructive text-xs font-medium text-center"
                            role="alert"
                          >
                            {errorMessage}
                          </div>
                        )}

                        <FormTextField<ForgotPasswordFormValues>
                          name="email"
                          label="Email Terdaftar"
                          type="email"
                          placeholder="contoh: johndoe@gmail.com"
                          autoComplete="email"
                        />

                        <Field className="gap-2 pt-2">
                          <Button
                            type="submit"
                            className="h-11 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm sm:text-base transition-all shadow-sm w-full"
                            disabled={forgotPassword.isPending}
                          >
                            {forgotPassword.isPending
                              ? "Mengirim instruksi..."
                              : "Kirim Kode Reset"}
                          </Button>
                        </Field>

                        <p className="text-center text-sm text-zinc-500">
                          Sudah ingat kata sandi Anda?{" "}
                          <Link
                            href="/login"
                            prefetch={false}
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            Masuk
                          </Link>
                        </p>
                      </FieldGroup>
                    </form>
                  </FormProvider>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        Kode 8 digit telah dikirim ke{" "}
                        <span className="font-semibold text-neutral-900 break-all">
                          {verifyEmail}
                        </span>
                      </p>
                    </div>

                    {/* Segmented OTP Input */}
                    <div className="relative flex justify-center py-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={8}
                        value={otp}
                        onChange={(e) => {
                          setOtpErrorMessage("");
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 8));
                        }}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            otp.length === 8 &&
                            !isVerifying
                          ) {
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
                              (otp.length === index ||
                                (otp.length === 8 && index === 7));
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
                            const isCurrent =
                              isInputFocused && otp.length === index;
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
                      onClick={handleVerifyOtp}
                      disabled={otp.length < 8 || isVerifying}
                      className="h-11 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm sm:text-base transition-all shadow-sm w-full disabled:opacity-50"
                    >
                      {isVerifying
                        ? "Memverifikasi..."
                        : "Verifikasi & Buat Sandi Baru"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setStep(1);
                        setOtp("");
                        setOtpErrorMessage("");
                      }}
                      className="w-full text-xs text-zinc-500 hover:text-neutral-900 hover:bg-zinc-100 rounded-lg h-9 font-medium"
                    >
                      Ubah Email
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>

      {/* Right side: Rounded Blue Box */}
      <div className="hidden lg:block p-4 lg:p-6 relative">
        <div className="w-full h-full min-h-[500px] bg-[#00205B] rounded-[2.5rem] sticky top-6 max-h-[calc(100vh-3rem)] overflow-hidden shadow-2xl flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#307FE2]/20 to-transparent pointer-events-none" />
        </div>
      </div>
    </main>
  );
}
