import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import type { ClientLombaEssayFormValues } from "@/lib/validation/essay";

type EssayPaymentStepProps = {
  isSubmitting: boolean;
  memberCount: number;
  registrationId: string;
  selectedSubTheme: string;
  submitError: string;
  values: ClientLombaEssayFormValues;
  onBack: () => void;
  onPayment: () => void;
};

export default function EssayPaymentStep({
  isSubmitting,
  memberCount,
  registrationId,
  selectedSubTheme,
  submitError,
  values,
  onBack,
  onPayment,
}: EssayPaymentStepProps) {
  return (
    <FieldGroup className="gap-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 rounded-[8px] bg-muted p-3">
          <p className="text-xs text-muted-foreground">Registration ID</p>
          <p className="font-mono text-sm font-semibold">{registrationId}</p>
        </div>

        <p className="text-sm text-muted-foreground">Total pembayaran</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">Rp 50.000</p>

        <dl className="mt-5 grid gap-3 text-sm">
          <PaymentSummaryItem label="Event" value="Lomba Karya Tulis Ilmiah" />
          <PaymentSummaryItem label="Nama Tim" value={values.team_name} />
          <PaymentSummaryItem label="Ketua Tim" value={values.leader_name} />
          <PaymentSummaryItem
            label="Judul Karya Tulis"
            value={values.paper_title}
            valueClassName="max-w-[55%] text-right font-medium"
          />
          <PaymentSummaryItem label="Sub-Tema" value={selectedSubTheme} />
          <PaymentSummaryItem
            label="Jumlah Peserta"
            value={`${memberCount} orang`}
          />
          <PaymentSummaryItem label="Payment Status" value="PENDING_PAYMENT" />
          <PaymentSummaryItem label="Registration" value="WAITING_PAYMENT" />
        </dl>
      </div>

      <div className="rounded-[8px] border p-4 text-sm font-medium leading-relaxed text-neutral-500">
        Setelah langkah ini, registrasi tim akan disimpan dan halaman pembayaran
        akan membuat atau membuka kembali invoice untuk tim ini.
      </div>

      {submitError ? <FieldError>{submitError}</FieldError> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-[8px]"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          type="button"
          className="h-11 rounded-[8px]"
          disabled={isSubmitting}
          onClick={onPayment}
        >
          {isSubmitting ? "Opening preview..." : "Open payment preview"}
        </Button>
      </div>
    </FieldGroup>
  );
}

function PaymentSummaryItem({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between gap-4 border-t pt-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={valueClassName ?? "font-medium"}>{value}</dd>
    </div>
  );
}

