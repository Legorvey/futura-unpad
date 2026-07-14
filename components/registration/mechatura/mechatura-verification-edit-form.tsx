import { useState } from "react";
import type { FieldPath, UseFormTrigger } from "react-hook-form";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MECHATURA_EDITABLE_FIELDS,
  type MechaturaFormValues,
} from "@/lib/validation/mechatura";

import {
  AttachmentEditSection,
  CoachEditSection,
  CompetitionTypeEditSection,
  LeaderEditSection,
  OptionalMemberEditSection,
  TeamIdentityEditSection,
} from "./mechatura-verification-edit-sections";

type MechaturaVerificationEditFormProps = {
  documentMaxSizeInBytes: number;
  flashDoneButton: boolean;
  trigger: UseFormTrigger<MechaturaFormValues>;
  onDone: () => void;
};

const editableFields =
  MECHATURA_EDITABLE_FIELDS as FieldPath<MechaturaFormValues>[];

export default function MechaturaVerificationEditForm({
  documentMaxSizeInBytes,
  flashDoneButton,
  trigger,
  onDone,
}: MechaturaVerificationEditFormProps) {
  const { clearErrors, control, setValue } =
    useFormContext<MechaturaFormValues>();
  const hasCoach = useWatch({ control, name: "has_coach" });
  const member2Name = useWatch({ control, name: "member2_name" });
  const member2Email = useWatch({ control, name: "member2_email" });
  const member2Phone = useWatch({ control, name: "member2_phone" });
  const member3Name = useWatch({ control, name: "member3_name" });
  const member3Email = useWatch({ control, name: "member3_email" });
  const member3Phone = useWatch({ control, name: "member3_phone" });

  const hasMember2Value = Boolean(member2Name || member2Email || member2Phone);
  const hasMember3Value = Boolean(member3Name || member3Email || member3Phone);
  const [isAddingMember2, setIsAddingMember2] = useState(false);
  const [isAddingMember3, setIsAddingMember3] = useState(false);
  const showMember2 = hasMember2Value || isAddingMember2;
  const showMember3 = hasMember3Value || isAddingMember3;

  const handleDone = async () => {
    const isValid = await trigger(editableFields);

    if (isValid) {
      onDone();
    }
  };

  const clearMember2 = () => {
    setValue("member2_name", "", { shouldDirty: true, shouldValidate: true });
    setValue("member2_email", "", { shouldDirty: true, shouldValidate: true });
    setValue("member2_phone", "", { shouldDirty: true, shouldValidate: true });
    clearErrors(["member2_name", "member2_email", "member2_phone"]);
    setIsAddingMember2(false);
  };

  const clearMember3 = () => {
    setValue("member3_name", "", { shouldDirty: true, shouldValidate: true });
    setValue("member3_email", "", { shouldDirty: true, shouldValidate: true });
    setValue("member3_phone", "", { shouldDirty: true, shouldValidate: true });
    clearErrors(["member3_name", "member3_email", "member3_phone"]);
    setIsAddingMember3(false);
  };

  const addCoach = () => {
    setValue("has_coach", true, { shouldDirty: true, shouldValidate: true });
  };

  const removeCoach = () => {
    setValue("has_coach", false, { shouldDirty: true, shouldValidate: true });
    setValue("coach_name", "", { shouldDirty: true, shouldValidate: true });
    setValue("coach_email", "", { shouldDirty: true, shouldValidate: true });
    setValue("coach_phone", "", { shouldDirty: true, shouldValidate: true });
    clearErrors(["coach_name", "coach_email", "coach_phone"]);
  };

  return (
    <div className="mt-5 space-y-5">
      <CompetitionTypeEditSection />
      <TeamIdentityEditSection />
      <LeaderEditSection />

      <OptionalMemberEditSection
        title="Anggota 1"
        emptyText="Belum ada anggota 1 yang ditambahkan."
        isShown={showMember2}
        fields={{
          name: "member2_name",
          email: "member2_email",
          phone: "member2_phone",
        }}
        labels={{
          name: "Nama Anggota 1",
          email: "Email Anggota 1",
          phone: "No. WhatsApp Anggota 1",
        }}
        onAdd={() => setIsAddingMember2(true)}
        onRemove={clearMember2}
      />

      <OptionalMemberEditSection
        title="Anggota 2"
        emptyText="Belum ada anggota 2 yang ditambahkan."
        isShown={showMember3}
        fields={{
          name: "member3_name",
          email: "member3_email",
          phone: "member3_phone",
        }}
        labels={{
          name: "Nama Anggota 2",
          email: "Email Anggota 2",
          phone: "No. WhatsApp Anggota 2",
        }}
        onAdd={() => setIsAddingMember3(true)}
        onRemove={clearMember3}
      />

      <CoachEditSection
        hasCoach={Boolean(hasCoach)}
        onAdd={addCoach}
        onRemove={removeCoach}
      />
      <AttachmentEditSection documentMaxSizeInBytes={documentMaxSizeInBytes} />

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className={cn(
          "rounded-[8px] transition-colors duration-300",
          flashDoneButton &&
            "bg-destructive/80 text-white hover:bg-destructive/90"
        )}
        onClick={handleDone}
      >
        Done Editing
      </Button>
    </div>
  );
}

