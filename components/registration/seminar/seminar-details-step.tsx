"use client";

import type { BaseSyntheticEvent } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";
import {
  seminarSchoolJenjangOptions,
  seminarStatusOptions,
} from "@/lib/seminar/seminar-options";

import { FormTextField } from "@/components/form/form-text-field";
import { SeminarInstitutionField } from "./seminar-institution-field";
import { SeminarMemberFields } from "./seminar-member-fields";

type SeminarDetailsStepProps = {
  isSubmitting: boolean;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  onBack: () => void;
};

export default function SeminarDetailsStep({
  isSubmitting,
  onSubmit,
  onBack,
}: SeminarDetailsStepProps) {
  const { control, getValues, setValue, watch } =
    useFormContext<ClientSeminarFormValues>();
  const registrationType = watch("registration_type");
  const statusAkademika = watch("status_akademika");
  const email = watch("email");
  const schoolJenjang = watch("school_jenjang") ?? "SMA";
  const isGroup = registrationType === "grup";
  const isStudent = statusAkademika === "siswa";

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup className="gap-6">
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Detail Informasi
            </h2>
            <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
              Mohon isi identitas lengkap untuk registrasi seminar dan persiapan sertifikat.
            </p>
          </div>

          <div className="space-y-6 p-4 sm:p-6">
            <FormTextField<ClientSeminarFormValues>
              name="nama"
              label={isGroup ? "Nama Lengkap (Kontak Utama)" : "Nama Lengkap"}
              placeholder="Nama sesuai identitas"
              autoComplete="name"
            />

            <div className="grid gap-3 sm:grid-cols-2 items-start">
              <Field className="gap-2">
                <FieldLabel>
                  {isGroup ? "Email (Kontak Utama)" : "Email"}
                </FieldLabel>
                <div className="flex h-11 w-full items-center rounded-[8px] border border-input bg-muted/40 px-3 text-sm text-foreground">
                  <span className="truncate">{email || "-"}</span>
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                  Diambil dari tahap pertama. Kembali ke tahap 1 untuk mengubah email.
                </p>
              </Field>

              <FormTextField<ClientSeminarFormValues>
                name="telp"
                label={
                  isGroup ? "Nomor WhatsApp (Kontak Utama)" : "Nomor WhatsApp"
                }
                placeholder="+62 8XX-XXXX-XXXX"
                autoComplete="tel"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 items-start">
              <Field className="gap-2">
                <FieldLabel htmlFor="status_akademika">
                  Status Akademika
                </FieldLabel>
                <Controller
                  name="status_akademika"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        value={String(field.value ?? "")}
                        onValueChange={(nextStatus) => {
                          const prevWasStudent = field.value === "siswa";
                          const nextIsStudent = nextStatus === "siswa";
                          field.onChange(nextStatus);
                          if (prevWasStudent !== nextIsStudent) {
                            setValue("institusi", "", { shouldValidate: false });
                            const members = getValues("members") ?? [];
                            members.forEach((_, index) => {
                              setValue(`members.${index}.institusi`, "", {
                                shouldValidate: false,
                              });
                            });
                          }
                        }}
                      >
                        <SelectTrigger
                          id="status_akademika"
                          className="h-11 w-full rounded-[8px] data-[size=default]:h-11"
                          aria-invalid={!!fieldState.error}
                          aria-describedby={
                            fieldState.error
                              ? "status_akademika-error"
                              : undefined
                          }
                        >
                          <SelectValue placeholder="Pilih status akademika" />
                        </SelectTrigger>
                        <SelectContent className="seminar-wrapper bg-popover text-popover-foreground border-border">
                          {seminarStatusOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error ? (
                        <FieldError id="status_akademika-error">
                          {String(fieldState.error.message)}
                        </FieldError>
                      ) : null}
                    </>
                  )}
                />
              </Field>

              {isStudent ? (
                <Field className="gap-2">
                  <FieldLabel htmlFor="school_jenjang">
                    Jenjang Sekolah
                  </FieldLabel>
                  <Controller
                    name="school_jenjang"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={String(field.value ?? "SMA")}
                        onValueChange={(nextJenjang) => {
                          field.onChange(nextJenjang);
                          setValue("institusi", "", { shouldValidate: false });
                          const members = getValues("members") ?? [];
                          members.forEach((_, index) => {
                            setValue(`members.${index}.institusi`, "", {
                              shouldValidate: false,
                            });
                          });
                        }}
                      >
                        <SelectTrigger
                          id="school_jenjang"
                          className="h-11 w-full rounded-[8px] data-[size=default]:h-11"
                        >
                          <SelectValue placeholder="Pilih jenjang sekolah" />
                        </SelectTrigger>
                        <SelectContent className="seminar-wrapper bg-popover text-popover-foreground border-border">
                          {seminarSchoolJenjangOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              ) : (
                <SeminarInstitutionField
                  name="institusi"
                  label={
                    isGroup ? "Asal Institusi (Kontak Utama)" : "Asal Institusi"
                  }
                  statusAkademika={statusAkademika}
                  schoolJenjang={schoolJenjang}
                />
              )}
            </div>

            {isStudent ? (
              <SeminarInstitutionField
                name="institusi"
                label={
                  isGroup ? "Asal Sekolah (Kontak Utama)" : "Asal Sekolah"
                }
                statusAkademika={statusAkademika}
                schoolJenjang={schoolJenjang}
              />
            ) : null}

            {isGroup && <SeminarMemberFields />}
          </div>
        </section>

        <Field className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-[8px]"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Kembali
          </Button>
          <Button
            type="submit"
            className="h-11 rounded-[8px]"
            disabled={isSubmitting}
          >
            Lanjutkan ke verifikasi identitas
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
