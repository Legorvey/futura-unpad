import Location from "../ui/location";

export default function LocationSection() {
    return (
        <section className="relative flex w-full flex-col items-center justify-center py-20 lg:py-28 overflow-hidden">
            <div className="relative mx-auto max-w-[100rem] w-full px-6 md:px-12 lg:px-20 z-10 flex flex-col items-center">
                <div className="mb-14 md:mb-20 text-center flex flex-col items-center">
                    <h2 className="text-[3rem] sm:text-[4rem] md:text-[5rem] font-bold tracking-[-0.08em] text-white text-center text-balance leading-tight">
                        Lokasi Seminar
                    </h2>
                    <p className="mt-2 text-lg md:text-xl text-foreground/60 leading-relaxed max-w-2xl text-center text-balance">
                        Seminar Nasional Futura 2026 akan diselenggarakan di Bale Rumawat, Kampus Universitas Padjadjaran Dipati Ukur.
                    </p>
                </div>

                <Location
                    id="lokasi"
                    location="Bale Rumawat, Universitas Padjadjaran"
                    address="Kampus Unpad Dipati Ukur, Jalan Dipati Ukur No. 35, Kota Bandung, Jawa Barat 40132"
                    mapSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9836602577193!2d107.61677209999999!3d-6.892557400000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e653edd6a831%3A0x19d1b678d15f986a!2sJl.%20Dipati%20Ukur%20No.35%2C%20Lebakgede%2C%20Kecamatan%20Coblong%2C%20Kota%20Bandung%2C%20Jawa%20Barat%2040132!5e0!3m2!1sen!2sid!4v1785246289270!5m2!1sen!2sid"
                    mapsUrl="https://maps.google.com/?q=Bale+Rumawat+Universitas+Padjadjaran"
                />
            </div>
        </section>
    );
}