import type { UseFormTrigger } from "react-hook-form";

import { FormSelectField } from "@/components/form/form-select-field";
import { FormTextField } from "@/components/form/form-text-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClientLombaEssayFormValues } from "@/lib/validation/essay";
import { essaySubThemeOptions } from "../../../lib/essay/essay-options";
import { ESSAY_VERIFICATION_FIELDS } from "../../../lib/essay/essay-verification-fields";

type EssayVerificationEditFormProps = {
  flashDoneButton: boolean;
  trigger: UseFormTrigger<ClientLombaEssayFormValues>;
  onDone: () => void;
};

export default function EssayVerificationEditForm({
  flashDoneButton,
  trigger,
  onDone,
}: EssayVerificationEditFormProps) {
  return (
    <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
      <FormTextField<ClientLombaEssayFormValues>
        name="team_name"
        label="Nama Tim"
        id="verify-team_name"
        inputClassName="h-9 rounded-[8px] text-sm"
      />
      <FormTextField<ClientLombaEssayFormValues>
        name="institution"
        label="Perguruan Tinggi"
        id="verify-institution"
        inputClassName="h-9 rounded-[8px] text-sm"
      />
      <FormTextField<ClientLombaEssayFormValues>
        name="faculty"
        label="Jurusan / Prodi"
        id="verify-faculty"
        inputClassName="h-9 rounded-[8px] text-sm"
      />
      <FormSelectField<ClientLombaEssayFormValues>
        name="sub_theme"
        label="Sub-Tema"
        options={essaySubThemeOptions}
      />
      <FormTextField<ClientLombaEssayFormValues>
        name="paper_title"
        label="Judul Karya Tulis"
        className="gap-2 sm:col-span-2"
        inputClassName="h-9 rounded-[8px] text-sm"
        id="verify-paper_title"
      />
      <FormTextField<ClientLombaEssayFormValues>
        name="leader_name"
        label="Nama Ketua"
        id="verify-leader_name"
        inputClassName="h-9 rounded-[8px] text-sm"
      />
      <FormTextField<ClientLombaEssayFormValues>
        name="leader_nim"
        label="NIM Ketua"
        id="verify-leader_nim"
        inputClassName="h-9 rounded-[8px] text-sm"
      />
      <FormTextField<ClientLombaEssayFormValues>
        name="leader_email"
        label="Email Ketua"
        type="email"
        id="verify-leader_email"
        inputClassName="h-9 rounded-[8px] text-sm"
      />
      <FormTextField<ClientLombaEssayFormValues>
        name="leader_phone"
        label="WhatsApp Ketua"
        id="verify-leader_phone"
        inputClassName="h-9 rounded-[8px] text-sm"
      />
      <FormTextField<ClientLombaEssayFormValues>
        name="member2_name"
        label={
          <>
            Anggota 2 <span className="font-normal">(opsional)</span>
          </>
        }
        placeholder="Nama Anggota 2"
        id="verify-member2_name"
        inputClassName="h-9 rounded-[8px] text-sm"
      />
      <FormTextField<ClientLombaEssayFormValues>
        name="member2_nim"
        label="NIM Anggota 2"
        placeholder="NIM Anggota 2"
        id="verify-member2_nim"
        inputClassName="h-9 rounded-[8px] text-sm"
      />
      <FormTextField<ClientLombaEssayFormValues>
        name="member3_name"
        label={
          <>
            Anggota 3 <span className="font-normal">(opsional)</span>
          </>
        }
        placeholder="Nama Anggota 3"
        id="verify-member3_name"
        inputClassName="h-9 rounded-[8px] text-sm"
      />
      <FormTextField<ClientLombaEssayFormValues>
        name="member3_nim"
        label="NIM Anggota 3"
        placeholder="NIM Anggota 3"
        id="verify-member3_nim"
        inputClassName="h-9 rounded-[8px] text-sm"
      />
      <div className="pt-2 sm:col-span-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className={cn(
            "rounded-[8px] transition-colors duration-300",
            flashDoneButton &&
            "bg-destructive/80 text-white hover:bg-destructive/90"
          )}
          onClick={async () => {
            const isValid = await trigger(ESSAY_VERIFICATION_FIELDS);
            if (isValid) onDone();
          }}
        >
          Done Editing
        </Button>
      </div>
    </div>
  );
}

