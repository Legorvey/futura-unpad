import Location from "../ui/location";
import {
    SEMINAR_LOCATION_ADDRESS,
    SEMINAR_LOCATION_NAME,
    SEMINAR_MAPS_EMBED_SRC,
    SEMINAR_MAPS_URL,
} from "@/lib/seminar/config";

export default function OurLocation() {
    return (
        <section className="relative flex w-full flex-col items-center justify-center py-20 lg:py-28 overflow-hidden">
            <div className="relative mx-auto max-w-[100rem] w-full px-6 md:px-12 lg:px-20 z-10 flex flex-col items-center">
                <div className="mb-14 md:mb-20 text-center flex flex-col items-center">
                    <h2 className="text-[3rem] sm:text-[4rem] md:text-[5rem] font-bold tracking-[-0.08em] text-white text-center text-balance leading-tight">
                        Lokasi Acara
                    </h2>
                    <p className="mt-2 text-lg md:text-xl text-foreground/60 leading-relaxed max-w-2xl text-center text-balance">
                        Rangkaian kegiatan Futura 2026 diselenggarakan di dua lokasi utama Universitas Padjadjaran.
                    </p>
                </div>

                <div className="w-full space-y-10 lg:space-y-12">
                    <Location
                        id="lokasi"
                        location={SEMINAR_LOCATION_NAME}
                        address={SEMINAR_LOCATION_ADDRESS}
                        mapSrc={SEMINAR_MAPS_EMBED_SRC}
                        mapsUrl={SEMINAR_MAPS_URL}
                        reverse={false}
                    />

                    <Location
                        location="Gedung Pusat Pelayanan Basic Science (PPBS)"
                        address="Gedung A, Hegarmanah, Kec. Jatinangor, Kabupaten Sumedang, Jawa Barat 45363"
                        mapSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.7264001086137!2d107.7731944!3d-6.9232738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68c4ad122cf4bd%3A0x53f6c21a1c11a802!2sGedung%20Pusat%20Pelayanan%20Basic%20Science%20(PPBS)!5e0!3m2!1sen!2sid!4v1783891084197!5m2!1sen!2sid"
                        mapsUrl="https://maps.google.com/?q=PPBS+Universitas+Padjadjaran"
                        reverse={true}
                    />
                </div>
            </div>
        </section>
    );
}