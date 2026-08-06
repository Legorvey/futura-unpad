"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const scopes = [
  {
    number: "01",
    title: "Green & Renewable Energy",
    description:
      "Kita akan membahas bagaimana inovasi energi ramah lingkungan bisa dioptimalkan, serta langkah nyata apa saja untuk menciptakan masa depan yang lebih hijau.",
    className: "col-span-1 lg:col-span-2",
  },
  {
    number: "02",
    title: "Internet of Things",
    description:
      "Bayangkan jika semua perangkat di sekitarmu bisa saling terhubung. Kita akan mengupas bagaimana ekosistem cerdas ini bekerja dan mempermudah kehidupan kita.",
    className: "col-span-1",
  },
  {
    number: "03",
    title: "Telekomunikasi",
    description:
      "Koneksi yang cepat dan andal kini menjadi kebutuhan utama. Di sesi ini, kita akan mengeksplorasi teknologi jaringan masa depan yang membuat kita semakin terhubung.",
    className: "col-span-1",
  },
  {
    number: "04",
    title: "Sistem Informasi",
    description:
      "Data memegang peran penting di era digital. Kita akan belajar bagaimana sebuah sistem dapat mengolah data menjadi informasi berharga untuk mengambil keputusan yang tepat.",
    className: "col-span-1 lg:col-span-2",
  },
];

function ScopeCard({
  scope,
}: {
  scope: (typeof scopes)[number];
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden p-8 sm:p-10 md:p-12 flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-black/50 min-h-[260px] md:min-h-[300px]",
        scope.className
      )}
    >
      {/* Top Border Glow Accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isHovered
            ? `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.06), transparent 75%)`
            : "none",
        }}
      />

      {/* Background Watermark Number (Matches SeminarTimeline style) */}
      <span className="absolute right-6 bottom-2 text-7xl sm:text-8xl md:text-9xl font-bold select-none pointer-events-none leading-none tracking-tight text-white/5 transition-all duration-500 group-hover:scale-105 group-hover:text-white/10">
        {scope.number}
      </span>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.05em] text-white leading-tight text-balance mb-4 transition-colors duration-300 group-hover:text-amber-300">
          {scope.title}
        </h3>
        <p className="text-base sm:text-lg text-white/70 leading-relaxed font-light text-balance max-w-xl">
          {scope.description}
        </p>
      </div>
    </motion.div>
  );
}

export function RuangLingkup() {
  return (
    <section className="w-full max-w-[100rem] mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-24 relative overflow-hidden">
      {/* Section Header */}
      <div className="mb-14 md:mb-20 text-center flex flex-col items-center">
        <h2 className="text-[3rem] sm:text-[4rem] md:text-[5rem] font-bold tracking-[-0.08em] text-white text-center text-balance leading-tight">
          Apa Saja yang Akan Dibahas?
        </h2>
        <p className="mt-2 text-lg md:text-xl text-foreground/60 leading-relaxed max-w-2xl text-center text-balance">
          Seminar ini akan membawa kamu mengeksplorasi berbagai inovasi yang sedang mengubah dunia. Berikut adalah beberapa topik seru yang akan kita kupas tuntas!
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {scopes.map((scope) => (
          <ScopeCard key={scope.number} scope={scope} />
        ))}
      </div>
    </section>
  );
}
