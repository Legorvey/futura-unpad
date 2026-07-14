import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { SummaryItem } from "@/components/form/summary-item";
import type { ClientLombaEssayFormValues } from "@/lib/validation/essay";
import { essaySubThemeOptions } from "../../../lib/essay/essay-options";

export default function EssayVerificationSummary() {
  const { control } = useFormContext<ClientLombaEssayFormValues>();
  const values = useWatch({ control });
  const selectedSubTheme = useMemo(
    () =>
      essaySubThemeOptions.find((option) => option.id === values.sub_theme)
        ?.title ?? "-",
    [values.sub_theme]
  );

  return (
    <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
      <SummaryItem label="Nama Tim" value={values.team_name} />
      <SummaryItem label="Perguruan Tinggi" value={values.institution} />
      <SummaryItem label="Jurusan / Prodi" value={values.faculty} />
      <SummaryItem label="Sub-Tema" value={selectedSubTheme} />
      <SummaryItem
        label="Judul Karya Tulis"
        value={values.paper_title}
        className="sm:col-span-2"
      />
      <SummaryItem label="Nama Ketua" value={values.leader_name} />
      <SummaryItem label="NIM Ketua" value={values.leader_nim} />
      <SummaryItem
        label="Email Ketua"
        value={values.leader_email}
        valueClassName="mt-1 break-all font-medium"
      />
      <SummaryItem label="WhatsApp Ketua" value={values.leader_phone} />

      {values.member2_name ? (
        <>
          <SummaryItem label="Anggota 2" value={values.member2_name} />
          <SummaryItem
            label="NIM Anggota 2"
            value={values.member2_nim || "-"}
          />
        </>
      ) : null}

      {values.member3_name ? (
        <>
          <SummaryItem label="Anggota 3" value={values.member3_name} />
          <SummaryItem
            label="NIM Anggota 3"
            value={values.member3_nim || "-"}
          />
        </>
      ) : null}
    </dl>
  );
}

