import FormFileField from "@/components/form/form-file-field"
import type { MechaturaFormValues } from "@/lib/validation/mechatura"

type MechaturaDocsInfoProps = {
    documentMaxSizeInBytes: number;
};

export default function MechaturaDocsInfo({
    documentMaxSizeInBytes,
}: MechaturaDocsInfoProps){
    return (
        <section className="sm:overflow-hidden sm:rounded-xl sm:border sm:border-border sm:bg-card" aria-labelledby="team-section-label">
            <div className="border-b border-border pb-4 pt-0 sm:py-6 sm:px-6">
                <h2 id="team-section-label" className="text-lg font-semibold">
                    Lampiran Anggota Tim
                </h2>
                <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
                    Mohon isi input di bawah berikut dengan satu file PDF yang berisi atas 3 hal, yaitu:
                </p>
                <ul className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
                    <li>- Student ID (KTM/Kartu Pelajar) Leader</li>
                    <li>- Student ID Member 2</li>
                    <li>- Student ID Member 3</li>
                </ul>
            </div>
    
            <div className="space-y-6 pt-5 pb-0 sm:p-6">
    
            <FormFileField<MechaturaFormValues>
                name="member_document"
                title="Upload Member Document"
                description="Mohon unggah file sesuai dengan ketentuan yang tertera."
                accept="application/pdf"
                maxSizeInBytes={documentMaxSizeInBytes}
                required
            />
            </div>
        </section>
    )
}

