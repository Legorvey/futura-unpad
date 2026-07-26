"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

interface LocationProps {
    id?: string;
    location: string;
    address: string;
    mapSrc: string;
    reverse?: boolean;
}

export default function Location({ id, location, address, mapSrc, reverse = false }: LocationProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Parallax effect using framer-motion useScroll
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    // Subtle parallax ranges
    const yText = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
    const yMap = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

    return (
        <section id={id} ref={containerRef} className="relative mx-auto w-full max-w-7xl py-12 md:py-24">
            <div className={cn("flex flex-col gap-12 text-center lg:grid lg:grid-cols-[1fr_1.5fr] lg:items-center lg:text-left", reverse && "lg:grid-cols-[1.5fr_1fr]")}>
                
                <motion.div 
                    style={{ y: yText }}
                    className={cn("space-y-6 flex flex-col justify-center", reverse && "lg:order-2")}
                >
                    <h2 className="text-3xl md:text-5xl font-medium tracking-[-0.07em] text-white leading-[1.1]">
                        {location}
                    </h2>
                    <div className="flex flex-col gap-3 mx-auto w-4/5 lg:w-full lg:mx-0 mt-4">
                        <p className="text-balance text-base md:text-lg font-light tracking-tight leading-relaxed">
                            {address}
                        </p>
                        <a href="mailto:unpad.futura@gmail.com" className="text-amber-300 hover:text-amber-200 transition-colors cursor-pointer w-fit mx-auto lg:mx-0 font-medium tracking-tight mt-2">
                            unpad.futura@gmail.com
                        </a>
                    </div>
                </motion.div>

                <motion.div 
                    style={{ y: yMap }}
                    className={cn("w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-md", reverse && "lg:order-1")}
                >
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl sm:aspect-video bg-neutral-900 group">
                        <iframe
                            className="absolute inset-0 h-full w-full border-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            src={mapSrc}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Location Map"
                            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                        />
                    </div>
                </motion.div>
                
            </div>
        </section>
    );
}