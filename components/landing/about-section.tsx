import Link from "next/link"
import SponsorsSection from "./sponsors-section"

export default function AboutSection() {
    return (
        <section id="home" className="bg-[#fbfbf8] text-slate-950">
            <div className="mx-auto grid max-w-6xl content-center gap-16 px-5 py-20 sm:px-8 lg:py-28">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="font-sans font-heading text-3xl tracking-tight leading-snug text-balance sm:text-4xl lg:text-5xl">
                        FUTURA by Himpunan Mahasiswa Teknik Elektro UNPAD
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
                        FUTURA is an annual event organized by Himpunan Mahasiswa Teknik Elektro UNPAD which aims to <span className="font-serif italic">bring together students, researchers, and professionals to share their knowledge, ideas, and innovations in the field of electrical engineering</span>
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-medium">
                        {/* <Link
                            href="/registration"
                            className="rounded-full bg-slate-950 px-5 py-3 text-white transition hover:bg-slate-700"
                        >
                            Register now
                        </Link> */}
                        <SponsorsSection />
                    </div>
                </div>
            </div>
        </section>
    )
}