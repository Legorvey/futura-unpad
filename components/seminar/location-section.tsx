import Location from "../ui/location"
export default function LocationSection() {
    return (
        <section className="flex flex-col space-y-8 mx-auto w-full max-w-[100rem] min-h-[calc(100svh-65px)] flex justify-center items-center px-6 md:px-12 lg:px-20 py-20 lg:py-28 z-10">
            <Location
                id="lokasi"
                location="Bale Rumawat, Universitas Padjadjaran"
                address="⁠Kampus Unpad Dipati Ukur, Jalan Dipati Ukur No. 35, Kota Bandung, Jawa Barat 40132"
                mapSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9836602577193!2d107.61677209999999!3d-6.892557400000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e653edd6a831%3A0x19d1b678d15f986a!2sJl.%20Dipati%20Ukur%20No.35%2C%20Lebakgede%2C%20Kecamatan%20Coblong%2C%20Kota%20Bandung%2C%20Jawa%20Barat%2040132!5e0!3m2!1sen!2sid!4v1785246289270!5m2!1sen!2sid"
            />
        </section>
    )
}