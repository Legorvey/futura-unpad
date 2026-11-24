"use client";

import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";
import {
  seminarSchoolJenjangOptions,
  seminarStatusOptions,
} from "@/lib/seminar/seminar-options";
import { SEMINAR_VERIFICATION_FIELDS } from "@/lib/seminar/seminar-verification-fields";

import { FormTextField } from "@/components/form/form-text-field";
import { SeminarInstitutionField } from "./seminar-institution-field";

type SeminarVerificationEditFormProps = {
  flashDoneButton: boolean;
  onDone: () => void;
};

export default function SeminarVerificationEditForm({
  flashDoneButton,
  onDone,
}: SeminarVerificationEditFormProps) {
  const { control, getValues, setValue, trigger } =
    useFormContext<ClientSeminarFormValues>();
  const { fields: memberFields } = useFieldArray({
    control,
    name: "members",
  });
  const [
    registrationType,
    statusAkademika,
    rawSchoolJenjang,
    isSameInstitution,
    mainInstitusi,
  ] = useWatch({
    control,
    name: [
      "registration_type",
      "status_akademika",
      "school_jenjang",
      "is_same_institution",
      "institusi",
    ],
  });
  const isGroup = registrationType === "grup";
  const isStudent = statusAkademika === "siswa";
  const schoolJenjang = rawSchoolJenjang ?? "SMA";

  const handleDone = async () => {
    const isValid = await trigger(SEMINAR_VERIFICATION_FIELDS);
    if (isValid) {
      onDone();
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {isGroup && (
        <FormTextField<ClientSeminarFormValues>
          name="group_name"
          label="Nama Grup/Tim"
          placeholder="Masukkan nama grup atau komunitas Anda"
          className="sm:col-span-2"
        />
      )}
      <FormTextField<ClientSeminarFormValues>
        name="nama"
        label={isGroup ? "Nama Lengkap (Kontak Utama)" : "Nama Lengkap"}
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
      <Field className="gap-2">
        <FieldLabel htmlFor="verify-status_akademika">
          Status Akademika
        </FieldLabel>
        <Controller
          name="status_akademika"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Select
                value={String(field.value ?? "")}
                onValueChange={(nextStatus) => {
                  const prevWasStudent = field.value === "siswa";
                  const nextIsStudent = nextStatus === "siswa";
                  field.onChange(nextStatus);
                  if (prevWasStudent !== nextIsStudent) {
                    setValue("institusi", "", { shouldValidate: false });
                    const members = getValues("members") ?? [];
                    members.forEach((_, index) => {
                      setValue(`members.${index}.institusi`, "", {
                        shouldValidate: false,
                      });
                    });
                  }
                }}
              >
                <SelectTrigger
                  id="verify-status_akademika"
                  className="h-11 w-full rounded-[8px] data-[size=default]:h-11"
                  aria-invalid={!!fieldState.error}
                  aria-describedby={
                    fieldState.error
                      ? "verify-status_akademika-error"
                      : undefined
                  }
                >
                  <SelectValue placeholder="Pilih status akademika" />
                </SelectTrigger>
                <SelectContent className="seminar-wrapper bg-popover text-popover-foreground border-border">
                  {seminarStatusOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error ? (
                <FieldError id="verify-status_akademika-error">
                  {String(fieldState.error.message)}
                </FieldError>
              ) : null}
            </>
          )}
        />
      </Field>

      {isStudent ? (
        <Field className="gap-2">
          <FieldLabel htmlFor="verify-school_jenjang">
            Jenjang Sekolah
          </FieldLabel>
          <Controller
            name="school_jenjang"
            control={control}
            render={({ field }) => (
              <Select
                value={String(field.value ?? "SMA")}
                onValueChange={(nextJenjang) => {
                  field.onChange(nextJenjang);
                  setValue("institusi", "", { shouldValidate: false });
                  const members = getValues("members") ?? [];
                  members.forEach((_, index) => {
                    setValue(`members.${index}.institusi`, "", {
                      shouldValidate: false,
                    });
                  });
                }}
              >
                <SelectTrigger
                  id="verify-school_jenjang"
                  className="h-11 w-full rounded-[8px] data-[size=default]:h-11"
                >
                  <SelectValue placeholder="Pilih jenjang sekolah" />
                </SelectTrigger>
                <SelectContent className="seminar-wrapper bg-popover text-popover-foreground border-border">
                  {seminarSchoolJenjangOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      ) : null}

      <SeminarInstitutionField
        name="institusi"
        label={isStudent ? "Asal Sekolah" : "Asal Institusi"}
        statusAkademika={statusAkademika}
        schoolJenjang={schoolJenjang}
        className="sm:col-span-2"
      />

      {isGroup && memberFields.length > 0 && (
        <div className="sm:col-span-2 space-y-4 pt-4 border-t border-border mt-2">
          <h3 className="text-sm font-semibold text-foreground">
            Anggota Grup
          </h3>
          {memberFields.map((field, index) => (
            <div key={field.id} className="grid gap-4 sm:grid-cols-2 items-start">
              <FormTextField<ClientSeminarFormValues>
                name={`members.${index}.nama`}
                label={`Nama Anggota ${index + 1}`}
              />
              <SeminarInstitutionField
                name={`members.${index}.institusi`}
                label={isStudent ? "Asal Sekolah" : "Asal Institusi"}
                statusAkademika={statusAkademika}
                schoolJenjang={schoolJenjang}
                disabled={isSameInstitution}
                displayValue={
                  isSameInstitution ? (mainInstitusi ?? "") : undefined
                }
              />
            </div>
          ))}
        </div>
      )}

      <div className="sm:col-span-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          className={cn(
            "h-11 rounded-[8px] px-5 transition-colors duration-300",
            flashDoneButton &&
              "bg-destructive text-white hover:bg-destructive/90"
          )}
          onClick={handleDone}
        >
          Selesai Mengedit
        </Button>
      </div>
    </div>
  );
}
