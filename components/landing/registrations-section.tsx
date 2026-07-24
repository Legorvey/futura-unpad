import { RegistrationCards } from "./registration-cards"
import { Calendar, PinIcon, BadgePercent } from "lucide-react"

import { ButtonV2 } from "../ui/button-v2"

const events = [
    {
        title: "Seminar Nasional",
        date: "Sabtu, 28 November 2026",
        location: "Bale Rumawat Unpad, Dipatiukur",
        description: "Bergabunglah dalam diskusi mendalam mengenai Transformasi Teknologi di Era Making Indonesia 4.0: Konvergensi Energi, Konektivitas, dan Industri Nasional Menuju 2030.",
        highlightsTitle: "Pembicara Utama",
        highlights: [
            "To Be Announced"
        ],
        speaker: "To Be Announced",
        image: "https://avatars.githubusercontent.com/u/1024025?v=4",
        href: "/seminar-nasional",
        price: "Gratis!",
        reverse: false
    },
    {
        title: "Mechatura",
        date: "Sabtu, 7 November 2026",
        location: "Gedung PPBS Unpad, Jatinangor",
        description: "Kompetisi robotika tingkat nasional yang menantang para inovator muda untuk memecahkan masalah energi melalui teknologi otomasi dan mekatronika. Tunjukkan karya terbaikmu!",
        highlightsTitle: "Kategori Lomba",
        highlights: [
            "Robot Sumo",
            "Robot Transporter",
        ],
        speaker: "Mechatura Event",
        image: "/green-renewable-1.webp",
        href: "/mechatura",
        price: "Rp. 250.000",
        reverse: true
    },
    {
        title: "Lomba Esai",
        date: "21 September - 28 November 2026",
        location: "Online / Daring",
        description: "Wadahi gagasan kreatif dan solutifmu melalui tulisan. Tema tahun ini berfokus pada inovasi mahasiswa untuk masa depan industri Indonesia di tahun 2030.",
        highlightsTitle: "Tema Utama",
        highlights: [
            "Transformasi Digital untuk Meningkatkan Daya Saing Industri Nasional",
            "Inovasi Teknologi Berkelanjutan dalam Mewujudkan Industri Hijau",
            "Pengembangan Talenta dan Ekosistem Inovasi sebagai Fondasi Industri 2030",
        ],
        speaker: "Lomba Essay",
        image: "https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=800&auto=format&fit=crop",
        href: "/lomba-essay",
        price: "Rp. 75.000",
        reverse: false
    }
]

export default function RegistrationsSection() {
    return (
        <section id="registrations" className="px-6 lg:px-12 max-w-7xl mx-auto flex flex-col justify-center items-center gap-16 md:gap-20 lg:gap-24">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight text-center">Rangkaian Kegiatan Futura 2026</h1>
            {events.map((event, index) => (
                <div
                    key={event.title}
                    className={`flex flex-col md:flex-row ${event.reverse ? "lg:flex-row-reverse" : "lg:flex-row"} md:items-start lg:items-center gap-8 md:gap-8 lg:gap-16 w-full`}
                >

                    {/* Visual Side */}
                    <div className="w-full md:w-auto flex justify-center shrink-0">
                        <RegistrationCards title={event.title} image={event.image} speaker={event.speaker} />
                    </div>

                    {/* Content Side */}
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex flex-col gap-3 md:gap-4">
                            <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-semibold tracking-tight">{event.title}</h2>

                            <div className="space-y-2 md:space-y-3 text-neutral-600 dark:text-neutral-400">
                                <div className="flex gap-3 items-center">
                                    <Calendar className="w-5 h-5 text-neutral-400 shrink-0" />
                                    <span className="text-sm md:text-base font-medium">{event.date}</span>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <PinIcon className="w-5 h-5 text-neutral-400 shrink-0" />
                                    <span className="text-sm md:text-base font-medium">{event.location}</span>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <BadgePercent className="w-5 h-5 text-neutral-400 shrink-0" />
                                    <span className="text-sm md:text-base font-medium">{event.price}</span>
                                </div>
                            </div>

                            <p className="mt-1 md:mt-2 text-base md:text-base lg:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                                {event.description}
                            </p>
                        </div>

                        <div className="mt-6 md:mt-6 lg:mt-8 space-y-2 md:space-y-3">
                            <h3 className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                                {event.highlightsTitle}
                            </h3>
                            <ul className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-2">
                                {event.highlights.map((highlight, idx) => (
                                    <li key={highlight} className="flex items-center gap-2 text-sm md:text-base text-neutral-600 dark:text-neutral-400 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 shrink-0" />
                                        {highlight}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6 md:mt-8 lg:mt-10">
                            <ButtonV2
                                text="Daftar Sekarang"
                                href={event.href}
                            />
                        </div>
                    </div>

                </div>
            ))}
        </section>
    )
}