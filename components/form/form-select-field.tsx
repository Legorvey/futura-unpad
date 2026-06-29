import type { FieldPath, FieldValues } from "react-hook-form";
import { Controller, useFormContext } from "react-hook-form";

import {
  Field,
  FieldError,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface SelectOption {
  id: string;
  title: string;
}

export interface FormSelectFieldProps<TValues extends FieldValues> {
  name: FieldPath<TValues>;
  label: ReactNode;
  options: readonly SelectOption[];
  placeholder?: string;
  description?: ReactNode;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  required?: boolean;
}

export function FormSelectField<TValues extends FieldValues = FieldValues>({
  name,
  label,
  placeholder,
  options,
  description,
  className,
  inputClassName,
  disabled,
  required,
}: FormSelectFieldProps<TValues>) {
  const {
    control,
  } = useFormContext<TValues>();
  const id = String(name);

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
            <Select
              value={String(field.value ?? "")}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger
                id={id}
                className={cn("h-11 rounded-[8px]", inputClassName)}
                aria-invalid={!!fieldState.error}
                aria-describedby={fieldState.error ? `${id}-error` : undefined}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
            {fieldState.error ? (
              <FieldError id={`${id}-error`}>
                {String(fieldState.error.message)}
              </FieldError>
            ) : null}
          </>
        )}
      />
    </Field>
  );
}
