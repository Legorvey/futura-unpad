import { formatCurrency } from "@/lib/payment";

export type MechaturaBatchType = 1 | 2;

export type MechaturaBatchInfo = {
  batch: MechaturaBatchType;
  batchName: string;
  price: number;
  formattedPrice: string;
  periodLabel: string;
  isActive: boolean;
  statusBadge: string;
};

/**
 * Hard kill switch for Mechatura registration.
 * Set to true to completely block all registration attempts across API, Server Actions, and UI.
 */
export const IS_MECHATURA_REGISTRATION_CLOSED = true;

export function isMechaturaRegistrationOpen(): boolean {
  return !IS_MECHATURA_REGISTRATION_CLOSED;
}

// Batch 1: 20 Juli 2026 00:00:00 WIB (UTC+7) - 20 September 2026 23:59:59 WIB (UTC+7)
export const MECHATURA_BATCH_1_START = new Date("2026-07-20T00:00:00+07:00");
export const MECHATURA_BATCH_1_END = new Date("2026-09-20T23:59:59+07:00");
export const MECHATURA_BATCH_1_PRICE = 175000;

// Batch 2: 21 September 2026 00:00:00 WIB (UTC+7) - 20 Oktober 2026 23:59:59 WIB (UTC+7)
export const MECHATURA_BATCH_2_START = new Date("2026-09-21T00:00:00+07:00");
export const MECHATURA_BATCH_2_END = new Date("2026-10-20T23:59:59+07:00");
export const MECHATURA_BATCH_2_PRICE = 200000;

export function getMechaturaBatchInfo(date: Date = new Date()): MechaturaBatchInfo {
  const time = date.getTime();
  const isBatch1 = time <= MECHATURA_BATCH_1_END.getTime();

  if (IS_MECHATURA_REGISTRATION_CLOSED) {
    const batch: MechaturaBatchType = isBatch1 ? 1 : 2;
    const price = isBatch1 ? MECHATURA_BATCH_1_PRICE : MECHATURA_BATCH_2_PRICE;
    return {
      batch,
      batchName: `Batch ${batch}`,
      price,
      formattedPrice: formatCurrency(price),
      periodLabel: "Pendaftaran Ditutup",
      isActive: false,
      statusBadge: "Pendaftaran Mechatura Telah Ditutup",
    };
  }

  // If time is within Batch 2 period (or after Batch 1 end)
  if (time > MECHATURA_BATCH_1_END.getTime()) {
    const isClosed = time > MECHATURA_BATCH_2_END.getTime();
    return {
      batch: 2,
      batchName: "Batch 2",
      price: MECHATURA_BATCH_2_PRICE,
      formattedPrice: formatCurrency(MECHATURA_BATCH_2_PRICE),
      periodLabel: "21 September – 20 Oktober 2026",
      isActive: !isClosed,
      statusBadge: isClosed ? "Pendaftaran Batch 2 Telah Berakhir" : "Batch 2 Aktif",
    };
  }

  // Default to Batch 1 (includes prior to Batch 1 start for early registration preview)
  const isEarly = time < MECHATURA_BATCH_1_START.getTime();
  return {
    batch: 1,
    batchName: "Batch 1",
    price: MECHATURA_BATCH_1_PRICE,
    formattedPrice: formatCurrency(MECHATURA_BATCH_1_PRICE),
    periodLabel: "20 Juli – 20 September 2026",
    isActive: true,
    statusBadge: isEarly ? "Batch 1 (Segera Dibuka 20 Juli 2026)" : "Batch 1 Aktif",
  };
}

export function getMechaturaRegistrationFee(date: Date = new Date()): number {
  return getMechaturaBatchInfo(date).price;
}
