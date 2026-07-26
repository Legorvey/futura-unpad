"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
import { ButtonV2 } from "../ui/button-v2"

const events = [
    {
        title: "Seminar Nasional",
        date: "Sabtu, 7 November 2026",
        location: "Auditorium Unpad",
        price: "Gratis",
        description: "Bergabunglah dalam diskusi mendalam mengenai implementasi energi cerdas di era industri 5.0. Kami mengundang para ahli untuk membahas optimalisasi smart grid dan energi baru terbarukan demi masa depan yang lebih hijau.",
        highlights_title: "Pembicara",
        highlights: "Aditya Cakti C. & Farras Faqih",
        href: "/seminar-nasional",
    },
    {
        title: "Mechatura",
        date: "Minggu, 8 November 2026",
        location: "Gedung PPBS Unpad",
        price: "Rp. 250.000",
        description: "Kompetisi robotika tingkat nasional yang menantang para inovator muda untuk memecahkan masalah energi melalui teknologi otomasi dan mekatronika. Tunjukkan karya terbaikmu!",
        highlights_title: "Tipe Lomba",
        highlights: "Robot Sumo & Robot Transporter",
        href: "/mechatura",
    },
    {
        title: "Lomba Esai",
        date: "1 - 31 Oktober 2026",
        location: "Online / Daring",
        price: "Rp. 175.000",
        description: "Wadahi gagasan kreatif dan solutifmu melalui tulisan. Tema tahun ini berfokus pada inovasi mahasiswa dalam mendukung transisi energi berkelanjutan di Indonesia.",
        highlights_title: "Tema",
        highlights: "Inovasi Smart Grid & Pengembangan EBT",
        href: "/lomba-essay",
    }
]

export default function RegistrationsSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    
    // Global scroll for the entire section
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })
    
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
    
    // Subtle global parallax elements
    const bgLineY = useTransform(smoothProgress, [0, 1], ["-10%", "10%"])
    
    return (
        <section id="registrations" ref={containerRef} className="relative w-full bg-background pt-24 pb-32 md:pt-40 md:pb-48 overflow-hidden">
            
            {/* Structural Boundaries matching Hero Section */}
            <div className="absolute inset-0 pointer-events-none flex justify-center z-0">
                <div className="w-full max-w-[100rem] h-full relative">
                    <motion.div style={{ y: bgLineY }} className="absolute left-[20%] md:left-[30%] top-[-20%] h-[140%] w-[1px] bg-foreground/[0.05]" />
                </div>
            </div>

            <div className="relative mx-auto max-w-[100rem] w-full px-6 md:px-12 lg:px-20 z-10">
                
                {/* Title */}
                <div className="mb-24 md:mb-40">
                    <h1 className="text-[3rem] sm:text-[4rem] md:text-[5rem] tracking-[-0.08em] font-medium text-foreground leading-none text-balance">
                        Rangkaian acara
                    </h1>
                </div>

                <div className="flex flex-col gap-32 md:gap-40">
                    {events.map((event, index) => (
                        <EventItem key={event.title} event={event} index={index} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function EventItem({ event, index }: { event: any, index: number }) {
    const itemRef = useRef<HTMLDivElement>(null)
    
    return (
        <div ref={itemRef} id="registration" className="relative w-full flex flex-col md:flex-row justify-between items-stretch gap-10">
            
            {/* Foreground Content */}
            <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-[-0.08em] mb-8 text-foreground">
                    {event.title}
                </h2>
                
                {/* Clearer Info Presentation */}
                <div className="flex flex-col sm:flex-row gap-6 mb-10 border-l border-foreground/10 pl-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold tracking-tight text-foreground/30">Tanggal</span>
                        <span className="text-sm md:text-base font-medium tracking-tight text-foreground/80">{event.date}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="ttext-sm font-bold tracking-tight text-foreground/30">Lokasi</span>
                        <span className="text-sm md:text-base font-medium tracking-tight text-foreground/80">{event.location}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold tracking-tight text-foreground/30">Biaya</span>
                        <span className="text-sm md:text-base font-medium tracking-tight text-foreground/80">{event.price}</span>
                    </div>
                </div>
                
                <p className="text-base md:text-lg lg:text-xl font-light tracking-[-0.01em] text-foreground/80 leading-[1.6] mb-10 text-balance max-w-2xl">
                    {event.description}
                </p>
                
                <div className="flex flex-col gap-2 mb-12">
                    <span className="text-sm font-bold tracking-tight text-foreground/30">{event.highlights_title}</span>
                    <span className="text-sm md:text-base font-medium tracking-tight text-foreground/90">{event.highlights}</span>
                </div>
                
                <div>
                    <ButtonV2 text="Daftar Sekarang" href={event.href} />
                </div>
            </div>

            {/* Right Side Visual Element - Typography Focus */}
            <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center justify-center group py-12 md:py-0">
                
                {/* Abstract Lines */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-[25%] w-[1px] h-full bg-foreground/[0.06]" />
                    <div className="absolute top-[45%] left-0 w-full h-[1px] bg-foreground/[0.06]" />
                    
                    {/* Diagonal Abstract Lines */}
                    <div className="absolute top-1/2 left-1/2 w-[150%] h-[1px] bg-foreground/[0.04] -translate-x-1/2 -translate-y-1/2 -rotate-[30deg]" />
                </div>

                {/* Typography Focus */}
                <span className="relative z-10 text-[12rem] md:text-[18rem] font-black uppercase tracking-tighter text-transparent [-webkit-text-stroke:2px_currentColor] text-foreground/[0.05] group-hover:text-foreground/20 transition-colors duration-500 select-none leading-none">
                    /0{index + 1}
                </span>
            </div>
        </div>
    )
}