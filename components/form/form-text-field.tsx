import type {
  FieldError as ReactHookFormFieldError,
  FieldErrors,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { useFormContext } from "react-hook-form";

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface FormTextFieldProps<TValues extends FieldValues>
  extends Omit<React.ComponentProps<"input">, "name" | "className" | "required"> {
  name: FieldPath<TValues>;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  fieldClassName?: string;
}

function getFieldError<TValues extends FieldValues>(
  errors: FieldErrors<TValues>,
  name: FieldPath<TValues>
) {
  return String(name)
    .split(".")
    .reduce<unknown>((error, key) => {
      if (error && typeof error === "object") {
        return (error as Record<string, unknown>)[key];
      }

      return undefined;
    }, errors) as ReactHookFormFieldError | undefined;
}

export function FormTextField<TValues extends FieldValues = FieldValues>({
  name,
  label,
  type,
  placeholder,
  autoComplete,
  description,
  className,
  inputClassName,
  disabled,
  required,
  fieldClassName,
  ...props
}: FormTextFieldProps<TValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TValues>();

  const error = getFieldError(errors, name);
  const id = String(name);

  return (
    <Field className={cn("gap-2", className, fieldClassName)}>
      <FieldLabel htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </FieldLabel>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn("h-11 rounded-[8px]", inputClassName)}
        disabled={disabled}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
        {...register(name)}
        {...props}
      />
      {description && !error ? (
        <p className="text-[0.8rem] text-muted-foreground">{description}</p>
      ) : null}
      {error ? (
        <FieldError id={`${id}-error`}>{String(error.message)}</FieldError>
      ) : null}
    </Field>
  );
}
