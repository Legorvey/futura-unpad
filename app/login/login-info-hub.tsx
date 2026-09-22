"use client";

import { useRef, useState, useEffect, useCallback, MouseEvent } from "react";
import Image from "next/image";
import { motion, useSpring, useTransform, AnimatePresence, type Variants, type MotionValue } from "motion/react";

/* ────────────────────────────────────────────────────
   SLIDE DATA
   ──────────────────────────────────────────────────── */

interface ContactInfo {
  name: string;
  phone: string;
  href: string;
}

interface TextLine {
  text: string;
  className: string;
  /** Parallax intensity — higher = more movement */
  parallax: { x: [number, number]; y: [number, number] };
}

interface SlideData {
  id: string;
  contactLabel: string;
  contacts: ContactInfo[];
  lines: TextLine[];
}

const slides: SlideData[] = [
  {
    id: "mechatura",
    contactLabel: "Narahubung Pendaftaran Mechatura",
    contacts: [
      { name: "Adam", phone: "0895-2984-6686", href: "https://wa.me/6289529846686" },
      { name: "Raisa", phone: "0857-1173-5270", href: "https://wa.me/6285711735270" },
    ],
    lines: [
      {
        text: "Mechatura",
        className: "text-5xl md:text-7xl lg:text-[3.5rem] xl:text-[5rem] 2xl:text-[6.5rem] font-black text-white tracking-tighter uppercase drop-shadow-xl whitespace-nowrap",
        parallax: { x: [-15, 15], y: [-15, 15] },
      },
      {
        text: "2nd Batch",
        className: "text-4xl md:text-6xl lg:text-[2.75rem] xl:text-[4rem] 2xl:text-[5.5rem] font-black text-amber-300 tracking-widest uppercase italic drop-shadow-lg ml-8 lg:ml-8 xl:ml-16 2xl:ml-24 mt-[-2px] xl:mt-[-5px] 2xl:mt-[-10px] whitespace-nowrap",
        parallax: { x: [-25, 25], y: [-20, 20] },
      },
      {
        text: "Is",
        className: "text-3xl md:text-5xl lg:text-3xl xl:text-5xl 2xl:text-6xl font-light text-white/80 tracking-[0.2em] xl:tracking-[0.3em] 2xl:tracking-[0.4em] uppercase drop-shadow-md mt-2 xl:mt-4 2xl:mt-6 ml-12 lg:ml-16 xl:ml-28 2xl:ml-40 whitespace-nowrap",
        parallax: { x: [-35, 35], y: [-25, 25] },
      },
      {
        text: "Opened.",
        className: "text-[4.5rem] md:text-[6.5rem] lg:text-[4.5rem] xl:text-[7rem] 2xl:text-[9rem] font-black text-white tracking-tighter uppercase leading-none drop-shadow-2xl mt-[-2px] xl:mt-[-10px] 2xl:mt-[-15px] -ml-2 lg:-ml-4 xl:-ml-8 2xl:-ml-10 whitespace-nowrap",
        parallax: { x: [-45, 45], y: [-30, 30] },
      },
    ],
  },
  {
    id: "lomba-esai",
    contactLabel: "Narahubung Lomba Esai",
    contacts: [
      { name: "Luvian", phone: "0858-9998-3097", href: "https://wa.me/6285899983097" },
      { name: "Fahd", phone: "0898-6838-482", href: "https://wa.me/628986838482" },
    ],
    lines: [
      {
        text: "Lomba",
        className: "text-6xl md:text-8xl lg:text-[4.5rem] xl:text-[6rem] 2xl:text-[8rem] font-black text-white tracking-tighter uppercase drop-shadow-xl whitespace-nowrap",
        parallax: { x: [-15, 15], y: [-15, 15] },
      },
      {
        text: "Essay",
        className: "text-5xl md:text-7xl lg:text-[3.5rem] xl:text-[5rem] 2xl:text-[7rem] font-black text-amber-300 tracking-[0.15em] xl:tracking-[0.2em] 2xl:tracking-[0.25em] uppercase italic drop-shadow-lg ml-6 lg:ml-8 xl:ml-12 2xl:ml-16 mt-[-2px] xl:mt-[-5px] 2xl:mt-[-10px] whitespace-nowrap",
        parallax: { x: [-25, 25], y: [-20, 20] },
      },
      {
        text: "Is Now",
        className: "text-3xl md:text-5xl lg:text-3xl xl:text-5xl 2xl:text-6xl font-light text-white/80 tracking-[0.2em] xl:tracking-[0.3em] 2xl:tracking-[0.4em] uppercase drop-shadow-md mt-3 xl:mt-5 2xl:mt-8 ml-4 lg:ml-6 xl:ml-10 2xl:ml-14 whitespace-nowrap",
        parallax: { x: [-35, 35], y: [-25, 25] },
      },
      {
        text: "Open!",
        className: "text-[5.5rem] md:text-[7.5rem] lg:text-[5.5rem] xl:text-[8rem] 2xl:text-[10.5rem] font-black text-white tracking-tighter uppercase leading-none drop-shadow-2xl mt-[-2px] xl:mt-[-8px] 2xl:mt-[-12px] -ml-2 lg:-ml-4 xl:-ml-6 2xl:-ml-8 whitespace-nowrap",
        parallax: { x: [-45, 45], y: [-30, 30] },
      },
    ],
  },
];

/* ────────────────────────────────────────────────────
   PARALLAX TEXT LINE
   A proper component so useTransform hooks are stable
   ──────────────────────────────────────────────────── */

function ParallaxLine({
  line,
  mx,
  my,
}: {
  line: TextLine;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const px = useTransform(mx, [-1, 1], line.parallax.x);
  const py = useTransform(my, [-1, 1], line.parallax.y);

  return (
    <motion.div className={line.className} style={{ x: px, y: py }}>
      {line.text}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────
   SLIDE TRANSITION VARIANTS
   Smooth ease-in-out for text & contacts
   ──────────────────────────────────────────────────── */

const textVariants: Variants = {
  enter: { opacity: 0, y: 40 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -40,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const contactVariants: Variants = {
  enter: { opacity: 0, y: 20 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ────────────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────────────── */

const SLIDE_INTERVAL_MS = 6_000;

export default function LoginInfoHub() {
  const ref = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /* ── mouse parallax springs ── */
  const mx = useSpring(0, { stiffness: 200, damping: 40 });
  const my = useSpring(0, { stiffness: 200, damping: 40 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  /* ── auto-rotate ── */
  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(goNext, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [goNext]);

  const slide = slides[activeIndex];


  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full bg-[#00205B] p-8 md:p-12 flex flex-col justify-between absolute inset-0 overflow-hidden group select-none"
    >
      {/* 
        ========================================================
        SCATTERED TRIANGLES (Accents)
        ======================================================== 
      */}
      <motion.div 
        className="absolute top-[-20%] right-[-10%] w-[120%] h-[120%] opacity-[0.08] mix-blend-screen pointer-events-none"
        style={{
          x: useTransform(mx, [-1, 1], [80, -80]),
          y: useTransform(my, [-1, 1], [60, -60]),
          rotate: 15,
        }}
      >
        <Image src="/Triangle-bg.png" alt="" fill className="object-contain" priority />
      </motion.div>

      <motion.div 
        className="absolute bottom-[-30%] left-[50%] w-[80%] h-[80%] opacity-[0.2] mix-blend-screen pointer-events-none"
        style={{
          x: useTransform(mx, [-1, 1], [-100, 100]),
          y: useTransform(my, [-1, 1], [-80, 80]),
          rotate: -45,
        }}
      >
        <Image src="/Triangle-bg.png" alt="" fill className="object-contain" priority />
      </motion.div>

      {/* 
        ========================================================
        FOREGROUND TYPOGRAPHY — parallax + slide transition
        ======================================================== 
      */}
      <div className="relative z-10 w-full h-full pointer-events-none flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="flex flex-col w-fit">
              {slide.lines.map((line, i) => (
                <ParallaxLine key={i} line={line} mx={mx} my={my} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 
        ========================================================
        CONTACT + DOTS (Bottom)
        ======================================================== 
      */}
      <div
        className="relative z-20 mt-auto pointer-events-auto w-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + "-contact"}
            variants={contactVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <span className="text-xs md:text-sm font-light text-white/50 block">
              {slide.contactLabel}
            </span>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-12 w-full border-t border-white/10 pt-4 mt-3">
              {slide.contacts.map((c) => (
                <a
                  key={c.name}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col w-fit group/contact"
                >
                  <span className="text-lg md:text-xl font-light text-white/90 group-hover/contact:text-amber-300 transition-colors tracking-tight">
                    Hubungi {c.name}
                  </span>
                  <span className="text-xs md:text-sm font-light text-white/50 group-hover/contact:text-white/80 transition-colors tracking-wider mt-0.5">
                    {c.phone}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="flex items-center gap-2 mt-5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === activeIndex
                  ? "w-8 bg-amber-300"
                  : "w-3 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
