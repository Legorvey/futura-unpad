import Location from "../ui/location";
import { SectionDivider } from "../ui/section-divider";

export default function OurLocation() {
    return (
        <section className="relative mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-6 text-center sm:px-8">
            <Location
                id="lokasi"
                location="Aula Graha Sanusi Hardjadinata, Universitas Padjadjaran"
                address="Jl. Dipati Ukur No.35, Lebakgede, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132"
                mapSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9848904239084!2d107.6144918749962!3d-6.8924101931067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6ff3218aacd%3A0xce249fca022b09c4!2sGraha%20Sanusi%20Hardjadinata!5e0!3m2!1sen!2sid!4v1783634649226!5m2!1sen!2sid"
            />

            <SectionDivider className="block lg:hidden my-4" />

            <Location
                id="lokasi"
                location="Gedung Pusat Pelayanan Basic Science (PPBS), Universitas Padjadjaran"
                address="Gedung A, Hegarmanah, Kec. Jatinangor, Kabupaten Sumedang, Jawa Barat 45363"
                mapSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.7264001086137!2d107.7731944!3d-6.9232738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68c4ad122cf4bd%3A0x53f6c21a1c11a802!2sGedung%20Pusat%20Pelayanan%20Basic%20Science%20(PPBS)!5e0!3m2!1sen!2sid!4v1783891084197!5m2!1sen!2sid"
            />
        </section>
    );
}