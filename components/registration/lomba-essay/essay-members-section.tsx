import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormTextField } from "@/components/form/form-text-field";
import type { ClientLombaEssayFormValues } from "@/lib/validation/essay";

export default function EssayMembersSection() {
  const { getValues, setValue, clearErrors } = useFormContext<ClientLombaEssayFormValues>();
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    if (getValues("member3_name")) {
      setMemberCount(2);
    } else if (getValues("member2_name")) {
      setMemberCount(1);
    }
  }, [getValues]);

  const addMember = () => {
    if (memberCount < 2) {
      setMemberCount((prev) => prev + 1);
    }
  };

  const removeMember = (index: number) => {
    if (index === 1) { // Remove Anggota 2
      if (memberCount === 2) {
        setValue("member2_name", getValues("member3_name") || "", { shouldDirty: true, shouldValidate: true });
        setValue("member2_nim", getValues("member3_nim") || "", { shouldDirty: true, shouldValidate: true });
        setValue("member3_name", "", { shouldDirty: true });
        setValue("member3_nim", "", { shouldDirty: true });
        clearErrors(["member3_name", "member3_nim"]);
      } else {
        setValue("member2_name", "", { shouldDirty: true });
        setValue("member2_nim", "", { shouldDirty: true });
        clearErrors(["member2_name", "member2_nim"]);
      }
      setMemberCount((prev) => prev - 1);
    } else if (index === 2) {
      setValue("member3_name", "", { shouldDirty: true });
      setValue("member3_nim", "", { shouldDirty: true });
      clearErrors(["member3_name", "member3_nim"]);
      setMemberCount(1);
    }
  };

  return (
    <section className="space-y-4" aria-labelledby="members-section-label">
      <div>
        <h2 id="members-section-label" className="text-lg font-semibold">
          Anggota Tim
        </h2>
        <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
          Opsional. Tambahkan hingga 2 anggota tambahan.
        </p>
      </div>

      <div className="space-y-4">
        {memberCount >= 1 && (
          <div className="rounded-[8px] border border-border p-4 space-y-4 relative bg-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Anggota 2</h3>
              <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-[8px] text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => removeMember(1)}
              >
                  <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormTextField<ClientLombaEssayFormValues>
                name="member2_name"
                label="Nama Lengkap"
                placeholder="Nama anggota 2"
                required
              />
              <FormTextField<ClientLombaEssayFormValues>
                name="member2_nim"
                label="NIM"
                placeholder="Nomor Induk Mahasiswa"
                required
              />
            </div>
          </div>
        )}

        {memberCount >= 2 && (
          <div className="rounded-[8px] border border-border p-4 space-y-4 relative bg-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Anggota 3</h3>
              <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-[8px] text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => removeMember(2)}
              >
                  <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormTextField<ClientLombaEssayFormValues>
                name="member3_name"
                label="Nama Lengkap"
                placeholder="Nama anggota 3"
                required
              />
              <FormTextField<ClientLombaEssayFormValues>
                name="member3_nim"
                label="NIM"
                placeholder="Nomor Induk Mahasiswa"
                required
              />
            </div>
          </div>
        )}

        {memberCount < 2 && (
          <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-[8px] border-dashed"
              onClick={addMember}
          >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Anggota
          </Button>
        )}
      </div>
    </section>
  );
}

