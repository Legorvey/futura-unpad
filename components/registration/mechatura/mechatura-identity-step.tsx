import type { BaseSyntheticEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";

import MechaturaTeamInfo from "./mechatura-team-info";
import MechaturaCoachInfo from "./mechatura-coach-info";
import MechaturaMemberInfo from "./mechatura-member-info";

type MechaturaIdentityStepProps = {
  isSubmitting: boolean;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  onBack: () => void;
};

export default function MechaturaIdentityStep({
  isSubmitting,
  onSubmit,
  onBack,
}: MechaturaIdentityStepProps) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup className="gap-6">

        <MechaturaTeamInfo />
        <MechaturaCoachInfo />
        <MechaturaMemberInfo />

        <Field className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-[8px]"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button type="submit" className="h-11 rounded-[8px]">
            Continue to identity check
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

