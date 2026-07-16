import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { invalidRequest, rateLimited, serverError } from "@/lib/http";
import { deleteMechaturaRegistration } from "@/lib/mechatura/registration";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase-admin";
import { idParamSchema } from "@/lib/validation";

type DeleteParams = Promise<{
    id: string;
}>;

export async function DELETE(
    request: Request,
    { params }: { params: DeleteParams }
) {
    const limit = await rateLimit(request, {
        key: "admin-delete-mechatura-registration",
        limit: 30,
        windowSeconds: 60,
    });

    if (!limit.success) {
        return rateLimited(limit.retryAfter);
    }

    const { id } = await params;
    const parsed = idParamSchema.safeParse({ id });

    if (!parsed.success) {
        return invalidRequest();
    }

    const { user, adminAccess } = await requireAdmin();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminSupabase = createAdminClient();
    const deleted = await deleteMechaturaRegistration(
        adminSupabase,
        parsed.data.id
    ).catch((error) => {
        console.error("Mechatura registration delete failed", error.message);
        return null;
    });

    if (deleted === null) {
        return serverError();
    }

    if (!deleted) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
