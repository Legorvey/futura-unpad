import Link from "next/link";
import { ButtonV2 } from "../ui/button-v2";

const categories = [
  {
    title: "Robot Sumo",
    description: "Pertarungan kekuatan dan strategi antar robot dalam arena tertutup. Robot harus mampu mendeteksi dan mendorong lawannya keluar dari arena untuk meraih kemenangan.",
  },
  {
    title: "Robot Transporter",
    description: "Uji ketangkasan dan presisi robot dalam memindahkan objek dari satu titik ke titik lain melewati berbagai rintangan dengan waktu tercepat.",
  },
];

export function KategoriKompetisi() {
  return (
    <section className="max-w-7xl mx-auto w-full px-4 py-16 lg:py-24">
      <div className="mb-14 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.07em]">
          Kategori Kompetisi
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Pilih kategori yang sesuai dengan keahlian tim kamu dan buktikan kemampuan robotmu di arena Mechatura!
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto items-stretch">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-2xl shadow-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center hover:bg-white/[0.04] hover:border-white/10 hover:-translate-y-2 transition-all duration-300 ease-in-out">
          <div className="relative z-10 space-y-8 flex flex-col items-center">
            <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white">
              {categories[0].title}
            </h2>
            <p className="text-base leading-relaxed text-white/70 max-w-sm mx-auto">
              {categories[0].description}
            </p>
            <ButtonV2 
              text="Lihat Juklak"
              href="https://drive.google.com/file/d/1Zz5PUCJeUzT4mAvQmtyfP6tVSQFobZ3B/view?usp=sharing"
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-2xl shadow-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center hover:bg-white/[0.04] hover:border-white/10 hover:-translate-y-2 transition-all duration-300 ease-in-out">
          <div className="relative z-10 space-y-8 flex flex-col items-center">
            <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white">
              {categories[1].title}
            </h2>
            <p className="text-base leading-relaxed text-white/70 max-w-sm mx-auto">
              {categories[1].description}
            </p>
            <ButtonV2 
              text="Lihat Juklak"
              href="https://drive.google.com/file/d/1krsXNkqPjHsvQmkj9DoSleJ1S-MQD2is/view?usp=sharing"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
