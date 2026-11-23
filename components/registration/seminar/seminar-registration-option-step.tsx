"use client";

import type { BaseSyntheticEvent } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";
import { seminarRegistrationOptions } from "@/lib/seminar/seminar-options";

type SeminarRegistrationOptionStepProps = {
  onSubmit: (event?: BaseSyntheticEvent) => void;
};

export default function SeminarRegistrationOptionStep({
  onSubmit,
}: SeminarRegistrationOptionStepProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ClientSeminarFormValues>();
  const { fields: memberFields, append: appendMember } = useFieldArray({
    control,
    name: "members",
  });

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <FieldSet className="gap-3">
          <FieldLegend variant="label" id="seminar-registration-option-label">
            Pilih Opsi Pendaftaran
          </FieldLegend>
          <Controller
            name="registration_type"
            control={control}
            render={({ field }) => (
              <RadioGroup
                aria-labelledby="seminar-registration-option-label"
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  if (val === "individu") {
                    setValue("members", []);
                  } else if (val === "grup" && memberFields.length === 0) {
                    appendMember({ nama: "", institusi: "" });
                  }
                }}
              >
                {seminarRegistrationOptions.map((option) => (
                  <FieldLabel
                    key={option.id}
                    htmlFor={`reg-option-${option.id}`}
                    className="has-[>[data-slot=field]]:rounded-[8px]"
                  >
                    <Field orientation="horizontal" className="py-4">
                      <FieldContent>
                        <FieldTitle>{option.title}</FieldTitle>
                        <FieldDescription>{option.description}</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem
                        id={`reg-option-${option.id}`}
                        value={option.id}
                      />
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
            )}
          />
          {errors.registration_type ? (
            <FieldError>{errors.registration_type.message}</FieldError>
          ) : null}
        </FieldSet>
        <Button type="submit" className="h-11 rounded-[8px] mt-4">
          Lanjutkan
        </Button>
      </FieldGroup>
    </form>
  );
}
