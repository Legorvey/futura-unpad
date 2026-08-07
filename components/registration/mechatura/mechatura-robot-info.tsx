import { useWatch } from "react-hook-form";
import FormFileField from "@/components/form/form-file-field";
import { FormTextField } from "@/components/form/form-text-field";
import { MECHATURA_DOCUMENTS } from "@/lib/mechatura/options";
import type { MechaturaFormValues } from "@/lib/validation/mechatura";

type MechaturaDocsInfoProps = {
  documentMaxSizeInBytes: number;
};

export default function MechaturaRobotInfo({
  documentMaxSizeInBytes,
}: MechaturaDocsInfoProps) {
  const competitionType = useWatch<MechaturaFormValues, "competition_type">({
    name: "competition_type",
  });

  const activeJuklak =
    competitionType === "transporter"
      ? MECHATURA_DOCUMENTS.juklakTransporter
      : MECHATURA_DOCUMENTS.juklakSumo;

  const categoryName =
    competitionType === "transporter" ? "Robot Transporter" : "Robot Sumo";

  return (
    <section
      className="overflow-hidden rounded-xl border border-border bg-card"
      aria-labelledby="robot-section-label"
    >
      <div className="border-b border-border p-4 sm:p-6 space-y-4">
        <div>
          <h2 id="robot-section-label" className="text-lg font-semibold">
            Lampiran Informasi Robot
          </h2>
          <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
            Sebelum mengunggah lampiran dokumen spesifikasi dan foto robot, pastikan robot Anda sesuai dengan regulasi teknis kategori yang dipilih.
          </p>
        </div>

        {/* Juklak Callout (Clean, high-contrast neutral theme without icons) */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Petunjuk Pelaksanaan ({categoryName})
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pelajari format lembar spesifikasi teknis dan regulasi lomba {categoryName}.
            </p>
          </div>
          <div className="shrink-0">
            <a
              href={activeJuklak.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm"
            >
              Lihat {activeJuklak.shortTitle}
            </a>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Dokumen panduan umum:{" "}
          <a
            className="font-medium text-blue-700 dark:text-blue-400 hover:underline"
            href={MECHATURA_DOCUMENTS.booklet.url}
            target="_blank"
            rel="noreferrer"
          >
            {MECHATURA_DOCUMENTS.booklet.title} (PDF)
          </a>
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
          description={`Unggah 1 file PDF berisi lembar spesifikasi teknis dan foto robot ${categoryName} rakitan tim sesuai ketentuan ${activeJuklak.shortTitle}.`}
          accept="application/pdf"
          maxSizeInBytes={documentMaxSizeInBytes}
          required
        />
      </div>
    </section>
  );
}
