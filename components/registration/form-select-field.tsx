import type { FieldPath, FieldValues } from "react-hook-form";
import { Controller, useFormContext } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type SelectOption<TValue extends string> = {
  id: TValue;
  title: string;
};

type FormSelectFieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
  TValue extends string,
> = {
  name: TName;
  label: string;
  id?: string;
  options: readonly SelectOption<TValue>[];
  className?: string;
  selectClassName?: string;
};

export function FormSelectField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
  TValue extends string,
>({
  name,
  label,
  id = String(name),
  options,
  className = "gap-2",
  selectClassName = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
}: FormSelectFieldProps<TValues, TName, TValue>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<TValues>();
  const fieldError = errors[name];

  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            id={id}
            className={selectClassName}
            value={field.value}
            onChange={field.onChange}
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        )}
      />
      {fieldError ? <FieldError>{String(fieldError.message)}</FieldError> : null}
    </Field>
  );
}
