"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clientLombaEssayFormSchema,
  type ClientLombaEssayFormValues,
} from "@/lib/validation/essay";

import { useAuth } from "@/components/auth-provider";
import StepProgress from "@/components/registration/step-progress";
import { useRegistrationStep } from "@/hooks/use-registration-step";
import EssayDetailsStep from "../../../components/registration/lomba-essay/essay-details-step";
import EssayPaymentStep from "../../../components/registration/lomba-essay/essay-payment-step";
import EssayVerificationStep from "../../../components/registration/lomba-essay/essay-verification-step";
import { ESSAY_VERIFICATION_FIELDS } from "../../../lib/essay/essay-verification-fields";
import { essaySubThemeOptions } from "../../../lib/essay/essay-options";

export default function EssayRegistrationForm() {
  const { user } = useAuth();
  const { step, setStep, steps } = useRegistrationStep("essay");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [registrationId, setRegistrationId] = useState("");

  const form = useForm<ClientLombaEssayFormValues>({
    resolver: zodResolver(clientLombaEssayFormSchema),
    mode: "onChange",
    defaultValues: {
      team_name: "",
      institution: "",
      faculty: "",
      paper_title: "",
      leader_name: "",
      leader_nim: "",
      leader_email: "",
      leader_phone: "",
      member2_name: "",
      member2_nim: "",
      member3_name: "",
      member3_nim: "",
      sub_theme: "teknologi",
      identity_confirmed: false,
    },
  });
  const { handleSubmit, setValue, trigger } = form;

  const subTheme = useWatch({ control: form.control, name: "sub_theme" });
  const leaderName = useWatch({ control: form.control, name: "leader_name" });
  const leaderEmail = useWatch({ control: form.control, name: "leader_email" });
  const member2Name = useWatch({ control: form.control, name: "member2_name" });
  const member3Name = useWatch({ control: form.control, name: "member3_name" });

  const selectedSubTheme = useMemo(
    () =>
      essaySubThemeOptions.find((o) => o.id === subTheme)
        ?.title ?? "-",
    [subTheme]
  );
  const memberCount = useMemo(
    () => [leaderName, member2Name, member3Name].filter(Boolean).length,
    [leaderName, member2Name, member3Name]
  );

  useEffect(() => {
    if (!user?.email) return;
    const timeout = window.setTimeout(() => {
      if (!leaderEmail) {
        setValue("leader_email", user.email ?? "", { shouldValidate: false });
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [user?.email, setValue, leaderEmail]);

  const goToVerification = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    const isValid = await trigger(ESSAY_VERIFICATION_FIELDS);
    if (isValid) {
      setSubmitError("");
      setStep("verification");
    }
  };

  const submitRegistration = handleSubmit(async () => {
    setIsSubmitting(true);
    setSubmitError("");

    // Simulate API call - replace with real API when backend is ready
    setTimeout(() => {
      setRegistrationId(
        `ESSAY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      );
      setStep("payment");
      setIsSubmitting(false);
    }, 1000);
  });

  const handlePayment = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert(
        "Simulated: Redirecting to Xendit Payment Gateway...\n(Backend integration is currently disabled for testing)"
      );
    }, 1000);
  };

  return (
    <FormProvider {...form}>
      <section className="space-y-8">
        <StepProgress
          steps={steps}
          currentStep={step}
          ariaLabel="Essay registration progress"
          labelVisibility="always"
        />

        {step === "details" ? (
          <EssayDetailsStep onSubmit={goToVerification} />
        ) : null}

        {step === "verification" ? (
          <EssayVerificationStep
            isSubmitting={isSubmitting}
            submitError={submitError}
            submitRegistration={submitRegistration}
            onClearSubmitError={() => setSubmitError("")}
            onBack={() => setStep("details")}
          />
        ) : null}
        {step === "payment" ? (
          <EssayPaymentStep
            isSubmitting={isSubmitting}
            memberCount={memberCount}
            registrationId={registrationId}
            selectedSubTheme={selectedSubTheme}
            submitError={submitError}
            values={form.getValues()}
            onBack={() => setStep("verification")}
            onPayment={handlePayment}
          />
        ) : null}
      </section>
    </FormProvider>
  );
}
