import { useState } from "react";

import VerificationStepCard from "@/components/registration/verification-step-card";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormCheckboxField } from "@/components/form/form-checkbox-field";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";

import SeminarVerificationEditForm from "./seminar-verification-edit-form";
import SeminarVerificationSummary from "./seminar-verification-summary";

type SeminarVerificationStepProps = {
  isSubmitting: boolean;
  statusLabel: string;
  submitError: string;
  submitRegistration: () => void;
  onClearSubmitError: () => void;
  onBack: () => void;
};

export default function SeminarVerificationStep({
  isSubmitting,
  statusLabel,
  submitError,
  submitRegistration,
  onClearSubmitError,
  onBack,
}: SeminarVerificationStepProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [flashDoneButton, setFlashDoneButton] = useState(false);

  return (
    <FieldGroup className="gap-6">
      <VerificationStepCard
        title="Verify certificate identity"
        description="Your name and institution will be used for seminar records and certificate preparation. Check spelling and capitalization carefully."
        isEditing={isEditing}
        onEdit={() => {
          setIsEditing(true);
          onClearSubmitError();
        }}
      >
        {isEditing ? (
          <SeminarVerificationEditForm
            flashDoneButton={flashDoneButton}
            onDone={() => setIsEditing(false)}
          />
        ) : (
          <SeminarVerificationSummary statusLabel={statusLabel} />
        )}
      </VerificationStepCard>

      <FormCheckboxField<ClientSeminarFormValues>
        name="identity_confirmed"
        label="I confirm these details are correct for certificate records."
        description="If the name or institution is misspelled here, the certificate may use the same spelling."
      />

      {submitError && (
        <p className="text-sm font-medium text-destructive">{submitError}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-[8px]"
          onClick={() => {
            if (isEditing) {
              setFlashDoneButton(true);
              setTimeout(() => setFlashDoneButton(false), 500);
            } else {
              onClearSubmitError();
              onBack();
            }
          }}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          type="button"
          className="h-11 rounded-[8px]"
          onClick={submitRegistration}
          disabled={isSubmitting || isEditing}
        >
          {isSubmitting ? "Saving..." : "Confirm and get ticket"}
        </Button>
      </div>
    </FieldGroup>
  );
}

