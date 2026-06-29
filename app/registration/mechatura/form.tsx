"use client";

import type { BaseSyntheticEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import MechaturaIdentityStep from "@/components/registration/mechatura/mechatura-identity-step";
import StepPlaceholder from "@/components/registration/step-placeholder";
import StepProgress from "@/components/registration/step-progress";
import { useRegistrationStep } from "@/hooks/use-registration-step";
import {
  mechaturaSchema,
  type MechaturaFormValues,
} from "@/lib/validation/mechatura";
import KategoriLomba from "./kategori-lomba";

export default function MechaturaRegistrationForm() {
  const { step, setStep, steps } = useRegistrationStep("mechatura");
  const currentStepLabel = steps.find((item) => item.id === step)?.label ?? "Next";
  const form = useForm<MechaturaFormValues>({
    resolver: zodResolver(mechaturaSchema),
    mode: "onChange",
    defaultValues: {
      team_name: "",
      institution: "",
      province: "",
      leader_name: "",
      leader_email: "",
      leader_phone: "",
      member2_name: "",
      member3_name: "",
      coach_name: "",
      coach_email: "",
      coach_phone: "",
    },
  });

  const goToVerification = async (event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    const isValid = await form.trigger(["team_name", "institution", "province"]);
    if (isValid) {
      setStep("verification");
    }
  };

  return (
    <FormProvider {...form}>
      <section className="space-y-8">
        <StepProgress
          steps={steps}
          currentStep={step}
          ariaLabel="Mechatura registration progress"
        />

        {step === "registration-option" ? (
          <KategoriLomba onContinue={() => setStep("identity")} />
        ) : null}

        {step === "identity" ? (
          <MechaturaIdentityStep
            isSubmitting={form.formState.isSubmitting}
            onSubmit={goToVerification}
            onBack={() => setStep("registration-option")}
          />
        ) : null}

        {step !== "registration-option" && step !== "identity" ? (
          <StepPlaceholder
            title={currentStepLabel}
            description="This Mechatura registration step is not available yet."
            onBack={() => setStep("identity")}
          />
        ) : null}
      </section>
    </FormProvider>
  );
}
