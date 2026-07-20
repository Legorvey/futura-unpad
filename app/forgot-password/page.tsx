"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "nextjs-toploader/app"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CheckCircle2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useForgotPasswordMutation } from "@/hooks/mutations/use-auth-mutations"
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validation"


export default function ForgotPasswordPage() {
    const router = useRouter()
    const [successMessage, setSuccessMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [verifyEmail, setVerifyEmail] = useState<string | null>(null)
    const [otp, setOtp] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [isVerifiedInOtherTab, setIsVerifiedInOtherTab] = useState(false)
    const forgotPassword = useForgotPasswordMutation()

    useEffect(() => {
        if (!verifyEmail) return;

        const channel = new window.BroadcastChannel('auth-sync');
        channel.onmessage = (event) => {
            if (event.data === 'email_verified') {
                setIsVerifiedInOtherTab(true);
            }
        };

        return () => channel.close();
    }, [verifyEmail, router]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    const onSubmit = async (values: ForgotPasswordFormValues) => {
        setSuccessMessage("")
        setErrorMessage("")

        try {
            await forgotPassword.mutateAsync(values)
        } catch (error) {
            if (error instanceof Error && error.message !== "User with this email not found") {
                setErrorMessage("Silakan coba lagi nanti.")
                return
            }
            // If the error is 'User with this email not found', we swallow it to prevent email enumeration.
        }

        setVerifyEmail(values.email)
        setSuccessMessage(`Jika akun dengan ${values.email} terdaftar, tautan reset yang aman telah dikirim.`)
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center space-y-10 px-4 pb-16 pt-32 sm:px-8">
            <section className="space-y-2">
                <h1 className="text-3xl sm:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance">
                    Reset kata sandi Anda
                </h1>
                <p className="text-sm font-medium leading-relaxed text-neutral-500">
                    Masukkan email akun Anda dan kami akan mengirimkan kode reset yang aman.
                </p>
            </section>

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

                    {errorMessage ? (
                        <p className="rounded-[8px] border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                            {errorMessage}
                        </p>
                    ) : null}

                    {successMessage ? (
                        <p className="rounded-[8px] border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {successMessage}
                        </p>
                    ) : null}

                    <Field className="gap-2">
                        <Button
                            type="submit"
                            className="h-11 rounded-[8px]"
                            disabled={forgotPassword.isPending}
                        >
                            {forgotPassword.isPending ? "Mengirim kode..." : "Kirim kode reset"}
                        </Button>
                        <Button asChild variant="outline" className="h-11 rounded-[8px]">
                            <Link href="/login" prefetch={false}>Kembali ke halaman masuk</Link>
                        </Button>
                    </Field>
                </FieldGroup>
            </form>

            <Dialog 
                open={!!verifyEmail} 
                onOpenChange={(open) => {
                    if (!open && !isVerifying) {
                        setVerifyEmail(null);
                        setOtp("");
                    }
                }}
            >
                <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
                    if (isVerifiedInOtherTab) return;
                    e.preventDefault();
                }}>
                    {isVerifiedInOtherTab ? (
                        <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-semibold">Berhasil Diverifikasi</h2>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Email Anda telah diverifikasi di tab lain. Anda dapat menutup jendela ini dan melanjutkan reset kata sandi Anda di tab tersebut.
                            </p>
                        </div>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-semibold tracking-tight">Periksa email Anda</DialogTitle>
                                <DialogDescription className="text-base text-muted-foreground pt-2">
                                    Kami telah mengirimkan kode reset kata sandi ke <span className="font-medium text-foreground">{verifyEmail}</span>.
                                    Silakan masukkan di bawah ini untuk mereset kata sandi Anda. Kode kedaluwarsa dalam 1 jam.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col space-y-6 py-4">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
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
                                                body: JSON.stringify({ email: verifyEmail, token: otp, type: "recovery" }),
                                            });
                                            const data = await res.json();
                                            if (!res.ok) throw new Error(data.error || "Verifikasi gagal");
                                            
                                            toast.success("Identitas berhasil diverifikasi!");
                                            router.push("/reset-password");
                                        } catch (err: any) {
                                            toast.error(err.message);
                                        } finally {
                                            setIsVerifying(false);
                                        }
                                    }}
                                >
                                    {isVerifying ? "Memverifikasi..." : "Verifikasi & Reset"}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </main>
    )
}
