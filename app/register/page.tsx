import type { Metadata } from "next"

import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import RegisterForm from "./form"
import { getCachedAuth } from "@/lib/auth"
import { ParallaxBackgrounds } from "@/components/landing/parallax-backgrounds"

import { getSafeRedirectPath } from "@/lib/navigation"

export const metadata: Metadata = {
  title: "Buat Akun"
}

type RegisterSearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: RegisterSearchParams
}){
    const [params, { user }] = await Promise.all([searchParams, getCachedAuth()]);

    if (user) {
        redirect(getSafeRedirectPath(params.next))
    }

    return (
        <main className="bg-white min-h-screen w-full relative grid lg:grid-cols-2 font-sans overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
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
                .light-form-fix button[role="checkbox"] {
                    border-color: rgba(0, 0, 0, 0.3) !important;
                }
                .light-form-fix button[role="checkbox"][data-state="checked"] {
                    background-color: black !important;
                    border-color: black !important;
                    color: white !important;
                }
                .light-form-fix button[role="checkbox"][data-state="checked"] svg {
                    color: white !important;
                }
                .light-form-fix button > svg.lucide-eye, .light-form-fix button > svg.lucide-eye-off {
                    color: rgba(0, 0, 0, 0.5) !important;
                }
                .light-form-fix button:hover > svg.lucide-eye, .light-form-fix button:hover > svg.lucide-eye-off {
                    color: black !important;
                }
            `}} />

            {/* Left side: Form */}
            <div className="flex flex-col items-center justify-center px-6 lg:px-12 pt-24 pb-12 w-full h-full lg:min-h-screen relative">
                <div className="absolute top-8 left-6 lg:left-12 z-50">
                    <Link href="/" className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>
                </div>

                <div className="relative z-10 w-full max-w-[420px] space-y-8">
                <section className="space-y-1">
                    <h1 className="text-black text-2xl md:text-3xl font-semibold tracking-tighter text-balance font-sans">
                        Buat akun Futura
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed tracking-tight font-sans">
                        Siapkan akun Futura Anda
                    </p>
                </section>

                <section className="font-sans light-form-fix"> 
                    <RegisterForm loginHref={params.next ? `/login?next=${Array.isArray(params.next) ? params.next[0] : params.next}` : "/login"} />
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
    )
}
