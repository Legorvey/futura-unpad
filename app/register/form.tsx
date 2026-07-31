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

        const channel = new window.BroadcastChannel('auth-sync');
        channel.onmessage = (event) => {
            if (event.data === 'email_verified') {
                toast.success("Email diverifikasi di tab lain!");
                setVerifyEmail(null);
                router.push("/login");
            }
        };

        return () => channel.close();
    }, [verifyEmail, router]);

    // Explicitly lock body scroll when dialog is open
    useEffect(() => {
        if (legalDialog !== null || !!verifyEmail) {
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
    }, [legalDialog, verifyEmail]);

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
            setSubmitError(error instanceof Error ? error.message : "Registrasi gagal.");
            toast.error("Registrasi gagal", {
                description: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak terduga."
            });
            return null;
        });

        if (!data) {
            return;
        }

        if (data?.authenticated) {
            toast.success("Berhasil mendaftar dan masuk");
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
        setSuccessMessage("Pendaftaran berhasil. Silakan verifikasi email Anda.");
        toast.success("Pendaftaran berhasil", {
            description: "Silakan masukkan OTP yang dikirim ke email Anda untuk memverifikasi akun Anda."
        });
    };

    const requireLegalAgreement = () => {
        if (termsAccepted) {
            return true;
        }

        setError("termsAccepted", {
            type: "manual",
            message: "Harap setujui Syarat dan Kebijakan Privasi.",
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
                            <p className={cn(
                                "text-xs font-medium text-right transition-colors duration-300",
                                passwordStrength === 1 ? "text-destructive" :
                                    passwordStrength === 2 ? "text-orange-500" :
                                        passwordStrength === 3 ? "text-yellow-500" :
                                            "text-emerald-500"
                            )}>
                                {passwordStrength === 1 ? "Sangat Lemah" : passwordStrength === 2 ? "Lemah" : passwordStrength === 3 ? "Kuat" : "Sangat Kuat"}
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
                        <p className="text-sm leading-5 text-muted-foreground">
                            Saya setuju dengan{" "}
                            <button
                                type="button"
                                className="cursor-pointer font-medium text-blue-600 underline-offset-4 hover:underline"
                                onClick={() => setLegalDialog("terms")}
                            >
                                Syarat
                            </button>{" "}
                            dan{" "}
                            <button
                                type="button"
                                className="cursor-pointer font-medium text-blue-600 underline-offset-4 hover:underline"
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
                {successMessage && <div className="text-sm font-medium text-emerald-600">{successMessage}</div>}

                <Field className="gap-2">
                    <Button
                        type="submit"
                        className="h-11 rounded-[8px]"
                        disabled={registerAccount.isPending}
                    >
                        {registerAccount.isPending ? "Membuat akun..." : "Buat Akun"}
                    </Button>

                    <div className="flex items-center gap-4 my-2">
                        <div className="h-px flex-1 bg-white/20"></div>
                        <span className="text-sm text-white/70 font-medium lowercase">atau</span>
                        <div className="h-px flex-1 bg-white/20"></div>
                    </div>

                    <GoogleLoginButton onBeforeLogin={requireLegalAgreement} />
                </Field>
                <p className="text-center text-sm text-muted-foreground">
                    Sudah punya akun?{" "}
                    <Link
                        href={loginHref}
                        prefetch={false}
                        className="text-blue-600"
                    >
                        Masuk
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
                <DialogContent className="sm:max-w-md dark bg-[#00205B] border-white/20 text-white custom-scrollbar">
                    <DialogHeader className="space-y-4">
                        <div className="space-y-2">
                            <DialogTitle className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                Periksa Email Anda
                            </DialogTitle>
                            <DialogDescription className="text-center text-[15px] sm:text-base leading-relaxed text-white/80">
                                Kami telah mengirimkan kode 8 digit ke <br/>
                                <span className="font-semibold text-white tracking-wide">{verifyEmail}</span>.<br/>
                                Masukkan kode di bawah ini untuk mengaktifkan akun Anda.
                            </DialogDescription>
                        </div>
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
                                    className="mx-auto flex h-16 w-full max-w-[320px] rounded-lg border-2 border-white/20 bg-white/10 px-3 py-1 text-center text-4xl font-medium tracking-[0.2em] shadow-sm transition-colors text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                    <DialogFooter className="sm:justify-center">
                        <Button
                            type="button"
                            className="w-full cursor-pointer mx-auto h-12 text-base font-bold tracking-wide rounded-lg bg-white hover:bg-white/90 text-[#00205B] transition-all duration-300"
                            disabled={otp.length < 8 || isVerifying}
                            onClick={async () => {
                                setIsVerifying(true);
                                try {
                                    const res = await fetch("/api/auth/verify-otp", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ email: verifyEmail, token: otp }),
                                    });
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.error || "Verifikasi gagal");
                                    
                                    toast.success("Email berhasil diverifikasi!");
                                    router.push("/login");
                                } catch (err: any) {
                                    toast.error(err.message);
                                } finally {
                                    setIsVerifying(false);
                                }
                            }}
                        >
                            {isVerifying ? "Memverifikasi..." : "Verifikasi Akun"}
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
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl dark bg-[#00205B] border-white/20 text-white custom-scrollbar">
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
                    Selamat datang di website resmi Futura Universitas Padjadjaran (futuraunpad.com). Syarat dan Ketentuan ini mengatur akses dan penggunaan Anda terhadap website dan layanan registrasi kami untuk acara lomba Robot Sumo, lomba Robot Transporter, Seminar Nasional, dan Lomba Essay.
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
                    Kami mengumpulkan Data Log yang dikirimkan browser Anda (seperti alamat IP, versi browser, halaman yang dikunjungi, dan waktu kunjungan). Kami juga menggunakan "cookies" untuk mengumpulkan informasi guna meningkatkan layanan kami.
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
