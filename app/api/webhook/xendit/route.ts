import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { invalidRequest, rateLimited, serverError } from "@/lib/http";
import { getXenditPaidAt, normalizeXenditInvoiceStatus } from "@/lib/payment";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase-admin";
import { xenditWebhookSchema } from "@/lib/validation";

const isValidCallbackToken = (token: string | null) => {
    const expected = process.env.XENDIT_CALLBACK_TOKEN;

    if (!token || !expected) {
        return false;
    }

    const tokenBuffer = Buffer.from(token);
    const expectedBuffer = Buffer.from(expected);

    return (
        tokenBuffer.length === expectedBuffer.length &&
        timingSafeEqual(tokenBuffer, expectedBuffer)
    );
};

export async function POST(req: Request) {
    try {
        const limit = await rateLimit(req, {
            key: "xendit-webhook",
            limit: 120,
            windowSeconds: 60,
        });

        if (!limit.success) {
            return rateLimited(limit.retryAfter);
        }

        const callbackToken = req.headers.get("x-callback-token");

        if (!isValidCallbackToken(callbackToken)) {
            return NextResponse.json(
                { error: "Invalid callback token" },
                { status: 401 }
            );
        }

        const parsed = xenditWebhookSchema.safeParse(
            await req.json().catch(() => null)
        );

        if (!parsed.success) {
            return invalidRequest();
        }

        const body = parsed.data;
        const paymentStatus = normalizeXenditInvoiceStatus(body.status);
        const paymentUpdate: Record<string, string | null> = {
            payment_status: paymentStatus,
            xendit_invoice_id: body.id,
        };

        if (body.invoice_url) {
            paymentUpdate.xendit_invoice_url = body.invoice_url;
        }

        if (paymentStatus === "paid" || paymentStatus === "settled") {
            paymentUpdate.paid_at = getXenditPaidAt(body);
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from("seminar_registrations")
            .update(paymentUpdate)
            .eq("xendit_external_id", body.external_id);

        if (error) {
            console.error("Webhook update failed", error.message);
            return serverError();
        }

        return NextResponse.json({
            received: true,
        });
    } catch (error) {
        console.error(error);
        return serverError();
    }
}
