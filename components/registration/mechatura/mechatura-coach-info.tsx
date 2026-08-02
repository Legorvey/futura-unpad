import { useFormContext, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { FormTextField } from "@/components/form/form-text-field";
import { Button } from "@/components/ui/button";
import type { MechaturaFormValues } from "@/lib/validation/mechatura";

export default function MechaturaCoachInfo() {
  const { control, clearErrors, setValue } = useFormContext<MechaturaFormValues>();
  const hasCoach = useWatch({ control, name: "has_coach" });

  const addCoach = () => {
    setValue("has_coach", true, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeCoach = () => {
    setValue("has_coach", false, { shouldDirty: true, shouldValidate: true });
    setValue("coach_name", "", { shouldDirty: true, shouldValidate: true });
    setValue("coach_email", "", { shouldDirty: true, shouldValidate: true });
    setValue("coach_phone", "", { shouldDirty: true, shouldValidate: true });
    clearErrors(["coach_name", "coach_email", "coach_phone"]);
  };

  return (
    <section
      className="overflow-hidden rounded-xl border border-border bg-card"
      aria-labelledby="coach-section-label"
    >
      <div className="border-b border-border p-4 sm:p-6">
        <h2 id="coach-section-label" className="text-lg font-semibold">
          Identitas Pembimbing (Opsional)
        </h2>
        <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
          Satu tim diperbolehkan didampingi oleh maksimal 1 orang pembimbing (guru/dosen/instruktur). Bersifat opsional.
        </p>
      </div>

      <div className="space-y-6 p-4 sm:p-6">
      {hasCoach ? (
        <div className="relative space-y-6">
          <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Data Pembimbing</h3>
              <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-[8px] text-destructive hover:bg-destructive hover:text-white"
                  onClick={removeCoach}
                  aria-label="Hapus pembimbing"
              >
                  <Trash2 className="h-4 w-4" />
              </Button>
          </div>

          <FormTextField<MechaturaFormValues>
            name="coach_name"
            label="Nama Pembimbing"
            placeholder="Masukkan nama pembimbing tim anda"
            required
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <FormTextField<MechaturaFormValues>
              name="coach_email"
              label="Email Pembimbing"
              placeholder="Masukkan email pembimbing tim anda"
              required
            />

            <FormTextField<MechaturaFormValues>
              name="coach_phone"
              label="No. WhatsApp Pembimbing"
              placeholder="Masukkan nomor WhatsApp pembimbing tim anda"
              required
            />
          </div>
        </div>
      ) : (
        <div className="pt-2">
            <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-[8px] border-dashed"
                onClick={addCoach}
            >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pembimbing (Opsional)
            </Button>
        </div>
      )}
      </div>
    </section>
  );
}

