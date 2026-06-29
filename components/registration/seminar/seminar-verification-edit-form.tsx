import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";
import { seminarStatusOptions } from "../../../lib/seminar/seminar-options";
import { SEMINAR_VERIFICATION_FIELDS } from "../../../lib/seminar/seminar-verification-fields";

import { FormTextField } from "@/components/form/form-text-field";
import { FormSelectField } from "@/components/form/form-select-field";

type SeminarVerificationEditFormProps = {
  flashDoneButton: boolean;
  onDone: () => void;
};

export default function SeminarVerificationEditForm({
  flashDoneButton,
  onDone,
}: SeminarVerificationEditFormProps) {
  const {
    control,
    trigger,
    watch,
  } = useFormContext<ClientSeminarFormValues>();
  const { fields: memberFields } = useFieldArray({
    control,
    name: "members",
  });
  const watchedValues = watch();

  const handleDone = async () => {
    const isValid = await trigger(SEMINAR_VERIFICATION_FIELDS);
    if (isValid) {
      onDone();
    }
  };

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <FormTextField<ClientSeminarFormValues>
        name="nama"
        label="Nama Lengkap"
      />
      <FormTextField<ClientSeminarFormValues>
        name="email"
        label="Email"
        type="email"
      />
      <FormTextField<ClientSeminarFormValues>
        name="telp"
        label="Nomor WhatsApp"
      />
      <FormTextField<ClientSeminarFormValues>
        name="institusi"
        label="Asal Institusi"
      />
      <FormSelectField<ClientSeminarFormValues>
        name="status_akademika"
        label="Status Akademika"
        placeholder="Pilih status akademika"
        options={seminarStatusOptions}
      />

      {watchedValues.registration_type === "grup" && memberFields.length > 0 && (
        <div className="sm:col-span-2 space-y-4 pt-4 border-t border-border mt-2">
          <h3 className="text-sm font-medium">Anggota Grup</h3>
          {memberFields.map((field, index) => (
            <div key={field.id} className="grid gap-4 sm:grid-cols-2">
              <FormTextField<ClientSeminarFormValues>
                name={`members.${index}.nama`}
                label={`Nama Anggota ${index + 1}`}
              />
              <FormTextField<ClientSeminarFormValues>
                name={`members.${index}.institusi`}
                label={`Asal Institusi ${!watchedValues.is_same_institution ? "" : "(Sama)"}`}
                disabled={watchedValues.is_same_institution}
                value={watchedValues.is_same_institution ? watchedValues.institusi : watchedValues.members?.[index]?.institusi || ""}
              />
            </div>
          ))}
        </div>
      )}

      <div className="sm:col-span-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className={cn(
            "rounded-[8px] transition-colors duration-300",
            flashDoneButton &&
            "bg-destructive/80 text-white hover:bg-destructive/90"
          )}
          onClick={handleDone}
        >
          Done Editing
        </Button>
      </div>
    </div>
  );
}
