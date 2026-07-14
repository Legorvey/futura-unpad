import { useWatch } from "react-hook-form";

import { SummaryItem } from "@/components/form/summary-item";
import { mechaturaCompetitionLabels } from "@/lib/mechatura/options";
import type { MechaturaFormValues } from "@/lib/validation/mechatura";

function getFileNames(files?: FileList) {
  if (!files?.length) {
    return "-";
  }

  return Array.from(files)
    .map((file) => file.name)
    .join(", ");
}

export default function MechaturaVerificationSummary() {
  const values = useWatch<MechaturaFormValues>();
  const competitionType = values.competition_type;
  const competitionLabel = competitionType
    ? mechaturaCompetitionLabels[competitionType]
    : "-";

  return (
    <div className="mt-5 space-y-6">
      <section>
        <h3 className="text-sm font-semibold">Tipe Robot</h3>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
          <SummaryItem label="Kategori Lomba" value={competitionLabel} />
        </dl>
      </section>

      <section className="border-t pt-5">
        <h3 className="text-sm font-semibold">Identitas Tim</h3>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
          <SummaryItem label="Nama Tim" value={values.team_name} />
          <SummaryItem label="Asal Institusi" value={values.institution} />
          <SummaryItem label="Provinsi/Kota" value={values.province} />
        </dl>
      </section>

      <section className="border-t pt-5">
        <h3 className="text-sm font-semibold">Anggota Tim</h3>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
          <SummaryItem label="Nama Ketua" value={values.leader_name} />
          <SummaryItem
            label="Email Ketua"
            value={values.leader_email}
            valueClassName="break-all"
          />
          <SummaryItem label="WhatsApp Ketua" value={values.leader_phone} />
          <SummaryItem label="Nama Anggota 1" value={values.member2_name} />
          <SummaryItem
            label="Email Anggota 1"
            value={values.member2_email}
            valueClassName="break-all"
          />
          <SummaryItem
            label="WhatsApp Anggota 1"
            value={values.member2_phone}
          />
          <SummaryItem label="Nama Anggota 2" value={values.member3_name} />
          <SummaryItem
            label="Email Anggota 2"
            value={values.member3_email}
            valueClassName="break-all"
          />
          <SummaryItem
            label="WhatsApp Anggota 2"
            value={values.member3_phone}
          />
        </dl>
      </section>

      <section className="border-t pt-5">
        <h3 className="text-sm font-semibold">Pembina</h3>
        {values.has_coach ? (
          <dl className="mt-3 grid gap-4 sm:grid-cols-2">
            <SummaryItem label="Nama Pembina" value={values.coach_name} />
            <SummaryItem
              label="Email Pembina"
              value={values.coach_email}
              valueClassName="break-all"
            />
            <SummaryItem label="WhatsApp Pembina" value={values.coach_phone} />
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Tim tidak menambahkan pembina.
          </p>
        )}
      </section>

      <section className="border-t pt-5">
        <h3 className="text-sm font-semibold">Lampiran</h3>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
          <SummaryItem label="Nama Robot" value={values.robot_name} />
          <SummaryItem
            label="Dokumen Anggota"
            value={getFileNames(values.member_document)}
            valueClassName="break-all"
          />
          <SummaryItem
            label="Dokumen Robot"
            value={getFileNames(values.robot_document)}
            valueClassName="break-all"
          />
        </dl>
      </section>
    </div>
  );
}

