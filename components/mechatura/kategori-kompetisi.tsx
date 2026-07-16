"use client";

import { WobbleCard } from "../ui/wobble-card";

const categories = [
  {
    title: "Robot Sumo",
    description: "Pertarungan kekuatan dan strategi antar robot dalam arena tertutup. Robot harus mampu mendeteksi dan mendorong lawannya keluar dari arena untuk meraih kemenangan.",
    className: "col-span-1 lg:col-span-2 bg-blue-800",
  },
  {
    title: "Robot Transporter",
    description: "Uji ketangkasan dan presisi robot dalam memindahkan objek dari satu titik ke titik lain melewati berbagai rintangan dengan waktu tercepat.",
    className: "col-span-1 lg:col-span-2 bg-emerald-800",
  },
];

export function KategoriKompetisi() {
  return (
    <section className="max-w-7xl mx-auto w-full px-4 py-16">
      <div className="mb-14 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          Kategori Kompetisi
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Pilih kategori yang sesuai dengan keahlian tim kamu dan buktikan kemampuan robotmu di arena Mechatura!
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {categories.map((category, idx) => (
          <WobbleCard key={category.title} containerClassName={`min-h-[300px] ${category.className}`}>
            <h2 className="max-w-80 text-left text-balance text-2xl lg:text-3xl font-semibold tracking-tight text-white">
              {category.title}
            </h2>
            <p className="mt-4 max-w-[26rem] text-left text-base leading-relaxed text-neutral-100/90">
              {category.description}
            </p>
          </WobbleCard>
        ))}
      </div>
    </section>
  );
}
