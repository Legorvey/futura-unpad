import Link from "next/link"
import { Button } from "../ui/button"
import Countdown from "@/components/countdown"
import { Spotlight } from "../ui/spotlight"

export function HeroSection() {
    return (
        <section id="home" className="relative overflow-hidden">
            <Spotlight />
            <div className="flex flex-col items-center justify-center space-y-8 mx-auto max-w-7xl min-h-[calc(100svh-0px)] px-4 py-20 sm:px-8 lg:py-28 z-10">
                <div className="max-w-5xl space-y-4 text-center">
                    {/* <h3 className="mx-auto text-md w-fit rounded-full bg-stone-800 py-3 px-6">Teknik Elektro Universitas Padjadjaran Presents</h3> */}
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter leading-none text-balance">
                        Lomba Essay
                    </h1>
                    <p className="text-md lg:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 text-balance">
                        Transformasi Teknologi di Era Making Indonesia 4.0: Konvergensi Energi, Konektivitas, dan Industri Nasional Menuju 2030
                    </p>
                </div>

                <div className="mx-auto flex flex-col items-center">
                    <h1 className="text-lg sm:text-xl font-semibold mb-4">Registrasi akan dibuka dalam</h1>
                    <Countdown targetDate={new Date("2026-09-21T00:00:00+07:00").getTime()} />
                </div>

                {/* <Link href="/registration/seminar" className="mx-auto bg-white text-black py-2 px-4 w-fit rounded-full">Daftar Sekarang</Link> */}

            </div>
        </section>
    )
}
