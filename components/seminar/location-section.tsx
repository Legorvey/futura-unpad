import Location from "../ui/location";
import {
    SEMINAR_LOCATION_ADDRESS,
    SEMINAR_LOCATION_FULL,
    SEMINAR_LOCATION_NAME,
    SEMINAR_MAPS_EMBED_SRC,
    SEMINAR_MAPS_URL,
} from "@/lib/seminar/config";

export default function LocationSection() {
    return (
        <section className="relative flex w-full flex-col items-center justify-center py-20 lg:py-28 overflow-hidden">
            <div className="relative mx-auto max-w-[100rem] w-full px-6 md:px-12 lg:px-20 z-10 flex flex-col items-center">
                <div className="mb-14 md:mb-20 text-center flex flex-col items-center">
                    <h2 className="text-[3rem] sm:text-[4rem] md:text-[5rem] font-bold tracking-[-0.08em] text-white text-center text-balance leading-tight">
                        Lokasi Seminar
                    </h2>
                    <p className="mt-2 text-lg md:text-xl text-foreground/60 leading-relaxed max-w-2xl text-center text-balance">
                        Seminar Nasional Futura 2026 akan diselenggarakan di {SEMINAR_LOCATION_FULL}.
                    </p>
                </div>

                <Location
                    id="lokasi"
                    location={SEMINAR_LOCATION_NAME}
                    address={SEMINAR_LOCATION_ADDRESS}
                    mapSrc={SEMINAR_MAPS_EMBED_SRC}
                    mapsUrl={SEMINAR_MAPS_URL}
                />
            </div>
        </section>
    );
}