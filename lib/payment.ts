export type AcademicStatus = "mahasiswa" | "dosen";
export type AttendanceMethod = "daring" | "luring";
export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled"
  | "settled";

export const paymentPrices: Record<
  AcademicStatus,
  Record<AttendanceMethod, number>
> = {
  mahasiswa: {
    daring: 75000,
    luring: 100000,
  },
  dosen: {
    daring: 100000,
    luring: 150000,
  },
};

export const statusLabels: Record<AcademicStatus, string> = {
  mahasiswa: "Mahasiswa",
  dosen: "Dosen",
};

export const attendanceLabels: Record<AttendanceMethod, string> = {
  daring: "Daring",
  luring: "Luring",
};

export const formatCurrency = (value: number) =>
  `Rp. ${value.toLocaleString("id-ID")}`;

export const isAcademicStatus = (value: unknown): value is AcademicStatus =>
  value === "mahasiswa" || value === "dosen";

export const isAttendanceMethod = (
  value: unknown
): value is AttendanceMethod => value === "daring" || value === "luring";

export const getPaymentAmount = (
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

export const normalizeXenditInvoiceStatus = (
  status: unknown
): PaymentStatus => {
  if (typeof status !== "string") {
    return "pending";
  }

  switch (status.toUpperCase()) {
    case "PENDING":
      return "pending";
    case "PAID":
      return "paid";
    case "SETTLED":
      return "settled";
    case "EXPIRED":
      return "expired";
    case "FAILED":
      return "failed";
    case "CANCELLED":
    case "CANCELED":
    case "VOIDED":
      return "cancelled";
    default:
      return "pending";
  }
};

export const isPaymentStatus = (value: unknown): value is PaymentStatus =>
  typeof value === "string" && value in paymentStatusLabels;

export const getXenditPaidAt = (invoice: { paid_at?: unknown }) =>
  typeof invoice.paid_at === "string" ? invoice.paid_at : new Date().toISOString();

export const createRegistrationToken = () => {
  const randomValue =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `FUTURA-${Date.now()}-${randomValue}`;
};

export const isRegistrationToken = (value: unknown): value is string =>
  typeof value === "string" &&
  /^FUTURA-\d{10,}-[a-zA-Z0-9-]+$/.test(value);
