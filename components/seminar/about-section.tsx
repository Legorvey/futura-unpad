"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "motion/react";
import Image from "next/image";

const documentationItems = [
  {
    src: "/seminar/IMG_5476.JPG",
    title: "Penyerahan Sertifikat untuk Moderator",
  },
  {
    src: "/seminar/DSC_0588.JPG",
    title: "Talkshow dengan Firu Designer",
  },
  {
    src: "/seminar/IMG_5526.JPG",
    title: "Pemenang Doorprize Futura 2025",
  },
  {
    src: "/seminar/IMG_5551.JPG",
    title: "Grand Opening Futura 2025",
  },
  {
    src: "/seminar/IMG_5420.JPG",
    title: "Antusiasme Peserta Seminar",
  },
  {
    src: "/seminar/IMG_5525.JPG",
    title: "Sesi Tanya Jawab",
  },
];

// Carousel component for mobile & lower resolutions (< 768px)
function MobileDocumentationCarousel({
  items,
}: {
  items: { src: string; title: string }[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / clientWidth);
      setCurrentIndex(index);
    }
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * scrollRef.current.clientWidth,
      behavior: "smooth",
    });
    setCurrentIndex(index);
  };

  return (
    <div className="w-full space-y-4">
      {/* Scrollable Carousel Track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            className="w-full shrink-0 snap-center rounded-2xl bg-zinc-900/70 border border-white/10 p-3 shadow-lg flex flex-col gap-3"
          >
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-950">
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-between px-1">
              <p className="text-xs sm:text-sm font-semibold tracking-tight text-white/90 truncate pr-2">
                {item.title}
              </p>
              <span className="text-[11px] font-medium tracking-tight text-white/40 shrink-0">
                {idx + 1} / {items.length}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls & Indicators */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollToIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white disabled:opacity-30 active:scale-95 transition-all"
            aria-label="Previous documentation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() =>
              scrollToIndex(Math.min(items.length - 1, currentIndex + 1))
            }
            disabled={currentIndex === items.length - 1}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white disabled:opacity-30 active:scale-95 transition-all"
            aria-label="Next documentation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const GalleryRow = ({
  items,
  xTransform,
  className = "",
}: {
  items: { src: string; title: string }[];
  xTransform: MotionValue<string>;
  className?: string;
}) => {
  return (
    <motion.div
      style={{ x: xTransform, willChange: "transform" }}
      className={`flex gap-4 md:gap-6 w-max px-4 transform-gpu ${className}`}
    >
      {[...items, ...items, ...items].map((item, idx) => (
        <div
          key={idx}
          className="group relative w-[60vw] sm:w-[40vw] md:w-[25vw] lg:w-[20vw] aspect-[4/3] rounded-2xl overflow-hidden shrink-0 cursor-pointer shadow-2xl bg-zinc-900 border border-white/10 transform-gpu"
        >
          <Image
            src={item.src}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 60vw, 25vw"
            quality={60}
            className="object-cover opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-110 will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
          <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
            <h4 className="text-white font-bold text-sm md:text-base lg:text-lg leading-tight uppercase tracking-tight drop-shadow-md">
              {item.title}
            </h4>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default function AboutSection() {
  const targetRef = useRef<HTMLDivElement>(null);

  // Track scroll progress over a 500vh container for tablet & higher resolutions
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  // --- Slide 1 ---
  const slide1X = useTransform(smoothProgress, [0, 0.2], ["0vw", "-50vw"]);
  const slide1Opacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);

  // --- Slide 2 ---
  const slide2ContentX = useTransform(smoothProgress, [0, 0.2, 0.35, 0.55], ["100vw", "0vw", "-10vw", "-100vw"]);
  const slide2Opacity = useTransform(smoothProgress, [0.15, 0.25, 0.45, 0.55], [0, 1, 1, 0]);
  const parallaxBg = useTransform(smoothProgress, [0, 0.2, 0.35, 0.55], ["-100vw", "-10vw", "10vw", "100vw"]);

  // --- Slide 3 ---
  const title3X = useTransform(smoothProgress, [0.35, 0.55, 0.75, 0.95], ["100vw", "0vw", "-5vw", "-150vw"]);
  
  // Gallery Rows Parallax:
  // Top row comes from the right side to the left (self-start, anchored at left 0)
  const topRowX = useTransform(smoothProgress, [0.35, 0.55, 0.75, 0.95], ["120vw", "0vw", "-40vw", "-200vw"]);
  
  // Bottom row comes from the left side to the right (self-end, anchored at right 100vw)
  const bottomRowX = useTransform(smoothProgress, [0.35, 0.55, 0.75, 0.95], ["-120vw", "0vw", "40vw", "200vw"]);
  
  // Slide 3 Opacity only visible during slide 3 phase
  const slide3Opacity = useTransform(smoothProgress, [0.3, 0.4, 0.75, 0.9], [0, 1, 1, 0]);

  // --- Slide 4 (Stay Tuned / Upcoming) ---
  const slide4Opacity = useTransform(smoothProgress, [0.84, 0.92], [0, 1]);
  const slide4TextX = useTransform(smoothProgress, [0.85, 0.95, 1], ["30vw", "0vw", "-2vw"]);
  const slide4BgTextX = useTransform(smoothProgress, [0.85, 0.95, 1], ["-30vw", "0vw", "2vw"]);

  return (
    <section id="about" className="relative w-full">
      {/* ========================================================================= */}
      {/* MOBILE LAYOUT (< 768px: Native Vertical Scroll & Carousel)                */}
      {/* ========================================================================= */}
      <div className="md:hidden w-full px-6 py-20 space-y-24 text-white">
        {/* Section 1: Intro / Organizers */}
        <div className="flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9] uppercase">
            SEMINAR NASIONAL
            <span className="block mt-2 text-white/80 text-2xl sm:text-3xl font-bold">
              FUTURA UNPAD
            </span>
          </h1>
          <div className="flex items-center justify-center gap-6 pt-2">
            <Image
              src="/image-eeunpad.png"
              width={100}
              height={100}
              alt="Futura Logo"
              className="object-contain w-16 sm:w-20"
            />
            <Image
              src="/hmte-unpad.png"
              width={100}
              height={100}
              alt="HMTE UNPAD Logo"
              className="object-contain w-16 sm:w-20"
            />
          </div>
        </div>

        {/* Section 2: What is Seminar Nasional */}
        <div className="space-y-4 max-w-xl mx-auto text-left">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            What is Seminar Nasional Futura?
          </h2>
          <p className="text-base sm:text-lg font-light text-zinc-300 leading-relaxed tracking-tight">
            Seminar yang akan membawa kamu mengeksplorasi berbagai inovasi yang
            sedang mengubah dunia dengan topik:{" "}
            <span className="text-white font-medium">
              Green & Renewable Energy, IoT, Telekomunikasi, dan Sistem
              Informasi.
            </span>
          </p>
        </div>

        {/* Section 3: Documentation Carousel */}
        <div className="space-y-4 max-w-xl mx-auto">
          <div className="text-left">
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-1">
              Kilas Balik Seminar
            </h3>
          </div>
          <MobileDocumentationCarousel items={documentationItems} />
        </div>

        {/* Section 4: Stay Tuned / Upcoming Announcement */}
        <div className="flex flex-col items-center text-center space-y-6 max-w-lg mx-auto py-8">
          <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white leading-tight">
            Nantikan Seminar Nasional <br className="hidden sm:inline" />
            <span className="text-white/80">Futura 2026</span>
          </h3>
          <p className="text-base sm:text-lg font-light text-zinc-300 leading-relaxed tracking-tight text-balance">
            Pendaftaran akan segera dibuka. Siapkan dirimu untuk mengeksplorasi inovasi teknologi masa depan, memperluas relasi, dan berdiskusi langsung bersama para pakar terkemuka.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABLET & DESKTOP LAYOUT (>= 768px: Horizontal Sliding Flow)               */}
      {/* ========================================================================= */}
      <div ref={targetRef} className="hidden md:block relative h-[500vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* --- SLIDE 1: Intro --- */}
          <motion.div
            style={{ x: slide1X, opacity: slide1Opacity }}
            className="absolute inset-0 w-full h-screen flex flex-col justify-center items-center text-white z-10 px-6 md:px-12 lg:px-20"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-center text-white mb-6 sm:mb-8 md:mb-10 lg:mb-14">
              SEMINAR NASIONAL
              <br />
              <span className="block mt-2 sm:mt-3 md:mt-4 text-white/80">
                FUTURA UNPAD
              </span>
            </h1>

            <div className="flex items-center gap-4 sm:gap-8 md:gap-12">
              <Image
                src="/image-eeunpad.png"
                width={160}
                height={160}
                alt="Futura Logo"
                className="object-contain w-16 sm:w-24 md:w-28 lg:w-32 xl:w-40"
              />
              <Image
                src="/hmte-unpad.png"
                width={160}
                height={160}
                alt="HMTE UNPAD Logo"
                className="object-contain w-16 sm:w-24 md:w-28 lg:w-32 xl:w-40"
              />
            </div>
          </motion.div>

          {/* --- SLIDE 2: The Explanation --- */}
          <motion.div
            style={{ opacity: slide2Opacity }}
            className="absolute inset-0 w-full h-screen flex text-white z-20 pointer-events-none px-6 md:px-12 lg:px-20"
          >
            <motion.div
              style={{ x: parallaxBg }}
              className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 whitespace-nowrap"
            >
              <h2 className="text-[5rem] sm:text-[10rem] md:text-[14rem] lg:text-[18rem] font-black uppercase tracking-[-0.07em] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.08)] lg:[-webkit-text-stroke:2px_rgba(255,255,255,0.1)]">
                SEMINAR?
              </h2>
            </motion.div>

            <motion.div style={{ x: slide2ContentX }} className="relative z-10 w-full max-w-[100rem] h-full mx-auto flex flex-col justify-center md:justify-start gap-10 sm:gap-16 md:gap-0 pointer-events-auto">
              <div className="w-full flex flex-col justify-center md:justify-end items-start md:h-1/2 md:pb-12 gap-2">
                <h3 className="text-sm md:text-lg font-bold tracking-tight uppercase">
                  What is
                </h3>
              </div>

              <div className="w-full flex justify-start md:justify-end md:items-start md:h-1/2 md:pt-12">
                <div className="max-w-[280px] sm:max-w-md md:max-w-xl lg:max-w-2xl md:text-right">
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-zinc-300 text-balance leading-relaxed md:leading-[1.6] tracking-tight">
                    Seminar yang akan membawa kamu mengeksplorasi berbagai
                    inovasi yang sedang mengubah dunia dengan topik:{" "}
                    <span className="text-white font-medium">
                      Green & Renewable Energy, IoT, Telekomunikasi, dan Sistem
                      Informasi.
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* --- SLIDE 3: Documentation Gallery (Non-diagonal, opposite sliding rows) --- */}
          <motion.div
            style={{ opacity: slide3Opacity }}
            className="absolute inset-0 w-full h-screen flex flex-col justify-center text-white z-30 pointer-events-none"
          >
            <motion.div style={{ x: title3X, willChange: "transform" }} className="absolute bottom-[10%] left-[5%] md:left-[8%] z-40 pointer-events-auto max-w-2xl pr-6 transform-gpu">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.9)] mb-4 whitespace-nowrap drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                Kilas Balik <span className="text-white [-webkit-text-stroke:0px]">Seminar</span>
              </h2>
              <div className="p-5 md:p-8 rounded-3xl bg-zinc-950/80 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transform-gpu">
                <p className="text-zinc-200 text-sm md:text-base lg:text-lg font-light tracking-tight leading-relaxed">
                  Momen-momen tak terlupakan dari seminar nasional tahun sebelumnya,
                  menampilkan antusiasme peserta, diskusi interaktif, dan
                  wawasan berharga dari para pembicara ahli.
                </p>
              </div>
            </motion.div>

            {/* Horizontal gallery without diagonal tilt */}
            <div className="flex flex-col gap-6 md:gap-8 z-10 w-full overflow-visible pointer-events-auto">
              <GalleryRow
                items={documentationItems.slice(0, 3)}
                xTransform={topRowX}
                className="self-start"
              />
              <GalleryRow
                items={documentationItems.slice(3, 6)}
                xTransform={bottomRowX}
                className="self-end"
              />
            </div>
          </motion.div>

          {/* --- SLIDE 4: Stay Tuned / Upcoming Announcement --- */}
          <motion.div
            style={{ opacity: slide4Opacity }}
            className="absolute inset-0 w-full h-screen flex flex-col justify-center items-center text-white z-40 overflow-hidden px-6 md:px-12 lg:px-20 pointer-events-none"
          >
            <motion.div
              style={{ x: slide4BgTextX }}
              className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none"
            >
              <h2 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] font-black uppercase tracking-tighter text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.05)] text-center leading-none whitespace-nowrap">
                STAY TUNED
              </h2>
            </motion.div>

            <motion.div
              style={{ x: slide4TextX }}
              className="relative z-10 flex flex-col items-center text-center max-w-4xl gap-6 sm:gap-8 pointer-events-auto"
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tighter text-white text-center leading-[0.9]">
                Nantikan Seminar Nasional <br />
                <span className="text-white/80">Futura 2026</span>
              </h2>

              <p className="max-w-2xl text-center text-base sm:text-lg md:text-xl lg:text-2xl font-light text-zinc-300 leading-relaxed tracking-tight text-balance">
                Pendaftaran akan segera dibuka. Siapkan dirimu untuk mengeksplorasi inovasi teknologi masa depan, memperluas relasi, dan berdiskusi langsung bersama para pakar terkemuka.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
