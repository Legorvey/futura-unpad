"use client";

import { Swords, Boxes } from "lucide-react";
import { ButtonV2 } from "../ui/button-v2";

const categories = [
  {
    title: "Robot Sumo",
    meta1_label: "Sistem Pertandingan",
    meta1_value: "Babak Grup (3 Ronde) & Play-off (5 Ronde)",
    meta2_label: "Ketentuan Robot",
    meta2_value: "Arena Bundar & Wajib Rakitan Peserta Sendiri",
    description: "Lomba robot manual yang mengadu dua robot saling dorong keluar dari arena bundar. Penilaian mempertimbangkan win time dan survive time jika skor imbang, dengan fokus pada kekuatan, kontrol, dan strategi duel langsung.",
    highlights_title: "Fokus Kompetisi",
    highlights: "Kekuatan, Kontrol, dan Strategi Duel Langsung",
    juklak_url: "https://drive.google.com/file/d/1Zz5PUCJeUzT4mAvQmtyfP6tVSQFobZ3B/view?usp=sharing",
    icon: Swords,
  },
  {
    title: "Robot Transporter",
    meta1_label: "Sistem Pertandingan",
    meta1_value: "Penyisihan 16 Tim Tercepat & Sistem Gugur",
    meta2_label: "Ketentuan Robot",
    meta2_value: "Robot Manual Controller (Tanpa Auto-Mapping)",
    description: "Lomba robot manual yang menguji kecepatan dan ketepatan saat memindahkan objek melewati rintangan tanpa fitur otomatis. Penilaian berfokus utama pada efisiensi gerak dan ketepatan waktu pemindahan objek.",
    highlights_title: "Fokus Kompetisi",
    highlights: "Kecepatan, Efisiensi Gerak, dan Ketepatan Pemindahan",
    juklak_url: "https://drive.google.com/file/d/1krsXNkqPjHsvQmkj9DoSleJ1S-MQD2is/view?usp=sharing",
    icon: Boxes,
  },
];

export function KategoriKompetisi() {
  return (
    <section className="max-w-[100rem] mx-auto w-full px-6 md:px-12 lg:px-20 py-16 lg:py-24">
      <div className="mb-14 md:mb-20 text-center flex flex-col items-center">
        <h2 className="text-[3rem] sm:text-[4rem] md:text-[5rem] font-bold tracking-[-0.08em] text-white text-center text-balance leading-tight">
          Kategori Kompetisi
        </h2>
        <p className="mt-2 text-lg md:text-xl text-foreground/60 leading-relaxed max-w-2xl text-center text-balance">
          Pilih kategori yang sesuai dengan keahlian tim kamu dan buktikan kemampuan robotmu di arena Mechatura!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto items-stretch">
        {categories.map((category) => (
          <CategoryCard key={category.title} category={category} />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ category }: { category: (typeof categories)[0] }) {
  const Icon = category.icon;

  return (
    <div className="relative group flex flex-col justify-between p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 ease-in-out backdrop-blur-2xl overflow-hidden shadow-xl hover:-translate-y-2 h-full">
      {/* Subtle Overflowing Background Icon */}
      <div className="absolute -top-8 -right-8 pointer-events-none select-none transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3">
        <Icon className="w-52 h-52 sm:w-60 sm:h-60 text-white/[0.03] group-hover:text-white/[0.06] stroke-[1.2] transition-colors duration-300" />
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-8">
            {category.title}
          </h2>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-0.5">
                  {category.meta1_label}
                </span>
                <span className="text-sm font-medium text-foreground/90">
                  {category.meta1_value}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-0.5">
                  {category.meta2_label}
                </span>
                <span className="text-sm font-medium text-foreground/90">
                  {category.meta2_value}
                </span>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-8" />

        <p className="text-base font-light text-foreground/70 leading-relaxed mb-10 flex-grow">
          {category.description}
        </p>

        <div className="mt-auto flex flex-col gap-8">


          <div className="flex justify-start">
            <ButtonV2 text="Lihat Juklak" href={category.juklak_url} />
          </div>
        </div>
      </div>
    </div>
  );
}
