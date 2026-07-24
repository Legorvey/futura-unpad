/* eslint-disable */
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Timeline } from "@/components/ui/timeline";
import { useLiteMotion } from "@/hooks/use-lite-motion";

type TimelineTabId = "seminar" | "mechatura" | "esai";

type GrandTimelineItem = {
  category: string;
  event: string;
  date: string;
  description: string;
  status?: string;
};

const grandTimelineStyles = {
  wrapper: "relative w-full overflow-clip",
  tabsShell: "md:px-10 md:flex",
  tabsWrap: "mx-auto max-w-[82rem] px-4 pb-6 md:px-0 md:pb-8",
  tabsList:
    "grid w-full grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm sm:inline-flex sm:w-auto sm:max-w-full sm:flex-wrap sm:gap-2 sm:rounded-full",
  tab:
    "relative min-w-0 rounded-xl px-2 py-2 text-center text-[0.72rem] font-medium leading-tight transition-colors duration-300 sm:rounded-full sm:px-4 sm:text-sm",
  tabActive: "text-white",
  tabInactive: "text-neutral-400 hover:text-white",
  activeTabPill:
    "absolute inset-0 rounded-[inherit] bg-blue-500",
  activeTabPillLite: "absolute inset-0 rounded-[inherit]",
  tabLabel: "relative z-10 block sm:inline",
  card:
    "rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-sm",
  category:
    "mb-4 inline-flex rounded-full border border-purple-300/30 bg-purple-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-purple-200",
  description: "text-sm leading-6 text-neutral-400",
  status:
    "mt-5 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300",
} as const;

const grandTimelineMotion = {
  tabPill: {
    type: "spring",
    stiffness: 420,
    damping: 34,
    mass: 0.7,
  },
  switch: {
    duration: 0.45,
    ease: [0.16, 1, 0.3, 1],
  },
  blur: "14px",
  offsetY: 18,
} as const;

const grandTimelineCopy = {
  titleSuffix: "Timeline",
} as const;

const timelineTabs = [
  {
    id: "seminar",
    label: "Seminar Nasional",
    description:
      "Timeline Seminar Nasional Futura 2026, mulai dari pembukaan registrasi sampai hari pelaksanaan seminar.",
    items: [
      {
        category: "Seminar Nasional",
        event: "Mulai Registrasi",
        date: "21 September 2026",
        description: "Periode registrasi peserta Seminar Nasional Futura.",
      },
      {
        category: "Seminar Nasional",
        event: "Akhir Registrasi",
        date: "21 Oktober 2026",
        description: "Akhir registrasi peserta Seminar Nasional Futura",
      },
      {
        category: "Seminar Nasional",
        event: "Pelaksanaan",
        date: "21 November 2026",
        description: "Hari pelaksanaan Seminar Nasional Futura.",
      },
      {
        category: "Seminar Nasional",
        event: "Pembagian Sertifikat",
        date: "1 Desember 2026",
        description: "Hari pembagian sertifikat Seminar Nasional Futura.",
      },
    ],
  },
  {
    id: "mechatura",
    label: "Mechatura",
    description:
      "Timeline Kompetisi Mechatura Futura 2026, mulai dari registrasi tim, pengarahan teknis, sampai hari pelaksanaan lomba robot.",
    items: [
      {
        category: "Mechatura",
        event: "Registrasi Batch 1",
        date: "20 Juli - 31 Agustus 2026",
        description:
          "Mulai pendaftaran tim Mechatura dan pengumpulan data peserta.",
      },
      {
        category: "Mechatura",
        event: "Registrasi Batch 2",
        date: "1 September - 1 Oktober 2026",
        description:
          "Mulai pendaftaran tim Mechatura dan pengumpulan data peserta.",
      },
      {
        category: "Mechatura",
        event: "Technical Meeting",
        date: "Akan Diumumkan",
        description:
          "Sesi pengarahan teknis untuk peserta sebelum pelaksanaan lomba.",
        status: "Akan Diumumkan",
      },
      {
        category: "Mechatura",
        event: "Pelaksanaan",
        date: "7 November 2026",
        description: "Hari pelaksanaan utama kompetisi robot Mechatura.",
      },
    ],
  },
  {
    id: "esai",
    label: "Lomba Esai",
    description:
      "Timeline Lomba Esai Futura, mulai dari registrasi & pengumpulan, seleksi naskah, pengumuman finalis, dan diakhiri dengan awarding.",
    items: [
      {
        category: "Lomba Esai",
        event: "Registrasi & Pengumpulan",
        date: "21 September - 22 Oktober 2026",
        description:
          "Peserta melakukan registrasi sekaligus mengumpulkan naskah esai",
      },
      {
        category: "Lomba Esai",
        event: "Seleksi Naskah",
        date: "23 Oktober - 2 November 2026",
        description: "Tahap kurasi dan penilaian awal naskah esai peserta.",
      },
      {
        category: "Lomba Esai",
        event: "Pengumuman Finalis",
        date: "4 November 2026",
        description: "Finalis Lomba Esai diumumkan secara resmi.",
      },
      {
        category: "Lomba Esai",
        event: "Upload Video Presentasi Finalis",
        date: "5 - 12 November 2026",
        description:
          "Finalis mengunggah video presentasi sesuai ketentuan panitia.",
      },
      {
        category: "Lomba Esai",
        event: "Seleksi Finalis",
        date: "13 - 27 November 2026",
        description: "Penilaian final untuk menentukan pemenang Lomba Esai.",
      },
      {
        category: "Lomba Esai",
        event: "Awarding",
        date: "28 November 2026",
        description: "Pengumuman dan apresiasi pemenang Lomba Esai.",
      },
    ],
  },
] satisfies Array<{
  id: TimelineTabId;
  label: string;
  description: string;
  items: GrandTimelineItem[];
}>;

const buildTimelineData = (items: GrandTimelineItem[]) =>
  items.map((item) => ({
    title: item.event,
    date: item.date,
    content: (
      <article className={grandTimelineStyles.card}>
        <span className={grandTimelineStyles.category}>{item.category}</span>
        <p className={grandTimelineStyles.description}>{item.description}</p>
        {item.status && (
          <span className={grandTimelineStyles.status}>{item.status}</span>
        )}
      </article>
    ),
  }));

export function RegistrationTimeline() {
  const [activeTab, setActiveTab] = useState<TimelineTabId>("seminar");
  const isLiteMotion = useLiteMotion();
  const selectedTab =
    timelineTabs.find((tab) => tab.id === activeTab) ?? timelineTabs[0];
  const tabPillMotion = isLiteMotion
    ? { duration: 0.18, ease: "easeOut" as const }
    : grandTimelineMotion.tabPill;
  const switchMotion = isLiteMotion
    ? { duration: 0.2, ease: "easeOut" as const }
    : grandTimelineMotion.switch;
  const switchBlur = isLiteMotion ? "0px" : grandTimelineMotion.blur;
  const switchOffsetY = isLiteMotion ? 6 : grandTimelineMotion.offsetY;

  return (
    <div id="timeline" className={grandTimelineStyles.wrapper}>
      <div className={grandTimelineStyles.tabsShell}>
        <div className={grandTimelineStyles.tabsWrap}>
          <div className={grandTimelineStyles.tabsList} role="tablist">
            {timelineTabs.map((tab) => {
              const isActive = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${grandTimelineStyles.tab} ${isActive
                    ? grandTimelineStyles.tabActive
                    : grandTimelineStyles.tabInactive
                    }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="grand-timeline-active-tab"
                      transition={tabPillMotion}
                      className={
                        isLiteMotion
                          ? grandTimelineStyles.activeTabPillLite
                          : grandTimelineStyles.activeTabPill
                      }
                    />
                  )}
                  <span className={grandTimelineStyles.tabLabel}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={selectedTab.id}
          initial={{
            opacity: 0,
            y: switchOffsetY,
            filter: `blur(${switchBlur})`,
          }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{
            opacity: 0,
            y: -switchOffsetY,
            filter: `blur(${switchBlur})`,
          }}
          transition={switchMotion}
        >
          <Timeline
            data={buildTimelineData(selectedTab.items)}
            title={`${selectedTab.label} ${grandTimelineCopy.titleSuffix}`}
            description={selectedTab.description}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

