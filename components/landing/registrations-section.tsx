"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
import { ButtonV2 } from "../ui/button-v2"

const events = [
    {
        title: "Seminar Nasional",
        date: "Sabtu, 28 November 2026",
        location: "Bale Rumawat Unpad Dipatiukur",
        description: "Diskusi Transformasi Teknologi di Era Making Indonesia 4.0: Konvergensi Energi, Konektivitas, dan Industri Nasional Menuju 2030 memfasilitasi para ahli untuk mengkaji kesiapan teknis industri nasional secara spesifik melalui integrasi konektivitas dan energi.",
        highlights_title: "Pembicara",
        highlights: "To Be Announced",
        href: "/seminar-nasional",
        gradient: ["#bbf7d0", "#22c55e", "#14532d"],
        accentRGB: "34, 197, 94",
    },
    {
        title: "Mechatura",
        date: "Sabtu, 7 November 2026",
        location: "Gedung PPBS Unpad",
        description: "Kompetisi robotika tingkat nasional yang menantang para inovator muda untuk memecahkan masalah energi melalui teknologi otomasi dan mekatronika. Tunjukkan karya terbaikmu!",
        highlights_title: "Tipe Lomba",
        highlights: "Robot Transporter & Robot Sumo",
        href: "/mechatura",
        gradient: ["#fde047", "#ea580c", "#7f1d1d"],
        accentRGB: "234, 88, 12",
    },
    {
        title: "Lomba Esai",
        date: "21 September - 22 Oktober 2026",
        location: "Online / Daring",
        description: "Wadahi gagasan kreatif dan solutifmu melalui tulisan. Tema tahun ini berfokus pada inovasi mahasiswa dalam mendukung transisi energi berkelanjutan di Indonesia.",
        highlights_title: "Tema",
        highlights: "Inovasi Smart Grid & Pengembangan EBT",
        href: "/lomba-esai",
        gradient: ["#93c5fd", "#3b82f6", "#1e3a8a"],
        accentRGB: "59, 130, 246",
    }
]

export default function RegistrationsSection() {
    const containerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
    const bgLineY = useTransform(smoothProgress, [0, 1], ["-10%", "10%"])

    return (
        <section id="registrations" ref={containerRef} className="relative w-full bg-background pt-24 pb-32 md:pt-40 md:pb-48 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none flex justify-center z-0">
                <div className="w-full max-w-[100rem] h-full relative">
                    <motion.div style={{ y: bgLineY }} className="absolute left-[20%] md:left-[30%] top-[-20%] h-[140%] w-[1px] bg-foreground/[0.05]" />
                </div>
            </div>

            <div className="relative mx-auto max-w-[100rem] w-full px-6 md:px-12 lg:px-20 z-10">
                <div className="mb-20 md:mb-28 text-center flex flex-col items-center">
                    <h1 className="text-[3rem] sm:text-[4rem] md:text-[5rem] tracking-[-0.08em] font-medium text-foreground leading-none text-balance mb-6">
                        Rangkaian Acara
                    </h1>
                    <p className="text-lg md:text-xl text-foreground/60 max-w-2xl text-balance">
                        Pilih program yang sesuai dengan minatmu dan jadilah bagian dari revolusi teknologi berkelanjutan di Indonesia.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                    {events.map((event, index) => (
                        <EventCard key={event.title} event={event} index={index} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function EventCard({ event, index }: { event: any, index: number }) {
    return (
        <div className="relative group flex flex-col justify-between p-8 md:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 ease-in-out backdrop-blur-2xl overflow-hidden shadow-xl hover:-translate-y-2 h-full cursor-pointer">

            <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
                <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={event.gradient[0]} />
                    <stop offset="50%" stopColor={event.gradient[1]} />
                    <stop offset="100%" stopColor={event.gradient[2]} />
                </linearGradient>
            </svg>

            {/* Dynamic Custom Hover Shadow */}
            <div
                className="absolute -inset-px rounded-[2.5rem] pointer-events-none transition-shadow duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                style={{ boxShadow: `0 12px 24px rgba(${event.accentRGB}, 0.25)` }}
            />

            {/* Default Glow */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-in-out rounded-[2.5rem] opacity-100 group-hover:opacity-0"
                style={{
                    background: `linear-gradient(to bottom right, ${event.gradient[0]}26, ${event.gradient[1]}26, ${event.gradient[2]}26)`
                }}
            />
            {/* Hover Glow with Continuous Pan Animation */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-in-out rounded-[2.5rem] opacity-0 group-hover:opacity-100 group-hover:animate-glow-pan"
                style={{
                    background: `linear-gradient(to bottom right, ${event.gradient[0]}66, ${event.gradient[1]}66, ${event.gradient[2]}66)`,
                    backgroundSize: '200% 200%'
                }}
            />

            {/* Background Number */}
            <div className="absolute right-[-5%] top-[-5%] text-[10rem] md:text-[12rem] font-black text-white/[0.02] pointer-events-none select-none leading-none group-hover:text-white/[0.04] transition-colors duration-300 ease-in-out">
                0{index + 1}
            </div>

            <div className="relative z-10 flex flex-col flex-grow">
                <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-8">
                        {event.title}
                    </h2>

                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={`url(#grad-${index})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold tracking-widest text-foreground/40 uppercase mb-0.5">Tanggal</span>
                                <span className="text-sm font-medium text-foreground/90">{event.date}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={`url(#grad-${index})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold tracking-widest text-foreground/40 uppercase mb-0.5">Lokasi</span>
                                <span className="text-sm font-medium text-foreground/90">{event.location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-base font-light text-foreground/70 leading-relaxed mb-10 flex-grow">
                    {event.description}
                </p>

                <div className="mt-auto flex flex-col gap-8">
                    <div className="p-5 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
                        <span
                            className="block text-xs font-bold tracking-widest uppercase mb-2 bg-clip-text text-white group-hover:text-transparent transition-colors duration-300 w-fit"
                            style={{ backgroundImage: `linear-gradient(to right, ${event.gradient[0]}, ${event.gradient[1]}, ${event.gradient[2]})` }}
                        >
                            {event.highlights_title}
                        </span>
                        <span className="text-sm font-medium text-foreground/90 block">{event.highlights}</span>
                    </div>

                    <div className="flex justify-start">
                        <ButtonV2 text="Daftar Sekarang" href={event.href} />
                    </div>
                </div>
            </div>
        </div>
    )
}