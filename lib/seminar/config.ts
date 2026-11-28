export const SEMINAR_EVENT_DATE_ISO = "2026-11-28T07:30:00+07:00";
export const SEMINAR_EVENT_DATE_LABEL = "28 November 2026";
export const SEMINAR_EVENT_TIME_LABEL = "07.30 WIB";

// Registration opened 21 November 2026 00:00 WIB and closes 28 November 2026 23:59:59 WIB.
// Public-facing deadline copy consistently displays 28 November 2026, 23.59 WIB.
export const SEMINAR_REG_START_ISO = "2026-11-21T00:00:00+07:00";
export const SEMINAR_REG_CLOSE_ISO = "2026-11-28T23:59:59+07:00";
export const SEMINAR_REG_START_LABEL = "21 November 2026";
export const SEMINAR_REG_DISPLAY_END_LABEL = "28 November 2026, 23.59 WIB";
export const SEMINAR_REG_BANNER_TEXT =
  "Registration for Semnas is Opened Until 28 November, 23.59 WIB!";

export function hasSeminarRegistrationStarted(now: Date = new Date()): boolean {
  return now.getTime() >= new Date(SEMINAR_REG_START_ISO).getTime();
}

export function isSeminarRegistrationOpen(now: Date = new Date()): boolean {
  const timestamp = now.getTime();
  return (
    timestamp >= new Date(SEMINAR_REG_START_ISO).getTime() &&
    timestamp < new Date(SEMINAR_REG_CLOSE_ISO).getTime()
  );
}

export function isSeminarEventOngoing(now: Date = new Date()): boolean {
  const timestamp = now.getTime();
  return (
    timestamp >= new Date(SEMINAR_EVENT_DATE_ISO).getTime() &&
    timestamp < new Date(SEMINAR_REG_CLOSE_ISO).getTime()
  );
}

export const SEMINAR_LOCATION_NAME =
  "Bale Rumawat, Universitas Padjadjaran (Kampus Dipati Ukur)";
export const SEMINAR_LOCATION_FULL =
  "Bale Rumawat, Universitas Padjadjaran (Kampus Dipati Ukur)";
export const SEMINAR_LOCATION_ADDRESS =
  "Jl. Dipati Ukur No. 35, Lebakgede, Coblong, Kota Bandung, Jawa Barat 40132";
export const SEMINAR_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Jl+Dipati+Ukur+No+35+Bandung";
export const SEMINAR_MAPS_EMBED_SRC =
  "https://www.google.com/maps?q=Bale+Rumawat+Universitas+Padjadjaran+Jl+Dipati+Ukur+No+35+Bandung&output=embed";

export const SEMINAR_WORKSHOP_TITLE = "Seminar & Workshop";
export const SEMINAR_FORUM_DESCRIPTION =
  "Seminar Nasional Futura adalah forum ilmiah yang mengkaji inovasi teknologi global. Acara ini menghadirkan akademisi, praktisi industri, asosiasi, dan perwakilan pemerintah untuk memaparkan tren teknologi terkini.";
export const SEMINAR_WORKSHOP_PRSI_DESCRIPTION =
  "Selain forum pemaparan gagasan, rangkaian kegiatan ini juga dilengkapi dengan sesi Workshop praktis bersama Persatuan Robotika Seluruh Indonesia (PRSI) yang dirancang untuk mengasah keterampilan teknis peserta secara langsung. Dipandu oleh para praktisi ahli dari PRSI, sesi ini berfokus pada implementasi teknologi robotika terapan guna membekali peserta dengan kompetensi yang relevan dengan kebutuhan industri masa depan.";
export const SEMINAR_WORKSHOP_DESCRIPTION = `${SEMINAR_FORUM_DESCRIPTION} ${SEMINAR_WORKSHOP_PRSI_DESCRIPTION}`;

export const SEMINAR_SPEAKERS = [
  {
    id: 1,
    name: "Erwan Setiawan, S.E",
    position: "Wakil Gubernur Jawa Barat",
    description: "",
    imageSrc: "/seminar/speakers/erwan-setiawan.png",
  },
  {
    id: 2,
    name: "Prof. (H.C). Hermansyah, M.T",
    position:
      "Staf Ahli Menteri Pertanian, Kementan RI / Dewan Pakar PRSI",
    description: "",
    imageSrc: "/seminar/speakers/hermansyah.png",
  },
  {
    id: 3,
    name: "Sofyan Mufti Prasetiyo, M.Kom",
    position:
      "PR Kecerdasan Artifisial dan Keamanan Siber BRIN / Wakil Ketua Umum PRSI",
    description: "",
    imageSrc: "/seminar/speakers/sofyan-mufti-prasetiyo.png",
  },
  {
    id: 4,
    name: "Prof. Stella Christie, Ph.D.",
    position: "Wakil Menteri Pendidikan Tinggi, Sains, dan Teknologi",
    description: "",
    imageSrc: "/seminar/speakers/stella-christie.png",
  },
  {
    id: 5,
    name: "Yohanes Erwin Priyanto, S.ST",
    position: "PT. Handal Yesindo Sejahtera",
    description: "",
    imageSrc: "/seminar/speakers/yohanes-erwin-priyanto.png",
  },
];

export const SEMINAR_MODERATORS = [
  {
    id: 1,
    name: "Septian Ari Kurniawan, S.T., M.T.",
    imageSrc: "/seminar/moderators/septian-ari-kurniawan.jpg",
    job: "Dosen Teknik Elektro, Universitas Padjadjaran",
    experience: "",
    description: "",
  },
];

export type SeminarTimelineEntry = {
  category: string;
  event: string;
  date: string;
  description: string;
  location?: string;
};

export const SEMINAR_TIMELINE_ITEMS: SeminarTimelineEntry[] = [
  {
    category: "Seminar Nasional",
    event: "Mulai Registrasi",
    date: SEMINAR_REG_START_LABEL,
    description: "Periode registrasi peserta Seminar Nasional Futura.",
    location: "Online/Daring",
  },
  {
    category: "Seminar Nasional",
    event: "Akhir Registrasi",
    date: SEMINAR_REG_DISPLAY_END_LABEL,
    description: "Akhir registrasi peserta Seminar Nasional Futura.",
    location: "Online/Daring",
  },
  {
    category: "Seminar Nasional",
    event: "Pelaksanaan",
    date: SEMINAR_EVENT_DATE_LABEL,
    description: `Hari pelaksanaan Seminar Nasional Futura (${SEMINAR_EVENT_TIME_LABEL}).`,
    location: SEMINAR_LOCATION_NAME,
  },
  {
    category: "Seminar Nasional",
    event: "Pembagian Sertifikat",
    date: "1 Desember 2026",
    description: "Hari pembagian sertifikat Seminar Nasional Futura.",
    location: "Online/Daring",
  },
];
