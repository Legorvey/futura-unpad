import { NextResponse } from "next/server";
import {
    getPaymentAmount,
    isAcademicStatus,
    isAttendanceMethod,
    normalizeXenditInvoiceStatus,
} from "@/lib/payment";
import { createAdminClient } from "@/lib/supabase-admin";
import { invalidRequest, rateLimited, serverError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { orderSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

type RegistrationPaymentRow = {
    email: string;
    status_akademika: unknown;
    presentasi_riset: unknown;
    payment_status: string | null;
    xendit_external_id: string;
    xendit_invoice_url: string | null;
    user_id: string | null;
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

        const parsed = orderSchema.safeParse(await req.json().catch(() => null));

        if (!parsed.success) {
            return invalidRequest();
        }

        if (!process.env.XENDIT_SECRET_KEY) {
            return serverError();
        }

        const orderId = parsed.data.order_id;
        const supabase = createAdminClient();
        const { data: order, error: lookupError } = await supabase
            .from("seminar_registrations")
            .select(
                "email,status_akademika,presentasi_riset,payment_status,xendit_external_id,xendit_invoice_url,user_id"
            )
            .eq("xendit_external_id", orderId)
            .maybeSingle<RegistrationPaymentRow>();

        if (lookupError) {
            console.error("Payment order lookup failed", lookupError.message);
            return serverError();
        }

        if (
            !order ||
            !isAcademicStatus(order.status_akademika) ||
            !isAttendanceMethod(order.presentasi_riset)
        ) {
            return NextResponse.json(
                { error: "Registration order was not found" },
                { status: 404 }
            );
        }

        const authSupabase = await createClient();
        const {
            data: { user },
        } = await authSupabase.auth.getUser();

        if (order.user_id && order.user_id !== user?.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const amount = getPaymentAmount(
            order.status_akademika,
            order.presentasi_riset
        );

        if (order.payment_status === "paid" || order.payment_status === "settled") {
            return NextResponse.json(
                { error: "Registration is already paid" },
                { status: 409 }
            );
        }

        if (order.xendit_invoice_url) {
            return NextResponse.json({
                external_id: order.xendit_external_id,
                invoice_url: order.xendit_invoice_url,
                amount,
            });
        }

        const appOrigin = getAppOrigin(req);
        const successRedirectUrl = new URL("/payment/success", appOrigin);
        successRedirectUrl.searchParams.set("order_id", order.xendit_external_id);

        const res = await fetch("https://api.xendit.co/v2/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                "Basic " +
                Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString("base64"),
            },
            body: JSON.stringify({
                external_id: order.xendit_external_id,
                amount,
                payer_email: order.email,
                description: "Futura Seminar Registration Payment",
                success_redirect_url: successRedirectUrl.toString(),
                failure_redirect_url: new URL("/payment", appOrigin).toString(),
            }),
        });

        const invoice = await res.json();

        if (!res.ok || !invoice?.invoice_url) {
            console.error("Xendit invoice creation failed", invoice?.message);
            return NextResponse.json({ error: "Failed to create invoice" }, { status: 502 });
        }

        const { error: updateError } = await supabase
            .from("seminar_registrations")
            .update({
                payment_status: normalizeXenditInvoiceStatus(invoice.status),
                payment_amount: amount,
                xendit_invoice_id: invoice.id,
                xendit_invoice_url: invoice.invoice_url,
            })
            .eq("xendit_external_id", order.xendit_external_id);

        if (updateError) {
            console.error("Invoice metadata update failed", updateError.message);
            return serverError();
        }

        return NextResponse.json({
            external_id: order.xendit_external_id,
            invoice_id: invoice.id,
            invoice_url: invoice.invoice_url,
            amount,
        });
    } catch (error) {
        console.error(error);
        return serverError();
    }
}
