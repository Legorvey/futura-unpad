export const seminarStatusOptions = [
  {
    id: "mahasiswa" as const,
    title: "Mahasiswa",
    description: "Peserta dari perguruan tinggi.",
  },
  {
    id: "siswa" as const,
    title: "Siswa",
    description: "Peserta dari sekolah menengah.",
  },
  {
    id: "dosen" as const,
    title: "Dosen",
    description: "Tenaga pendidik perguruan tinggi.",
  },
  {
    id: "umum" as const,
    title: "Umum",
    description: "Peserta umum atau profesional.",
  },
];

export const seminarRegistrationOptions = [
  {
    id: "individu" as const,
    title: "Individu",
    description: "Daftar sebagai Individu",
  },
  {
    id: "grup" as const,
    title: "Grup",
    description:
      "Daftar seminar hanya melalui satu orang dengan mendaftar banyak orang",
  },
];
