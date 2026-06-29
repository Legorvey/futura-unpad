import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { useFormContext } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type FormTextFieldProps<TValues extends FieldValues> = {
  name: FieldPath<TValues>;
  label: ReactNode;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  id?: string;
  description?: string;
  className?: string;
  inputClassName?: string;
  required?: boolean;
};

export function FormTextField<TValues extends FieldValues>({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  id = String(name),
  description,
  className = "gap-2",
  inputClassName = "h-11 rounded-[8px]",
  required = false,
}: FormTextFieldProps<TValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TValues>();
  const fieldError = errors[name];
  const errorId = fieldError ? `${id}-error` : undefined;

  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>
        {label} {required ? <span aria-hidden="true">*</span> : null}
      </FieldLabel>
      <Input
        id={id}
        type={type}
        className={inputClassName}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!fieldError}
        aria-describedby={errorId}
        {...register(name)}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {fieldError ? (
        <FieldError id={errorId}>{String(fieldError.message)}</FieldError>
      ) : null}
    </Field>
  );
}
