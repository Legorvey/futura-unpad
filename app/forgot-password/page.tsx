"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "@/hooks/mutations/use-auth-mutations";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validation";
import { FormTextField } from "@/components/form/form-text-field";
import { ParallaxBackgrounds } from "@/components/landing/parallax-backgrounds";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpErrorMessage, setOtpErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerifiedInOtherTab, setIsVerifiedInOtherTab] = useState(false);
  const forgotPassword = useForgotPasswordMutation();

  useEffect(() => {
    if (!verifyEmail) return;

    const channel = new window.BroadcastChannel("auth-sync");
    channel.onmessage = (event) => {
      if (event.data === "email_verified") {
        setIsVerifiedInOtherTab(true);
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
    setSuccessMessage("");
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
      // If the error is 'User with this email not found', swallow to prevent email enumeration.
    }

    setVerifyEmail(values.email);
    setSuccessMessage(
      `Jika akun dengan email ${values.email} terdaftar, tautan dan kode reset telah dikirim.`
    );
  };

  return (
    <main className="dark text-foreground min-h-screen w-full relative flex flex-col items-center justify-center px-4 pt-24 pb-12 font-sans overflow-x-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body {
              background-color: #00205B !important;
            }
            .form-visibility-fix input {
              background-color: rgba(255, 255, 255, 0.1) !important;
              border-color: rgba(255, 255, 255, 0.3) !important;
              color: white !important;
            }
            .form-visibility-fix input::placeholder {
              color: rgba(255, 255, 255, 0.5) !important;
            }
            .form-visibility-fix label {
              color: white !important;
              font-weight: 500 !important;
            }
            .form-visibility-fix .text-muted-foreground {
              color: rgba(255, 255, 255, 0.75) !important;
            }
            .form-visibility-fix a {
              color: #93c5fd !important;
            }
            .form-visibility-fix a:hover {
              color: white !important;
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
            @keyframes aurora-ribbon-1 {
              0% { transform: translateY(0) rotate(-2deg) skewY(2deg); opacity: 0.15; }
              25% { transform: translateY(-5vh) rotate(3deg) skewY(-3deg) scaleY(1.2); opacity: 0.25; }
              50% { transform: translateY(2vh) rotate(-1deg) skewY(4deg) scaleY(0.9); opacity: 0.2; }
              75% { transform: translateY(-3vh) rotate(2deg) skewY(-2deg) scaleY(1.1); opacity: 0.3; }
              100% { transform: translateY(0) rotate(-2deg) skewY(2deg); opacity: 0.15; }
            }
            @keyframes aurora-ribbon-2 {
              0% { transform: translateY(2vh) rotate(3deg) skewY(-2deg); opacity: 0.12; }
              33% { transform: translateY(-3vh) rotate(-2deg) skewY(3deg) scaleY(1.3); opacity: 0.22; }
              66% { transform: translateY(4vh) rotate(1deg) skewY(-4deg) scaleY(0.8); opacity: 0.18; }
              100% { transform: translateY(2vh) rotate(3deg) skewY(-2deg); opacity: 0.12; }
            }
            @keyframes aurora-ribbon-3 {
              0% { transform: translateY(-3vh) rotate(-1deg) skewY(1deg) scaleY(0.9); opacity: 0.2; }
              30% { transform: translateY(3vh) rotate(2deg) skewY(-2deg) scaleY(1.2); opacity: 0.15; }
              70% { transform: translateY(-4vh) rotate(-2deg) skewY(3deg) scaleY(1); opacity: 0.25; }
              100% { transform: translateY(-3vh) rotate(-1deg) skewY(1deg) scaleY(0.9); opacity: 0.2; }
            }
            .animate-aurora-ribbon-1 { animation: aurora-ribbon-1 12s ease-in-out infinite; }
            .animate-aurora-ribbon-2 { animation: aurora-ribbon-2 16s ease-in-out infinite; }
            .animate-aurora-ribbon-3 { animation: aurora-ribbon-3 20s ease-in-out infinite; }
          `,
        }}
      />

      {/* Atmospheric Aurora Ribbons Background */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[-10vw] w-[120vw] h-[15vh] bg-[#307FE2] blur-[60px] rounded-[100%] animate-aurora-ribbon-1 opacity-50" />
        <div className="absolute top-[45%] right-[-10vw] w-[130vw] h-[12vh] bg-[#307FE2] blur-[50px] rounded-[100%] animate-aurora-ribbon-2 opacity-50" />
        <div className="absolute bottom-[25%] left-[-15vw] w-[140vw] h-[18vh] bg-[#307FE2] blur-[70px] rounded-[100%] animate-aurora-ribbon-3 opacity-50" />
      </div>

      <ParallaxBackgrounds
        isStatic
        className="absolute inset-0 z-[2] mix-blend-screen opacity-40"
      />

      <div className="relative z-10 w-full max-w-lg space-y-8 border border-white/15 p-6 md:p-8 rounded-2xl backdrop-blur-xl bg-neutral-950/15 shadow-2xl">
        <section className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tighter text-balance font-sans text-white">
            Reset Kata Sandi
          </h1>
          <p className="text-sm font-medium leading-relaxed text-white/70 tracking-tight font-sans">
            Masukkan email akun Anda dan kami akan mengirimkan instruksi serta kode reset kata sandi.
          </p>
        </section>

        {errorMessage && (
          <div
            className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200 text-center"
            role="alert"
          >
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-200 text-center space-y-1"
            role="status"
          >
            <p className="text-sm font-medium">{successMessage}</p>
            {verifyEmail && (
              <button
                type="button"
                onClick={() => setVerifyEmail(verifyEmail)}
                className="text-xs text-emerald-300 underline underline-offset-4 hover:text-white"
              >
                Buka dialog verifikasi kode OTP
              </button>
            )}
          </div>
        )}

        <section className="font-sans form-visibility-fix">
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldGroup className="gap-6">
                <FormTextField<ForgotPasswordFormValues>
                  name="email"
                  label="Email Terdaftar"
                  type="email"
                  placeholder="contoh: johndoe@gmail.com"
                  autoComplete="email"
                />

                <Field className="gap-3 pt-2">
                  <Button
                    type="submit"
                    className="h-11 rounded-xl bg-white hover:bg-white/90 text-neutral-950 font-semibold text-sm sm:text-base transition-all shadow-sm"
                    disabled={forgotPassword.isPending}
                  >
                    {forgotPassword.isPending
                      ? "Mengirim instruksi..."
                      : "Kirim Kode Reset"}
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium text-sm sm:text-base transition-all"
                  >
                    <Link
                      href="/login"
                      prefetch={false}
                      className="flex items-center justify-center"
                    >
                      Kembali ke Halaman Masuk
                    </Link>
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </FormProvider>
        </section>
      </div>

      {/* OTP Verification Modal */}
      <Dialog
        open={!!verifyEmail}
        onOpenChange={(open) => {
          if (!open && !isVerifying) {
            setVerifyEmail(null);
            setOtp("");
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md dark bg-[#00205B] border border-white/20 text-white custom-scrollbar rounded-2xl shadow-2xl p-6 sm:p-8"
          onInteractOutside={(e) => {
            if (isVerifiedInOtherTab) return;
            e.preventDefault();
          }}
        >
          {isVerifiedInOtherTab ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Berhasil Diverifikasi
              </h2>
              <p className="text-sm text-blue-100/75 max-w-sm leading-relaxed">
                Email Anda telah diverifikasi di tab lain. Anda dapat menutup jendela ini dan melanjutkan reset kata sandi di tab tersebut.
              </p>
              <Button
                asChild
                className="mt-2 h-11 px-6 rounded-xl bg-white hover:bg-white/90 text-neutral-950 font-semibold shadow-sm"
              >
                <Link href="/reset-password">Lanjutkan Reset Kata Sandi</Link>
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader className="space-y-2 text-center">
                <DialogTitle className="text-2xl font-bold tracking-tight text-white text-center">
                  Periksa Email Anda
                </DialogTitle>
                <DialogDescription className="text-sm text-blue-100/75 leading-relaxed text-center">
                  Kami telah mengirimkan kode 8 digit ke{" "}
                  <span className="font-semibold text-white block mt-0.5">
                    {verifyEmail}
                  </span>
                  Masukkan kode di bawah ini untuk memverifikasi dan mereset kata sandi.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center justify-center space-y-4 py-3">
                {otpErrorMessage && (
                  <div
                    className="w-full text-center rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200 text-xs font-medium"
                    role="alert"
                  >
                    <span>{otpErrorMessage}</span>
                  </div>
                )}

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={otp}
                  onChange={(e) => {
                    setOtpErrorMessage("");
                    setOtp(e.target.value.replace(/\D/g, ""));
                  }}
                  placeholder="00000000"
                  className={cn(
                    "mx-auto flex h-14 sm:h-16 w-full max-w-[280px] rounded-xl border-2 bg-white/[0.08] px-3 py-1 text-center text-3xl sm:text-4xl font-mono font-bold tracking-[0.25em] text-white placeholder:text-white/20 focus:outline-none transition-all disabled:opacity-50",
                    otpErrorMessage
                      ? "border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                      : "border-white/20 focus:border-white focus:ring-1 focus:ring-white"
                  )}
                />
                <p className="text-xs text-white/50 text-center">
                  Tidak menerima kode? Periksa folder spam atau minta kode baru setelah beberapa saat.
                </p>
              </div>

              <DialogFooter className="flex-col sm:flex-col gap-2 sm:gap-2">
                <Button
                  type="button"
                  className="w-full h-11 text-sm sm:text-base font-semibold tracking-wide rounded-xl bg-white hover:bg-white/90 text-neutral-950 transition-all shadow-sm"
                  disabled={otp.length < 8 || isVerifying}
                  onClick={async () => {
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
                        throw new Error(data.error || "Kode verifikasi tidak valid atau telah kedaluwarsa");
                      }

                      toast.success("Verifikasi berhasil!");
                      router.push("/reset-password");
                    } catch (err: any) {
                      let msg =
                        err?.message ||
                        "Kode verifikasi tidak valid atau telah kedaluwarsa.";
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
                        msg =
                          "Terlalu banyak percobaan. Silakan tunggu beberapa saat.";
                      }
                      setOtpErrorMessage(msg);
                      toast.error("Verifikasi gagal", { description: msg });
                    } finally {
                      setIsVerifying(false);
                    }
                  }}
                >
                  {isVerifying ? "Memverifikasi..." : "Verifikasi & Buat Sandi Baru"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-xs text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg h-9"
                  onClick={() => {
                    setVerifyEmail(null);
                    setOtp("");
                    setOtpErrorMessage("");
                  }}
                >
                  Ubah Email / Batalkan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
