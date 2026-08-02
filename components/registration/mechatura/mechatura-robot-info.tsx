import FormFileField from "@/components/form/form-file-field"
import { FormTextField } from "@/components/form/form-text-field";
import type { MechaturaFormValues } from "@/lib/validation/mechatura"

type MechaturaDocsInfoProps = {
    documentMaxSizeInBytes: number;
};

export default function MechaturaRobotInfo({
    documentMaxSizeInBytes,
}: MechaturaDocsInfoProps){
    return (
        <section className="overflow-hidden rounded-xl border border-border bg-card" aria-labelledby="team-section-label">
            <div className="border-b border-border p-4 sm:p-6">
                <h2 id="team-section-label" className="text-lg font-semibold">
                    Lampiran Informasi Robot
                </h2>
                <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
                    Sebelum mengunggah lampiran di bawah, pastikan robot Anda sesuai dengan regulasi teknis kategori yang dipilih.<br />
                    Unduh dan baca booklet resmi melalui tautan berikut: <a className="font-semibold text-blue-600 hover:text-blue-500 hover:underline" href="https://drive.google.com/file/d/1ZrAl8yhVDBqf2Yo4GCoYwWAz-kv7-Zyo/view?usp=sharing" target="_blank" rel="noreferrer">Booklet Resmi Mechatura 2026 (PDF)</a>
                </p>
            </div>

            <div className="space-y-6 p-4 sm:p-6">
                <FormTextField<MechaturaFormValues>
                    name="robot_name"
                    label="Nama Robot Tim"
                    placeholder="Masukkan nama robot tim anda"
                    required
                />

                <FormFileField<MechaturaFormValues>
                    name="robot_document"
                    title="Unggah Dokumen Robot (PDF)"
                    description="Unggah 1 file PDF berisi lembar spesifikasi teknis dan foto robot rakitan peserta sesuai ketentuan Booklet Mechatura."
                    accept="application/pdf"
                    maxSizeInBytes={documentMaxSizeInBytes}
                    required
                />
            </div>
        </section>
    )
}

