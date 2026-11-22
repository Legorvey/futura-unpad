import type { BaseSyntheticEvent } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";
import { seminarStatusOptions } from "../../../lib/seminar/seminar-options";

import { FormTextField } from "@/components/form/form-text-field";
import { FormSelectField } from "@/components/form/form-select-field";
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
  const { watch } = useFormContext<ClientSeminarFormValues>();
  const watchedValues = watch();

  return (
    <form onSubmit={onSubmit} noValidate>
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4 sm:p-6">
          <h2 className="text-lg font-semibold">
            Detail Informasi
          </h2>
          <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
            Mohon isi identitas lengkap untuk registrasi seminar
          </p>
        </div>

        <div className="space-y-6 p-4 sm:p-6">
          {watchedValues.registration_type === "grup" && (
            <FormTextField<ClientSeminarFormValues>
              name="group_name"
              label="Nama Grup/Tim"
              placeholder="Masukkan nama grup atau komunitas Anda"
              required
            />
          )}

          <FormTextField<ClientSeminarFormValues>
            name="nama"
            label={`Nama Lengkap ${watchedValues.registration_type === "grup" ? "(Kontak Utama)" : ""}`}
            placeholder="Nama sesuai identitas"
            autoComplete="name"
            required
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <FormTextField<ClientSeminarFormValues>
              name="email"
              label={`Email ${watchedValues.registration_type === "grup" ? "(Kontak Utama)" : ""}`}
              type="email"
              placeholder="nama@email.com"
              autoComplete="email"
              required
            />

            <FormTextField<ClientSeminarFormValues>
              name="telp"
              label={`Nomor WhatsApp ${watchedValues.registration_type === "grup" ? "(Kontak Utama)" : ""}`}
              placeholder="+62 8XX-XXXX-XXXX"
              autoComplete="tel"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormTextField<ClientSeminarFormValues>
              name="institusi"
              label={`Asal Institusi ${watchedValues.registration_type === "grup" ? "(Kontak Utama)" : ""}`}
              placeholder='Nama sekolah/kampus/instansi (isi "-" jika tidak ada)'
              autoComplete="organization"
              required
            />

            <FormSelectField<ClientSeminarFormValues>
              name="status_akademika"
              label="Status Akademika"
              placeholder="Pilih status akademika"
              options={seminarStatusOptions}
              required
            />
          </div>

          {watchedValues.registration_type === "grup" && <SeminarMemberFields />}

          <Field className="grid gap-3 sm:grid-cols-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-[8px]"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Kembali
            </Button>
            <Button type="submit" className="h-11 rounded-[8px]">
              Lanjut ke pemeriksaan identitas
            </Button>
          </Field>
        </div>
      </section>
    </form>
  );
}

