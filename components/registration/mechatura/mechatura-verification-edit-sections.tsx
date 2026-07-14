import type { ReactNode } from "react";
import type { FieldPath } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { FormSelectField } from "@/components/form/form-select-field";
import { FormTextField } from "@/components/form/form-text-field";
import { Button } from "@/components/ui/button";
import { mechaturaCompetitionOptions } from "@/lib/mechatura/options";
import type { MechaturaFormValues } from "@/lib/validation/mechatura";

import { CompactFileEditField } from "./mechatura-compact-file-edit-field";

type EditSectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

type ContactFieldNames = {
  name: FieldPath<MechaturaFormValues>;
  email: FieldPath<MechaturaFormValues>;
  phone: FieldPath<MechaturaFormValues>;
};

type ContactText = {
  name: string;
  email: string;
  phone: string;
};

function EditSection({ title, action, children }: EditSectionProps) {
  return (
    <section className="space-y-4 border-t pt-5 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function SectionActionButton({
  isShown,
  addLabel = "Tambah",
  removeLabel,
  onAdd,
  onRemove,
}: {
  isShown: boolean;
  addLabel?: string;
  removeLabel: string;
  onAdd: () => void;
  onRemove: () => void;
}) {
  if (isShown) {
    return (
      <Button
        type="button"
        variant="destructive"
        size="icon-sm"
        aria-label={removeLabel}
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
      </Button>
    );
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={onAdd}>
      <Plus className="size-4" />
      {addLabel}
    </Button>
  );
}

function ContactFields({
  fields,
  labels,
  placeholders,
  required,
}: {
  fields: ContactFieldNames;
  labels: ContactText;
  placeholders: ContactText;
  required?: boolean;
}) {
  return (
    <>
      <FormTextField<MechaturaFormValues>
        name={fields.name}
        label={labels.name}
        placeholder={placeholders.name}
        required={required}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <FormTextField<MechaturaFormValues>
          name={fields.email}
          label={labels.email}
          placeholder={placeholders.email}
          required={required}
        />
        <FormTextField<MechaturaFormValues>
          name={fields.phone}
          label={labels.phone}
          placeholder={placeholders.phone}
          required={required}
        />
      </div>
    </>
  );
}

export function CompetitionTypeEditSection() {
  return (
    <EditSection title="Tipe Robot">
      <FormSelectField<MechaturaFormValues>
        name="competition_type"
        label="Kategori Lomba"
        options={mechaturaCompetitionOptions}
        required
      />
    </EditSection>
  );
}

export function TeamIdentityEditSection() {
  return (
    <EditSection title="Identitas Tim">
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
    </EditSection>
  );
}

export function LeaderEditSection() {
  return (
    <EditSection title="Ketua Tim">
      <ContactFields
        required
        fields={{
          name: "leader_name",
          email: "leader_email",
          phone: "leader_phone",
        }}
        labels={{
          name: "Nama Ketua Tim",
          email: "Email Ketua Tim",
          phone: "No. WhatsApp Ketua Tim",
        }}
        placeholders={{
          name: "Masukkan nama ketua tim anda",
          email: "Masukkan email ketua tim anda",
          phone: "Masukkan nomor WhatsApp ketua tim anda",
        }}
      />
    </EditSection>
  );
}

export function OptionalMemberEditSection({
  title,
  emptyText,
  isShown,
  labels,
  fields,
  onAdd,
  onRemove,
}: {
  title: string;
  emptyText: string;
  isShown: boolean;
  labels: ContactText;
  fields: ContactFieldNames;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <EditSection
      title={title}
      action={
        <SectionActionButton
          isShown={isShown}
          removeLabel={`Hapus ${title.toLowerCase()}`}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      }
    >
      {isShown ? (
        <ContactFields
          fields={fields}
          labels={labels}
          placeholders={{
            name: "Masukkan nama anggota",
            email: "Masukkan email anggota",
            phone: "Masukkan nomor WhatsApp anggota",
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
    </EditSection>
  );
}

export function CoachEditSection({
  hasCoach,
  onAdd,
  onRemove,
}: {
  hasCoach: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <EditSection
      title="Pembina"
      action={
        <SectionActionButton
          isShown={hasCoach}
          removeLabel="Hapus pembina"
          onAdd={onAdd}
          onRemove={onRemove}
        />
      }
    >
      {hasCoach ? (
        <ContactFields
          required
          fields={{
            name: "coach_name",
            email: "coach_email",
            phone: "coach_phone",
          }}
          labels={{
            name: "Nama Pembina Tim",
            email: "Email Pembina Tim",
            phone: "No. WhatsApp Pembina Tim",
          }}
          placeholders={{
            name: "Masukkan nama pembina tim anda",
            email: "Masukkan email pembina tim anda",
            phone: "Masukkan nomor WhatsApp pembina tim anda",
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Tim tidak menambahkan pembina.
        </p>
      )}
    </EditSection>
  );
}

export function AttachmentEditSection({
  documentMaxSizeInBytes,
}: {
  documentMaxSizeInBytes: number;
}) {
  return (
    <EditSection title="Lampiran">
      <CompactFileEditField
        name="member_document"
        label="Dokumen Anggota"
        accept="application/pdf"
        maxSizeInBytes={documentMaxSizeInBytes}
      />
      <FormTextField<MechaturaFormValues>
        name="robot_name"
        label="Nama Robot Tim"
        placeholder="Masukkan nama robot tim anda"
        required
      />
      <CompactFileEditField
        name="robot_document"
        label="Dokumen Robot"
        accept="application/pdf"
        maxSizeInBytes={documentMaxSizeInBytes}
      />
    </EditSection>
  );
}

