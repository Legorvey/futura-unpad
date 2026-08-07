import type { MechaturaCompetitionType } from "@/lib/payment";

export const MECHATURA_DOCUMENTS = {
  booklet: {
    title: "Booklet Mechatura 2026",
    shortTitle: "Booklet Resmi",
    url: "https://drive.google.com/file/d/1ZrAl8yhVDBqf2Yo4GCoYwWAz-kv7-Zyo/view?usp=sharing",
    description: "Panduan umum, jadwal, alur pendaftaran, dan ketentuan lomba.",
  },
  juklakSumo: {
    title: "Juklak Robot Sumo",
    shortTitle: "Juklak Robot Sumo",
    url: "https://drive.google.com/file/d/1Zz5PUCJeUzT4mAvQmtyfP6tVSQFobZ3B/view?usp=sharing",
    description: "Regulasi arena, dimensi robot, sistem pertandingan, dan teknis Sumo.",
  },
  juklakTransporter: {
    title: "Juklak Robot Transporter",
    shortTitle: "Juklak Robot Transporter",
    url: "https://drive.google.com/file/d/1krsXNkqPjHsvQmkj9DoSleJ1S-MQD2is/view?usp=sharing",
    description: "Regulasi lintasan, spesifikasi teknis, mekanisme poin & waktu Transporter.",
  },
} as const;

export const mechaturaCompetitionOptions = [
  {
    id: "sumo",
    title: "Robot Sumo",
    description:
      "Robot manual adu dorong di arena bundar. Wajib rakitan peserta sendiri (bukan kit pabrikan), sistem babak grup & play-off.",
    juklakUrl: MECHATURA_DOCUMENTS.juklakSumo.url,
  },
  {
    id: "transporter",
    title: "Robot Transporter",
    description:
      "Robot manual penguji kecepatan & ketepatan memindahkan objek (tanpa auto-mapping). 16 tim tercepat lolos ke babak gugur.",
    juklakUrl: MECHATURA_DOCUMENTS.juklakTransporter.url,
  },
] as const satisfies readonly {
  id: MechaturaCompetitionType;
  title: string;
  description: string;
  juklakUrl: string;
}[];

export const mechaturaCompetitionLabels = Object.fromEntries(
  mechaturaCompetitionOptions.map((option) => [option.id, option.title])
) as Record<MechaturaCompetitionType, string>;

