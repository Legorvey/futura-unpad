"use client";

import { WobbleCard } from "../ui/wobble-card";

const scopes = [
  {
    title: "Green & Renewable Energy",
    description: "Kita akan membahas bagaimana inovasi energi ramah lingkungan bisa dioptimalkan, serta langkah nyata apa saja untuk menciptakan masa depan yang lebih hijau.",
    className: "col-span-1 lg:col-span-2 bg-emerald-800",
  },
  {
    title: "Internet of Things",
    description: "Bayangkan jika semua perangkat di sekitarmu bisa saling terhubung. Kita akan mengupas bagaimana ekosistem cerdas ini bekerja dan mempermudah kehidupan kita.",
    className: "col-span-1 bg-cyan-800",
  },
  {
    title: "Telekomunikasi",
    description: "Koneksi yang cepat dan andal kini menjadi kebutuhan utama. Di sesi ini, kita akan mengeksplorasi teknologi jaringan masa depan yang membuat kita semakin terhubung.",
    className: "col-span-1 bg-violet-800",
  },
  {
    title: "Sistem Informasi",
    description: "Data memegang peran penting di era digital. Kita akan belajar bagaimana sebuah sistem dapat mengolah data menjadi informasi berharga untuk mengambil keputusan yang tepat.",
    className: "col-span-1 lg:col-span-2 bg-rose-800",
  },
];

export function RuangLingkup() {
  return (
    <section className="max-w-7xl mx-auto w-full px-4 py-16">
      <div className="mb-14 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          Apa Saja yang Akan Dibahas?
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Seminar ini akan membawa kamu mengeksplorasi berbagai inovasi yang sedang mengubah dunia. Berikut adalah beberapa topik seru yang akan kita kupas tuntas!
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {scopes.map((scope, idx) => (
          <WobbleCard key={scope.title} containerClassName={`min-h-[300px] ${scope.className}`}>
            <h2 className="max-w-80 text-left text-balance text-2xl lg:text-3xl font-semibold tracking-tight text-white">
              {scope.title}
            </h2>
            <p className="mt-4 max-w-[26rem] text-left text-base leading-relaxed text-neutral-100/90">
              {scope.description}
            </p>
          </WobbleCard>
        ))}
      </div>
    </section>
  );
}
