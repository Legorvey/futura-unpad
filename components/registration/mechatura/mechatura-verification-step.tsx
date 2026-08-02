import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { FormCheckboxField } from "@/components/form/form-checkbox-field";
import VerificationStepCard from "@/components/registration/verification-step-card";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import type { MechaturaFormValues } from "@/lib/validation/mechatura";

import MechaturaVerificationEditForm from "./mechatura-verification-edit-form";
import MechaturaVerificationSummary from "./mechatura-verification-summary";

type MechaturaVerificationStepProps = {
  documentMaxSizeInBytes: number;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  submitError?: string;
};

export default function MechaturaVerificationStep({
  documentMaxSizeInBytes,
  isSubmitting,
  onBack,
  onSubmit,
  submitError,
}: MechaturaVerificationStepProps) {
  const { trigger } = useFormContext<MechaturaFormValues>();
  const [isEditing, setIsEditing] = useState(false);
  const [flashDoneButton, setFlashDoneButton] = useState(false);

  const requestBack = () => {
    if (!isEditing) {
      onBack();
      return;
    }

    setFlashDoneButton(true);
    window.setTimeout(() => setFlashDoneButton(false), 500);
  };

  return (
    <FieldGroup className="gap-6">
      <VerificationStepCard
        title="Verifikasi registrasi Mechatura"
        description="Periksa kembali kategori lomba, identitas tim, anggota, pembimbing, dan lampiran sebelum melanjutkan ke pembayaran."
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
      >
        {isEditing ? (
          <MechaturaVerificationEditForm
            documentMaxSizeInBytes={documentMaxSizeInBytes}
            flashDoneButton={flashDoneButton}
            trigger={trigger}
            onDone={() => setIsEditing(false)}
          />
        ) : (
          <MechaturaVerificationSummary />
        )}
      </VerificationStepCard>

      <FormCheckboxField<MechaturaFormValues>
        name="identity_confirmed"
        label="Saya menyetujui seluruh syarat, ketentuan, dan regulasi kompetisi Mechatura 2026."
        description="Saya menyatakan data tim sudah benar, memahami bahwa biaya registrasi bersifat non-refundable, dan siap mematuhi tata tertib perlombaan."
      />

      {submitError ? (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-[8px]"
          onClick={requestBack}
          disabled={isSubmitting}
        >
          Kembali
        </Button>
        <Button
          type="button"
          className="h-11 rounded-[8px]"
          onClick={onSubmit}
          disabled={isSubmitting || isEditing}
        >
          {isSubmitting ? "Menyimpan..." : "Konfirmasi dan lanjutkan"}
        </Button>
      </div>
    </FieldGroup>
  );
}

