"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { useResetPasswordMutation } from "@/hooks/mutations/use-auth-mutations";
import { resetPasswordSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { FormTextField } from "@/components/form/form-text-field";
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
            .light-form-fix button > svg.lucide-eye, .light-form-fix button > svg.lucide-eye-off {
              color: rgba(0, 0, 0, 0.5) !important;
            }
            .light-form-fix button:hover > svg.lucide-eye, .light-form-fix button:hover > svg.lucide-eye-off {
              color: black !important;
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
              Buat kata sandi baru
            </h1>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed tracking-tight font-sans">
              Gunakan minimal 8 karakter dengan kombinasi huruf dan angka
            </p>
          </section>

          <section className="font-sans light-form-fix">
            <FormProvider {...form}>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <FieldGroup className="gap-6">
                  {submitError && (
                    <div
                      className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-destructive text-xs font-medium text-center"
                      role="alert"
                    >
                      {submitError}
                    </div>
                  )}

                  <Field className="gap-2">
                    <FormTextField<ResetPasswordFormValues>
                      name="password"
                      label="Kata Sandi Baru"
                      type="password"
                      placeholder="Masukkan kata sandi baru"
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

                  <FormTextField<ResetPasswordFormValues>
                    name="confirmPassword"
                    label="Konfirmasi Kata Sandi"
                    type="password"
                    placeholder="Konfirmasi kata sandi baru Anda"
                    autoComplete="new-password"
                  />

                  <Field className="gap-2 pt-2">
                    <Button
                      type="submit"
                      className="h-11 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm sm:text-base transition-all shadow-sm w-full"
                      disabled={resetPassword.isPending}
                    >
                      {resetPassword.isPending
                        ? "Memperbarui kata sandi..."
                        : "Perbarui Kata Sandi"}
                    </Button>
                  </Field>

                  <p className="text-center text-sm text-zinc-500">
                    <Link
                      href="/login"
                      prefetch={false}
                      className="text-sm font-medium text-zinc-500 hover:text-neutral-900 transition-colors"
                    >
                      Kembali ke Halaman Masuk
                    </Link>
                  </p>
                </FieldGroup>
              </form>
            </FormProvider>
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
