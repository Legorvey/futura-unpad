export const runtime = 'edge';
import Countdown from "@/components/countdown";
import { TARGET_DATE } from "@/lib/landing/helper";
import SeminarRegistrationForm from "./form";

export default function SeminarRegistrationPage() {
    return (
        <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col justify-center space-y-8 px-6 pb-32 pt-28 sm:px-8">
            <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Seminar Registration Coming Soon</h1>
            <Countdown
                targetDate={TARGET_DATE({
                    date: 21,
                    month: 11,
                    year: 2026,
                })}
            />
        </main>
    );
}

