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

  return (
    <div className="space-y-6">
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <SummaryItem label="Nama Lengkap" value={watchedValues.nama} />
        <SummaryItem label="Email" value={watchedValues.email} valueClassName="break-all" />
        <SummaryItem label="Nomor WhatsApp" value={watchedValues.telp} />
        <SummaryItem label="Asal Institusi" value={watchedValues.institusi} />
        <SummaryItem label="Status Akademika" value={statusLabel} />
      </dl>

      {watchedValues.registration_type === "grup" && watchedValues.members && watchedValues.members.length > 0 && (
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-medium mb-3">Anggota Grup</h3>
          <ul className="space-y-2 text-sm">
            {watchedValues.members.map((m, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-muted-foreground">{idx + 1}.</span>
                <span className="font-medium">
                  {m.nama || "-"}
                  {!watchedValues.is_same_institution && m.institusi ? (
                    <span className="text-muted-foreground font-normal ml-1">({m.institusi})</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

