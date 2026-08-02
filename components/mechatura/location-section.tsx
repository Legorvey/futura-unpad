import Location from "../ui/location"
export default function LocationSection() {
    return (
        <section className="flex flex-col space-y-8 mx-auto w-full max-w-[100rem] min-h-[calc(100svh-65px)] flex justify-center items-center px-6 md:px-12 lg:px-20 py-20 lg:py-28 z-10">
            <Location
                id="lokasi"
                location="Pusat Pelayanan Basic Science (PPBS), Universitas Padjadjaran"
                address="Jalan Raya Bandung - Sumedang KM 21, Jatinangor, Kabupaten Sumedang, Jawa Barat 45363"
                mapSrc="https://www.google.com/maps?q=PPBS+Universitas+Padjadjaran&output=embed"
            />
        </section>
    )
}