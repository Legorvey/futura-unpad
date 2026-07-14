import { NextResponse } from "next/server";

import {
  isValidMidtransSignature,
  mapMidtransPaymentStatus,
} from "@/lib/midtrans";
import { updateMechaturaPaymentStatus } from "@/lib/mechatura/payment";
import { isRegistrationToken } from "@/lib/payment";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type MidtransNotification = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
};

export async function POST(request: Request) {
  const notification = (await request.json().catch(() => null)) as
    | MidtransNotification
    | null;

  if (!notification || !isRegistrationToken(notification.order_id)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const isValidSignature = isValidMidtransSignature({
    orderId: notification.order_id,
    statusCode: notification.status_code,
    grossAmount: notification.gross_amount,
    signatureKey: notification.signature_key,
  });

  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const paymentStatus = mapMidtransPaymentStatus(
    notification.transaction_status,
    notification.fraud_status
  );

  await updateMechaturaPaymentStatus(
    createAdminClient(),
    notification.order_id,
    paymentStatus,
    notification.payment_type
  );

  return NextResponse.json({ ok: true });
}
