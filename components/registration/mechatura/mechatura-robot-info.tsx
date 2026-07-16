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
        <section className="sm:overflow-hidden sm:rounded-xl sm:border sm:border-border sm:bg-card" aria-labelledby="team-section-label">
            <div className="border-b border-border pb-4 pt-0 sm:py-6 sm:px-6">
                <h2 id="team-section-label" className="text-lg font-semibold">
                    Lampiran Informasi Robot
                </h2>
                <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
                    Sebelum isi lampiran di bawah, mohon baca ketentuan Lomba Mechatura terlebih dahulu <br />
                    Link Guidebook Mechatura dapat diakses melalui link berikut: <a className="text-blue-600 hover:text-blue-500 hover:underline" href="https://www.youtube.com" target="_blank" rel="noreferrer">Guidebook Mechatura</a>
                </p>
            </div>

            <div className="space-y-6 pt-5 pb-0 sm:p-6">

 
            <FormTextField<MechaturaFormValues>
                name="robot_name"
                label="Nama Robot Tim"
                placeholder="Masukkan nama robot tim anda"
                required
            />

            <FormFileField<MechaturaFormValues>
                name="robot_document"
                title="Upload Robot Document"
                description="Mohon unggah file sesuai dengan ketentuan Guidebook Mechatura."
                accept="application/pdf"
                maxSizeInBytes={documentMaxSizeInBytes}
                required
            />
            </div>
        </section>
    )
}

