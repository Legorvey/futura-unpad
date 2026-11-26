"use client";

import Image from "next/image";

interface Pembicara {
  id: number;
  description: string;
  name: string;
  position: string;
  imageSrc: string;
}

interface PembicaraCardsProps {
  title: string;
  subtitle: string;
  pembicaras: Pembicara[];
}

export const PembicaraItem = ({ pembicara }: { pembicara: Pembicara }) => {
  return (
    <div className="relative flex flex-col items-center w-full gap-6 md:gap-8 group">
      {/* Static Wrapper */}
      <div className="relative w-full max-w-[320px] aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl z-0">
        <Image
          src={pembicara.imageSrc}
          alt={pembicara.name}
          fill
          sizes="(max-width: 768px) 320px, 320px"
          className="object-contain object-bottom grayscale transition-all duration-700 group-hover:grayscale-0"
        />
        {/* Very subtle overlay to blend with background */}
        <div className="absolute inset-0 bg-background/10 mix-blend-overlay pointer-events-none transition-opacity duration-500 group-hover:opacity-0" />
      </div>

      {/* Typography */}
      <div className="flex flex-col items-center text-center z-10 w-full px-4">
        <h4 className="text-sm md:text-base font-light tracking-tight text-white/40 mb-1">
          Pembicara
        </h4>
        <h3 className="text-3xl md:text-4xl font-medium tracking-[-0.05em] text-white leading-tight text-balance transition-colors duration-500 group-hover:text-amber-300">
          {pembicara.name}
        </h3>
        <p className="mt-2 text-base md:text-lg font-light tracking-tight text-white/60 text-balance">
          {pembicara.position}
        </p>
        
        {pembicara.description && (
          <p className="mt-4 text-sm md:text-base font-light tracking-tight text-white/40 leading-relaxed">
            {pembicara.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default function PembicaraCards({ title, subtitle, pembicaras }: PembicaraCardsProps) {
  return (
    <section className="w-full py-16 md:py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center">
        
        {/* Typography Header */}
        <div className="text-center mb-16 md:mb-24 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.05em] text-white leading-none">
            {title}
          </h2>
          <p className="mt-2 text-base md:text-lg font-light tracking-tight text-white/50 max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 w-full justify-items-center">
          {pembicaras.map((pembicara) => (
            <PembicaraItem key={pembicara.id} pembicara={pembicara} />
          ))}
        </div>
      </div>
    </section>
  );
}
