"use client"
import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
import Image from "next/image"
import Link from "next/link"

export default function AboutSection() {
    const targetRef = useRef<HTMLDivElement>(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // Track scroll progress over a 500vh container
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    })

    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

    // Horizontal Sliding Sequence - Parallax overlap restored
    const slide1X = useTransform(smoothProgress, [0, 0.2], ["0%", "-30%"])
    const slide2X = useTransform(smoothProgress, [0, 0.2, 0.35, 0.55], ["100%", "0%", "0%", "-30%"])
    const slide3X = useTransform(smoothProgress, [0.35, 0.55, 0.75, 0.95], ["100%", "0%", "0%", "-30%"])
    const slide4X = useTransform(smoothProgress, [0.75, 0.95], ["100%", "0%"])

    // Opacity fades to cleanly hide overlapping slides over the transparent background
    const slide1Opacity = useTransform(smoothProgress, [0, 0.15], [1, 0])
    const slide2Opacity = useTransform(smoothProgress, [0.35, 0.5], [1, 0])
    const slide3Opacity = useTransform(smoothProgress, [0.75, 0.9], [1, 0])

    // Static lines opacity for Slide 2 (Fades in/out smoothly without translating)
    const slide2LinesOpacity = useTransform(smoothProgress, [0, 0.2, 0.35, 0.55], [0, 1, 1, 0])

    // 3D Parallax specifically for Slide 2
    const parallaxBg = useTransform(smoothProgress, [0, 1], ["-10%", "10%"])

    // Horizontal Parallax on Slide 4 text (Lands exactly in the center at 0.95)
    const slide4TextX = useTransform(smoothProgress, [0.75, 0.95, 1], ["20vw", "0vw", "0vw"])
    const slide4BgTextX = useTransform(smoothProgress, [0.75, 0.95, 1], ["-20vw", "0vw", "0vw"])

    // Slide 3 Image Parallax (Horizontal, strict limits to prevent overlap)
    const img1X = useTransform(smoothProgress, [0.35, 0.95], ["6vw", "-6vw"]) // Top left
    const img2X = useTransform(smoothProgress, [0.35, 0.95], ["-6vw", "6vw"]) // Bottom right
    const img3X = useTransform(smoothProgress, [0.35, 0.95], ["4vw", "-4vw"]) // Top right
    const img4X = useTransform(smoothProgress, [0.35, 0.95], ["-4vw", "4vw"]) // Bottom left
    const imgCenterX = useTransform(smoothProgress, [0.35, 0.95], ["2vw", "-2vw"]) // Center

    return (
        <section id="about" ref={targetRef} className="relative h-[500vh]">

            <div className="sticky top-0 h-screen w-full overflow-hidden">


                {/* --- SLIDE 1: Intro --- */}
                <motion.div
                    style={{ x: slide1X, opacity: slide1Opacity }}
                    className="absolute inset-0 w-screen h-screen flex flex-col justify-center items-center text-white z-10 px-6 md:px-12 lg:px-20"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-center text-white mb-6 sm:mb-8 md:mb-10 lg:mb-14">
                        FUTURA UNPAD
                        <br />
                        <span className="block mt-2 sm:mt-3 md:mt-4 text-white/80">ORGANIZERS</span>
                    </h1>

                    <div className="flex items-center gap-4 sm:gap-8 md:gap-12">
                        <Image src="/image-eeunpad.png" width={160} height={160} alt="Futura Logo" className="object-contain w-16 sm:w-24 md:w-28 lg:w-32 xl:w-40" />
                        <Image src="/hmte-unpad.png" width={160} height={160} alt="HMTE UNPAD Logo" className="object-contain w-16 sm:w-24 md:w-28 lg:w-32 xl:w-40" />
                    </div>
                </motion.div>

                {/* --- SLIDE 2: The Explanation (Abstract Typography Layout) --- */}
                <motion.div
                    style={{ x: slide2X, opacity: slide2Opacity }}
                    className="absolute inset-0 w-screen h-screen flex text-white z-20 overflow-hidden px-6 md:px-12 lg:px-20"
                >
                    {/* Massive Abstract Background Typography */}
                    <motion.div style={{ x: parallaxBg }} className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none whitespace-nowrap">
                        <h2 className="text-[6rem] sm:text-[12rem] md:text-[16rem] lg:text-[22rem] font-black uppercase tracking-[-0.07em] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.08)] lg:[-webkit-text-stroke:2px_rgba(255,255,255,0.1)]">
                            FUTURA?
                        </h2>
                    </motion.div>

                    {/* Foreground Abstract Organized Content */}
                    <div className="relative z-10 w-full max-w-[100rem] h-full mx-auto flex flex-col justify-center md:justify-start gap-10 sm:gap-16 md:gap-0">

                        {/* Top Section: Centered on mobile, Anchored above middle line on desktop */}
                        <div className="w-full flex flex-col justify-center md:justify-end items-start md:h-1/2 md:pb-12 gap-2">
                            <h3 className="text-sm md:text-lg font-bold tracking-tight uppercase">
                                What is
                            </h3>
                            {/* Mobile-only FUTURA title */}
                            <h2 className="block md:hidden text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-none text-white">
                                FUTURA?
                            </h2>
                        </div>

                        {/* Bottom Section: Centered on mobile, Anchored below middle line on desktop */}
                        <div className="w-full flex justify-start md:justify-end md:items-start md:h-1/2 md:pt-12">
                            <div className="max-w-[280px] sm:max-w-md md:max-w-xl lg:max-w-2xl md:text-right">
                                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-zinc-300 text-balance leading-relaxed md:leading-[1.6] tracking-tight">
                                    Acara tahunan oleh <span className="text-white font-medium">Himpunan Mahasiswa Teknik Elektro UNPAD</span> yang bertujuan untuk mempertemukan mahasiswa, peneliti, dan profesional guna berbagi pengetahuan dan inovasi di bidang teknik elektro.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* --- SLIDE 3: Documentation Gallery --- */}
                <motion.div
                    style={{ x: slide3X, opacity: slide3Opacity }}
                    className="absolute inset-0 w-screen h-screen flex flex-col text-white z-30 overflow-hidden px-6 md:px-12 lg:px-20"
                >
                    {/* Surrounding Gallery Images */}
                    <div className="absolute inset-0 z-10 pointer-events-none">

                        {/* Top Left (Col 1) */}
                        <motion.div style={{ x: img1X }} className="group absolute top-[8%] md:top-[12%] left-[4%] md:left-[5%] flex flex-col gap-2 pointer-events-auto">
                            <div className="relative w-[45vw] sm:w-[30vw] md:w-[20vw] aspect-video bg-zinc-900 border border-white/5 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl">
                                <Image src="/seminar/IMG_5476.JPG" alt="Documentation" fill className="object-cover opacity-60 mix-blend-luminosity grayscale transition-all duration-500 group-hover:opacity-100 group-hover:mix-blend-normal group-hover:grayscale-0" />
                            </div>
                            <div className="text-[10px] sm:text-xs md:text-sm font-bold tracking-[-0.04em] uppercase text-white/40 group-hover:text-white transition-colors duration-300">
                                Penyerahan Sertifikat untuk Moderator
                            </div>
                        </motion.div>

                        {/* Bottom Left (Col 1) */}
                        <motion.div style={{ x: img4X }} className="group absolute bottom-[10%] md:bottom-[12%] left-[4%] md:left-[8%] flex flex-col-reverse gap-2 pointer-events-auto hidden sm:flex">
                            <div className="relative w-[40vw] sm:w-[30vw] md:w-[20vw] aspect-[4/3] bg-zinc-900 border border-white/5 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl">
                                <Image src="/seminar/DSC_0588.JPG" alt="Documentation" fill className="object-cover opacity-60 mix-blend-luminosity grayscale transition-all duration-500 group-hover:opacity-100 group-hover:mix-blend-normal group-hover:grayscale-0" />
                            </div>
                            <div className="text-[10px] sm:text-xs md:text-sm font-bold tracking-[-0.04em] uppercase text-white/40 group-hover:text-white transition-colors duration-300">
                                Talkshow dengan Firu Designer
                            </div>
                        </motion.div>

                        {/* Top Right (Col 3) */}
                        <motion.div style={{ x: img3X }} className="group absolute top-[12%] md:top-[20%] right-[4%] md:right-[5%] flex flex-col gap-2 items-end pointer-events-auto hidden sm:flex">
                            <div className="relative w-[40vw] sm:w-[30vw] md:w-[20vw] aspect-video bg-zinc-900 border border-white/5 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl">
                                <Image src="/mechatura/IMG_3931.JPG" alt="Documentation" fill className="object-cover opacity-60 mix-blend-luminosity grayscale transition-all duration-500 group-hover:opacity-100 group-hover:mix-blend-normal group-hover:grayscale-0" />
                            </div>
                            <div className="text-[10px] sm:text-xs md:text-sm font-bold tracking-[-0.04em] uppercase text-white/40 group-hover:text-white transition-colors duration-300 text-right">
                                1st winner robotik sumo
                            </div>
                        </motion.div>

                        {/* Bottom Right (Col 3) */}
                        <motion.div style={{ x: img2X }} className="group absolute bottom-[8%] md:bottom-[15%] right-[4%] md:right-[5%] flex flex-col-reverse gap-2 items-end pointer-events-auto">
                            <div className="relative w-[50vw] sm:w-[30vw] md:w-[20vw] aspect-video bg-zinc-900 border border-white/5 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl">
                                <Image src="/mechatura/IMG_3939.JPG" alt="Documentation" fill className="object-cover opacity-60 mix-blend-luminosity grayscale transition-all duration-500 group-hover:opacity-100 group-hover:mix-blend-normal group-hover:grayscale-0" />
                            </div>
                            <div className="text-[10px] sm:text-xs md:text-sm font-bold tracking-[-0.04em] uppercase text-white/40 group-hover:text-white transition-colors duration-300 text-right">
                                Para pemenang Mechatura 2025
                            </div>
                        </motion.div>
                    </div>

                    {/* Center Image (Col 2) */}
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <motion.div style={{ x: imgCenterX }} className="group flex flex-col gap-3 items-center pointer-events-auto">
                            <div className="relative w-[65vw] sm:w-[36vw] md:w-[28vw] aspect-[4/3] bg-zinc-900 shadow-2xl border border-white/10 cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
                                <Image src="/seminar/IMG_5526.JPG" alt="Featured Documentation" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                            <div className="text-sm md:text-base lg:text-lg font-black tracking-[-0.05em] uppercase text-white/50 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                                Pemenang Doorprize Futura 2025
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* --- SLIDE 4: The Final Parallax Ending --- */}
                <motion.div
                    style={{ x: slide4X }}
                    className="absolute inset-0 w-screen h-screen flex flex-col justify-center items-center text-white z-40 overflow-hidden"
                >
                    {/* Parallax Background Text */}
                    <motion.div style={{ x: slide4BgTextX }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                        <h2 className="text-[10rem] sm:text-[15rem] font-black uppercase tracking-tighter text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.05)] text-center leading-none whitespace-nowrap">
                            READY TO WIN?
                        </h2>
                    </motion.div>

                    {/* Main Foreground Text with independent parallax */}
                    <motion.div style={{ x: slide4TextX }} className="relative z-10 flex flex-col items-center">
                        <h2 className="text-5xl sm:text-7xl md:text-9xl lg:text-[10rem] font-black uppercase tracking-tighter text-white text-center leading-none">
                            READY TO WIN?
                        </h2>
                    </motion.div>
                </motion.div>

            </div>
        </section>
    )
}
