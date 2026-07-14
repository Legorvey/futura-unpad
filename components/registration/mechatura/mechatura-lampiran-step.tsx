import type { BaseSyntheticEvent } from "react";

import MechaturaDocsInfo from "./mechatura-docs-info"
import MechaturaRobotInfo from "./mechatura-robot-info";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";

type MechaturaLampiranStepProps = {
    documentMaxSizeInBytes: number;
    onBack: () => void;
    onSubmit: (event?: BaseSyntheticEvent) => void;
};

export default function MechaturaLampiranStep({
    documentMaxSizeInBytes,
    onBack,
    onSubmit,
}: MechaturaLampiranStepProps){
    return (
        <form onSubmit={onSubmit} noValidate>
            <FieldGroup className="gap-6">
                
                <MechaturaDocsInfo documentMaxSizeInBytes={documentMaxSizeInBytes} />
                <MechaturaRobotInfo documentMaxSizeInBytes={documentMaxSizeInBytes} />

                <Field className="grid gap-3 sm:grid-cols-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-[8px]"
                        onClick={onBack}
                    >
                        Back
                    </Button>
                    <Button type="submit" className="h-11 rounded-[8px]">
                        Continue to verification
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    )
}

