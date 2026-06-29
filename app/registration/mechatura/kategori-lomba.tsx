import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const registrationOption = [
  {
    id: "sumo" as const,
    title: "Sumo",
    description: "Daftar kategori lomba Robot Sumo",
  },
  {
    id: "transporter" as const,
    title: "Transporter",
    description: "Daftar kategori lomba Robot Transporter",
  },
]

type KategoriLombaProps = {
    onContinue: () => void;
};

export default function KategoriLomba({ onContinue }: KategoriLombaProps){
    return (
         <form
            onSubmit={(event) => {
                event.preventDefault();
                onContinue();
            }}
        >
            <FieldGroup>
                <Field className="gap-3">
                    <FieldLabel>
                        Pilih kategori lomba Mechatura <span aria-hidden="true">*</span>
                    </FieldLabel>
                    <RadioGroup defaultValue={registrationOption[0].id}>
                        {registrationOption.map((option) => (
                            <FieldLabel
                                key={option.id}
                                htmlFor={`reg-option-${option.id}`}
                                className="has-[>[data-slot=field]]:rounded-[8px]"
                            >
                                <Field orientation="horizontal" className="py-4">
                                    <FieldContent>
                                        <FieldTitle>{option.title}</FieldTitle>
                                        <FieldDescription>
                                            {option.description}
                                        </FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem
                                        id={`reg-option-${option.id}`}
                                        value={option.id}
                                    />
                                </Field>
                            </FieldLabel>
                        ))}
                    </RadioGroup>
                </Field>
                <Button type="submit" className="h-11 rounded-[8px] mt-4">
                    Continue
                </Button>
            </FieldGroup>
        </form>
    )
}
