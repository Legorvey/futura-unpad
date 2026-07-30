"use client";

import { useRef } from "react";
import { motion, useTransform, useScroll } from "motion/react";
import Image from "next/image";

export interface ModeratorCardProps {
  id: number;
  name: string;
  imageSrc: string;
  job?: string;
  experience?: string;
  description?: string;
}

export const ModeratorItem = ({ moderator }: { moderator: ModeratorCardProps }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax inside the image container
  const yImage = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div 
      ref={ref} 
      className="relative flex flex-col items-center w-full gap-6 md:gap-8 group" 
    >
      {/* Static Wrapper */}
      <div 
        className="relative w-full max-w-[320px] aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl z-0"
      >
        <motion.div style={{ y: yImage, scale: 1.25 }} className="absolute inset-0 w-full h-full">
          <Image 
            src={moderator.imageSrc} 
            alt={moderator.name} 
            fill 
            className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0" 
          />
        </motion.div>
        <div className="absolute inset-0 bg-background/10 mix-blend-overlay pointer-events-none transition-opacity duration-500 group-hover:opacity-0" />
      </div>

      {/* Typography */}
      <div className="flex flex-col items-center text-center z-10 w-full px-4">
        <h4 className="text-sm md:text-base font-light tracking-tight text-white/40 mb-1">
          Moderator
        </h4>
        <h3 className="text-3xl md:text-4xl font-medium tracking-[-0.05em] text-white leading-tight transition-colors duration-500 group-hover:text-amber-300">
          {moderator.name}
        </h3>
        
        {moderator.job && (
          <p className="mt-2 text-base md:text-lg font-light tracking-tight text-white/60">
            {moderator.job}
          </p>
        )}
        
        {moderator.experience && (
          <p className="mt-1 text-sm md:text-base font-light tracking-tight text-white/40">
            {moderator.experience}
          </p>
        )}
        
        {moderator.description && (
          <p className="mt-6 text-sm md:text-base font-light tracking-tight text-white/40 italic leading-relaxed">
            {moderator.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default function ModeratorCards({ moderators }: { moderators: ModeratorCardProps[] }) {
  if (!moderators || moderators.length === 0) return null;

  return (
    <section className="w-full pb-16 md:pb-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center">
        <div className="flex flex-col items-center w-full gap-16">
          {moderators.map((moderator) => (
            <ModeratorItem key={moderator.id} moderator={moderator} />
          ))}
        </div>
      </div>
    </section>
  );
}