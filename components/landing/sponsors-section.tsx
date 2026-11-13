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

// All official sponsors housed in sleek white rectangle cards
export const sponsorsList: SponsorLogo[] = [
  {
    name: "PT United Tractors Tbk",
    logo: "/sponsors/logo-united-tractors.png",
    aspect: "w-36 sm:w-48 h-10 sm:h-12",
    website: "https://www.unitedtractors.com",
    isPrincipal: true,
  },
  {
    name: "Kemendikbudristek",
    logo: "/sponsors/LogoTutWuriHandayani.svg",
    aspect: "w-12 sm:w-16 h-12 sm:h-16",
    isSvg: true,
  },
  {
    name: "Pusat Prestasi Nasional",
    logo: "/sponsors/logo-puspresnas.png",
    aspect: "w-32 sm:w-40 h-10 sm:h-12",
  },
  {
    name: "Persatuan Robotika Seluruh Indonesia",
    logo: "/sponsors/LogoPRSI.png",
    aspect: "w-12 sm:w-16 h-12 sm:h-16",
  },
  {
    name: "T-REX Robotic",
    logo: "/sponsors/logo-trex-robotic-transparent.png",
    aspect: "w-12 sm:w-16 h-12 sm:h-16",
  },
  {
    name: "T-REX Robotic (ERIC)",
    logo: "/sponsors/logo-trex-robotic-eric-transparent.png",
    aspect: "w-12 sm:w-16 h-12 sm:h-16",
  },
];

export default function SponsorsSection() {
  // Quadruple the list (2 equal halves of 12 items) for seamless infinite looping across all screen sizes
  const loopList = [
    ...sponsorsList,
    ...sponsorsList,
    ...sponsorsList,
    ...sponsorsList,
  ];

  return (
    <div
      id="sponsors"
      className="relative w-full overflow-visible py-4 sm:py-6"
      role="region"
      aria-label="Official Futura Sponsors"
    >
      {/* Framer Motion Infinite Auto-Sliding Track of White Rectangle Cards (without labels or pills) */}
      <motion.div
        className="flex items-center gap-5 sm:gap-7 w-max cursor-grab active:cursor-grabbing hover:[animation-play-state:paused]"
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

          const card = (
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4.5 rounded-2xl bg-white shadow-lg min-w-[180px] sm:min-w-[220px] md:min-w-[240px] h-20 sm:h-24 transition-colors duration-300 hover:shadow-2xl shrink-0 ${
                sponsor.isPrincipal
                  ? "border-2 border-amber-400/90 shadow-[0_0_25px_rgba(251,191,36,0.35)] ring-1 ring-amber-400/60"
                  : "border border-white/20"
              }`}
            >
              <div className={`relative ${sponsor.aspect} flex items-center justify-center`}>
                <Image
                  src={sponsor.logo}
                  alt={isFirstHalf ? sponsor.name : ""}
                  width={240}
                  height={80}
                  className="max-h-full max-w-full object-contain"
                  unoptimized={sponsor.isSvg}
                />
              </div>
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
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl shrink-0"
            >
              {card}
            </Link>
          ) : (
            <div
              key={keyId}
              aria-hidden={isFirstHalf ? undefined : true}
              className="shrink-0"
            >
              {card}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
