/* eslint-disable */
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useLiteMotion } from "@/hooks/use-lite-motion";

type GrandTimelineItem = {
  category: string;
  event: string;
  date: string;
  description: string;
  location?: string;
};

const esaiTimelineItems: GrandTimelineItem[] = [
  {
    category: "Lomba Esai",
    event: "Registrasi & Pengumpulan",
    date: "21 September - 22 Oktober 2026",
    description: "Peserta melakukan registrasi sekaligus mengumpulkan naskah Esai.",
    location: "Online/Daring",
  },
  {
    category: "Lomba Esai",
    event: "Seleksi Naskah",
    date: "23 Oktober - 2 November 2026",
    description: "Tahap kurasi dan penilaian awal naskah Esai peserta.",
    location: "Oleh Panitia",
  },
  {
    category: "Lomba Esai",
    event: "Pengumuman Finalis",
    date: "4 November 2026",
    description: "Finalis Lomba Esai diumumkan secara resmi melalui email dan kanal informasi.",
    location: "By Email",
  },
  {
    category: "Lomba Esai",
    event: "Upload Video Presentasi Finalis",
    date: "5 - 12 November 2026",
    description: "Finalis mengunggah video presentasi sesuai ketentuan dan regulasi panitia.",
    location: "Online/Daring",
  },
  {
    category: "Lomba Esai",
    event: "Seleksi Finalis",
    date: "13 - 27 November 2026",
    description: "Penilaian tahap akhir untuk menentukan karya terbaik dan pemenang Lomba Esai.",
    location: "Oleh Panitia",
  },
  {
    category: "Lomba Esai",
    event: "Pengumuman Juara",
    date: "28 November 2026",
    description: "Pengumuman dan apresiasi pemenang Lomba Esai pada sesi awarding.",
    location: "Bale Rumawat Unpad",
  },
];

const RevealText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const words = text.split(" ");
  return (
    <span className={`inline-flex flex-wrap ${className || ""}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex whitespace-nowrap">
          {word.split("").map((char, charIndex) => (
            <span key={charIndex} className="inline-flex overflow-hidden align-bottom">
              <motion.span
                variants={{
                  hidden: { y: "110%" },
                  visible: {
                    y: "0%",
                    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  },
                  exit: { opacity: 0, transition: { duration: 0.1 } },
                }}
                className="inline-block whitespace-pre"
              >
                {char}
              </motion.span>
            </span>
          ))}
          {wordIndex < words.length - 1 && (
            <span className="inline-flex overflow-hidden align-bottom">
              <motion.span
                variants={{
                  hidden: { y: "110%" },
                  visible: {
                    y: "0%",
                    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  },
                  exit: { opacity: 0, transition: { duration: 0.1 } },
                }}
                className="inline-block whitespace-pre"
              >
                {" "}
              </motion.span>
            </span>
          )}
        </span>
      ))}
    </span>
  );
};

const RevealWords = ({ text, className }: { text: string; className?: string }) => {
  return (
    <span className={`inline-flex flex-wrap ${className || ""}`}>
      {text.split(" ").map((word, index) => (
        <span key={index} className="inline-flex overflow-hidden align-bottom mr-[0.25em]">
          <motion.span
            variants={{
              hidden: { y: "110%" },
              visible: { opacity: 1, y: "0%", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
              exit: { opacity: 0, transition: { duration: 0.1 } }
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

const ParallaxTimelineItem = ({ item, index, isLiteMotion }: { item: GrandTimelineItem, index: number, isLiteMotion: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "end 10%"],
  });

  const yDate = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"]);
  const yEvent = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);
  const yDesc = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
  const yNumber = useTransform(scrollYProgress, [0, 1], ["60%", "-60%"]);

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.4, 1, 1, 0.4]);

  return (
    <motion.div
      ref={ref}
      style={!isLiteMotion ? { scale, opacity } : { opacity: 1, transform: "none" }}
      className="flex flex-col xl:flex-row w-full py-8 md:py-16 group relative z-10 gap-8 xl:gap-24 items-start"
    >
      {/* 3D Background Number */}
      <motion.div 
        style={!isLiteMotion ? { y: yNumber, opacity: opacity } : { opacity: 0.1 }}
        className="absolute top-0 right-0 md:right-auto md:left-0 text-[9rem] sm:text-[11.5rem] md:text-[14rem] lg:text-[16.5rem] xl:text-[18.5rem] font-bold text-white/5 pointer-events-none select-none leading-none z-[-1]"
      >
        {String(index + 1).padStart(2, '0')}
      </motion.div>

      {/* Left Column of Timeline Item: Date */}
      <div className="w-full xl:w-[30%] shrink-0 flex flex-col items-start relative z-20 pt-1 md:pt-2">
        <motion.div style={!isLiteMotion ? { y: yDate } : { transform: "none" }} className="w-full">
          <RevealText 
            text={item.date} 
            className="text-sm md:text-base font-bold text-amber-300 tracking-[-0.02em]"
          />
          {item.location && (
            <div className="mt-2 text-xs md:text-sm font-medium text-amber-400 tracking-[-0.02em] flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {item.location}
            </div>
          )}
        </motion.div>
      </div>

      {/* Right Column of Timeline Item: Title & Offset Description */}
      <div className="w-full flex-1 flex flex-col relative z-30 min-w-0 xl:pl-8">
        <motion.div style={!isLiteMotion ? { y: yEvent } : { transform: "none" }} className="relative">
          <RevealText 
            text={item.event}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.05em] leading-[1.05] text-balance text-white"
          />
        </motion.div>

        <motion.div style={!isLiteMotion ? { y: yDesc } : { transform: "none" }} className="mt-4 md:mt-6 w-full max-w-xl relative z-10">
          <RevealWords 
            text={item.description}
            className="text-base md:text-lg lg:text-xl leading-relaxed text-white/80 tracking-[-0.04em] font-light"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export function EsaiTimeline() {
  const isLiteMotion = useLiteMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  return (
    <section
      id="timeline"
      className="w-full bg-background relative overflow-clip py-10 md:py-16"
    >
      <div className="mx-auto max-w-[100rem] w-full px-6 md:px-10 relative z-20 flex flex-col items-center">
        
        {/* Inner Constrained Wrapper mimicking Hero Section layout */}
        <div className="w-full flex flex-col md:flex-row md:gap-8 lg:gap-12 relative">
          
          {/* Left Column (Sticky Title) */}
          <div className="w-full md:w-1/3 flex-shrink-0 flex flex-col md:sticky md:top-32 h-fit pb-8 md:pb-0 relative z-30 pt-6 md:pt-16">
            <div className="lg:pl-6 xl:pl-10 mb-4 w-full flex flex-col gap-1">
              <h2 className="text-3xl lg:text-4xl tracking-[-0.08em] font-semibold text-white">
                Timeline
              </h2>
              <span className="text-left text-5xl lg:text-6xl font-bold tracking-[-0.04em] text-amber-300">
                Lomba Esai
              </span>
            </div>

            <div className="w-full lg:pl-6 xl:pl-10 z-30">
              <p className="text-sm md:text-base text-white/70 mt-1 md:mt-2 max-w-xs leading-relaxed font-light tracking-[-0.02em]">
                Jadwal lengkap kompetisi Lomba Esai Nasional Futura, mulai dari pendaftaran hingga pengumuman juara.
              </p>
            </div>
          </div>

          {/* Right Column (Timeline Content) */}
          <div className="w-full flex-1 relative pt-10 md:pt-16 min-w-0" ref={containerRef}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 1 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: isLiteMotion ? 0 : 0.008 }
                }
              }}
              className="w-full flex flex-col"
            >
              {esaiTimelineItems.map((item, i) => (
                <ParallaxTimelineItem key={i} item={item} index={i} isLiteMotion={isLiteMotion} />
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
