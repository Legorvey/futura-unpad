import type { Metadata } from "next"
export const runtime = 'edge';
import { redirect } from "next/navigation";

import {
    findLatestMechaturaRegistrationForUser,
    getMechaturaRegistrationStepHref,
    isMechaturaPaymentExpired,
} from "@/lib/mechatura/registration";
import { getCachedAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import ExpiredRegistrationDialog from "./expired-registration-dialog";
import MechaturaRegistrationForm from "./form";

export const metadata: Metadata = {
  title: "Form Pendaftaran Mechatura"
}

export default async function MechaturaPage() {
    const { user } = await getCachedAuth();

    if (!user) {
        redirect("/login?next=/mechatura/form");
    }

    const adminSupabase = createAdminClient();
    const latestRegistration = await findLatestMechaturaRegistrationForUser(
        adminSupabase,
        user.id
    );
    const expiredTeamName =
        latestRegistration && isMechaturaPaymentExpired(latestRegistration)
            ? latestRegistration.teamName
            : null;

    if (latestRegistration && !expiredTeamName) {
        redirect(getMechaturaRegistrationStepHref(latestRegistration));
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                body {
                    background-color: #00205B !important;
                }
                .mechatura-wrapper {
                    --background: #f1f5f9;
                    --foreground: #0f172a;
                    --card: #f8fafc;
                    --card-foreground: #0f172a;
                    --popover: #f8fafc;
                    --popover-foreground: #0f172a;
                    --primary: #fbbf24;
                    --primary-foreground: #0f172a;
                    --secondary: #e2e8f0;
                    --secondary-foreground: #0f172a;
                    --muted: #e2e8f0;
                    --muted-foreground: #64748b;
                    --accent: #e2e8f0;
                    --accent-foreground: #0f172a;
                    --border: #cbd5e1;
                    --input: #cbd5e1;
                    --ring: #fbbf24;
                }
            `}} />
            
            {/* Static Aurora Ribbons Background */}
            <div className="fixed inset-0 z-[-2] pointer-events-none overflow-hidden bg-[#00205B]">
                <div className="absolute top-[20%] left-[-10vw] w-[120vw] h-[15vh] bg-[#307FE2] blur-[60px] rounded-[100%] opacity-20 transform translate-y-0 rotate-[-2deg] skew-y-[2deg]" />
                <div className="absolute top-[45%] right-[-10vw] w-[130vw] h-[12vh] bg-[#307FE2] blur-[50px] rounded-[100%] opacity-20 transform translate-y-[2vh] rotate-[3deg] skew-y-[-2deg]" />
                <div className="absolute bottom-[25%] left-[-15vw] w-[140vw] h-[18vh] bg-[#307FE2] blur-[70px] rounded-[100%] opacity-20 transform translate-y-[-3vh] rotate-[-1deg] skew-y-[1deg]" />
            </div>

            <main className="relative flex min-h-screen w-full flex-col items-center overflow-clip pb-32 pt-24 mechatura-wrapper text-white">
                
                <div className="relative w-full max-w-6xl px-4 sm:px-8 space-y-10">
                    <section className="text-center space-y-4">
                        <h1 className="text-4xl font-extrabold tracking-[-0.07em] sm:text-5xl lg:text-6xl text-white">
                            Formulir Mechatura
                        </h1>
                        <p className="mx-auto max-w-2xl text-base tracking-tighter leading-relaxed text-blue-100/80 sm:text-lg">
                        Daftarkan tim Anda, unggah dokumen yang diperlukan, verifikasi detail, lalu lanjutkan ke pembayaran.
                    </p>
                </section>

                    <section className="relative rounded-3xl border border-transparent lg:border-border bg-card text-card-foreground p-0 lg:p-12 lg:shadow-2xl overflow-clip">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#307FE2]/5 via-transparent to-amber-500/5 pointer-events-none hidden lg:block" />
                        <div className="relative">
                            {latestRegistration && expiredTeamName ? (
                                <ExpiredRegistrationDialog teamName={expiredTeamName} registrationId={latestRegistration.id} />
                            ) : null}
                            <MechaturaRegistrationForm />
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
