import { create } from "zustand";

import {
  registrationInitialSteps,
  type RegistrationFlow,
  type RegistrationFlowSteps,
} from "@/lib/registration-steps";

type RegistrationProgressState = {
  steps: RegistrationFlowSteps;
  setStep: <TFlow extends RegistrationFlow>(
    flow: TFlow,
    step: RegistrationFlowSteps[TFlow]
  ) => void;
  resetStep: (flow: RegistrationFlow) => void;
};

export const useRegistrationProgressStore = create<RegistrationProgressState>(
  (set) => ({
    steps: { ...registrationInitialSteps },
    setStep: (flow, step) =>
      set((state) => ({
        steps: {
          ...state.steps,
          [flow]: step,
        },
      })),
    resetStep: (flow) =>
      set((state) => ({
        steps: {
          ...state.steps,
          [flow]: registrationInitialSteps[flow],
        },
      })),
  })
);
