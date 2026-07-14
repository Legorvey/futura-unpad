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
        description="Periksa kembali tipe robot, identitas tim, anggota, pembina, dan lampiran sebelum melanjutkan."
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
        label="Saya menyatakan data pendaftaran Mechatura sudah benar."
        description="Data ini akan digunakan untuk proses administrasi, pembayaran, dan verifikasi lomba."
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
          Back
        </Button>
        <Button
          type="button"
          className="h-11 rounded-[8px]"
          onClick={onSubmit}
          disabled={isSubmitting || isEditing}
        >
          {isSubmitting ? "Saving..." : "Confirm and continue"}
        </Button>
      </div>
    </FieldGroup>
  );
}

