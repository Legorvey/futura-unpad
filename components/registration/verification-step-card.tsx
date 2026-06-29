import type { ReactNode } from "react";
import { PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";

type VerificationStepCardProps = {
  title: string;
  description: string;
  isEditing: boolean;
  onEdit: () => void;
  children: ReactNode;
};

export default function VerificationStepCard({
  title,
  description,
  isEditing,
  onEdit,
  children,
}: VerificationStepCardProps) {
  return (
    <div className="rounded-[8px] border border-border bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {isEditing ? null : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit rounded-[8px]"
            onClick={onEdit}
          >
            <PencilLine className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {children}
    </div>
  );
}
