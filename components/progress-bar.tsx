"use client"

import StepProgress from "@/components/registration/step-progress";
import { useRegistrationStep } from "@/hooks/use-registration-step";

export default function ProgressBar(){
    const { step, steps } = useRegistrationStep("mechatura", {
        resetOnMount: false,
    });

    return (
        <StepProgress
            steps={steps}
            currentStep={step}
            ariaLabel="Mechatura registration progress"
        />
    )
}
