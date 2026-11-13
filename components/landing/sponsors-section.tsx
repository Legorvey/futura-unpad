"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

type SponsorLogo = {
  name: string;
  logo: string;
  aspect: string;
  website?: string;
  isPrincipal?: boolean;
  isSvg?: boolean;
};

// High-impact sponsors with 100% transparent backgrounds (no baked white boxes or backgrounds)
export const sponsorsList: SponsorLogo[] = [
  {
    name: "PT United Tractors Tbk",
    logo: "/sponsors/logo-united-tractors-white.png",
    aspect: "w-48 sm:w-64 md:w-80 h-14 sm:h-18 md:h-22",
    website: "https://www.unitedtractors.com",
    isPrincipal: true,
  },
  {
    name: "Kemendikbudristek",
    logo: "/sponsors/LogoTutWuriHandayani.svg",
    aspect: "w-16 sm:w-22 md:w-28 h-16 sm:h-22 md:h-28",
    isSvg: true,
  },
  {
    name: "Pusat Prestasi Nasional",
    logo: "/sponsors/logo-puspresnas.png",
    aspect: "w-40 sm:w-52 md:w-64 h-14 sm:h-18 md:h-22",
  },
  {
    name: "Persatuan Robotika Seluruh Indonesia",
    logo: "/sponsors/LogoPRSI.png",
    aspect: "w-16 sm:w-22 md:w-28 h-16 sm:h-22 md:h-28",
  },
];

export default function SponsorsSection() {
  // Quadruple the list (2 equal halves of 8 items) for seamless infinite looping across all screen sizes
  const loopList = [
    ...sponsorsList,
    ...sponsorsList,
    ...sponsorsList,
    ...sponsorsList,
  ];

  return (
    <div
      id="sponsors"
      className="relative w-full overflow-visible py-6 sm:py-8"
      role="region"
      aria-label="Official Futura Sponsors"
    >
      {/* Framer Motion Infinite Auto-Sliding Track (pure logo images without white backgrounds, cards, labels, or pills) */}
      <motion.div
        className="flex items-center gap-12 sm:gap-20 md:gap-28 w-max cursor-grab active:cursor-grabbing hover:[animation-play-state:paused]"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 28,
            ease: "linear",
          },
        }}
      >
        {loopList.map((sponsor, idx) => {
          const isFirstHalf = idx < loopList.length / 2;
          const keyId = `sponsor-logo-${sponsor.name}-${idx}`;

          const logoImage = (
            <motion.div
              whileHover={{ scale: 1.12, y: -4 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`relative ${sponsor.aspect} flex items-center justify-center shrink-0 ${
                sponsor.isPrincipal
                  ? "filter drop-shadow-[0_0_24px_rgba(251,191,36,0.7)] hover:drop-shadow-[0_0_36px_rgba(251,191,36,1)]"
                  : "filter drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] opacity-90 hover:opacity-100 transition-opacity"
              }`}
            >
              <Image
                src={sponsor.logo}
                alt={isFirstHalf ? sponsor.name : ""}
                width={360}
                height={120}
                className="max-h-full max-w-full object-contain"
                unoptimized={sponsor.isSvg}
              />
            </motion.div>
          );

          return sponsor.website ? (
            <Link
              key={keyId}
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={isFirstHalf ? `Official site: ${sponsor.name}` : undefined}
              tabIndex={isFirstHalf ? 0 : -1}
              aria-hidden={isFirstHalf ? undefined : true}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl shrink-0"
            >
              {logoImage}
            </Link>
          ) : (
            <div
              key={keyId}
              aria-hidden={isFirstHalf ? undefined : true}
              className="shrink-0"
            >
              {logoImage}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
