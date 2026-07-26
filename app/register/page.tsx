import type { Metadata } from "next"
export const runtime = 'edge';

import { redirect } from "next/navigation"
import RegisterForm from "./form"
import { getCachedAuth } from "@/lib/auth"
import { ParallaxBackgrounds } from "@/components/landing/parallax-backgrounds"

type LoginSearchParams = Promise<Record<string, string | string[] | undefined>>

const getSafeRedirectPath = (value: string | string[] | undefined) => {
    const next = Array.isArray(value) ? value[0] : value

    if (
        !next ||
        !next.startsWith("/") ||
        next.startsWith("//") ||
        next.startsWith("/login") ||
        next.startsWith("/register") ||
        next.startsWith("/auth/callback")
    ) {
        return "/profile"
    }

    return next
}

export const metadata: Metadata = {
  title: "Buat Akun"
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

            <div className="relative z-10 w-full max-w-md space-y-10">
                <section className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.07em] text-balance font-sans text-white">
                        Buat akun Futura
                    </h1>
                    <p className="text-sm font-medium leading-relaxed text-white/70 tracking-tight font-sans">
                        Siapkan akun Futura Anda
                    </p>
                </section>

                <section className="font-sans form-visibility-fix"> 
                    <RegisterForm loginHref={params.next ? `/login?next=${Array.isArray(params.next) ? params.next[0] : params.next}` : "/login"} />
                </section>
            </div>
        </main>
    )
}
