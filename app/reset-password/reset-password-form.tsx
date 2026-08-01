"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { useResetPasswordMutation } from "@/hooks/mutations/use-auth-mutations";
import { resetPasswordSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { FormTextField } from "@/components/form/form-text-field";
import { ParallaxBackgrounds } from "@/components/landing/parallax-backgrounds";
import { toast } from "sonner";

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const getPasswordStrength = (pwd: string) => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length > 0) score = 1;
  if (pwd.length >= 6) score = 2;
  if (pwd.length >= 8 && /[A-Za-z]/.test(pwd) && /[0-9]/.test(pwd)) score = 3;
  if (
    pwd.length >= 8 &&
    /[A-Z]/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /[0-9]/.test(pwd) &&
    /[^A-Za-z0-9]/.test(pwd)
  )
    score = 4;
  return score;
};

export default function ResetPasswordForm() {
  const router = useRouter();
  const resetPassword = useResetPasswordMutation();
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const channel = new window.BroadcastChannel("auth-sync");
    channel.postMessage("email_verified");
    channel.close();
  }, []);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit, watch } = form;
  const passwordValue = watch("password");
  const passwordStrength = getPasswordStrength(passwordValue);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setSubmitError("");
    try {
      await resetPassword.mutateAsync(values);
      toast.success("Kata sandi berhasil diperbarui! Silakan masuk kembali.");
      window.location.href = "/login?reset=success";
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Pembaruan kata sandi gagal. Silakan minta tautan reset baru.";
      setSubmitError(msg);
      toast.error("Gagal memperbarui kata sandi", { description: msg });
    }
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
            Buat Kata Sandi Baru
          </h1>
          <p className="text-sm font-medium leading-relaxed text-white/70 tracking-tight font-sans">
            Gunakan setidaknya 8 karakter. Setelah diperbarui, Anda akan diarahkan ke halaman masuk.
          </p>
        </section>

        {submitError && (
          <div
            className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200 text-center"
            role="alert"
          >
            <p className="text-sm font-medium">{submitError}</p>
          </div>
        )}

        <section className="font-sans form-visibility-fix">
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldGroup className="gap-5">
                <Field className="gap-2">
                  <FormTextField<ResetPasswordFormValues>
                    name="password"
                    label="Kata Sandi Baru"
                    type="password"
                    placeholder="Masukkan kata sandi baru"
                    autoComplete="new-password"
                  />

                  <div className="mt-1.5 flex gap-1.5">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-all duration-300",
                          passwordStrength >= bar
                            ? passwordStrength === 1
                              ? "bg-rose-500"
                              : passwordStrength === 2
                              ? "bg-amber-500"
                              : passwordStrength === 3
                              ? "bg-sky-400"
                              : "bg-emerald-400"
                            : "bg-white/15"
                        )}
                      />
                    ))}
                  </div>
                  {passwordStrength > 0 && (
                    <p
                      className={cn(
                        "text-xs font-medium text-right transition-colors duration-300",
                        passwordStrength === 1
                          ? "text-rose-400"
                          : passwordStrength === 2
                          ? "text-amber-400"
                          : passwordStrength === 3
                          ? "text-sky-300"
                          : "text-emerald-300"
                      )}
                    >
                      {passwordStrength === 1
                        ? "Sangat Lemah"
                        : passwordStrength === 2
                        ? "Cukup"
                        : passwordStrength === 3
                        ? "Kuat"
                        : "Sangat Kuat"}
                    </p>
                  )}
                </Field>

                <FormTextField<ResetPasswordFormValues>
                  name="confirmPassword"
                  label="Konfirmasi Kata Sandi"
                  type="password"
                  placeholder="Konfirmasi kata sandi baru Anda"
                  autoComplete="new-password"
                />

                <Field className="gap-3 pt-2">
                  <Button
                    type="submit"
                    className="h-11 rounded-xl bg-white hover:bg-white/90 text-neutral-950 font-semibold text-sm sm:text-base transition-all shadow-sm"
                    disabled={resetPassword.isPending}
                  >
                    {resetPassword.isPending
                      ? "Memperbarui kata sandi..."
                      : "Perbarui Kata Sandi"}
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
    </main>
  );
}
