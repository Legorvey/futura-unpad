import {
  mechaturaRegistrationSteps,
  type MechaturaRegistrationStep,
} from "@/lib/registration-steps";

export type MechaturaSteps = MechaturaRegistrationStep;
export const MechaturaProgress = mechaturaRegistrationSteps;
