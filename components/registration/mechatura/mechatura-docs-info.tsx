import FormFileField from "@/components/form/form-file-field"
import type { MechaturaFormValues } from "@/lib/validation/mechatura"

type MechaturaDocsInfoProps = {
    documentMaxSizeInBytes: number;
};

export default function MechaturaDocsInfo({
    documentMaxSizeInBytes,
}: MechaturaDocsInfoProps){
    return (
        <section className="overflow-hidden rounded-xl border border-border bg-card" aria-labelledby="team-section-label">
            <div className="border-b border-border p-4 sm:p-6">
                <h2 id="team-section-label" className="text-lg font-semibold">
                    Lampiran Identitas Anggota Tim
                </h2>
                <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
                    Gabungkan kartu identitas seluruh anggota tim yang didaftarkan ke dalam <strong>1 file PDF</strong>:
                </p>
                <ul className="mt-2 space-y-1 text-sm font-medium leading-relaxed text-neutral-500">
                    <li>• <strong>Pelajar/Mahasiswa</strong>: Kartu Pelajar atau Kartu Tanda Mahasiswa (KTM) aktif.</li>
                    <li>• <strong>Kategori Umum</strong>: KTP atau Kartu Identitas Resmi yang masih berlaku.</li>
                    <li>• File harus mencakup identitas <strong>Ketua Tim</strong> dan seluruh <strong>Anggota</strong> yang didaftarkan.</li>
                </ul>
            </div>
    
            <div className="space-y-6 p-4 sm:p-6">
                <FormFileField<MechaturaFormValues>
                    name="member_document"
                    title="Unggah Dokumen Identitas Anggota (PDF)"
                    description="Format PDF, ukuran maksimal 2 MB. Pastikan foto dan data identitas terbaca dengan jelas."
                    accept="application/pdf"
                    maxSizeInBytes={documentMaxSizeInBytes}
                    required
                />
            </div>
        </section>
    )
}

