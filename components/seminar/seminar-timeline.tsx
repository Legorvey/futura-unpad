"use client";

import { Timeline } from "@/components/ui/timeline";

type SeminarTimelineItem = {
  category: string;
  event: string;
  date: string;
  description: string;
  status?: string;
};

const seminarTimelineStyles = {
  wrapper: "relative w-full overflow-clip bg-neutral-950",
  card:
    "rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-sm",
  category:
    "mb-4 inline-flex rounded-full border border-purple-300/30 bg-purple-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-purple-200",
  description: "text-sm leading-6 text-neutral-400",
  status:
    "mt-5 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300",
} as const;

const seminarTimelineItems: SeminarTimelineItem[] = [
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
    description: "Akhir registrasi peserta Seminar Nasional Futura.",
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
    date: "67 November 2026",
    description: "Hari pembagian sertifikat Seminar Nasional Futura.",
  },
];

const seminarTimelineData = seminarTimelineItems.map((item) => ({
  title: item.event,
  date: item.date,
  content: (
    <article className={seminarTimelineStyles.card}>
      <span className={seminarTimelineStyles.category}>{item.category}</span>
      <p className={seminarTimelineStyles.description}>{item.description}</p>
      {item.status && (
        <span className={seminarTimelineStyles.status}>{item.status}</span>
      )}
    </article>
  ),
}));

export function SeminarTimeline() {
  return (
    <section className={seminarTimelineStyles.wrapper}>
      <Timeline
        data={seminarTimelineData}
        title="Timeline Seminar Nasional"
        description="Timeline Seminar Nasional Futura, mulai dari pembukaan registrasi sampai hari pelaksanaan seminar."
      />
    </section>
  );
}
