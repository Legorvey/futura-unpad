"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
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
    src: "/mechatura/IMG_3931.JPG",
    title: "1st winner robotik sumo",
  },
  {
    src: "/mechatura/IMG_3939.JPG",
    title: "Para pemenang Mechatura 2025",
  },
  {
    src: "/seminar/IMG_5526.JPG",
    title: "Pemenang Doorprize Futura 2025",
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

// Desktop interactive hover trailer
const VideoHoverWrapper = ({
  videoSrc,
  className,
}: {
  videoSrc: string;
  className?: string;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 300, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 300, damping: 20 });

  const [isHovered, setIsHovered] = useState(false);
  const [isOverControls, setIsOverControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setHasPlayed(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);

    setIsPlaying(!videoElement.paused);
    if (!videoElement.paused) setHasPlayed(true);

    return () => {
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseX.set(x - 60);
    mouseY.set(y - 20);

    setIsOverControls(y > rect.height - 70);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseX.set(x - 60);
    mouseY.set(y - 20);

    setIsHovered(true);
    setIsOverControls(y > rect.height - 70);
  };

  const showPill = isHovered && !isOverControls && !isPlaying;
  const pillText = hasPlayed ? "Continue" : "Watch Trailer";

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform hover:scale-[1.02] duration-500 overflow-hidden ${
        showPill ? "cursor-none" : ""
      } ${className || ""}`}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        loop
        controls
        playsInline
        className="w-full h-auto object-cover"
      />
      <motion.div
        initial={false}
        style={{ x: smoothX, y: smoothY }}
        animate={{
          scale: showPill ? 1 : 0,
          opacity: showPill ? 1 : 0,
        }}
        transition={{
          scale: { duration: 0.3, ease: "easeInOut" },
          opacity: { duration: 0.2 },
        }}
        className="pointer-events-none absolute left-0 top-0 z-50 flex h-10 w-[120px] items-center justify-center rounded-full bg-white text-black text-xs font-bold tracking-tight shadow-xl uppercase"
      >
        {pillText}
      </motion.div>
    </div>
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
        {/* Section 1: Intro / Organizers */}
        <div className="flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9] uppercase">
            FUTURA UNPAD
            <span className="block mt-2 text-white/80 text-2xl sm:text-3xl font-bold">
              ORGANIZERS
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

        {/* Section 2: What is Futura */}
        <div className="space-y-4 max-w-xl mx-auto text-left">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            What is Futura?
          </h2>
          <p className="text-base sm:text-lg font-light text-zinc-300 leading-relaxed tracking-tight">
            Acara tahunan oleh{" "}
            <span className="text-white font-medium">
              Himpunan Mahasiswa Teknik Elektro UNPAD
            </span>{" "}
            yang bertujuan untuk mempertemukan mahasiswa, peneliti, dan
            profesional guna berbagi pengetahuan dan inovasi di bidang teknik
            elektro.
          </p>
        </div>

        {/* Section 3: Documentation Carousel */}
        <div className="space-y-4 max-w-xl mx-auto">
          <div className="text-left">
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-1">
              Kilas Balik Futura
            </h3>
          </div>
          <MobileDocumentationCarousel items={documentationItems} />
        </div>

        {/* Section 4: Video Trailer */}
        <div className="flex flex-col items-center text-center space-y-6 max-w-lg mx-auto">
          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Futura 2026 Video Trailer
          </h3>
          <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
            <video
              src="https://res.cloudinary.com/wf03cnan/video/upload/v1785484250/instagram-reel_dcem2h.mp4"
              controls
              playsInline
              className="w-full h-auto object-cover"
            />
          </div>
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
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-center text-white mb-6 sm:mb-8 md:mb-10 lg:mb-14">
              FUTURA UNPAD
              <br />
              <span className="block mt-2 sm:mt-3 md:mt-4 text-white/80">
                ORGANIZERS
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
            style={{ x: slide2X, opacity: slide2Opacity }}
            className="absolute inset-0 w-full h-screen flex text-white z-20 overflow-hidden px-6 md:px-12 lg:px-20"
          >
            <motion.div
              style={{ x: parallaxBg }}
              className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none whitespace-nowrap"
            >
              <h2 className="text-[6rem] sm:text-[12rem] md:text-[16rem] lg:text-[22rem] font-black uppercase tracking-[-0.07em] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.08)] lg:[-webkit-text-stroke:2px_rgba(255,255,255,0.1)]">
                FUTURA?
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
                    Acara tahunan oleh{" "}
                    <span className="text-white font-medium">
                      Himpunan Mahasiswa Teknik Elektro UNPAD
                    </span>{" "}
                    yang bertujuan untuk mempertemukan mahasiswa, peneliti, dan
                    profesional guna berbagi pengetahuan dan inovasi di bidang
                    teknik elektro.
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
                    src="/seminar/IMG_5476.JPG"
                    alt="Documentation"
                    fill
                    className="object-cover opacity-60 mix-blend-luminosity grayscale transition-all duration-500 group-hover:opacity-100 group-hover:mix-blend-normal group-hover:grayscale-0"
                  />
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm font-bold tracking-tight uppercase text-white/40 group-hover:text-white transition-colors duration-300">
                  Penyerahan Sertifikat untuk Moderator
                </div>
              </motion.div>

              {/* Bottom Left */}
              <motion.div
                style={{ x: img4X }}
                className="group absolute bottom-[10%] md:bottom-[12%] left-[4%] md:left-[8%] flex flex-col-reverse gap-2 pointer-events-auto hidden sm:flex"
              >
                <div className="relative w-[40vw] sm:w-[30vw] md:w-[20vw] aspect-[4/3] bg-zinc-900 border border-white/5 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl">
                  <Image
                    src="/seminar/DSC_0588.JPG"
                    alt="Documentation"
                    fill
                    className="object-cover opacity-60 mix-blend-luminosity grayscale transition-all duration-500 group-hover:opacity-100 group-hover:mix-blend-normal group-hover:grayscale-0"
                  />
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm font-bold tracking-tight uppercase text-white/40 group-hover:text-white transition-colors duration-300">
                  Talkshow dengan Firu Designer
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
                  1st winner robotik sumo
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
                  Para pemenang Mechatura 2025
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
                    src="/seminar/IMG_5526.JPG"
                    alt="Featured Documentation"
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </div>
                <div className="text-sm md:text-base lg:text-lg font-black tracking-tight uppercase text-white/50 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                  Pemenang Doorprize Futura 2025
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* --- SLIDE 4: Instagram Reel --- */}
          <motion.div
            style={{ x: slide4X }}
            className="absolute inset-0 w-full h-screen flex flex-col justify-center items-center text-white z-40 overflow-hidden"
          >
            <motion.div
              style={{ x: slide4BgTextX }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
            >
              <h2 className="text-[10rem] sm:text-[15rem] font-black uppercase tracking-tighter text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.05)] text-center leading-none whitespace-nowrap">
                FUTURA
              </h2>
            </motion.div>

            <motion.div
              style={{ x: slide4TextX }}
              className="relative z-10 flex flex-col items-center gap-6 sm:gap-8"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white text-center">
                Futura 2026 Video Trailer
              </h2>
              <VideoHoverWrapper
                videoSrc="https://res.cloudinary.com/wf03cnan/video/upload/v1785484250/instagram-reel_dcem2h.mp4"
                className="w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px]"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
