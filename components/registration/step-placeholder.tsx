import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field";

type StepPlaceholderProps = {
  title: string;
  description: string;
  onBack?: () => void;
};

export default function StepPlaceholder({
  title,
  description,
  onBack,
}: StepPlaceholderProps) {
  return (
    <FieldGroup>
      <Field orientation="horizontal" className="rounded-[8px] border p-4">
        <FieldContent>
          <FieldTitle>{title}</FieldTitle>
          <FieldDescription>{description}</FieldDescription>
        </FieldContent>
      </Field>

      {onBack ? (
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-[8px]"
          onClick={onBack}
        >
          Back
        </Button>
      ) : null}
    </FieldGroup>
  );
}

