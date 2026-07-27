"use client";

import { Timeline } from "@/components/ui/timeline";

type MechaturaTimelineItem = {
  category: string;
  event: string;
  date: string;
  description: string;
  status?: string;
};

const mechaturaTimelineStyles = {
  wrapper: "relative w-full overflow-clip bg-neutral-950",
  card:
    "rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-sm",
  category:
    "mb-4 inline-flex rounded-full border border-blue-300/30 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-blue-200",
  description: "text-sm leading-6 text-neutral-400",
  status:
    "mt-5 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300",
} as const;

const mechaturaTimelineItems: MechaturaTimelineItem[] = [
  {
    category: "Mechatura",
    event: "Pendaftaran Gelombang 1",
    date: "1 - 30 September 2026",
    description: "Periode pendaftaran awal kompetisi robotika Mechatura dengan biaya khusus.",
  },
  {
    category: "Mechatura",
    event: "Pendaftaran Gelombang 2",
    date: "1 - 31 Oktober 2026",
    description: "Periode pendaftaran reguler kompetisi robotika Mechatura.",
  },
  {
    category: "Mechatura",
    event: "Technical Meeting",
    date: "14 November 2026",
    description: "Pertemuan teknis membahas regulasi dan sistem pertandingan Mechatura.",
  },
  {
    category: "Mechatura",
    event: "Hari Pertandingan",
    date: "21 - 22 November 2026",
    description: "Pelaksanaan kompetisi Robot Sumo dan Robot Transporter.",
  },
];

const mechaturaTimelineData = mechaturaTimelineItems.map((item) => ({
  title: item.event,
  date: item.date,
  content: (
    <article className={mechaturaTimelineStyles.card}>
      <span className={mechaturaTimelineStyles.category}>{item.category}</span>
      <p className={mechaturaTimelineStyles.description}>{item.description}</p>
      {item.status && (
        <span className={mechaturaTimelineStyles.status}>{item.status}</span>
      )}
    </article>
  ),
}));

export function MechaturaTimeline() {
  return (
    <section className={mechaturaTimelineStyles.wrapper}>
      <Timeline
        data={mechaturaTimelineData}
        title="Timeline Mechatura"
        description="Jadwal lengkap kompetisi robotika Mechatura, mulai dari pendaftaran hingga hari pertandingan."
      />
    </section>
  );
}
