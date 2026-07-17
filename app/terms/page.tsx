import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Syarat dan Ketentuan - Futura Universitas Padjadjaran",
    description: "Syarat dan Ketentuan layanan registrasi dan informasi Futura Universitas Padjadjaran",
};

export default function TermsOfServicePage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                        Syarat dan Ketentuan Layanan (Terms of Service)
                    </h1>
                    <p className="mt-3 text-lg font-medium text-muted-foreground">
                        Futura Universitas Padjadjaran
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Terakhir Diperbarui: 17 Juli 2026
                    </p>
                </div>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
                    <div className="space-y-4">
                        <p>
                            Selamat datang di website resmi Futura Universitas Padjadjaran (futuraunpad.com). Syarat dan Ketentuan ini mengatur akses dan penggunaan Anda terhadap website dan layanan registrasi kami untuk acara lomba Robot Sumo, lomba Robot Transporter, Seminar Nasional, dan Lomba Essay.
                        </p>
                        <p>
                            Dengan mengakses atau menggunakan website ini, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda tidak diperkenankan untuk menggunakan layanan kami.
                        </p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Pendaftaran dan Akun Pengguna</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Untuk mendaftar acara atau kompetisi, Anda diwajibkan untuk membuat akun dan memberikan informasi yang akurat, lengkap, dan terbaru.</li>
                            <li>Anda bertanggung jawab penuh untuk menjaga kerahasiaan kata sandi dan akun Anda.</li>
                            <li>Panitia berhak menangguhkan atau menghapus akun jika ditemukan indikasi pemalsuan data, pendaftaran ganda yang melanggar aturan, atau tindakan curang lainnya.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Ketentuan Pendaftaran Acara dan Kompetisi</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Seluruh peserta wajib mematuhi Guidebook (Buku Panduan) resmi dari masing-masing acara yang didaftarkan.</li>
                            <li>Bagi peserta di bawah umur (di bawah 18 tahun), pendaftaran wajib menyertakan data dan dokumen identitas (KTP) dari Orang Tua, Wali yang sah, atau Guru Pembina sebagai penanggung jawab.</li>
                            <li>Pendaftaran baru dianggap sah dan selesai setelah proses verifikasi dokumen atau pembayaran berhasil dikonfirmasi oleh sistem.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Pembayaran dan Kebijakan Pengembalian Dana (Refund)</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Pembayaran pendaftaran (seperti untuk acara Mechatura) diproses melalui sistem payment gateway pihak ketiga yang terintegrasi di website kami.</li>
                            <li>Anda wajib membayar sesuai dengan nominal tagihan yang tertera pada sistem sebelum batas waktu yang ditentukan.</li>
                            <li>Seluruh pembayaran yang telah berhasil dikonfirmasi bersifat final dan tidak dapat dikembalikan (non-refundable), kecuali acara dibatalkan secara sepihak oleh panitia Futura Universitas Padjadjaran.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Kewajiban Pengguna</h2>
                        <p>Saat menggunakan website kami, Anda dilarang untuk:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Menggunakan website ini untuk tujuan ilegal atau melanggar hukum.</li>
                            <li>Mengunggah dokumen yang mengandung virus, malware, atau kode berbahaya lainnya.</li>
                            <li>Mencoba meretas, melakukan spamming, menembus sistem keamanan (bypass), atau membebani infrastruktur API registrasi kami secara tidak wajar.</li>
                            <li>Menggunakan identitas orang lain atau entitas lain tanpa izin.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Tiket dan Akses Acara</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Peserta yang telah tervalidasi akan menerima tiket elektronik (QR Code) melalui sistem kami atau email terdaftar.</li>
                            <li>Tiket elektronik ini wajib ditunjukkan pada saat proses daftar ulang (check-in) di lokasi acara.</li>
                            <li>Tiket tidak dapat dipindahtangankan kepada orang lain tanpa persetujuan resmi dari panitia.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Hak Kekayaan Intelektual</h2>
                        <p>
                            Seluruh konten yang terdapat di website ini, termasuk namun tidak terbatas pada teks, grafik, logo, desain antarmuka, dan kode sumber, adalah hak milik eksklusif Futura Universitas Padjadjaran atau Himpunan Mahasiswa Teknik Elektro (HMTE) Unpad, dan dilindungi oleh undang-undang hak cipta yang berlaku.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Batasan Tanggung Jawab</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Kami berusaha memastikan website beroperasi dengan lancar. Namun, kami tidak bertanggung jawab atas gangguan teknis sementara yang disebabkan oleh masalah infrastruktur pihak ketiga (seperti server down pada payment gateway atau penyedia cloud).</li>
                            <li>Panitia tidak bertanggung jawab atas kerugian finansial atau material yang timbul akibat kelalaian peserta dalam menjaga kerahasiaan akun atau kesalahan dalam melakukan transfer pembayaran.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Perubahan Syarat dan Ketentuan</h2>
                        <p>
                            Kami berhak memodifikasi atau mengganti Syarat dan Ketentuan ini kapan saja. Perubahan akan berlaku efektif segera setelah diposting di halaman ini. Anda diharapkan untuk memeriksa halaman ini secara berkala.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Hubungi Kami</h2>
                        <p>
                            Jika Anda memiliki pertanyaan mengenai Syarat dan Ketentuan ini, silakan hubungi kami melalui:
                        </p>
                        <ul className="list-none space-y-1">
                            <li>Email: <strong>unpad.futura@gmail.com</strong></li>
                            <li>Instagram: <strong>instagram.com/futuraunpad.hmte</strong></li>
                        </ul>
                    </section>
                </div>
            </div>
        </main>
    );
}
