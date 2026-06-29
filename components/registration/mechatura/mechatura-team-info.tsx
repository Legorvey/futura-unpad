import { FormTextField } from "@/components/form/form-text-field";
import type { MechaturaFormValues } from "@/lib/validation/mechatura";

export default function MechaturaTeamInfo() {
  return (
    <section className="space-y-4" aria-labelledby="team-section-label">
      <div>
        <h2 id="team-section-label" className="text-base font-semibold">
          Identitas Tim
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Mohon isi ada tim
        </p>
      </div>

      <FormTextField<MechaturaFormValues>
        name="team_name"
        label="Nama Grup/Tim"
        placeholder="Masukkan nama grup atau komunitas Anda"
        required
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <FormTextField<MechaturaFormValues>
          name="institution"
          label="Asal Institusi"
          placeholder="Nama sekolah, kampus, instansi, atau komunitas"
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
    </section>
  );
}
