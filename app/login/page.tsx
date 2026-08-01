
import { redirect } from "next/navigation"
import LoginForm from "./form"
import { getCachedAuth } from "@/lib/auth"
import { Metadata } from "next"
import { CheckCircle2, ShieldAlert } from "lucide-react"
import { cookies } from "next/headers"
import { getSafeRedirectPath } from "@/lib/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { ParallaxBackgrounds } from "@/components/landing/parallax-backgrounds"

import HoverFooter from "@/components/layout/footer"

type LoginSearchParams = Promise<Record<string, string | string[] | undefined>>


export const metadata: Metadata = {
  title: "Log in"
}

export default async function LoginPage({
    searchParams,
}: {
    searchParams: LoginSearchParams
}){
    const [params, { user }] = await Promise.all([searchParams, getCachedAuth()]);

    if (user) {
        redirect(getSafeRedirectPath(params.next))
    }

    if (params.error === "oauth_failed" || params.error === "missing_code") {
        return (
            <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-16 sm:px-6">
                <ErrorState 
                    icon={ShieldAlert}
                    title="Tautan verifikasi tidak valid atau sudah digunakan"
                    description="Tautan ini telah kedaluwarsa atau Anda sudah memverifikasi email Anda menggunakan kode OTP. Silakan masuk untuk melanjutkan."
                    actionHref="/login"
                    actionLabel="Ke Halaman Masuk"
                    tone="warning"
                />
            </main>
        )
    }

    if (params.reset === "success") {
        return (
            <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-16 sm:px-6">
                <ErrorState 
                    icon={CheckCircle2}
                    title="Kata Sandi Berhasil Direset"
                    description="Kata sandi Anda telah diperbarui dengan aman. Anda sekarang dapat masuk ke akun Anda."
                    actionHref="/login"
                    actionLabel="Ke Halaman Masuk"
                    tone="success"
                />
            </main>
        )
    }

    const cookieStore = await cookies();
    const isVerified = cookieStore.get("email_verified_flash")?.value === "1";

    return (
        <main className="dark text-foreground min-h-screen w-full relative flex flex-col items-center justify-center px-4 pt-24 pb-12 font-sans overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
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
            `}} />
            
            <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] left-[-10vw] w-[120vw] h-[15vh] bg-[#307FE2] blur-[60px] rounded-[100%] animate-aurora-ribbon-1 opacity-50" />
                <div className="absolute top-[45%] right-[-10vw] w-[130vw] h-[12vh] bg-[#307FE2] blur-[50px] rounded-[100%] animate-aurora-ribbon-2 opacity-50" />
                <div className="absolute bottom-[25%] left-[-15vw] w-[140vw] h-[18vh] bg-[#307FE2] blur-[70px] rounded-[100%] animate-aurora-ribbon-3 opacity-50" />
            </div>

            <ParallaxBackgrounds isStatic className="absolute inset-0 z-[2] mix-blend-screen opacity-40" />

            <div className="relative z-10 w-full max-w-lg space-y-8 border border-white/15 p-6 md:p-8 rounded-2xl backdrop-blur-xl bg-neutral-950/15 shadow-2xl">
                <section className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tighter text-balance font-sans text-white">
                        Masuk ke akun Futura
                    </h1>
                    <p className="text-sm font-medium leading-relaxed text-white/70 tracking-tight font-sans">
                        Masuk untuk mengelola pendaftaran Anda
                    </p>
                </section>

                {isVerified && (
                    <div 
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200 shadow-sm text-center"
                        role="alert"
                        aria-live="polite"
                    >
                        <p className="text-sm font-medium">Email Anda berhasil diverifikasi. Silakan masuk untuk melanjutkan.</p>
                    </div>
                )}

                <section className="font-sans form-visibility-fix">
                    <LoginForm isVerified={isVerified} />
                </section>
            </div>
        </main>
    )
}
