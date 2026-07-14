import { FormTextField } from "@/components/form/form-text-field";
import type { ClientLombaEssayFormValues } from "@/lib/validation/essay";

export default function EssayTeamInformationSection() {
  return (
    <section className="space-y-4" aria-labelledby="team-section-label">
      <div>
        <h2 id="team-section-label" className="text-lg font-semibold">
          Informasi Tim
        </h2>
        <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
          Satu tim dapat terdiri dari 1-3 orang peserta.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField<ClientLombaEssayFormValues>
          name="team_name"
          label="Nama Tim"
          placeholder="Contoh: Tim Riset Nusantara"
          required
        />
        <FormTextField<ClientLombaEssayFormValues>
          name="institution"
          label="Asal Perguruan Tinggi"
          placeholder="Nama universitas atau institusi"
          autoComplete="organization"
          required
        />
        <FormTextField<ClientLombaEssayFormValues>
          name="faculty"
          label="Jurusan / Program Studi"
          placeholder="Contoh: Teknik Informatika, S1"
          className="gap-2 sm:col-span-2"
          required
        />
      </div>
    </section>
  );
}

