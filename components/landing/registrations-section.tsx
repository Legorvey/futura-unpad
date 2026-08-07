"use client";

import { Calendar, MapPin, Presentation, Bot, PenTool } from "lucide-react";
import { ButtonV2 } from "../ui/button-v2";

const events = [
    {
        title: "Seminar Nasional",
        date: "Sabtu, 28 November 2026",
        location: "Bale Rumawat Unpad Dipatiukur",
        description: "Diskusi Transformasi Teknologi di Era Making Indonesia 4.0: Konvergensi Energi, Konektivitas, dan Industri Nasional Menuju 2030 memfasilitasi para ahli untuk mengkaji kesiapan teknis industri nasional secara spesifik melalui integrasi konektivitas dan energi.",
        highlights_title: "Pembicara",
        highlights: "To Be Announced",
        href: "/seminar-nasional",
        icon: Presentation,
    },
    {
        title: "Mechatura",
        date: "Sabtu, 7 November 2026",
        location: "Gedung PPBS Unpad",
        description: "Kompetisi robotika tingkat nasional yang menantang para inovator muda untuk memecahkan masalah energi melalui teknologi otomasi dan mekatronika. Tunjukkan karya terbaikmu!",
        highlights_title: "Tipe Lomba",
        highlights: "Robot Transporter & Robot Sumo",
        href: "/mechatura",
        icon: Bot,
    },
    {
        title: "Lomba Esai",
        date: "21 September - 22 Oktober 2026",
        location: "Online / Daring",
        description: "Wadahi gagasan kreatif dan solutifmu melalui tulisan. Tema tahun ini berfokus pada inovasi mahasiswa dalam mendukung transisi energi berkelanjutan di Indonesia.",
        highlights_title: "Tema",
        highlights: "Inovasi Smart Grid & Pengembangan EBT",
        href: "/lomba-esai",
        icon: PenTool,
    },
];

export default function RegistrationsSection() {
    return (
        <section id="registrations" className="relative w-full py-20 lg:py-28 overflow-hidden">
            <div className="relative mx-auto max-w-[100rem] w-full px-6 md:px-12 lg:px-20 z-10">
                <div className="mb-14 md:mb-20 text-center flex flex-col items-center">
                    <h2 className="text-[3rem] sm:text-[4rem] md:text-[5rem] font-bold tracking-[-0.08em] text-white text-center text-balance leading-tight">
                        Rangkaian Acara
                    </h2>
                    <p className="mt-2 text-lg md:text-xl text-foreground/60 leading-relaxed max-w-2xl text-center text-balance">
                        Pilih program yang sesuai dengan minatmu dan jadilah bagian dari revolusi teknologi berkelanjutan di Indonesia.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                    {events.map((event) => (
                        <EventCard key={event.title} event={event} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function EventCard({ event }: { event: (typeof events)[0] }) {
    const Icon = event.icon;

    return (
        <div className="relative group flex flex-col justify-between p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 ease-in-out backdrop-blur-2xl overflow-hidden shadow-xl hover:-translate-y-2 h-full">
            {/* Subtle Overflowing Background Icon */}
            <div className="absolute -top-8 -right-8 pointer-events-none select-none transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3">
                <Icon className="w-52 h-52 sm:w-60 sm:h-60 text-white/[0.03] group-hover:text-white/[0.06] stroke-[1.2] transition-colors duration-300" />
            </div>

            <div className="relative z-10 flex flex-col flex-grow">
                <div>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-8">
                        {event.title}
                    </h2>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-0.5">Tanggal</span>
                                <span className="text-sm font-medium text-foreground/90">{event.date}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-0.5">Lokasi</span>
                                <span className="text-sm font-medium text-foreground/90">{event.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="my-8 "/>
                <p className="text-base font-light text-foreground/70 leading-relaxed mb-10 flex-grow">
                    {event.description}
                </p>

                <div className="mt-auto flex flex-col gap-8">
                    <div className="p-5 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
                        <span className="block text-xs font-semibold tracking-tight text-white/60 mb-1">
                            {event.highlights_title}
                        </span>
                        <span className="text-sm font-medium text-foreground/90 block">
                            {event.highlights}
                        </span>
                    </div>

                    <div className="flex justify-start">
                        <ButtonV2 text="Daftar Sekarang" href={event.href} />
                    </div>
                </div>
            </div>
        </div>
    );
}