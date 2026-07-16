import { FormTextField } from "@/components/form/form-text-field";
import type { MechaturaFormValues } from "@/lib/validation/mechatura";

export default function MechaturaTeamInfo() {
  return (
    <section className="sm:overflow-hidden sm:rounded-xl sm:border sm:border-border sm:bg-card" aria-labelledby="team-section-label">
      <div className="border-b border-border pb-4 pt-0 sm:py-6 sm:px-6">
        <h2 id="team-section-label" className="text-lg font-semibold">
          Identitas Tim
        </h2>
        <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
          Mohon isi ada tim
        </p>
      </div>

      <div className="space-y-6 pt-5 pb-0 sm:p-6">

      <FormTextField<MechaturaFormValues>
        name="team_name"
        label="Nama Tim"
        placeholder="Masukkan nama tim anda"
        required
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <FormTextField<MechaturaFormValues>
          name="institution"
          label="Asal Institusi"
          placeholder="Nama sekolah, kampus atau instansi"
          autoComplete="organization"
          required
        />

        <FormTextField<MechaturaFormValues>
          name="province"
          label="Provinsi/Kota"
          placeholder="Provinsi atau kota asal institusi"
          autoComplete="organization"
          required
        />
      </div>   
      </div>
    </section>
  );
}

