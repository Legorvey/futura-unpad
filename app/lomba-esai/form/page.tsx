import type { Metadata } from "next"
import Countdown from "@/components/countdown";
import { TARGET_DATE } from "@/lib/landing/helper";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Form Pendaftaran Lomba Esai"
}

export default function EsaiRegistrationPage() {
    // SECURITY (Defense-in-depth): Fallback redirect in case middleware is bypassed.
    redirect("/lomba-esai");
    
    return (
         <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col justify-center space-y-8 px-4 pb-32 pt-28 sm:px-8">
            <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Form Pendaftaran Lomba Esai</h1>
            <Countdown
                targetDate={TARGET_DATE({
                    date: 21,
                    month: 9,
                    year: 2026,
                })}
            />
        </main>
    )
}


