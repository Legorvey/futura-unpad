import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";
import { FormTextField } from "@/components/form/form-text-field";
import { FormCheckboxField } from "@/components/form/form-checkbox-field";

export function SeminarMemberFields() {
  const {
    control,
    watch,
    setValue,
  } = useFormContext<ClientSeminarFormValues>();

  const {
    fields: memberFields,
    append: appendMember,
    remove: removeMember,
  } = useFieldArray({
    control,
    name: "members",
  });

  const watchedValues = watch();

  return (
    <div className="space-y-4 pt-4 border-t border-border mt-2">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium">Anggota Grup</h3>
        
        <FormCheckboxField<ClientSeminarFormValues>
          name="is_same_institution"
          label="Seluruh anggota berasal dari institusi yang sama dengan Kontak Utama"
          onCheckedChangeAction={(val) => {
            if (val) {
              memberFields.forEach((_, i) => {
                setValue(`members.${i}.institusi`, "", { shouldValidate: true });
              });
            }
          }}
        />
      </div>

      {memberFields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-3">
          <div className="flex-1 grid gap-4 sm:grid-cols-2">
            <FormTextField<ClientSeminarFormValues>
              name={`members.${index}.nama`}
              label={`Nama Anggota ${index + 1}`}
              placeholder="Nama sesuai identitas"
              required
            />
            
            <FormTextField<ClientSeminarFormValues>
              name={`members.${index}.institusi`}
              label={`Asal Institusi ${watchedValues.is_same_institution ? "(Sama dengan Kontak Utama)" : ""}`}
              placeholder="Nama institusi"
              disabled={watchedValues.is_same_institution}
              required={!watchedValues.is_same_institution}
              value={watchedValues.is_same_institution ? watchedValues.institusi : watchedValues.members?.[index]?.institusi || ""}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="mt-[28px] h-11 w-11 shrink-0 rounded-[8px] text-destructive hover:bg-destructive hover:text-white"
            onClick={() => removeMember(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 rounded-[8px] border-dashed"
        onClick={() => appendMember({ nama: "", institusi: "" })}
      >
        <Plus className="mr-2 h-4 w-4" />
        Tambah Anggota
      </Button>
    </div>
  );
}

