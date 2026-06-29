import { FormTextField } from "@/components/registration/form-text-field";
import type { ClientLombaEssayFormValues } from "@/lib/validation/essay";

export default function EssayLeaderSection() {
  return (
    <section className="space-y-4" aria-labelledby="leader-section-label">
      <div>
        <h2 id="leader-section-label" className="text-base font-semibold">
          Ketua Tim
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Ketua tim adalah penanggung jawab utama dan kontak panitia.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField<ClientLombaEssayFormValues>
          name="leader_name"
          label="Nama Lengkap Ketua"
          placeholder="Nama sesuai identitas"
          autoComplete="name"
          required
        />
        <FormTextField<ClientLombaEssayFormValues>
          name="leader_nim"
          label="NIM Ketua"
          placeholder="Nomor Induk Mahasiswa"
          required
        />
        <FormTextField<ClientLombaEssayFormValues>
          name="leader_email"
          label="Email Ketua"
          type="email"
          placeholder="nama@email.com"
          autoComplete="email"
          required
        />
        <FormTextField<ClientLombaEssayFormValues>
          name="leader_phone"
          label="WhatsApp Ketua"
          placeholder="+62 8XX-XXXX-XXXX"
          autoComplete="tel"
          required
        />
      </div>
    </section>
  );
}
