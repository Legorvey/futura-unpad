import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { invalidRequest, rateLimited, readJsonBody, serverError } from "@/lib/http";
import {
    getXenditPaidAt,
    mechaturaPaymentAmount,
    normalizeXenditInvoiceStatus,
} from "@/lib/payment";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase-admin";
import { xenditWebhookSchema } from "@/lib/validation";

type WebhookOrder = {
    table: "mechatura_registrations";
    payment_amount: number | null;
};

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

const findWebhookOrder = async (
    supabase: ReturnType<typeof createAdminClient>,
    externalId: string
): Promise<WebhookOrder | null> => {
    const { data: mechaturaRegistration, error: mechaturaError } = await supabase
        .from("mechatura_registrations")
        .select("payment_amount")
        .eq("xendit_external_id", externalId)
        .maybeSingle<{ payment_amount: number | null }>();

    if (mechaturaError) {
        throw mechaturaError;
    }

    if (!mechaturaRegistration) {
        return null;
    }

    return {
        table: "mechatura_registrations",
        payment_amount: mechaturaRegistration.payment_amount ?? mechaturaPaymentAmount,
    };
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

        const bodyResult = await readJsonBody(req, 32_768);

        if (!bodyResult.ok) {
            return bodyResult.response;
        }

        const parsed = xenditWebhookSchema.safeParse(bodyResult.data);

        if (!parsed.success) {
            return invalidRequest();
        }

        const body = parsed.data;
        const paymentStatus = normalizeXenditInvoiceStatus(body.status);
        const supabase = createAdminClient();
        const registration = await findWebhookOrder(supabase, body.external_id);

        if (!registration) {
            return NextResponse.json(
                { error: "Registration order was not found" },
                { status: 404 }
            );
        }

        if (
            typeof body.amount === "number" &&
            registration.payment_amount !== null &&
            body.amount !== registration.payment_amount
        ) {
            console.error("Webhook amount mismatch", {
                external_id: body.external_id,
            });
            return invalidRequest();
        }

        const paymentUpdate: Record<string, string | null> = {
            payment_status: paymentStatus,
            xendit_invoice_id: body.id,
        };

        if (body.invoice_url) {
            paymentUpdate.xendit_invoice_url = body.invoice_url;
        }

        if (paymentStatus === "paid" || paymentStatus === "settled") {
            paymentUpdate.paid_at = getXenditPaidAt(body);

            paymentUpdate.registration_status = "confirmed";
        }

        const { error } = await supabase
            .from(registration.table)
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
