import { NextResponse } from "next/server";

import {
  isValidMidtransSignature,
  mapMidtransPaymentStatus,
} from "@/lib/midtrans";
import {
  findMechaturaPaymentOrder,
  updateMechaturaPaymentStatus,
} from "@/lib/mechatura/payment";
import { isCompletedPaymentStatus, isRegistrationToken } from "@/lib/payment";
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

  const adminSupabase = createAdminClient();
  const existingOrder = await findMechaturaPaymentOrder(
    adminSupabase,
    notification.order_id
  );

  if (!existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const paymentStatus = mapMidtransPaymentStatus(
    notification.transaction_status,
    notification.fraud_status
  );

  if (isCompletedPaymentStatus(paymentStatus)) {
    const receivedAmount = parseFloat(notification.gross_amount ?? "0");
    if (receivedAmount < existingOrder.paymentAmount) {
      console.error("[Midtrans Webhook] Amount mismatch:", {
        orderId: notification.order_id,
        expected: existingOrder.paymentAmount,
        received: receivedAmount,
      });
      return NextResponse.json(
        { error: "Payment amount does not match order amount" },
        { status: 400 }
      );
    }
  }

  await updateMechaturaPaymentStatus(
    adminSupabase,
    notification.order_id,
    paymentStatus,
    notification.payment_type
  );

  return NextResponse.json({ ok: true });
}
