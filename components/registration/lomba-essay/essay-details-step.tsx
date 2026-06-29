import type { BaseSyntheticEvent } from "react";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import EssayLeaderSection from "./essay-leader-section";
import EssayMembersSection from "./essay-members-section";
import EssayPaperInformationSection from "./essay-paper-information-section";
import EssayTeamInformationSection from "./essay-team-information-section";

type EssayDetailsStepProps = {
  onSubmit: (event?: BaseSyntheticEvent) => void;
};

export default function EssayDetailsStep({ onSubmit }: EssayDetailsStepProps) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup className="gap-8">
        <div className="rounded-[8px] border-1 border-red-300 bg-red-100 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-red-600">
            <AlertCircle className="h-4 w-4" />
            Disclaimer
          </p>
          <p className="mt-1 text-sm leading-6 text-red-500">
            Input yang ada di sini masih dummy dan ga berfungsi. Soalnya website
            masih dalam tahap development.
          </p>
        </div>

        <EssayTeamInformationSection />
        <EssayPaperInformationSection />
        <EssayLeaderSection />
        <EssayMembersSection />

        <Button type="submit" className="h-11 w-full rounded-[8px]">
          Continue to verification
        </Button>
      </FieldGroup>
    </form>
  );
}
