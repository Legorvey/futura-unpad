"use client";

import type { ReactNode } from "react";
import { Controller, useFormContext, type FieldPath } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  PlainInstitutionInput,
  SchoolCombobox,
  type InstitutionType,
} from "@/components/school-combobox";
import { cn } from "@/lib/utils";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";

type SchoolJenjang = Extract<InstitutionType, "SD" | "SMP" | "SMA" | "SMK">;

type SeminarInstitutionFieldProps = {
  name: FieldPath<ClientSeminarFormValues>;
  label: ReactNode;
  statusAkademika: ClientSeminarFormValues["status_akademika"];
  schoolJenjang?: SchoolJenjang;
  disabled?: boolean;
  required?: boolean;
  displayValue?: string;
  className?: string;
};

function getInstitutionPlaceholder(
  statusAkademika: ClientSeminarFormValues["status_akademika"]
): string {
  if (statusAkademika === "mahasiswa" || statusAkademika === "dosen") {
    return "Tulis nama lengkap perguruan tinggi (contoh: Universitas Padjadjaran)";
  }

  return 'Nama instansi / komunitas (isi "-" jika tidak ada)';
}

export function SeminarInstitutionField({
  name,
  label,
  statusAkademika,
  schoolJenjang = "SMA",
  disabled,
  required,
  displayValue,
  className,
}: SeminarInstitutionFieldProps) {
  const { control } = useFormContext<ClientSeminarFormValues>();
  const id = String(name);
  const isSchoolSearch = statusAkademika === "siswa" && !disabled;

  return (
    <Field className={cn("gap-2", className)}>
      <FieldLabel htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const currentValue =
            displayValue !== undefined
              ? displayValue
              : typeof field.value === "string"
                ? field.value
                : "";

          return (
            <>
              {isSchoolSearch ? (
                <SchoolCombobox
                  id={id}
                  value={currentValue}
                  onChange={field.onChange}
                  institutionType={schoolJenjang}
                  disabled={disabled}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={
                    fieldState.error ? `${id}-error` : undefined
                  }
                />
              ) : (
                <PlainInstitutionInput
                  id={id}
                  value={currentValue}
                  onChange={field.onChange}
                  disabled={disabled}
                  placeholder={getInstitutionPlaceholder(statusAkademika)}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={
                    fieldState.error ? `${id}-error` : undefined
                  }
                />
              )}
              {fieldState.error ? (
                <FieldError id={`${id}-error`}>
                  {String(fieldState.error.message)}
                </FieldError>
              ) : null}
            </>
          );
        }}
      />
    </Field>
  );
}
