export type StepDefinition<TStep extends string = string> = {
  id: TStep;
  label: string;
};

export type SeminarRegistrationStep =
  | "registration-option"
  | "details"
  | "verification"
  | "ticket";

export type EsaiRegistrationStep = "details" | "verification" | "payment";

export type MechaturaRegistrationStep =
  | "tipe-robot"
  | "identitas"
  | "lampiran"
  | "verifikasi"
  | "payment";

export type SeminarPaymentStep = "registration" | "payment";

export const seminarRegistrationSteps = [
  { id: "registration-option", label: "Registration Option" },
  { id: "details", label: "Details" },
  { id: "verification", label: "Verify" },
  { id: "ticket", label: "Ticket" },
] as const satisfies readonly StepDefinition<SeminarRegistrationStep>[];

export const esaiRegistrationSteps = [
  { id: "details", label: "Details" },
  { id: "verification", label: "Verify" },
  { id: "payment", label: "Payment" },
] as const satisfies readonly StepDefinition<EsaiRegistrationStep>[];

export const mechaturaRegistrationSteps = [
  { id: "tipe-robot", label: "Tipe Robot" },
  { id: "identitas", label: "Identitas" },
  { id: "lampiran", label: "Lampiran" },
  { id: "verifikasi", label: "Verifikasi" },
  { id: "payment", label: "Payment" },
] as const satisfies readonly StepDefinition<MechaturaRegistrationStep>[];

export const seminarPaymentSteps = [
  { id: "registration", label: "Registration" },
  { id: "payment", label: "Payment" },
] as const satisfies readonly StepDefinition<SeminarPaymentStep>[];

export const registrationStepDefinitions = {
  seminar: seminarRegistrationSteps,
  esai: esaiRegistrationSteps,
  mechatura: mechaturaRegistrationSteps,
} as const;

export type RegistrationFlow = keyof typeof registrationStepDefinitions;

export type RegistrationFlowSteps = {
  seminar: SeminarRegistrationStep;
  esai: EsaiRegistrationStep;
  mechatura: MechaturaRegistrationStep;
};

export type RegistrationStepFor<TFlow extends RegistrationFlow> =
  RegistrationFlowSteps[TFlow];

export const registrationInitialSteps = {
  seminar: "registration-option",
  esai: "details",
  mechatura: "tipe-robot",
} as const satisfies RegistrationFlowSteps;
