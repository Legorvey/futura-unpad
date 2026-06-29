import StepProgress from "@/components/registration/step-progress";
import { seminarPaymentSteps } from "@/lib/registration-steps";

export default function SeminarRegistrationProgress({
  currentStep,
}: {
  currentStep: 1 | 2;
}) {
  const step = seminarPaymentSteps[currentStep - 1]?.id ?? seminarPaymentSteps[0].id;

  return (
    <StepProgress
      steps={seminarPaymentSteps}
      currentStep={step}
      ariaLabel="Payment progress"
      labelVisibility="always"
    />
  );
}
