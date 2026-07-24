import Image from "next/image"
import SponsorsSection from "./sponsors-section"
import MediaPartnersSection from "./media-partners-section"

export default function AboutSection() {
    return (
        <section id="about" className="relative overflow-hidden bg-background px-5 sm:px-8">

            <div className="relative z-10 mx-auto max-w-[82rem] gap-16">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="flex items-center justify-center gap-4 sm:gap-12 mb-8">
                        <Image src="/image-eeunpad.png" alt="image-eeunpad.png" width={170} height={170} className="w-42 sm:w-[170px] h-auto" />
                        <Image src="/hmte-unpad.png" width={170} height={170} alt="hmte-unpad.png" className="w-28 sm:w-[170px] h-auto" />
                    </div>
                    <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance">
                        FUTURA oleh Himpunan Mahasiswa Teknik Elektro UNPAD
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-8">
                        FUTURA adalah acara tahunan yang diselenggarakan oleh Himpunan Mahasiswa Teknik Elektro Unpad yang bertujuan untuk memperluas pengetahuan ilmu pengetahuan di bidang teknologi dan menunjukkan implementasi dalam bentuk kompetisi dan pameran teknologi.
                    </p>

                    {/* <div className="mt-8 w-full text-sm font-medium">
                        <SponsorsSection />
                    </div>
                    <div className="w-full text-sm font-medium">
                        <MediaPartnersSection />
                    </div> */}
                </div>
            </div>
        </section>
    )
}
