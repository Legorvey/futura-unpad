export const SEMINAR_EVENT_DATE_ISO = "2026-11-28T07:30:00+07:00";
export const SEMINAR_EVENT_DATE_LABEL = "28 November 2026";
export const SEMINAR_EVENT_TIME_LABEL = "07.30 WIB";

// Registration opened 21 November 2026 00:00 WIB and closes 28 November 2026 07:30 WIB.
// Public-facing deadline copy consistently displays 27 November 2026.
export const SEMINAR_REG_START_ISO = "2026-11-21T00:00:00+07:00";
export const SEMINAR_REG_CLOSE_ISO = "2026-11-28T07:30:00+07:00";
export const SEMINAR_REG_START_LABEL = "21 November 2026";
export const SEMINAR_REG_DISPLAY_END_LABEL = "27 November 2026";
export const SEMINAR_REG_BANNER_TEXT =
  "Registration for Semnas is Opened Until 27 November!";

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

export const SEMINAR_LOCATION_NAME =
  "Ruang Serba Guna (RSG) Rektorat Gd. 2 Lt. 4";
export const SEMINAR_LOCATION_FULL =
  "Ruang Serba Guna (RSG) Rektorat Gd. 2 Lt. 4, Universitas Padjadjaran";
export const SEMINAR_LOCATION_ADDRESS =
  "Kampus Unpad Jatinangor, Jl. Ir. Soekarno KM. 21, Hegarmanah, Kec. Jatinangor, Kabupaten Sumedang, Jawa Barat 45363";
export const SEMINAR_MAPS_URL =
  "https://maps.google.com/?q=Gedung+Rektorat+Universitas+Padjadjaran+Jatinangor";
export const SEMINAR_MAPS_EMBED_SRC =
  "https://www.google.com/maps?q=Gedung+Rektorat+Universitas+Padjadjaran+Jatinangor&output=embed";

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
    imageSrc: "/seminar/mystery-pembicara-moderator.png",
  },
  {
    id: 2,
    name: "Prof. (H.C). Hermansyah, M.T",
    position:
      "Staf Ahli Menteri Pertanian, Kementan RI / Dewan Pakar PRSI",
    description: "",
    imageSrc: "/seminar/mystery-pembicara-moderator.png",
  },
  {
    id: 3,
    name: "Sofyan Mufti Prasetiyo, M.Kom",
    position:
      "PR Kecerdasan Artifisial dan Keamanan Siber BRIN / Wakil Ketua Umum PRSI",
    description: "",
    imageSrc: "/seminar/mystery-pembicara-moderator.png",
  },
  {
    id: 4,
    name: "Prof. Brian Yuliarto, S.T., M.Eng., Ph.D.",
    position: "Menteri Diktisaintek",
    description: "",
    imageSrc: "/seminar/mystery-pembicara-moderator.png",
  },
  {
    id: 5,
    name: "Yohanes Erwin Priyanto, S.ST",
    position: "PT. Handal Yesindo Sejahtera",
    description: "",
    imageSrc: "/seminar/mystery-pembicara-moderator.png",
  },
];

export const SEMINAR_MODERATORS = [
  {
    id: 1,
    name: "To Be Announced",
    imageSrc: "/seminar/mystery-pembicara-moderator.png",
    job: "",
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
