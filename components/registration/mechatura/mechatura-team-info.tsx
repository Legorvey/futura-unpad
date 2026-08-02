import { FormTextField } from "@/components/form/form-text-field";
import type { MechaturaFormValues } from "@/lib/validation/mechatura";

export default function MechaturaTeamInfo() {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card" aria-labelledby="team-section-label">
      <div className="border-b border-border p-4 sm:p-6">
        <h2 id="team-section-label" className="text-lg font-semibold">
          Identitas Tim
        </h2>
        <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
          Nama tim bebas dan dilarang mengandung unsur SARA, pornografi, atau penghinaan. Anggota tim diperbolehkan berasal dari institusi berbeda (cantumkan institusi perwakilan/ketua di bawah).
        </p>
      </div>

      <div className="space-y-6 p-4 sm:p-6">
        <FormTextField<MechaturaFormValues>
          name="team_name"
          label="Nama Tim"
          placeholder="Masukkan nama tim anda (maks. 50 karakter)"
          description="Jika terdapat kesamaan nama tim, panitia memprioritaskan tim yang mendaftar lebih awal."
          required
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <FormTextField<MechaturaFormValues>
            name="institution"
            label="Asal Institusi"
            placeholder="Nama sekolah, kampus, atau instansi"
            description="Institusi utama / perwakilan ketua tim"
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

