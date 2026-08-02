import type { Metadata } from "next"


import Link from "next/link"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/password-recovery"
import { getCachedAuth } from "@/lib/auth"
import { ParallaxBackgrounds } from "@/components/landing/parallax-backgrounds"
import ResetPasswordForm from "./reset-password-form"

function ExpiredResetLink() {
    return (
        <main className="dark text-foreground min-h-screen w-full relative flex flex-col items-center justify-center px-4 py-16 font-sans overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
                body {
                  background-color: #00205B !important;
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
            `}} />

            <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] left-[-10vw] w-[120vw] h-[15vh] bg-[#307FE2] blur-[60px] rounded-[100%] animate-aurora-ribbon-1 opacity-50" />
                <div className="absolute top-[45%] right-[-10vw] w-[130vw] h-[12vh] bg-[#307FE2] blur-[50px] rounded-[100%] animate-aurora-ribbon-2 opacity-50" />
                <div className="absolute bottom-[25%] left-[-15vw] w-[140vw] h-[18vh] bg-[#307FE2] blur-[70px] rounded-[100%] animate-aurora-ribbon-3 opacity-50" />
            </div>

            <ParallaxBackgrounds isStatic className="absolute inset-0 z-[2] mix-blend-screen opacity-40" />

            <div className="relative z-10 w-full max-w-lg space-y-6 border border-white/15 p-6 md:p-8 rounded-2xl backdrop-blur-xl bg-neutral-950/15 shadow-2xl text-center">
                <section className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tighter text-balance font-sans text-white">
                        Tautan Reset Tidak Valid atau Kedaluwarsa
                    </h1>
                    <p className="text-sm font-medium leading-relaxed text-white/70 tracking-tight font-sans max-w-md mx-auto">
                        Sesi verifikasi atau tautan reset kata sandi Anda telah kedaluwarsa. Silakan minta kode atau tautan baru.
                    </p>
                </section>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <Button
                        asChild
                        className="w-full sm:w-auto h-11 px-6 rounded-xl bg-white hover:bg-white/90 text-neutral-950 font-semibold text-sm sm:text-base transition-all shadow-sm"
                    >
                        <Link href="/forgot-password" prefetch={false}>
                            Minta Kode Baru
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        className="w-full sm:w-auto h-11 px-6 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium text-sm sm:text-base transition-all"
                    >
                        <Link href="/login" prefetch={false}>
                            Kembali ke Masuk
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}

type ResetPasswordSearchParams = Promise<Record<string, string | string[] | undefined>>

export const metadata: Metadata = {
  title: "Reset Kata Sandi"
}

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: ResetPasswordSearchParams
}) {
    const params = await searchParams;

    if (params.error === "oauth_failed") {
        return <ExpiredResetLink />
    }

    const cookieStore = await cookies()
    const hasRecoveryContext = cookieStore.has(PASSWORD_RECOVERY_COOKIE)

    if (!hasRecoveryContext) {
        return <ExpiredResetLink />
    }

    return <ResetPasswordForm />
}
