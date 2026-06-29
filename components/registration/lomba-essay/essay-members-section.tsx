import { FormTextField } from "@/components/registration/form-text-field";
import type { ClientLombaEssayFormValues } from "@/lib/validation/essay";

export default function EssayMembersSection() {
  return (
    <section className="space-y-4" aria-labelledby="members-section-label">
      <div>
        <h2 id="members-section-label" className="text-base font-semibold">
          Anggota Tim
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Opsional. Tambahkan hingga 2 anggota tambahan.
        </p>
      </div>

      <EssayMemberCard
        title="Anggota 2"
        nameField="member2_name"
        nimField="member2_nim"
        namePlaceholder="Nama anggota 2"
      />
      <EssayMemberCard
        title="Anggota 3"
        nameField="member3_name"
        nimField="member3_nim"
        namePlaceholder="Nama anggota 3"
      />
    </section>
  );
}

type EssayMemberCardProps = {
  title: string;
  nameField: "member2_name" | "member3_name";
  nimField: "member2_nim" | "member3_nim";
  namePlaceholder: string;
};

function EssayMemberCard({
  title,
  nameField,
  nimField,
  namePlaceholder,
}: EssayMemberCardProps) {
  return (
    <div className="rounded-[8px] border border-border p-4">
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        {title} <span className="font-normal">(opsional)</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField<ClientLombaEssayFormValues>
          name={nameField}
          label="Nama Lengkap"
          placeholder={namePlaceholder}
        />
        <FormTextField<ClientLombaEssayFormValues>
          name={nimField}
          label="NIM"
          placeholder="Nomor Induk Mahasiswa"
        />
      </div>
    </div>
  );
}
