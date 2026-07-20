import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi"
};

export default function PrivacyPolicyPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                        Kebijakan Privasi
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Futura Universitas Padjadjaran
                    </p>
                </div>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
                    <div className="space-y-4">
                        <p>
                            Futura Universitas Padjadjaran mengoperasikan website{" "}
                            <a href="https://www.futuraunpad.com" className="font-medium text-foreground underline underline-offset-4">www.futuraunpad.com</a>, 
                            yang menyediakan layanan registrasi dan informasi terkait lomba Robot Sumo, lomba Robot Transporter, Seminar Nasional, serta Lomba Essay.
                        </p>
                        <p>
                            Halaman ini digunakan untuk menginformasikan pengunjung website mengenai kebijakan kami terkait pengumpulan, penggunaan, dan pengungkapan Informasi Pribadi jika ada yang memutuskan untuk menggunakan layanan kami di website www.futuraunpad.com.
                        </p>
                        <p>
                            Jika Anda memilih untuk menggunakan layanan kami, maka Anda menyetujui pengumpulan dan penggunaan informasi sehubungan dengan kebijakan ini. Informasi Pribadi yang kami kumpulkan digunakan untuk menyediakan dan meningkatkan layanan. Kami tidak akan menggunakan atau membagikan informasi Anda dengan siapa pun kecuali seperti yang dijelaskan dalam Kebijakan Privasi ini.
                        </p>
                        <p>
                            Istilah yang digunakan dalam Kebijakan Privasi ini memiliki arti yang sama seperti dalam Syarat dan Ketentuan kami, yang dapat diakses di www.futuraunpad.com, kecuali jika didefinisikan lain dalam Kebijakan Privasi ini.
                        </p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Pengumpulan dan Penggunaan Informasi</h2>
                        <p>
                            Untuk pengalaman yang lebih baik saat menggunakan layanan kami, kami mungkin meminta Anda untuk memberikan kami informasi pengenal pribadi tertentu, termasuk namun tidak terbatas pada nama, nomor telepon, dan alamat email Anda. Informasi yang kami kumpulkan akan digunakan untuk menghubungi atau mengidentifikasi Anda.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Data Log</h2>
                        <p>
                            Kami ingin memberi tahu Anda bahwa setiap kali Anda mengunjungi layanan kami, kami mengumpulkan informasi yang dikirimkan browser Anda kepada kami yang disebut Data Log. Data Log ini dapat mencakup informasi seperti alamat Protokol Internet (“IP”) komputer Anda, versi browser, halaman layanan kami yang Anda kunjungi, waktu dan tanggal kunjungan Anda, waktu yang dihabiskan di halaman tersebut, dan statistik lainnya.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Cookies</h2>
                        <p>
                            Cookies adalah file dengan sejumlah kecil data yang umumnya digunakan sebagai pengenal unik anonim. File ini dikirim ke browser Anda dari website yang Anda kunjungi dan disimpan di hard drive komputer Anda. Website kami menggunakan "cookies" ini untuk mengumpulkan informasi dan untuk meningkatkan layanan kami. Anda memiliki opsi untuk menerima atau menolak cookies ini, dan mengetahui kapan sebuah cookie sedang dikirim ke komputer Anda. Jika Anda memilih untuk menolak cookies kami, Anda mungkin tidak dapat menggunakan beberapa bagian dari layanan kami.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Penyedia Layanan</h2>
                        <p>Kami mungkin mempekerjakan perusahaan dan individu pihak ketiga karena alasan berikut:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Untuk memfasilitasi layanan kami;</li>
                            <li>Untuk menyediakan layanan atas nama kami;</li>
                            <li>Untuk melakukan layanan terkait operasional website; atau</li>
                            <li>Untuk membantu kami dalam menganalisis bagaimana layanan kami digunakan.</li>
                        </ul>
                        <p>
                            Kami ingin memberi tahu pengguna layanan kami bahwa pihak ketiga ini memiliki akses ke Informasi Pribadi Anda. Alasannya adalah untuk melakukan tugas yang diberikan kepada mereka atas nama kami. Namun, mereka berkewajiban untuk tidak mengungkapkan atau menggunakan informasi tersebut untuk tujuan lain apa pun.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Keamanan</h2>
                        <p>
                            Kami menghargai kepercayaan Anda dalam memberikan Informasi Pribadi Anda kepada kami, sehingga kami berusaha menggunakan cara yang dapat diterima secara komersial untuk melindunginya. Namun perlu diingat bahwa tidak ada metode transmisi melalui internet, atau metode penyimpanan elektronik yang 100% aman dan andal, dan kami tidak dapat menjamin keamanan mutlaknya.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Tautan ke Situs Lain</h2>
                        <p>
                            Layanan kami mungkin berisi tautan ke situs lain. Jika Anda mengklik tautan pihak ketiga, Anda akan diarahkan ke situs tersebut. Perhatikan bahwa situs eksternal ini tidak dioperasikan oleh kami. Oleh karena itu, kami sangat menyarankan Anda untuk meninjau Kebijakan Privasi dari website tersebut. Kami tidak memiliki kendali atas, dan tidak bertanggung jawab atas konten, kebijakan privasi, atau praktik situs atau layanan pihak ketiga mana pun.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Privasi Anak dan Peserta di Bawah Umur</h2>
                        <p>
                            Layanan kami terbuka untuk umum, termasuk peserta kompetisi yang berstatus di bawah umur (di bawah 18 tahun). Sesuai dengan regulasi pelindungan data, pengumpulan informasi pribadi (seperti nama, asal sekolah, dan kartu pelajar) dari peserta di bawah umur hanya dapat dilakukan dengan sepengetahuan, pengawasan, dan persetujuan dari orang tua, wali yang sah, atau guru pembina. Bagi peserta di bawah umur, data kontak utama (email dan nomor telepon) serta dokumen identitas penjamin (KTP orang tua/pembina) wajib disertakan pada saat pendaftaran. Apabila kami menemukan data anak di bawah umur yang dikirimkan tanpa persetujuan pengawasan dari pihak wali yang sah, panitia berhak membatalkan pendaftaran dan menghapus data tersebut dari sistem kami.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Perubahan pada Kebijakan Privasi Ini</h2>
                        <p>
                            Kami mungkin memperbarui Kebijakan Privasi kami dari waktu ke waktu. Oleh karena itu, kami menyarankan Anda untuk meninjau halaman ini secara berkala untuk setiap perubahan. Kami akan memberi tahu Anda tentang setiap perubahan dengan memposting Kebijakan Privasi baru di halaman ini. Perubahan ini berlaku segera setelah diposting di halaman ini.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Hubungi Kami</h2>
                        <p>
                            Jika Anda memiliki pertanyaan atau saran tentang Kebijakan Privasi kami, jangan ragu untuk menghubungi kami melalui email resmi <strong>unpad.futura@gmail.com</strong> atau kanal sosial media kami di <strong>instagram.com/futuraunpad.hmte</strong>.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
