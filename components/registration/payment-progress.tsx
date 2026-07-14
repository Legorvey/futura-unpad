import StepProgress from "@/components/registration/step-progress";
import {
  mechaturaRegistrationSteps,
  seminarPaymentSteps,
} from "@/lib/registration-steps";
import type { RegistrationProgram } from "@/lib/payment";

type PaymentProgressProps = {
  program?: RegistrationProgram;
};

export default function PaymentProgress({ program }: PaymentProgressProps) {
  if (program === "mechatura") {
    return (
      <StepProgress
        steps={mechaturaRegistrationSteps}
        currentStep="payment"
        ariaLabel="Mechatura registration progress"
        labelVisibility="responsive"
      />
    );
  }

  return (
    <StepProgress
      steps={seminarPaymentSteps}
      currentStep="payment"
      ariaLabel="Payment progress"
      labelVisibility="always"
    />
  );
}

