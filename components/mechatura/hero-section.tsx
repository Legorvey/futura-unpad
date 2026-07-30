import Link from "next/link"
import { Button } from "../ui/button"
import Countdown from "@/components/countdown"
import { Spotlight } from "../ui/spotlight"
import { ButtonV2 } from "../ui/button-v2"

export function HeroSection() {
    return (
        <section id="home" className="relative overflow-hidden">
            <Spotlight />
            <div className="flex flex-col items-center justify-center space-y-8 mx-auto max-w-7xl min-h-[calc(100svh-0px)] px-4 py-20 sm:px-8 lg:py-28 z-10">
                <div className="max-w-5xl space-y-4 text-center">
                    {/* <h3 className="mx-auto text-md w-fit rounded-full bg-stone-800 py-3 px-6">Teknik Elektro Universitas Padjadjaran Presents</h3> */}
                    <h1 className="uppercase text-4xl sm:text-5xl lg:text-8xl font-bold tracking-tighter leading-none text-balance">
                        Mechatura
                    </h1>
                    <p className="text-md lg:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 text-balance">
                        Mechatura adalah kompetisi teknologi dan robotika yang diselenggarakan oleh Himpunan Mahasiswa Teknik Elektro (HMTE) Universitas Padjadjaran. Ajang ini menjadi wadah bagi pelajar dan mahasiswa untuk menguji kompetensi serta inovasi mereka melalui berbagai format perlombaan.
                    </p>
                </div>

                <div className="mx-auto flex flex-col md:flex-row items-center gap-2">
                    <ButtonV2
                        text="Daftar Sekarang"
                        href="/mechatura/form"
                        requireAuth={true}
                    />

                    <Button variant="link" asChild>
                        <Link href="/docs/mechatura_guidebook.pdf">Lihat Guidebook</Link>
                    </Button>
                </div>

                {/* <Link href="/registration/seminar" className="mx-auto bg-white text-black py-2 px-4 w-fit rounded-full">Daftar Sekarang</Link> */}

            </div>
        </section>
    )
}
