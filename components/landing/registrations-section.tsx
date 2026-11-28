"use client";

import { Presentation, Bot, PenTool } from "lucide-react";
import { ButtonV2 } from "../ui/button-v2";
import {
    SEMINAR_EVENT_DATE_LABEL,
    SEMINAR_EVENT_TIME_LABEL,
    SEMINAR_LOCATION_NAME,
    SEMINAR_SPEAKERS,
} from "@/lib/seminar/config";
import {
    useSeminarEventOngoing,
    useSeminarRegistrationOpen,
} from "@/lib/seminar/use-seminar-registration-open";

type EventItem = {
    title: string;
    date: string;
    location: string;
    description: string;
    highlights_title: string;
    highlights: string | string[];
    href: string;
    icon: typeof Presentation;
    isOpen?: boolean;
    openBadgeText?: string;
    isUnopened?: boolean;
    isClosed?: boolean;
};

const speakerHighlights = SEMINAR_SPEAKERS.map((speaker) => speaker.name);

const getEvents = (isSeminarOpen: boolean, isSeminarOngoing: boolean): EventItem[] => [
    {
        title: "Seminar Nasional",
        date: isSeminarOngoing && isSeminarOpen
            ? "Hari Ini • Sedang Berlangsung"
            : `Sabtu, ${SEMINAR_EVENT_DATE_LABEL} • ${SEMINAR_EVENT_TIME_LABEL}`,
        location: SEMINAR_LOCATION_NAME,
        description:
            "Forum ilmiah Seminar & Workshop bersama Persatuan Robotika Seluruh Indonesia (PRSI) yang mengkaji inovasi teknologi global, menghadirkan akademisi, praktisi industri, asosiasi, dan perwakilan pemerintah.",
        highlights_title: "Pembicara",
        highlights: speakerHighlights,
        href: "/seminar-nasional",
        icon: Presentation,
        isOpen: isSeminarOpen,
        openBadgeText: isSeminarOngoing ? "Buka s.d. 23.59 WIB" : "Dibuka s.d. 28 Nov",
        isClosed: !isSeminarOpen,
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
        isClosed: true,
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
        isClosed: true,
    },
];

export default function RegistrationsSection() {
    const isSeminarOpen = useSeminarRegistrationOpen();
    const isSeminarOngoing = useSeminarEventOngoing();
    const events = getEvents(isSeminarOpen, isSeminarOngoing);

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

function EventCard({ event }: { event: EventItem }) {
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
                        <span className="block text-xs font-semibold tracking-tight text-white/60 mb-2">
                            {event.highlights_title}
                        </span>
                        {Array.isArray(event.highlights) ? (
                            <ul className="space-y-1.5">
                                {event.highlights.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-2 text-xs sm:text-sm font-medium text-foreground/90 leading-snug"
                                    >
                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300/80" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-sm font-medium text-foreground/90 block">
                                {event.highlights}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between w-full gap-3">
                        <ButtonV2
                            text={event.isOpen ? "Daftar Sekarang" : "Lihat Detail"}
                            href={event.href}
                        />
                        {event.isOpen && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                {event.openBadgeText ?? "Dibuka s.d. 28 Nov"}
                            </span>
                        )}
                        {event.isUnopened && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                Segera Dibuka
                            </span>
                        )}
                        {event.isClosed && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                                Pendaftaran Ditutup
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}