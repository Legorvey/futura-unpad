import type { BaseSyntheticEvent } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";
import { seminarStatusOptions } from "../../../lib/seminar/seminar-options";

import { FormTextField } from "@/components/form/form-text-field";
import { FormSelectField } from "@/components/form/form-select-field";
import { SeminarMemberFields } from "./seminar-member-fields";

type SeminarDetailsStepProps = {
  isSubmitting: boolean;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  onBack: () => void;
};

export default function SeminarDetailsStep({
  isSubmitting,
  onSubmit,
  onBack,
}: SeminarDetailsStepProps) {
  const { watch } = useFormContext<ClientSeminarFormValues>();
  const watchedValues = watch();

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup className="gap-6">
        {watchedValues.registration_type === "grup" && (
          <FormTextField<ClientSeminarFormValues>
            name="group_name"
            label="Nama Grup/Tim"
            placeholder="Masukkan nama grup atau komunitas Anda"
            required
          />
        )}

        <FormTextField<ClientSeminarFormValues>
          name="nama"
          label={`Nama Lengkap ${watchedValues.registration_type === "grup" ? "(Kontak Utama)" : ""}`}
          placeholder="Nama sesuai identitas"
          autoComplete="name"
          required
        />

        <FormTextField<ClientSeminarFormValues>
          name="email"
          label={`Email ${watchedValues.registration_type === "grup" ? "(Kontak Utama)" : ""}`}
          type="email"
          placeholder="nama@email.com"
          autoComplete="email"
          required
        />

        <FormTextField<ClientSeminarFormValues>
          name="telp"
          label={`Nomor WhatsApp ${watchedValues.registration_type === "grup" ? "(Kontak Utama)" : ""}`}
          placeholder="+62 8XX-XXXX-XXXX"
          autoComplete="tel"
          required
        />

        <FormTextField<ClientSeminarFormValues>
          name="institusi"
          label={`Asal Institusi ${watchedValues.registration_type === "grup" ? "(Kontak Utama)" : ""}`}
          placeholder="Nama sekolah, kampus, instansi, atau komunitas"
          autoComplete="organization"
          required
        />

        <FormSelectField<ClientSeminarFormValues>
          name="status_akademika"
          label="Status Akademika"
          placeholder="Pilih status akademika"
          options={seminarStatusOptions}
          required
        />

        {watchedValues.registration_type === "grup" && <SeminarMemberFields />}

        <Field className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-[8px]"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button type="submit" className="h-11 rounded-[8px]">
            Continue to identity check
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
