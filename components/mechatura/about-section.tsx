"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import Image from "next/image";

const documentationItems = [
  {
    src: "/mechatura/_DSC0757.JPG",
    title: "SUMO BOT BATTLE",
  },
  {
    src: "/mechatura/_DSC0762.JPG",
    title: "On-site maintenance di arena",
  },
  {
    src: "/mechatura/IMG_3931.JPG",
    title: "1st Winner Robotik Sumo",
  },
  {
    src: "/mechatura/IMG_3939.JPG",
    title: "Para pemenang mechatura 2025",
  },
  {
    src: "/mechatura/_DSC0665.JPG",
    title: "FUTURA MECHATURA",
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
      {/* Scrollable Track */}
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

export default function AboutSection() {
  const targetRef = useRef<HTMLDivElement>(null);

  // Track scroll progress over a 500vh container for tablet & higher resolutions
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Horizontal Sliding Sequence
  const slide1X = useTransform(smoothProgress, [0, 0.2], ["0%", "-30%"]);
  const slide2X = useTransform(
    smoothProgress,
    [0, 0.2, 0.35, 0.55],
    ["100%", "0%", "0%", "-30%"]
  );
  const slide3X = useTransform(
    smoothProgress,
    [0.35, 0.55, 0.75, 0.95],
    ["100%", "0%", "0%", "-30%"]
  );
  const slide4X = useTransform(smoothProgress, [0.75, 0.95], ["100%", "0%"]);

  const slide1Opacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const slide2Opacity = useTransform(smoothProgress, [0.35, 0.5], [1, 0]);
  const slide3Opacity = useTransform(smoothProgress, [0.75, 0.9], [1, 0]);

  // 3D Parallax specifically for Slide 2
  const parallaxBg = useTransform(smoothProgress, [0, 1], ["-10%", "10%"]);

  // Horizontal Parallax on Slide 4 text
  const slide4TextX = useTransform(
    smoothProgress,
    [0.75, 0.95, 1],
    ["20vw", "0vw", "0vw"]
  );
  const slide4BgTextX = useTransform(
    smoothProgress,
    [0.75, 0.95, 1],
    ["-20vw", "0vw", "0vw"]
  );

  // Slide 3 Image Parallax
  const img1X = useTransform(smoothProgress, [0.35, 0.95], ["6vw", "-6vw"]);
  const img2X = useTransform(smoothProgress, [0.35, 0.95], ["-6vw", "6vw"]);
  const img3X = useTransform(smoothProgress, [0.35, 0.95], ["4vw", "-4vw"]);
  const img4X = useTransform(smoothProgress, [0.35, 0.95], ["-4vw", "4vw"]);
  const imgCenterX = useTransform(smoothProgress, [0.35, 0.95], ["2vw", "-2vw"]);

  return (
    <section id="about" className="relative w-full">
      {/* ========================================================================= */}
      {/* MOBILE LAYOUT (< 768px: Redesigned Native Vertical Scroll & Carousel)     */}
      {/* ========================================================================= */}
      <div className="md:hidden w-full px-6 py-20 space-y-24 text-white">

        {/* Section 1: What is Mechatura */}
        <div className="space-y-4 max-w-xl mx-auto text-left">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            What is MECHATURA?
          </h2>
          <p className="text-base sm:text-lg font-light text-zinc-300 leading-relaxed tracking-tight">
            Mechatura adalah kompetisi teknologi dan robotika yang diselenggarakan
            oleh Himpunan Mahasiswa Teknik Elektro (HMTE) Universitas
            Padjadjaran. Ajang ini menjadi wadah bagi pelajar dan mahasiswa
            untuk menguji kompetensi serta inovasi mereka melalui berbagai
            format perlombaan.
          </p>
        </div>

        {/* Section 2: Documentation Carousel */}
        <div className="space-y-4 max-w-xl mx-auto">
          <div className="text-left">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Kilas Balik Mechatura
            </h3>
          </div>
          <MobileDocumentationCarousel items={documentationItems} />
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TABLET & DESKTOP LAYOUT (>= 768px: Intact Horizontal Sliding Flow As-Is)  */}
      {/* ========================================================================= */}
      <div ref={targetRef} className="hidden md:block relative h-[500vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* --- SLIDE 1: Intro --- */}
          <motion.div
            style={{ x: slide1X, opacity: slide1Opacity }}
            className="absolute inset-0 w-full h-screen flex flex-col justify-center items-center text-white z-10 px-6 md:px-12 lg:px-20"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase text-center text-white">
              MECHATURA
            </h1>
          </motion.div>

          {/* --- SLIDE 2: The Explanation --- */}
          <motion.div
            style={{ x: slide2X, opacity: slide2Opacity }}
            className="absolute inset-0 w-full h-screen flex text-white z-20 overflow-hidden px-6 md:px-12 lg:px-20"
          >
            <motion.div
              style={{ x: parallaxBg }}
              className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none whitespace-nowrap"
            >
              <h2 className="text-[5rem] sm:text-[10rem] md:text-[14rem] lg:text-[16rem] font-black uppercase tracking-[-0.07em] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.08)] lg:[-webkit-text-stroke:2px_rgba(255,255,255,0.1)]">
                MECHATURA?
              </h2>
            </motion.div>

            <div className="relative z-10 w-full max-w-[100rem] h-full mx-auto flex flex-col justify-center md:justify-start gap-10 sm:gap-16 md:gap-0">
              <div className="w-full flex flex-col justify-center md:justify-end items-start md:h-1/2 md:pb-12 gap-2">
                <h3 className="text-sm md:text-lg font-bold tracking-tight uppercase">
                  What is
                </h3>
              </div>

              <div className="w-full flex justify-start md:justify-end md:items-start md:h-1/2 md:pt-12">
                <div className="max-w-[280px] sm:max-w-md md:max-w-xl lg:max-w-2xl md:text-right">
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-zinc-300 text-balance leading-relaxed md:leading-[1.6] tracking-tight">
                    Mechatura adalah kompetisi teknologi dan robotika yang
                    diselenggarakan oleh Himpunan Mahasiswa Teknik Elektro
                    (HMTE) Universitas Padjadjaran. Ajang ini menjadi wadah bagi
                    pelajar dan mahasiswa untuk menguji kompetensi serta inovasi
                    mereka melalui berbagai format perlombaan.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* --- SLIDE 3: Documentation Gallery --- */}
          <motion.div
            style={{ x: slide3X, opacity: slide3Opacity }}
            className="absolute inset-0 w-full h-screen flex flex-col text-white z-30 overflow-hidden px-6 md:px-12 lg:px-20"
          >
            <div className="absolute inset-0 z-10 pointer-events-none">
              {/* Top Left */}
              <motion.div
                style={{ x: img1X }}
                className="group absolute top-[8%] md:top-[12%] left-[4%] md:left-[5%] flex flex-col gap-2 pointer-events-auto"
              >
                <div className="relative w-[45vw] sm:w-[30vw] md:w-[20vw] aspect-video bg-zinc-900 border border-white/5 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl">
                  <Image
                    src="/mechatura/_DSC0757.JPG"
                    alt="Documentation"
                    fill
                    className="object-cover opacity-60 mix-blend-luminosity grayscale transition-all duration-500 group-hover:opacity-100 group-hover:mix-blend-normal group-hover:grayscale-0"
                  />
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm font-bold tracking-tight uppercase text-white/40 group-hover:text-white transition-colors duration-300">
                  SUMO BOT BATTLE
                </div>
              </motion.div>

              {/* Bottom Left */}
              <motion.div
                style={{ x: img4X }}
                className="group absolute bottom-[10%] md:bottom-[12%] left-[4%] md:left-[8%] flex flex-col-reverse gap-2 pointer-events-auto hidden sm:flex"
              >
                <div className="relative w-[40vw] sm:w-[30vw] md:w-[20vw] aspect-[4/3] bg-zinc-900 border border-white/5 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl">
                  <Image
                    src="/mechatura/_DSC0762.JPG"
                    alt="Documentation"
                    fill
                    className="object-cover opacity-60 mix-blend-luminosity grayscale transition-all duration-500 group-hover:opacity-100 group-hover:mix-blend-normal group-hover:grayscale-0"
                  />
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm font-bold tracking-tight uppercase text-white/40 group-hover:text-white transition-colors duration-300">
                  On-site maintenance di arena
                </div>
              </motion.div>

              {/* Top Right */}
              <motion.div
                style={{ x: img3X }}
                className="group absolute top-[12%] md:top-[20%] right-[4%] md:right-[5%] flex flex-col gap-2 items-end pointer-events-auto hidden sm:flex"
              >
                <div className="relative w-[40vw] sm:w-[30vw] md:w-[20vw] aspect-video bg-zinc-900 border border-white/5 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl">
                  <Image
                    src="/mechatura/IMG_3931.JPG"
                    alt="Documentation"
                    fill
                    className="object-cover opacity-60 mix-blend-luminosity grayscale transition-all duration-500 group-hover:opacity-100 group-hover:mix-blend-normal group-hover:grayscale-0"
                  />
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm font-bold tracking-tight uppercase text-white/40 group-hover:text-white transition-colors duration-300 text-right">
                  1st Winner Robotik Sumo
                </div>
              </motion.div>

              {/* Bottom Right */}
              <motion.div
                style={{ x: img2X }}
                className="group absolute bottom-[8%] md:bottom-[15%] right-[4%] md:right-[5%] flex flex-col-reverse gap-2 items-end pointer-events-auto"
              >
                <div className="relative w-[50vw] sm:w-[30vw] md:w-[20vw] aspect-video bg-zinc-900 border border-white/5 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl">
                  <Image
                    src="/mechatura/IMG_3939.JPG"
                    alt="Documentation"
                    fill
                    className="object-cover opacity-60 mix-blend-luminosity grayscale transition-all duration-500 group-hover:opacity-100 group-hover:mix-blend-normal group-hover:grayscale-0"
                  />
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm font-bold tracking-tight uppercase text-white/40 group-hover:text-white transition-colors duration-300 text-right">
                  Para pemenang mechatura 2025
                </div>
              </motion.div>
            </div>

            {/* Center Image */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <motion.div
                style={{ x: imgCenterX }}
                className="group flex flex-col gap-3 items-center pointer-events-auto"
              >
                <div className="relative w-[65vw] sm:w-[36vw] md:w-[28vw] aspect-[4/3] bg-zinc-900 shadow-2xl border border-white/10 cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
                  <Image
                    src="/mechatura/_DSC0665.JPG"
                    alt="Featured Documentation"
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </div>
                <div className="text-sm md:text-base lg:text-lg font-black tracking-tight uppercase text-white/50 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                  FUTURA MECHATURA
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* --- SLIDE 4: Join Us --- */}
          <motion.div
            style={{ x: slide4X }}
            className="absolute inset-0 w-full h-screen flex flex-col justify-center items-center text-white z-40 overflow-hidden"
          >
            <motion.div
              style={{ x: slide4BgTextX }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
            >
              <h2 className="text-[10rem] sm:text-[15rem] font-black uppercase tracking-tighter text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.05)] text-center leading-none whitespace-nowrap">
                JOIN US
              </h2>
            </motion.div>

            <motion.div
              style={{ x: slide4TextX }}
              className="relative z-10 flex flex-col items-center"
            >
              <h2 className="text-5xl sm:text-7xl md:text-9xl lg:text-[10rem] font-black uppercase tracking-tighter text-white text-center leading-none">
                JOIN US
              </h2>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
