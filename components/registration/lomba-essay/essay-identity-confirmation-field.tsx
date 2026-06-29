import { Controller, useFormContext } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { ClientLombaEssayFormValues } from "@/lib/validation/essay";

export default function EssayIdentityConfirmationField() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ClientLombaEssayFormValues>();

  return (
    <>
      <Field
        orientation="horizontal"
        className="items-start rounded-[8px] border p-4"
      >
        <Controller
          name="identity_confirmed"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="identity-confirmed"
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-invalid={!!errors.identity_confirmed}
              aria-describedby={
                errors.identity_confirmed
                  ? "identity-confirmed-error"
                  : undefined
              }
            />
          )}
        />
        <FieldContent>
          <FieldLabel htmlFor="identity-confirmed">
            Saya menyatakan data yang diisi sudah benar.
          </FieldLabel>
          <FieldDescription>
            Nama, NIM, judul, dan sub-tema akan digunakan untuk proses seleksi
            dan publikasi hasil lomba.
          </FieldDescription>
        </FieldContent>
      </Field>

      {errors.identity_confirmed ? (
        <FieldError id="identity-confirmed-error">
          {errors.identity_confirmed.message}
        </FieldError>
      ) : null}
    </>
  );
}
