import { Button } from "@/components/ui/button";

type EssayVerificationActionsProps = {
  isEditing: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
};

export default function EssayVerificationActions({
  isEditing,
  isSubmitting,
  onBack,
  onSubmit,
}: EssayVerificationActionsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-[8px]"
        onClick={onBack}
        disabled={isSubmitting}
      >
        Back
      </Button>
      <Button
        type="button"
        className="h-11 rounded-[8px]"
        onClick={onSubmit}
        disabled={isSubmitting || isEditing}
      >
        {isSubmitting ? "Saving..." : "Confirm and continue to payment"}
      </Button>
    </div>
  );
}

