/* eslint-disable */
"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useLiteMotion } from "@/hooks/use-lite-motion";

type TimelineTabId = "seminar" | "mechatura" | "essay";

type GrandTimelineItem = {
  category: string;
  event: string;
  date: string;
  description: string;
  location?: string;
};

const timelineTabs = [
  {
    id: "seminar",
    label: "Seminar Nasional",
    items: [
      {
        category: "Seminar Nasional",
        event: "Mulai Registrasi",
        date: "21 September 2026",
        description: "Periode registrasi peserta Seminar Nasional Futura.",
        location: "Online/Daring",
      },
      {
        category: "Seminar Nasional",
        event: "Akhir Registrasi",
        date: "21 Oktober 2026",
        description: "Akhir registrasi peserta Seminar Nasional Futura.",
        location: "Online/Daring",
      },
      {
        category: "Seminar Nasional",
        event: "Pelaksanaan",
        date: "28 November 2026",
        description: "Hari pelaksanaan Seminar Nasional Futura.",
        location: "Bale Rumawat Unpad Dipatiukur",
      },
      {
        category: "Seminar Nasional",
        event: "Pembagian Sertifikat",
        date: "1 Desember 2026",
        description: "Hari pembagian sertifikat Seminar Nasional Futura.",
        location: "Online/Daring",
      },
    ],
  },
  {
    id: "mechatura",
    label: "Mechatura",
    items: [
      {
        category: "Mechatura",
        event: "Registrasi Batch 1",
        date: "20 Juli - 31 Agustus 2026",
        description:
          "Mulai pendaftaran tim Mechatura dan pengumpulan data peserta.",
        location: "Online/Daring",
      },
      {
        category: "Mechatura",
        event: "Registrasi Batch 2",
        date: "1 September - 1 Oktober 2026",
        description:
          "Mulai pendaftaran tim Mechatura dan pengumpulan data peserta.",
        location: "Online/Daring",
      },
      {
        category: "Mechatura",
        event: "Technical Meeting",
        date: "TBA (To Be Announced)",
        description:
          "Sesi pengarahan teknis untuk peserta sebelum pelaksanaan lomba.",
        location: "Online/Daring",
      },
      {
        category: "Mechatura",
        event: "Pelaksanaan",
        date: "7 November 2026",
        description: "Hari pelaksanaan utama kompetisi robot Mechatura.",
        location: "Gd. PPBS Unpad Jatinangor",
      },
    ],
  },
  {
    id: "essay",
    label: "Lomba Esai",
    items: [
      {
        category: "Lomba Esai",
        event: "Registrasi & Pengumpulan",
        date: "21 September - 22 Oktober 2026",
        description:
          "Peserta melakukan registrasi sekaligus mengumpulkan naskah Esai.",
        location: "Online/Daring",
      },
      {
        category: "Lomba Esai",
        event: "Seleksi Naskah",
        date: "23 Oktober - 2 November 2026",
        description: "Tahap kurasi dan penilaian awal naskah Esai peserta.",
        location: "Oleh Panitia",
      },
      {
        category: "Lomba Esai",
        event: "Pengumuman Finalis",
        date: "4 November 2026",
        description: "Finalis Lomba Esai diumumkan secara resmi.",
        location: "By Email",
      },
      {
        category: "Lomba Esai",
        event: "Upload Video Presentasi Finalis",
        date: "5 - 12 November 2026",
        description:
          "Finalis mengunggah video presentasi sesuai ketentuan panitia.",
        location: "TBA (To be Announced)",
      },
      {
        category: "Lomba Esai",
        event: "Seleksi Finalis",
        date: "13 - 27 November 2026",
        description: "Penilaian final untuk menentukan pemenang Lomba Esai.",
        location: "Oleh Panitia",
      },
      {
        category: "Lomba Esai",
        event: "Pengumuman Juara",
        date: "28 November 2026",
        description: "Pengumuman dan apresiasi pemenang Lomba Esai.",
        location: "Bale Rumawat",
      },
    ],
  },
] satisfies Array<{
  id: TimelineTabId;
  label: string;
  items: GrandTimelineItem[];
}>;

const RevealText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  return (
    <span className={`inline-flex flex-wrap ${className || ""}`}>
      {text.split("").map((char, index) => (
        <span key={index} className="inline-flex overflow-hidden align-bottom">
          <motion.span
            variants={{
              hidden: { y: "110%" },
              visible: {
                y: "0%",
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              },
              exit: { opacity: 0, transition: { duration: 0.1 } },
            }}
            className="inline-block whitespace-pre"
          >
            {char}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

const RevealWords = ({ text, className }: { text: string; className?: string }) => {
  return (
    <span className={`inline-flex flex-wrap ${className || ""}`}>
      {text.split(" ").map((word, index) => (
        <span key={index} className="inline-flex overflow-hidden align-bottom mr-[0.25em]">
          <motion.span
            variants={{
              hidden: { y: "110%" },
              visible: { opacity: 1, y: "0%", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
              exit: { opacity: 0, transition: { duration: 0.1 } }
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

const ParallaxTimelineItem = ({ item, index, isLiteMotion }: { item: GrandTimelineItem, index: number, isLiteMotion: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "end 10%"],
  });

  // Original parallax values
  const yDate = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"]);
  const yEvent = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);
  const yDesc = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
  const yNumber = useTransform(scrollYProgress, [0, 1], ["60%", "-60%"]);

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [20, 0, -20]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.2, 1, 1, 0.2]);

  return (
    <motion.div
      ref={ref}
      style={!isLiteMotion ? { scale, opacity, rotateX, transformPerspective: 1200 } : {}}
      className="flex flex-col xl:flex-row w-full py-8 md:py-16 group relative z-10"
    >
      {/* 3D Background Number replacing the line and dot */}
      <motion.div
        style={!isLiteMotion ? { y: yNumber, opacity: opacity } : { opacity: 0.1 }}
        className="absolute top-0 right-0 md:right-auto md:left-[-5%] text-[8rem] md:text-[12rem] lg:text-[18rem] font-bold text-white/5 pointer-events-none select-none leading-none z-[-1]"
      >
        {String(index + 1).padStart(2, '0')}
      </motion.div>

      {/* Left Column of Timeline Item: Date */}
      <div className="w-full md:w-[35%] flex flex-col items-start mb-4 md:mb-0 relative z-20">
        <motion.div style={!isLiteMotion ? { y: yDate } : {}} className="w-full">
          <RevealText
            text={item.date}
            className="text-sm md:text-base font-bold text-amber-300 tracking-[-0.02em]"
          />
          {item.location && (
            <div className="mt-2 text-xs md:text-sm font-medium text-white/60 tracking-[-0.02em] flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              {item.location}
            </div>
          )}
        </motion.div>
      </div>

      {/* Right Column of Timeline Item: Title & Offset Description */}
      <div className="w-full md:w-[65%] flex flex-col relative z-30">
        <motion.div style={!isLiteMotion ? { y: yEvent } : {}} className="relative">
          <RevealText
            text={item.event}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.05em] leading-[1.05] text-white"
          />
        </motion.div>

        <motion.div style={!isLiteMotion ? { y: yDesc } : {}} className="mt-3 w-full max-w-md relative z-10">
          <RevealWords
            text={item.description}
            className="text-base md:text-lg lg:text-xl leading-relaxed text-white/80 tracking-[-0.04em] font-light"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export function RegistrationTimeline() {
  const [activeTab, setActiveTab] = useState<TimelineTabId>("seminar");
  const isLiteMotion = useLiteMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const selectedTab =
    timelineTabs.find((tab) => tab.id === activeTab) ?? timelineTabs[0];

  return (
    <section
      id="timeline"
      className="w-full bg-background relative overflow-clip py-10 md:py-16"
    >
      {/* Structural Perimeter Lines Removed */}

      <div className="mx-auto max-w-[100rem] px-5 sm:px-8 relative z-20 flex flex-col items-center">

        {/* Inner Constrained Wrapper mimicking Hero Section layout */}
        <div className="w-full flex flex-col md:flex-row relative">

          {/* Left Column (Sticky Title & Picker) */}
          <div className="w-full md:w-1/3 flex flex-col md:sticky md:top-32 h-fit pb-8 md:pb-0 relative z-30 pt-6 md:pt-16">
            {/* Section Title */}
            <div className="mb-2 md:mb-6 w-full">
              <h2 className="md:pl-12 lg:pl-16 text-4xl lg:text-5xl xl:text-6xl tracking-[-0.08em] font-semibold text-white">
                Timeline
              </h2>
            </div>

            {/* Abstract Picker: Floating Text */}
            <div className="w-full md:pl-12 lg:pl-16 flex flex-row md:flex-col flex-wrap gap-2 relative z-30">
              {timelineTabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-left text-base md:text-lg font-medium tracking-[-0.04em] transition-colors duration-500 ${isActive ? "text-amber-300" : "text-white hover:text-amber-200"
                      }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column (Timeline Content) */}
          <div className="w-full md:w-2/3 relative pt-10 md:pt-16" ref={containerRef}>
            {/* Persistent Structural Axis Removed (Now using floating 3D numbers) */}


            {/* Timeline */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTab.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: isLiteMotion ? 0 : 0.008 }
                  },
                  exit: {
                    opacity: 0,
                    transition: { duration: 0.2 }
                  }
                }}
                className="w-full flex flex-col"
              >
                {selectedTab.items.map((item, i) => (
                  <ParallaxTimelineItem key={i} item={item} index={i} isLiteMotion={isLiteMotion} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
