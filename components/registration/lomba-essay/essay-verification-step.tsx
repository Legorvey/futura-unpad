import { useFormContext } from "react-hook-form";

import VerificationStepCard from "@/components/registration/verification-step-card";
import { FieldError, FieldGroup } from "@/components/ui/field";
import type { ClientLombaEssayFormValues } from "@/lib/validation/essay";
import { useEssayVerificationEditMode } from "@/hooks/use-essay-verification-edit-mode";
import EssayIdentityConfirmationField from "./essay-identity-confirmation-field";
import EssayVerificationActions from "./essay-verification-actions";
import EssayVerificationEditForm from "./essay-verification-edit-form";
import EssayVerificationSummary from "./essay-verification-summary";

type EssayVerificationStepProps = {
  isSubmitting: boolean;
  submitError: string;
  submitRegistration: () => void;
  onClearSubmitError: () => void;
  onBack: () => void;
};

export default function EssayVerificationStep({
  isSubmitting,
  submitError,
  submitRegistration,
  onClearSubmitError,
  onBack,
}: EssayVerificationStepProps) {
  const { trigger } = useFormContext<ClientLombaEssayFormValues>();
  const {
    flashDoneButton,
    isEditing,
    requestBack,
    setIsEditing,
  } = useEssayVerificationEditMode();

  return (
    <FieldGroup className="gap-6">
      <VerificationStepCard
        title="Verify registration data"
        description="Periksa kembali data tim, ketua, dan judul karya tulis sebelum melanjutkan ke pembayaran."
        isEditing={isEditing}
        onEdit={() => {
          setIsEditing(true);
          onClearSubmitError();
        }}
      >
        {isEditing ? (
          <EssayVerificationEditForm
            flashDoneButton={flashDoneButton}
            trigger={trigger}
            onDone={() => setIsEditing(false)}
          />
        ) : (
          <EssayVerificationSummary />
        )}
      </VerificationStepCard>

      <EssayIdentityConfirmationField />

      {submitError ? <FieldError>{submitError}</FieldError> : null}

      <EssayVerificationActions
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onBack={() =>
          requestBack(() => {
            onClearSubmitError();
            onBack();
          })
        }
        onSubmit={submitRegistration}
      />
    </FieldGroup>
  );
}

