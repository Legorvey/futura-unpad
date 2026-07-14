import Countdown from "@/components/countdown";
import { TARGET_DATE } from "@/lib/landing/helper";
import SeminarRegistrationForm from "./form";

export default function SeminarRegistrationPage() {
    return (
        // <main className="mx-auto w-full items-start space-y-12 px-6 py-16 sm:px-8">
        //     <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Seminar Registration Coming Soon</h1>
        //     <Countdown
        //         targetDate={TARGET_DATE({
        //             date: 21,
        //             month: 11,
        //             year: 2026,
        //         })}
        //     />
        // </main>
        <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col justify-center space-y-8 px-6 pb-32 pt-28 sm:px-8">
            <section>
                <div className="space-y-2">
                    <h1 className="max-w-xl text-3xl sm:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                        Formulir Seminar Nasional
                    </h1>
                    <p className="max-w-lg text-sm font-medium leading-relaxed text-neutral-500">
                        Registrasi Seminar
                    </p>
                </div>
            </section>
            <section>
                <SeminarRegistrationForm />
            </section>
        </main>
    );
}

