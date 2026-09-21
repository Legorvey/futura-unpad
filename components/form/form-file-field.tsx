import type { ChangeEvent, DragEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import type { FieldPath, FieldValues, RegisterOptions } from "react-hook-form";
import { Controller, useFormContext } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FileText, UploadCloud, X } from "lucide-react";

type FileValidationResult = true | string;

export interface FormFileFieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues> = FieldPath<TValues>
> extends Omit<
    React.ComponentProps<"input">,
    | "className"
    | "defaultValue"
    | "name"
    | "onChange"
    | "required"
    | "title"
    | "type"
    | "value"
  > {
  name: TName;
  label?: ReactNode | null;
  title?: ReactNode | null;
  description?: ReactNode;
  maxSizeInBytes?: number;
  maxSizeLabel?: ReactNode;
  maxSizeErrorMessage?: string;
  className?: string;
  inputClassName?: string;
  fieldClassName?: string;
  required?: boolean;
  requiredMessage?: string;
  rules?: RegisterOptions<TValues, TName>;
  onFileChange?: (
    files: FileList | null,
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  variant?: "drag-drop" | "button";
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const size = bytes / 1024 ** exponent;
  const digits = size >= 10 || exponent === 0 ? 0 : 1;

  return `${size.toFixed(digits)} ${units[exponent]}`;
}

function formatAcceptedTypes(accept?: string) {
  if (!accept) {
    return null;
  }

  const labels = accept
    .split(",")
    .map((type) => type.trim())
    .filter(Boolean)
    .map((type) => {
      if (type === "application/pdf" || type === ".pdf") {
        return "PDF";
      }

      if (type.startsWith("image/")) {
        return "Images";
      }

      return type.toUpperCase();
    });

  return [...new Set(labels)].join(", ");
}

function getFiles(value: unknown) {
  if (typeof File !== "undefined" && value instanceof File) {
    return [value];
  }

  if (typeof FileList !== "undefined" && value instanceof FileList) {
    return Array.from(value);
  }

  if (Array.isArray(value)) {
    return value.filter(
      (item): item is File =>
        typeof File !== "undefined" && item instanceof File
    );
  }

  return [];
}

function getSingleFileList(files: FileList, multiple?: boolean) {
  if (multiple || files.length <= 1 || typeof DataTransfer === "undefined") {
    return files;
  }

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(files[0]);

  return dataTransfer.files;
}

function createMaxSizeValidator(maxSizeInBytes?: number, message?: string) {
  return (value: unknown): FileValidationResult => {
    if (!maxSizeInBytes) {
      return true;
    }

    const hasOversizedFile = getFiles(value).some(
      (file) => file.size > maxSizeInBytes
    );

    if (!hasOversizedFile) {
      return true;
    }

    return message ?? `File must be ${formatFileSize(maxSizeInBytes)} or less.`;
  };
}

function mergeValidators<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>
>(
  validate: RegisterOptions<TValues, TName>["validate"],
  maxSizeValidator: (value: unknown) => FileValidationResult
): RegisterOptions<TValues, TName>["validate"] {
  if (!validate) {
    return maxSizeValidator as RegisterOptions<TValues, TName>["validate"];
  }

  if (typeof validate === "function") {
    return (async (value, formValues) => {
      const result = await validate(value, formValues);

      if (result !== true) {
        return result;
      }

      return maxSizeValidator(value);
    }) as RegisterOptions<TValues, TName>["validate"];
  }

  return {
    ...validate,
    maxFileSize: maxSizeValidator,
  } as RegisterOptions<TValues, TName>["validate"];
}

export function FormFileField<
  TValues extends FieldValues = FieldValues,
  TName extends FieldPath<TValues> = FieldPath<TValues>
>({
  name,
  label,
  title,
  description,
  maxSizeInBytes,
  maxSizeLabel,
  maxSizeErrorMessage,
  className,
  inputClassName,
  disabled,
  required,
  requiredMessage = "File is required.",
  rules,
  onFileChange,
  fieldClassName,
  id: idProp,
  accept,
  multiple,
  variant = "drag-drop",
  ...props
}: FormFileFieldProps<TValues, TName>) {
  const { control } = useFormContext<TValues>();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const id = idProp ?? String(name);
  const fieldTitle =
    title !== undefined
      ? title
      : label !== undefined
        ? label
        : "Unggah file anda";
  const descriptionId = description ? `${id}-description` : undefined;
  const maxSizeId = maxSizeInBytes ? `${id}-max-size` : undefined;
  const maxSizeText =
    maxSizeLabel ??
    (maxSizeInBytes
      ? `Maximum file size: ${formatFileSize(maxSizeInBytes)}.`
      : null);
  const acceptedTypesText =
    typeof accept === "string" ? formatAcceptedTypes(accept) : null;
  const selectedFileText =
    selectedFiles.length === 1
      ? selectedFiles[0].name
      : `${selectedFiles.length} files selected`;
  const { validate, ...restRules } = rules ?? {};

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        ...restRules,
        required: rules?.required ?? (required ? requiredMessage : undefined),
        validate: mergeValidators(
          validate,
          createMaxSizeValidator(maxSizeInBytes, maxSizeErrorMessage)
        ),
      }}
      render={({ field, fieldState }) => {
        const errorId = fieldState.error ? `${id}-error` : undefined;
        const describedBy = [descriptionId, maxSizeId, errorId]
          .filter(Boolean)
          .join(" ");

        const setInputFiles = (files: FileList) => {
          if (!inputRef.current) {
            return files;
          }

          try {
            inputRef.current.files = files;
            return inputRef.current.files;
          } catch {
            return files;
          }
        };

        const updateFiles = (files: FileList | null) => {
          setSelectedFiles(files ? Array.from(files) : []);
          field.onChange(files);
        };

        const handleDrop = (event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          event.stopPropagation();
          dragDepth.current = 0;
          setIsDragging(false);

          if (disabled || event.dataTransfer.files.length === 0) {
            return;
          }

          const files = getSingleFileList(event.dataTransfer.files, multiple);
          updateFiles(setInputFiles(files));
        };

        const clearFiles = () => {
          if (inputRef.current) {
            inputRef.current.value = "";
          }

          updateFiles(null);
        };

        return (
          <Field className={cn("gap-2", className, fieldClassName)}>
            {fieldTitle ? (
              <FieldLabel htmlFor={id}>
                {fieldTitle} {required ? <span aria-hidden="true">*</span> : null}
              </FieldLabel>
            ) : null}

            <div
              className={cn(
                "overflow-hidden rounded-[8px] transition-all",
                variant === "drag-drop" && "border border-dashed border-input bg-muted/30",
                variant === "button" && "border border-input bg-background shadow-sm",
                "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
                isDragging &&
                  "border-primary bg-primary/5 ring-3 ring-primary/15",
                fieldState.error &&
                  "border-destructive bg-destructive/5 ring-3 ring-destructive/15",
                disabled && "cursor-not-allowed opacity-60",
                inputClassName
              )}
              onDragEnter={(event) => {
                event.preventDefault();
                event.stopPropagation();
                dragDepth.current += 1;
                if (!disabled) {
                  setIsDragging(true);
                }
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                event.stopPropagation();
                dragDepth.current = Math.max(0, dragDepth.current - 1);
                if (dragDepth.current === 0) {
                  setIsDragging(false);
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.stopPropagation();
                event.dataTransfer.dropEffect = "copy";
              }}
              onDrop={handleDrop}
            >
              <Input
                id={id}
                type="file"
                className="sr-only"
                disabled={disabled}
                required={required}
                aria-describedby={describedBy || undefined}
                aria-invalid={!!fieldState.error}
                {...props}
                accept={accept}
                multiple={multiple}
                name={field.name}
                ref={(element) => {
                  inputRef.current = element;
                  field.ref(element);
                }}
                onBlur={field.onBlur}
                onChange={(event) => {
                  updateFiles(event.currentTarget.files);
                  onFileChange?.(event.currentTarget.files, event);
                }}
              />

              {selectedFiles.length === 0 && variant === "drag-drop" ? (
                <label
                  htmlFor={id}
                  className={cn(
                    "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 px-6 py-6 text-center",
                    "hover:bg-background/60",
                    disabled && "pointer-events-none cursor-not-allowed"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-14 items-center justify-center rounded-full border bg-background shadow-xs transition-colors",
                      isDragging &&
                        "border-primary bg-primary text-primary-foreground"
                    )}
                    aria-hidden="true"
                  >
                    <UploadCloud className="size-7" />
                  </span>
                  <span className="space-y-1">
                    <span className="block text-sm font-medium">
                      {isDragging
                        ? "Drop your file here"
                        : "Drag and drop your file here"}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      or{" "}
                      <span className="font-medium text-primary">
                        browse from device
                      </span>
                    </span>
                  </span>
                </label>
              ) : null}

              {selectedFiles.length === 0 && variant === "button" ? (
                <label
                  htmlFor={id}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-center gap-2 bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80 text-foreground",
                    disabled && "pointer-events-none opacity-50"
                  )}
                >
                  <UploadCloud className="size-4 opacity-70" />
                  {fieldTitle === "Unggah file anda" ? "Browse File..." : `Pilih ${fieldTitle}`}
                </label>
              ) : null}

              {selectedFiles.length > 0 ? (
                <div className={cn("bg-background/80", variant === "drag-drop" ? "border-t p-3" : "p-1")}>
                  <div className={cn("flex items-center gap-3 rounded-[8px] bg-muted/60", variant === "drag-drop" ? "px-3 py-2" : "px-3 py-2")}>
                    <FileText
                      className="size-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {selectedFileText}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {selectedFiles
                          .map((file) => formatFileSize(file.size))
                          .join(" + ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
                      onClick={clearFiles}
                      disabled={disabled}
                      aria-label="Remove selected file"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {fieldState.error ? (
              <FieldError id={errorId}>
                {String(fieldState.error.message)}
              </FieldError>
            ) : null}

            <span className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              {acceptedTypesText ? <span>{acceptedTypesText}</span> : null}
              {maxSizeText ? <span id={maxSizeId}>{maxSizeText}</span> : null}
            </span>

            {description ? (
              <p id={descriptionId} className="text-sm">
                {description}
              </p>
            ) : null}
          </Field>
        );
      }}
    />
  );
}

export default FormFileField;
