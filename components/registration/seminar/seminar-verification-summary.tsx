"use client";

import { useFormContext } from "react-hook-form";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";
import { SummaryItem } from "@/components/form/summary-item";

type SeminarVerificationSummaryProps = {
  statusLabel: string;
};

export default function SeminarVerificationSummary({
  statusLabel,
}: SeminarVerificationSummaryProps) {
  const { watch } = useFormContext<ClientSeminarFormValues>();
  const watchedValues = watch();
  const isGroup = watchedValues.registration_type === "grup";

  return (
    <div className="space-y-6">
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <SummaryItem
          label="Jenis Pendaftaran"
          value={isGroup ? "Grup" : "Individu"}
        />
        <SummaryItem
          label={isGroup ? "Nama Lengkap (Kontak Utama)" : "Nama Lengkap"}
          value={watchedValues.nama}
        />
        <SummaryItem
          label="Email"
          value={watchedValues.email}
          valueClassName="break-all"
        />
        <SummaryItem label="Nomor WhatsApp" value={watchedValues.telp} />
        <SummaryItem label="Asal Institusi" value={watchedValues.institusi} />
        <SummaryItem label="Status Akademika" value={statusLabel} />
      </dl>

      {isGroup && watchedValues.members && watchedValues.members.length > 0 && (
        <div className="border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Anggota Grup ({watchedValues.members.length})
          </h3>
          <ul className="space-y-2 text-sm">
            {watchedValues.members.map((m, idx) => (
              <li
                key={`member-${idx}`}
                className="flex items-start gap-2 rounded-lg border border-border/70 bg-background/60 px-3 py-2"
              >
                <span className="text-muted-foreground font-medium">
                  {idx + 1}.
                </span>
                <span className="font-medium text-foreground">
                  {m.nama || "-"}
                  <span className="text-muted-foreground font-normal ml-1.5">
                    (
                    {watchedValues.is_same_institution
                      ? watchedValues.institusi || "-"
                      : m.institusi || "-"}
                    )
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
