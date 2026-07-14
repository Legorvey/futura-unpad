import { Controller, useFormContext } from "react-hook-form";

import { FormFileField } from "@/components/form/form-file-field";
import { FormTextField } from "@/components/form/form-text-field";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ClientLombaEssayFormValues } from "@/lib/validation/essay";
import { essaySubThemeOptions } from "../../../lib/essay/essay-options";

export default function EssayPaperInformationSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ClientLombaEssayFormValues>();

  return (
    <section className="space-y-4" aria-labelledby="paper-section-label">
      <div>
        <h2 id="paper-section-label" className="text-lg font-semibold">
          Karya Tulis
        </h2>
      </div>

      <FormTextField<ClientLombaEssayFormValues>
        name="paper_title"
        label="Judul Karya Tulis"
        placeholder="Judul lengkap karya tulis ilmiah"
        description="Judul dapat disesuaikan hingga batas akhir pengumpulan berkas."
        required
      />

      <Field className="gap-3">
        <FieldLabel>
          Sub-Tema <span aria-hidden="true">*</span>
        </FieldLabel>
        <Controller
          name="sub_theme"
          control={control}
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange}>
              {essaySubThemeOptions.map((option) => (
                <FieldLabel
                  key={option.id}
                  htmlFor={`sub-theme-${option.id}`}
                  className="has-[>[data-slot=field]]:rounded-[8px]"
                >
                  <Field orientation="horizontal" className="py-4">
                    <FieldContent>
                      <FieldTitle>{option.title}</FieldTitle>
                      <FieldDescription>{option.description}</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      id={`sub-theme-${option.id}`}
                      value={option.id}
                    />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
          )}
        />
        {errors.sub_theme ? (
          <FieldError>{errors.sub_theme.message}</FieldError>
        ) : null}
      </Field>
    </section>
  );
}

