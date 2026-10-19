import type { MechaturaCompetitionType } from "@/lib/payment";

const juknisSumoDoc = {
  title: "Juknis Robot Sumo",
  shortTitle: "Juknis Robot Sumo",
  url: "https://drive.google.com/file/d/1Zz5PUCJeUzT4mAvQmtyfP6tVSQFobZ3B/view?usp=sharing",
  description: "Regulasi arena, dimensi robot, sistem pertandingan, dan teknis Sumo.",
};

const juknisTransporterDoc = {
  title: "Juknis Robot Transporter",
  shortTitle: "Juknis Robot Transporter",
  url: "https://drive.google.com/file/d/1uPokIED16frMM7HlFlWoTrzti-tcnUh3/view?usp=sharing",
  description: "Regulasi lintasan, spesifikasi teknis, mekanisme poin & waktu Transporter.",
};

export const MECHATURA_DOCUMENTS = {
  booklet: {
    title: "Booklet Mechatura 2026",
    shortTitle: "Booklet Resmi",
    url: "https://drive.google.com/file/d/1ZrAl8yhVDBqf2Yo4GCoYwWAz-kv7-Zyo/view?usp=sharing",
    description: "Panduan umum, jadwal, alur pendaftaran, dan ketentuan lomba.",
  },
  juknisSumo: juknisSumoDoc,
  juknisTransporter: juknisTransporterDoc,
  juklakSumo: juknisSumoDoc,
  juklakTransporter: juknisTransporterDoc,
} as const;

export const mechaturaCompetitionOptions = [
  {
    id: "sumo",
    title: "Robot Sumo",
    description:
      "Robot manual adu dorong di arena bundar. Wajib rakitan peserta sendiri (bukan kit pabrikan), sistem babak grup & play-off.",
    juknisUrl: MECHATURA_DOCUMENTS.juknisSumo.url,
    juklakUrl: MECHATURA_DOCUMENTS.juknisSumo.url,
  },
  {
    id: "transporter",
    title: "Robot Transporter",
    description:
      "Robot manual penguji kecepatan & ketepatan memindahkan objek (tanpa auto-mapping). 16 tim tercepat lolos ke babak gugur.",
    juknisUrl: MECHATURA_DOCUMENTS.juknisTransporter.url,
    juklakUrl: MECHATURA_DOCUMENTS.juknisTransporter.url,
  },
] as const satisfies readonly {
  id: MechaturaCompetitionType;
  title: string;
  description: string;
  juknisUrl: string;
  juklakUrl: string;
}[];

export const mechaturaCompetitionLabels = Object.fromEntries(
  mechaturaCompetitionOptions.map((option) => [option.id, option.title])
) as Record<MechaturaCompetitionType, string>;

