"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";
import { FormTextField } from "@/components/form/form-text-field";
import { FormCheckboxField } from "@/components/form/form-checkbox-field";
import { SeminarInstitutionField } from "./seminar-institution-field";

export function SeminarMemberFields() {
  const { control, watch, setValue } =
    useFormContext<ClientSeminarFormValues>();

  const {
    fields: memberFields,
    append: appendMember,
    remove: removeMember,
  } = useFieldArray({
    control,
    name: "members",
  });

  const watchedValues = watch();
  const canRemoveMember = memberFields.length > 1;
  const schoolJenjang = watchedValues.school_jenjang ?? "SMA";
  const isStudent = watchedValues.status_akademika === "siswa";

  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">Anggota Grup</h3>
          <span className="text-xs text-muted-foreground">
            {memberFields.length} anggota tambahan
          </span>
        </div>

        <FormCheckboxField<ClientSeminarFormValues>
          name="is_same_institution"
          label="Seluruh anggota berasal dari institusi yang sama dengan Kontak Utama"
          onCheckedChangeAction={(val) => {
            if (val) {
              memberFields.forEach((_, i) => {
                setValue(`members.${i}.institusi`, "", {
                  shouldValidate: true,
                });
              });
            }
          }}
        />
      </div>

      {memberFields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-xl border border-border bg-background/60 p-4 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Anggota {index + 1}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-[8px] text-destructive hover:bg-destructive hover:text-white"
              onClick={() => removeMember(index)}
              disabled={!canRemoveMember}
              aria-label={`Hapus anggota ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 items-start">
            <FormTextField<ClientSeminarFormValues>
              name={`members.${index}.nama`}
              label={`Nama Anggota ${index + 1}`}
              placeholder="Nama sesuai identitas"
            />

            <SeminarInstitutionField
              name={`members.${index}.institusi`}
              label={isStudent ? "Asal Sekolah" : "Asal Institusi"}
              statusAkademika={watchedValues.status_akademika}
              schoolJenjang={schoolJenjang}
              disabled={watchedValues.is_same_institution}
              displayValue={
                watchedValues.is_same_institution
                  ? (watchedValues.institusi ?? "")
                  : undefined
              }
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 rounded-[8px] border-dashed"
        onClick={() => appendMember({ nama: "", institusi: "" })}
      >
        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
        Tambah Anggota
      </Button>
    </div>
  );
}
