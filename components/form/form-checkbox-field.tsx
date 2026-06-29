import type { FieldPath, FieldValues } from "react-hook-form";
import { Controller, useFormContext } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface FormCheckboxFieldProps<TValues extends FieldValues> {
  name: FieldPath<TValues>;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  inputClassName?: string;
  fieldClassName?: string;
  disabled?: boolean;
  required?: boolean;
  onCheckedChangeAction?: (val: boolean) => void;
}

export function FormCheckboxField<TValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  className,
  inputClassName,
  disabled,
  fieldClassName,
  onCheckedChangeAction,
}: FormCheckboxFieldProps<TValues>) {
  const {
    control,
  } = useFormContext<TValues>();
  const id = String(name);

  return (
    <div className="flex flex-col gap-2">
      <Field
        orientation="horizontal"
        className={cn(
          "items-center gap-2 rounded-[8px] border bg-muted/50 p-4",
          className,
          fieldClassName
        )}
      >
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState }) => (
            <Checkbox
              id={id}
              checked={field.value === true}
              className={inputClassName}
              disabled={disabled}
              onCheckedChange={(val) => {
                const checked = val === true;
                field.onChange(checked);
                onCheckedChangeAction?.(checked);
              }}
              aria-invalid={!!fieldState.error}
              aria-describedby={fieldState.error ? `${id}-error` : undefined}
            />
          )}
        />
        <FieldContent>
          <FieldLabel htmlFor={id} className="cursor-pointer font-normal">
            {label}
          </FieldLabel>
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
        </FieldContent>
      </Field>
      <Controller
        name={name}
        control={control}
        render={({ fieldState }) =>
          fieldState.error ? (
            <FieldError id={`${id}-error`}>
              {String(fieldState.error.message)}
            </FieldError>
          ) : (
            <></>
          )
        }
      />
    </div>
  );
}
