import { useRef, type ChangeEvent } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FileText, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { MechaturaFormValues } from "@/lib/validation/mechatura";

type CompactFileFieldName = "member_document" | "robot_document";

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

function getFiles(value: unknown) {
  if (typeof FileList !== "undefined" && value instanceof FileList) {
    return Array.from(value);
  }

  if (typeof File !== "undefined" && value instanceof File) {
    return [value];
  }

  return [];
}

export function CompactFileEditField({
  name,
  label,
  accept,
  maxSizeInBytes,
}: {
  name: CompactFileFieldName;
  label: string;
  accept: string;
  maxSizeInBytes: number;
}) {
  const { control } = useFormContext<MechaturaFormValues>();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = `${name}-verification-file`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const files = getFiles(field.value);
        const hasFiles = files.length > 0;

        const updateFiles = (event: ChangeEvent<HTMLInputElement>) => {
          field.onChange(event.currentTarget.files);
        };

        const deleteFiles = () => {
          if (inputRef.current) {
            inputRef.current.value = "";
          }

          field.onChange(null);
        };

        return (
          <Field className="gap-2">
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
            <input
              id={inputId}
              type="file"
              accept={accept}
              name={field.name}
              className="sr-only"
              ref={(element) => {
                inputRef.current = element;
                field.ref(element);
              }}
              onBlur={field.onBlur}
              onChange={updateFiles}
            />

            <div
              className={cn(
                "flex flex-col gap-3 rounded-[8px] border bg-muted/20 p-3 sm:flex-row sm:items-center",
                fieldState.error && "border-destructive bg-destructive/5"
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-primary">
                  <FileText className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {hasFiles
                      ? files.map((file) => file.name).join(", ")
                      : "Belum ada file yang dipilih"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {hasFiles
                      ? files.map((file) => formatFileSize(file.size)).join(" + ")
                      : `Pilih file PDF, maksimal ${formatFileSize(maxSizeInBytes)}.`}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                >
                  <Pencil className="size-4" />
                  {hasFiles ? "Edit" : "Upload"}
                </Button>
                {hasFiles ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label={`Hapus ${label}`}
                    onClick={deleteFiles}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>

            {fieldState.error ? (
              <FieldError>{String(fieldState.error.message)}</FieldError>
            ) : null}
          </Field>
        );
      }}
    />
  );
}

