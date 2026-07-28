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
};

const seminarTimelineItems: GrandTimelineItem[] = [
  {
    category: "Seminar Nasional",
    event: "Mulai Registrasi",
    date: "21 September 2026",
    description: "Periode registrasi peserta Seminar Nasional Futura.",
  },
  {
    category: "Seminar Nasional",
    event: "Akhir Registrasi",
    date: "21 Oktober 2026",
    description: "Akhir registrasi peserta Seminar Nasional Futura.",
  },
  {
    category: "Seminar Nasional",
    event: "Pelaksanaan",
    date: "21 November 2026",
    description: "Hari pelaksanaan Seminar Nasional Futura.",
  },
  {
    category: "Seminar Nasional",
    event: "Pembagian Sertifikat",
    date: "27 November 2026",
    description: "Hari pembagian sertifikat Seminar Nasional Futura.",
  },
];

const RevealText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  return (
    <span className={`inline-flex flex-wrap ${className || ""}`}>
      {text.split("").map((char, index) => (
        <span key={index} className="inline-flex overflow-hidden align-bottom">
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

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [20, 0, -20]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.2, 1, 1, 0.2]);

  return (
    <motion.div
      ref={ref}
      style={!isLiteMotion ? { scale, opacity, rotateX, transformPerspective: 1200 } : {}}
      className="flex flex-col md:flex-row w-full py-8 md:py-16 group relative z-10"
    >
      {/* 3D Background Number */}
      <motion.div 
        style={!isLiteMotion ? { y: yNumber, opacity: opacity } : { opacity: 0.1 }}
        className="absolute top-0 right-0 md:right-auto md:left-[-5%] text-[8rem] md:text-[12rem] lg:text-[18rem] font-bold text-white/5 pointer-events-none select-none leading-none z-[-1]"
      >
        {String(index + 1).padStart(2, '0')}
      </motion.div>

      {/* Left Column of Timeline Item: Date */}
      <div className="w-full md:w-[35%] flex flex-col items-start mb-4 md:mb-0 relative z-20">
        <motion.div style={!isLiteMotion ? { y: yDate } : {}} className="w-full">
          <RevealText 
            text={item.date} 
            className="text-sm md:text-base font-bold text-amber-300 tracking-[-0.02em]"
          />
        </motion.div>
      </div>

      {/* Right Column of Timeline Item: Title & Offset Description */}
      <div className="w-full md:w-[65%] flex flex-col relative z-30">
        <motion.div style={!isLiteMotion ? { y: yEvent } : {}} className="relative">
          <RevealText 
            text={item.event}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.05em] leading-[1.05] text-white"
          />
        </motion.div>

        <motion.div style={!isLiteMotion ? { y: yDesc } : {}} className="mt-3 w-full max-w-md relative z-10">
          <RevealWords 
            text={item.description}
            className="text-base md:text-lg lg:text-xl leading-relaxed text-white/80 tracking-[-0.04em] font-light"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export function SeminarTimeline() {
  const isLiteMotion = useLiteMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  return (
    <section
      id="timeline"
      className="w-full relative overflow-clip py-10 md:py-16"
    >
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8 relative z-20 flex flex-col items-center">
        
        {/* Inner Constrained Wrapper mimicking Hero Section layout */}
        <div className="w-full flex flex-col md:flex-row relative">
          
          {/* Left Column (Sticky Title) */}
          <div className="w-full md:w-1/3 flex flex-col md:sticky md:top-32 h-fit pb-8 md:pb-0 relative z-30 pt-6 md:pt-16">
            <div className="mb-2 w-full">
              <h2 className="md:pl-12 lg:pl-16 text-4xl lg:text-5xl xl:text-6xl tracking-[-0.08em] font-semibold text-white">
                Timeline
              </h2>
            </div>

            <div className="w-full md:pl-12 lg:pl-16 flex flex-col gap-2 relative z-30">
              <span className="text-left text-base md:text-lg font-medium tracking-[-0.04em] text-amber-300">
                Seminar Nasional
              </span>
              <p className="text-xs md:text-sm text-white/60 mt-1 md:mt-2 max-w-xs leading-relaxed">
                Timeline Seminar Nasional Futura, mulai dari pembukaan registrasi sampai hari pelaksanaan seminar.
              </p>
            </div>
          </div>

          {/* Right Column (Timeline Content) */}
          <div className="w-full md:w-2/3 relative pt-10 md:pt-16" ref={containerRef}>
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
              {seminarTimelineItems.map((item, i) => (
                <ParallaxTimelineItem key={i} item={item} index={i} isLiteMotion={isLiteMotion} />
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
