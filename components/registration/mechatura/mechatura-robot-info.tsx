import FormFileField from "@/components/form/form-file-field"
import { FormTextField } from "../form-text-field";
import type { MechaturaFormValues } from "@/lib/validation/mechatura"

type MechaturaDocsInfoProps = {
    documentMaxSizeInBytes: number;
};

export default function MechaturaRobotInfo({
    documentMaxSizeInBytes,
}: MechaturaDocsInfoProps){
    return (
        <section className="space-y-4 border rounded-2xl p-4" aria-labelledby="team-section-label">
            <div>
                <h2 id="team-section-label" className="font-semibold">
                    Lampiran Informasi Robot
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Sebelum isi lampiran di bawah, mohon baca ketentuan Lomba Mechatura terlebih dahulu <br />
                    Link Guidebook Mechatura dapat diakses melalui link berikut: <a className="text-blue-600 hover:text-blue-500 hover:underline" href="https://www.youtube.com" target="_blank" rel="noreferrer">Guidebook Mechatura</a>
                </p>
            </div>

 
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
        </section>
    )
}
