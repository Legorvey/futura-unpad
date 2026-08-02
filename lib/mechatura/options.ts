import type { MechaturaCompetitionType } from "@/lib/payment";

export const mechaturaCompetitionOptions = [
  {
    id: "sumo",
    title: "Robot Sumo",
    description:
      "Robot manual adu dorong di arena bundar. Wajib rakitan peserta sendiri (bukan kit pabrikan), sistem babak grup & play-off.",
  },
  {
    id: "transporter",
    title: "Robot Transporter",
    description:
      "Robot manual penguji kecepatan & ketepatan memindahkan objek (tanpa auto-mapping). 16 tim tercepat lolos ke babak gugur.",
  },
] as const satisfies readonly {
  id: MechaturaCompetitionType;
  title: string;
  description: string;
}[];

export const mechaturaCompetitionLabels = Object.fromEntries(
  mechaturaCompetitionOptions.map((option) => [option.id, option.title])
) as Record<MechaturaCompetitionType, string>;
