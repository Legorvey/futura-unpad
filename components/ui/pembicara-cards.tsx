/* eslint-disable */
import { motion } from "framer-motion";
import Image from "next/image";

// TypeScript interface for a single pembicara object
interface Pembicara {
  id: number;
  quote: string;
  name: string;
  position: string;
  imageSrc: string;
}

// TypeScript interface for the component's props
interface PembicaraCardsProps {
  title: string;
  subtitle: string;
  pembicaras: Pembicara[];
}

/**
 * A responsive section component to display pembicara cards.
 * It features a title, subtitle, and a grid of animated pembicara cards.
 */
export default function PembicaraCards({ title, subtitle, pembicaras }: PembicaraCardsProps) {
  // Animation variants for the container to orchestrate staggered children animations
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Animation variants for each pembicara card
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="w-full bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl text-center">
        {/* Section Header */}
        <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-6xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {subtitle}
        </p>

        {/* Pembicara Grid */}
        <motion.div
          className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {pembicaras.map((pembicara) => (
            <motion.div
              key={pembicara.id}
              className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-xl bg-card shadow-sm"
            >
              {/* Image as background */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={pembicara.imageSrc}
                  alt={pembicara.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient overlay for text readability (always present) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:opacity-80" />
                {/* Very dim solid background that fades in on hover (Desktop only) */}
                <div className="absolute inset-0 bg-black/80 opacity-0 transition-opacity duration-500 md:group-hover:opacity-100" />
              </div>

              {/* Content within the card */}
              <div className="relative z-10 flex flex-1 flex-col p-6">
                {/* 
                  Name and Role Layer
                  On mobile: positioned at bottom (mt-auto pushes it down).
                  On desktop: positioned at bottom, fades out and slides up on hover.
                */}
                <div className="mt-auto flex flex-col text-left font-semibold transition-all duration-500 ease-out md:group-hover:-translate-y-4 md:group-hover:opacity-0">
                  <p className="text-2xl tracking-tight text-white sm:text-3xl">
                    {pembicara.name}
                  </p>
                  <span className="text-base text-white/70 sm:text-lg">
                    {pembicara.position}
                  </span>
                </div>

                {/* 
                  Experience Layer
                  On mobile: flows naturally below the name, expanding the card height if needed.
                  On desktop: absolutely positioned to fill the card, safely centered, fades in on hover.
                */}
                <div className="pointer-events-auto mt-4 flex flex-col opacity-100 transition-all duration-500 ease-out md:pointer-events-none md:absolute md:inset-0 md:mt-0 md:-translate-y-4 md:overflow-y-auto md:p-8 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100">
                  <p className="text-left text-sm leading-relaxed text-white/90 md:mb-auto md:mt-auto md:text-base">
                    {pembicara.quote}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
