"use client";

import * as React from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { Controller, useFormContext } from "react-hook-form";
import type { ReactNode } from "react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  SchoolCombobox,
  type InstitutionType,
} from "@/components/school-combobox";
import { cn } from "@/lib/utils";

export interface FormSchoolFieldProps<TValues extends FieldValues> {
  name: FieldPath<TValues>;
  label: ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function FormSchoolField<TValues extends FieldValues = FieldValues>({
  name,
  label,
  className,
  disabled,
  required,
}: FormSchoolFieldProps<TValues>) {
  const { control } = useFormContext<TValues>();
  const id = String(name);

  // institution_type is local UI state — not persisted in form
  const [institutionType, setInstitutionType] =
    React.useState<InstitutionType>("SD");

  return (
    <Field className={cn("gap-2", className)}>
      <FieldLabel htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <SchoolCombobox
              id={id}
              value={field.value ?? ""}
              onChange={field.onChange}
              institutionType={institutionType}
              disabled={disabled}
              aria-invalid={!!fieldState.error}
              aria-describedby={
                fieldState.error ? `${id}-error` : undefined
              }
            />
            {fieldState.error && (
              <FieldError id={`${id}-error`}>
                {String(fieldState.error.message)}
              </FieldError>
            )}
          </>
        )}
      />
    </Field>
  );
}
