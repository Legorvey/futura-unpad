export type StepDefinition<TStep extends string = string> = {
  id: TStep;
  label: string;
};

export type SeminarRegistrationStep =
  | "registration-option"
  | "details"
  | "verification"
  | "ticket";

export type EssayRegistrationStep = "details" | "verification" | "payment";

export type MechaturaRegistrationStep =
  | "registration-option"
  | "identity"
  | "verification"
  | "lampiran"
  | "ticket";

export type SeminarPaymentStep = "registration" | "payment";

export const seminarRegistrationSteps = [
  { id: "registration-option", label: "Registration Option" },
  { id: "details", label: "Details" },
  { id: "verification", label: "Verify" },
  { id: "ticket", label: "Ticket" },
] as const satisfies readonly StepDefinition<SeminarRegistrationStep>[];

export const essayRegistrationSteps = [
  { id: "details", label: "Details" },
  { id: "verification", label: "Verify" },
  { id: "payment", label: "Payment" },
] as const satisfies readonly StepDefinition<EssayRegistrationStep>[];

export const mechaturaRegistrationSteps = [
  { id: "registration-option", label: "Registration Option" },
  { id: "identity", label: "Identity" },
  { id: "verification", label: "Verify" },
  { id: "lampiran", label: "Lampiran" },
  { id: "ticket", label: "Ticket" },
] as const satisfies readonly StepDefinition<MechaturaRegistrationStep>[];

export const seminarPaymentSteps = [
  { id: "registration", label: "Registration" },
  { id: "payment", label: "Payment" },
] as const satisfies readonly StepDefinition<SeminarPaymentStep>[];

export const registrationStepDefinitions = {
  seminar: seminarRegistrationSteps,
  essay: essayRegistrationSteps,
  mechatura: mechaturaRegistrationSteps,
} as const;

export type RegistrationFlow = keyof typeof registrationStepDefinitions;

export type RegistrationFlowSteps = {
  seminar: SeminarRegistrationStep;
  essay: EssayRegistrationStep;
  mechatura: MechaturaRegistrationStep;
};

export type RegistrationStepFor<TFlow extends RegistrationFlow> =
  RegistrationFlowSteps[TFlow];

export const registrationInitialSteps = {
  seminar: "registration-option",
  essay: "details",
  mechatura: "registration-option",
} as const satisfies RegistrationFlowSteps;
