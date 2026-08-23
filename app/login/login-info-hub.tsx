"use client";

import { useRef, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useSpring, useTransform } from "motion/react";

export default function LoginInfoHub() {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useSpring(0, { stiffness: 200, damping: 40 });
  const y = useSpring(0, { stiffness: 200, damping: 40 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize to range -1 to 1
    const xPct = (mouseX / width - 0.5) * 2;
    const yPct = (mouseY / height - 0.5) * 2;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

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
          x: useTransform(x, [-1, 1], [80, -80]),
          y: useTransform(y, [-1, 1], [60, -60]),
          rotate: 15,
        }}
      >
        <Image src="/Triangle-bg.png" alt="" fill className="object-contain" priority />
      </motion.div>

      <motion.div 
        className="absolute bottom-[-30%] left-[50%] w-[80%] h-[80%] opacity-[0.2] mix-blend-screen pointer-events-none"
        style={{
          x: useTransform(x, [-1, 1], [-100, 100]),
          y: useTransform(y, [-1, 1], [-80, 80]),
          rotate: -45,
        }}
      >
        <Image src="/Triangle-bg.png" alt="" fill className="object-contain" priority />
      </motion.div>


      {/* 
        ========================================================
        FOREGROUND TYPOGRAPHY (Structured & Readable)
        ======================================================== 
      */}
      <div className="relative z-10 w-full h-full pointer-events-none flex flex-col justify-center items-center">
        
        <div className="flex flex-col w-fit">
          <motion.div 
            className="text-5xl md:text-7xl lg:text-[3.5rem] xl:text-[5rem] 2xl:text-[6.5rem] font-black text-white tracking-tighter uppercase drop-shadow-xl whitespace-nowrap"
            style={{
              x: useTransform(x, [-1, 1], [-15, 15]),
              y: useTransform(y, [-1, 1], [-15, 15]),
            }}
          >
            Mechatura
          </motion.div>

          <motion.div 
            className="text-4xl md:text-6xl lg:text-[2.75rem] xl:text-[4rem] 2xl:text-[5.5rem] font-black text-white/90 tracking-widest uppercase italic drop-shadow-lg ml-8 lg:ml-8 xl:ml-16 2xl:ml-24 mt-[-2px] xl:mt-[-5px] 2xl:mt-[-10px] whitespace-nowrap"
            style={{
              x: useTransform(x, [-1, 1], [-25, 25]),
              y: useTransform(y, [-1, 1], [-20, 20]),
            }}
          >
            Registration
          </motion.div>

          <motion.div 
            className="text-3xl md:text-5xl lg:text-3xl xl:text-5xl 2xl:text-6xl font-light text-white/80 tracking-[0.2em] xl:tracking-[0.3em] 2xl:tracking-[0.4em] uppercase drop-shadow-md mt-2 xl:mt-4 2xl:mt-6 ml-12 lg:ml-16 xl:ml-28 2xl:ml-40 whitespace-nowrap"
            style={{
              x: useTransform(x, [-1, 1], [-35, 35]),
              y: useTransform(y, [-1, 1], [-25, 25]),
            }}
          >
            Is
          </motion.div>

          <motion.div 
            className="text-[4.5rem] md:text-[6.5rem] lg:text-[4.5rem] xl:text-[7rem] 2xl:text-[9rem] font-black text-white tracking-tighter uppercase leading-none drop-shadow-2xl mt-[-2px] xl:mt-[-10px] 2xl:mt-[-15px] -ml-2 lg:-ml-4 xl:-ml-8 2xl:-ml-10 whitespace-nowrap"
            style={{
              x: useTransform(x, [-1, 1], [-45, 45]),
              y: useTransform(y, [-1, 1], [-30, 30]),
            }}
          >
            Opened.
          </motion.div>
        </div>
      </div>

      {/* 
        ========================================================
        ACTION BUTTON (Bottom Base)
        ======================================================== 
      */}
      <motion.div 
         className="relative z-20 mt-auto pointer-events-auto w-full"
         style={{
           x: useTransform(x, [-1, 1], [-10, 10]),
           y: useTransform(y, [-1, 1], [-10, 10]),
         }}
      >
        <span className="text-xs md:text-sm font-light text-white/50 block">Narahubung Pendaftaran Mechatura</span>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-12 w-full border-t border-white/10 pt-4 mt-3">
          <a 
            href="https://wa.me/6289529846686" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col w-fit group/contact"
          >
            <span className="text-lg md:text-xl font-light text-white/90 group-hover/contact:text-amber-300 transition-colors tracking-tight">
              Hubungi Adam
            </span>
            <span className="text-xs md:text-sm font-light text-white/50 group-hover/contact:text-white/80 transition-colors tracking-wider mt-0.5">
              0895-2984-6686
            </span>
          </a>

          <a 
            href="https://wa.me/6285711735270" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col w-fit group/contact"
          >
            <span className="text-lg md:text-xl font-light text-white/90 group-hover/contact:text-amber-300 transition-colors tracking-tight">
              Hubungi Raisa
            </span>
            <span className="text-xs md:text-sm font-light text-white/50 group-hover/contact:text-white/80 transition-colors tracking-wider mt-0.5">
              0857-1173-5270
            </span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
