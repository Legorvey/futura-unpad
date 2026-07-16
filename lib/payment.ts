/* eslint-disable */
export type AcademicStatus = "mahasiswa" | "siswa" | "dosen" | "umum";
export type AttendanceMethod = "daring" | "luring";
export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled"
  | "settled";
export type RegistrationProgram = "seminar" | "mechatura";
export type MechaturaCompetitionType = "sumo" | "transporter";

export const paymentPrices: Record<
  AcademicStatus,
  Record<AttendanceMethod, number>
> = {
  mahasiswa: {
    daring: 0,
    luring: 0,
  },
  siswa: {
    daring: 0,
    luring: 0,
  },
  dosen: {
    daring: 0,
    luring: 0,
  },
  umum: {
    daring: 0,
    luring: 0,
  },
};

export const statusLabels: Record<AcademicStatus, string> = {
  mahasiswa: "Mahasiswa",
  siswa: "Siswa",
  dosen: "Dosen",
  umum: "Umum",
};

const attendanceLabels: Record<AttendanceMethod, string> = {
  daring: "Daring",
  luring: "Luring",
};

export const registrationProgramLabels: Record<RegistrationProgram, string> = {
  seminar: "Futura Seminar",
  mechatura: "Mechatura",
};

export const mechaturaCompetitionLabels: Record<MechaturaCompetitionType, string> = {
  sumo: "Robot Sumo",
  transporter: "Robot Transporter",
};

export const mechaturaPaymentAmount = 10000;
export const midtransOrderIdMaxLength = 50;

export const formatCurrency = (value: number) =>
  `Rp. ${value.toLocaleString("id-ID")}`;

export const isAcademicStatus = (value: unknown): value is AcademicStatus =>
  value === "mahasiswa" ||
  value === "siswa" ||
  value === "dosen" ||
  value === "umum";

const isAttendanceMethod = (
  value: unknown
): value is AttendanceMethod => value === "daring" || value === "luring";

const isRegistrationProgram = (
  value: unknown
): value is RegistrationProgram => value === "seminar" || value === "mechatura";

export const isMechaturaCompetitionType = (
  value: unknown
): value is MechaturaCompetitionType =>
  value === "sumo" || value === "transporter";

const getPaymentAmount = (
  status: AcademicStatus,
  attendance: AttendanceMethod
) => paymentPrices[status][attendance];

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  expired: "Expired",
  cancelled: "Cancelled",
  settled: "Settled",
};

export const isPaymentStatus = (value: unknown): value is PaymentStatus =>
  typeof value === "string" && value in paymentStatusLabels;

export const completedPaymentStatuses = ["paid", "settled"] as const satisfies readonly PaymentStatus[];

const completedPaymentStatusSet = new Set<PaymentStatus>(completedPaymentStatuses);

export const isCompletedPaymentStatus = (
  value: unknown
): value is (typeof completedPaymentStatuses)[number] =>
  isPaymentStatus(value) && completedPaymentStatusSet.has(value);

const createOrderRandomSuffix = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
  }

  return Math.random().toString(36).slice(2, 14).toUpperCase();
};

export const createRegistrationToken = () => {
  const timestamp = Date.now().toString(36).toUpperCase();

  return `FUTURA-${timestamp}-${createOrderRandomSuffix()}`;
};

export const isRegistrationToken = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length <= 80 &&
  /^FUTURA-[a-zA-Z0-9]+-[a-zA-Z0-9-]+$/.test(value);

export const isMidtransCompatibleOrderId = (value: string) =>
  isRegistrationToken(value) && value.length <= midtransOrderIdMaxLength;
