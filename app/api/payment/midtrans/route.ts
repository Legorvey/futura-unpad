import { NextResponse } from "next/server";
import { z } from "zod";

import { invalidRequest, rateLimited, readJsonBody, serverError } from "@/lib/http";
import {
  ensureMidtransCompatibleMechaturaOrder,
  findMechaturaPaymentOrder,
  getMechaturaPaymentItemName,
  isCompletedMechaturaPaymentStatus,
  rotateMechaturaPaymentOrderId,
  updateMechaturaPaymentStatus,
} from "@/lib/mechatura/payment";
import {
  getLatestMechaturaRegistration,
  isMechaturaPaymentExpired,
} from "@/lib/mechatura/registration";
import {
  createMidtransSnapTransaction,
  getMidtransEnvironment,
  MidtransOrderDuplicateError,
  MidtransSnapResponse,
} from "@/lib/midtrans";
import { isRegistrationToken } from "@/lib/payment";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

const midtransPaymentSchema = z.object({
  order_id: z.string().refine(isRegistrationToken),
});

const getOrigin = (request: Request) =>
  process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "midtrans-payment",
    limit: 10,
    windowSeconds: 60,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return body.response;
  }

  const parsed = midtransPaymentSchema.safeParse(body.data);

  if (!parsed.success) {
    return invalidRequest();
  }

  const authSupabase = await createClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        details: "You must be signed in to perform this action.",
      },
      { status: 401 }
    );
  }

  const adminSupabase = createAdminClient();
  let existingOrder = await findMechaturaPaymentOrder(
    adminSupabase,
    parsed.data.order_id
  ).catch((error) => {
    console.error("Midtrans order lookup failed", error.message);
    return null;
  });

  // Fallback: If order not found by order_id, check if authenticated user owns an active mechatura registration
  if (!existingOrder) {
    const latest = await getLatestMechaturaRegistration(
      adminSupabase,
      user.id
    ).catch(() => null);
    if (latest) {
      existingOrder = await findMechaturaPaymentOrder(
        adminSupabase,
        latest.paymentOrderId
      ).catch(() => null);
    }
  }

  if (!existingOrder) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  if (existingOrder.userId !== user.id) {
    console.error("[Midtrans Payment] Forbidden Mismatch:", {
      orderUserId: existingOrder.userId,
      sessionUserId: user.id,
    });
    return NextResponse.json(
      {
        error: "Forbidden",
        details: "Anda tidak memiliki izin untuk membayar pesanan ini.",
      },
      { status: 403 }
    );
  }

  if (isCompletedMechaturaPaymentStatus(existingOrder.paymentStatus)) {
    return NextResponse.json({
      redirect_url: `/payment/success?order_id=${encodeURIComponent(
        existingOrder.paymentOrderId
      )}`,
      order_id: existingOrder.paymentOrderId,
    });
  }

  if (isMechaturaPaymentExpired(existingOrder)) {
    return NextResponse.json(
      {
        error: "Waktu pembayaran Mechatura telah kedaluwarsa.",
        redirect_url: "/mechatura/form",
      },
      { status: 410 }
    );
  }

  let order = await ensureMidtransCompatibleMechaturaOrder(
    adminSupabase,
    existingOrder
  ).catch((error) => {
    console.error("Midtrans order id rotation failed", error.message);
    return null;
  });

  if (!order) {
    return serverError();
  }

  const origin = getOrigin(request);
  const getSuccessUrl = (orderId: string) =>
    `${origin}/payment/success?order_id=${encodeURIComponent(orderId)}`;
  const getPaymentUrl = (orderId: string) =>
    `${origin}/payment?order_id=${encodeURIComponent(orderId)}`;

  console.info("Creating Midtrans Snap transaction", {
    environment: getMidtransEnvironment(),
    orderId: order.paymentOrderId,
  });

  let transaction: MidtransSnapResponse | null = null;
  try {
    transaction = await createMidtransSnapTransaction({
      orderId: order.paymentOrderId,
      amount: order.paymentAmount,
      itemName: getMechaturaPaymentItemName(order),
      customer: order.leader,
      finishUrl: getSuccessUrl(order.paymentOrderId),
      errorUrl: getPaymentUrl(order.paymentOrderId),
      pendingUrl: getPaymentUrl(order.paymentOrderId),
    });
  } catch (err) {
    const isDuplicate =
      err instanceof MidtransOrderDuplicateError ||
      (err instanceof Error && /already/i.test(err.message));

    if (isDuplicate) {
      console.warn(
        "Midtrans order_id already taken in Snap, rotating order_id and retrying...",
        {
          oldOrderId: order.paymentOrderId,
        }
      );

      const rotatedOrder = await rotateMechaturaPaymentOrderId(
        adminSupabase,
        order
      ).catch((rotateErr) => {
        console.error("Failed to rotate order ID on Midtrans duplicate:", rotateErr);
        return null;
      });

      if (rotatedOrder) {
        order = rotatedOrder;
        try {
          transaction = await createMidtransSnapTransaction({
            orderId: order.paymentOrderId,
            amount: order.paymentAmount,
            itemName: getMechaturaPaymentItemName(order),
            customer: order.leader,
            finishUrl: getSuccessUrl(order.paymentOrderId),
            errorUrl: getPaymentUrl(order.paymentOrderId),
            pendingUrl: getPaymentUrl(order.paymentOrderId),
          });
        } catch (retryErr) {
          console.error(
            "Midtrans retry transaction creation failed",
            retryErr instanceof Error ? retryErr.message : retryErr
          );
        }
      }
    } else {
      console.error(
        "Midtrans transaction creation failed",
        err instanceof Error ? err.message : err
      );
    }
  }

  if (!transaction?.redirect_url) {
    return NextResponse.json(
      {
        error: "Terjadi kendala saat menghubungkan ke sistem pembayaran. Silakan muat ulang halaman atau coba klik tombol pembayaran kembali.",
        order_id: order.paymentOrderId,
      },
      { status: 500 }
    );
  }

  await updateMechaturaPaymentStatus(
    adminSupabase,
    order.paymentOrderId,
    "pending"
  ).catch((updateError) => {
    console.error("Payment status update failed", updateError.message);
  });

  return NextResponse.json({
    token: transaction.token,
    redirect_url: transaction.redirect_url,
    order_id: order.paymentOrderId,
  });
}
