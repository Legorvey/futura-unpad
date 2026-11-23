"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

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
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  return (
    <FieldGroup className="gap-6">
      <VerificationStepCard
        title="Verifikasi identitas sertifikat"
        description="Nama dan institusi Anda akan digunakan untuk catatan seminar dan persiapan sertifikat. Periksa ejaan dan kapitalisasi dengan teliti."
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
        label="Saya mengonfirmasi bahwa detail ini benar untuk catatan sertifikat."
        description="Jika nama atau institusi salah eja di sini, sertifikat mungkin akan menggunakan ejaan yang sama."
      />

      {submitError && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {submitError}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-[8px]"
          onClick={() => {
            if (isEditing) {
              setFlashDoneButton(true);
              if (flashTimeoutRef.current) {
                clearTimeout(flashTimeoutRef.current);
              }
              flashTimeoutRef.current = setTimeout(() => {
                setFlashDoneButton(false);
              }, 500);
            } else {
              onClearSubmitError();
              onBack();
            }
          }}
          disabled={isSubmitting}
        >
          Kembali
        </Button>
        <Button
          type="button"
          className="h-11 rounded-[8px]"
          onClick={submitRegistration}
          disabled={isSubmitting || isEditing}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Menyimpan...
            </>
          ) : (
            "Konfirmasi dan dapatkan tiket"
          )}
        </Button>
      </div>
    </FieldGroup>
  );
}
