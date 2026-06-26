import { NextResponse } from "next/server";
import {
    mechaturaPaymentAmount,
    normalizeXenditInvoiceStatus,
} from "@/lib/payment";
import { createAdminClient } from "@/lib/supabase-admin";
import { invalidRequest, rateLimited, readJsonBody, serverError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { orderSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

type MechaturaPaymentRow = {
    id: string;
    team_name: string;
    payment_status: string | null;
    payment_amount: number | null;
    xendit_external_id: string;
    xendit_invoice_id: string | null;
    xendit_invoice_url: string | null;
    user_id: string;
};

type PayableOrder = {
    email: string;
    paymentStatus: string | null;
    externalId: string;
    invoiceId: string | null;
    invoiceUrl: string | null;
    userId: string | null;
    amount: number;
    description: string;
};

const getAppOrigin = (request: Request) => {
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (configuredUrl) {
        try {
            const url = new URL(configuredUrl);

            if (url.protocol === "http:" || url.protocol === "https:") {
                return url.origin;
            }
        } catch {
            console.error("Invalid NEXT_PUBLIC_APP_URL");
        }
    }

    return new URL(request.url).origin;
};

const findMechaturaOrder = async (
    supabase: ReturnType<typeof createAdminClient>,
    orderId: string
): Promise<PayableOrder | null> => {
    const { data: order, error } = await supabase
        .from("mechatura_registrations")
        .select(
            "id,team_name,payment_status,payment_amount,xendit_external_id,xendit_invoice_id,xendit_invoice_url,user_id"
        )
        .eq("xendit_external_id", orderId)
        .maybeSingle<MechaturaPaymentRow>();

    if (error) {
        throw error;
    }

    if (!order) {
        return null;
    }

    const { data: leader, error: leaderError } = await supabase
        .from("mechatura_members")
        .select("email")
        .eq("registration_id", order.id)
        .eq("is_leader", true)
        .maybeSingle<{ email: string | null }>();

    if (leaderError) {
        throw leaderError;
    }

    if (!leader?.email) {
        return null;
    }

    return {
        email: leader.email,
        paymentStatus: order.payment_status,
        externalId: order.xendit_external_id,
        invoiceId: order.xendit_invoice_id,
        invoiceUrl: order.xendit_invoice_url,
        userId: order.user_id,
        amount: order.payment_amount ?? mechaturaPaymentAmount,
        description: `Futura Mechatura Registration Payment - ${order.team_name}`,
    };
};

const findOrder = findMechaturaOrder;

const updateInvoiceMetadata = async (
    supabase: ReturnType<typeof createAdminClient>,
    order: PayableOrder,
    invoice: { id: string; invoice_url: string; status?: unknown }
) => {
    return supabase
        .from("mechatura_registrations")
        .update({
            payment_status: normalizeXenditInvoiceStatus(invoice.status),
            payment_amount: order.amount,
            xendit_invoice_id: invoice.id,
            xendit_invoice_url: invoice.invoice_url,
        })
        .eq("xendit_external_id", order.externalId);
};

export async function POST(req: Request) {
    try {
        const limit = await rateLimit(req, {
            key: "payment-create",
            limit: 8,
            windowSeconds: 300,
        });

        if (!limit.success) {
            return rateLimited(limit.retryAfter);
        }

        const body = await readJsonBody(req);

        if (!body.ok) {
            return body.response;
        }

        const parsed = orderSchema.safeParse(body.data);

        if (!parsed.success) {
            return invalidRequest();
        }

        if (!process.env.XENDIT_SECRET_KEY) {
            return serverError();
        }

        const orderId = parsed.data.order_id;
        const supabase = createAdminClient();
        const order = await findOrder(supabase, orderId);

        if (!order) {
            return NextResponse.json(
                { error: "Registration order was not found" },
                { status: 404 }
            );
        }

        const authSupabase = await createClient();
        const {
            data: { user },
        } = await authSupabase.auth.getUser();

        if (order.userId && order.userId !== user?.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (order.paymentStatus === "paid" || order.paymentStatus === "settled") {
            return NextResponse.json(
                { error: "Registration is already paid" },
                { status: 409 }
            );
        }

        if (order.invoiceUrl) {
            return NextResponse.json({
                external_id: order.externalId,
                invoice_id: order.invoiceId,
                invoice_url: order.invoiceUrl,
                amount: order.amount,
                program: "mechatura",
                message: "A pending invoice already exists. Continue payment.",
            });
        }

        const appOrigin = getAppOrigin(req);
        const successRedirectUrl = new URL("/payment/success", appOrigin);
        successRedirectUrl.searchParams.set("order_id", order.externalId);

        const res = await fetch("https://api.xendit.co/v2/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Basic " +
                    Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString("base64"),
            },
            body: JSON.stringify({
                external_id: order.externalId,
                amount: order.amount,
                payer_email: order.email,
                description: order.description,
                success_redirect_url: successRedirectUrl.toString(),
                failure_redirect_url: new URL("/payment", appOrigin).toString(),
            }),
        });

        const invoice = await res.json();

        if (!res.ok || !invoice?.invoice_url || !invoice?.id) {
            console.error("Xendit invoice creation failed", invoice?.message);
            return NextResponse.json({ error: "Failed to create invoice" }, { status: 502 });
        }

        const { error: updateError } = await updateInvoiceMetadata(supabase, order, {
            id: invoice.id,
            invoice_url: invoice.invoice_url,
            status: invoice.status,
        });

        if (updateError) {
            console.error("Invoice metadata update failed", updateError.message);
            return serverError();
        }

        return NextResponse.json({
            external_id: order.externalId,
            invoice_id: invoice.id,
            invoice_url: invoice.invoice_url,
            amount: order.amount,
            program: "mechatura",
        });
    } catch (error) {
        console.error(error);
        return serverError();
    }
}
