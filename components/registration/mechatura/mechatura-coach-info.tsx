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
      className="sm:overflow-hidden sm:rounded-xl sm:border sm:border-border sm:bg-card"
      aria-labelledby="coach-section-label"
    >
      <div className="border-b border-border pb-4 pt-0 sm:py-6 sm:px-6">
        <h2 id="coach-section-label" className="text-lg font-semibold">
          Identitas pembina tim
        </h2>
        <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
          Tambahkan pembina jika tim anda memiliki pembina.
        </p>
      </div>

      <div className="space-y-6 pt-5 pb-0 sm:p-6">
      {hasCoach ? (
        <div className="relative space-y-6">
          <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Pembina Tim</h3>
              <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-[8px] text-destructive hover:bg-destructive hover:text-white"
                  onClick={removeCoach}
              >
                  <Trash2 className="h-4 w-4" />
              </Button>
          </div>

          <FormTextField<MechaturaFormValues>
            name="coach_name"
            label="Nama Pembina Tim"
            placeholder="Masukkan nama pembina tim anda"
            required
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <FormTextField<MechaturaFormValues>
              name="coach_email"
              label="Email Pembina Tim"
              placeholder="Masukkan email pembina tim anda"
              required
            />

            <FormTextField<MechaturaFormValues>
              name="coach_phone"
              label="No. WhatsApp Pembina Tim"
              placeholder="Masukkan nomor WhatsApp pembina tim anda"
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
                Tambah Pembina
            </Button>
        </div>
      )}
      </div>
    </section>
  );
}

