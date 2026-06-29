"use client";

import { useEffect } from "react";

import {
  registrationStepDefinitions,
  type RegistrationFlow,
  type RegistrationStepFor,
} from "@/lib/registration-steps";
import { useRegistrationProgressStore } from "@/store/registration-progress";

type UseRegistrationStepOptions = {
  resetOnMount?: boolean;
};

export function useRegistrationStep<TFlow extends RegistrationFlow>(
  flow: TFlow,
  options: UseRegistrationStepOptions = {}
) {
  const { resetOnMount = true } = options;
  const step = useRegistrationProgressStore(
    (state) => state.steps[flow]
  ) as RegistrationStepFor<TFlow>;
  const setStoreStep = useRegistrationProgressStore((state) => state.setStep);
  const resetStoreStep = useRegistrationProgressStore((state) => state.resetStep);
  const steps = registrationStepDefinitions[flow];
  const rawActiveStepIndex = steps.findIndex((item) => item.id === step);
  const activeStepIndex = rawActiveStepIndex >= 0 ? rawActiveStepIndex : 0;

  useEffect(() => {
    if (resetOnMount) {
      resetStoreStep(flow);
    }
  }, [flow, resetOnMount, resetStoreStep]);

  return {
    activeStepIndex,
    step,
    steps,
    setStep: (nextStep: RegistrationStepFor<TFlow>) =>
      setStoreStep(flow, nextStep),
    resetStep: () => resetStoreStep(flow),
  };
}
