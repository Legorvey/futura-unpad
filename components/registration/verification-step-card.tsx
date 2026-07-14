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
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
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

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </div>
  );
}

