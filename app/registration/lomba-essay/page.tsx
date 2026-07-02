import Countdown from "@/components/countdown";
import { TARGET_DATE } from "@/lib/landing/helper";

export default function EssayRegistrationPage() {
    return (
         <main className="mx-auto w-full items-start space-y-12 px-6 py-16 sm:px-8">
            <h1 className="text-center text-5xl font-bold">Essay Registration Coming Soon</h1>
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
