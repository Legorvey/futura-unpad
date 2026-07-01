import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { invalidRequest, rateLimited, serverError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase-admin";
import { idParamSchema } from "@/lib/validation";

const MECHATURA_DOCUMENT_BUCKET = "mechatura-documents";

type DeleteParams = Promise<{
    id: string;
}>;

type MechaturaDeleteTarget = {
    member_document_path: string | null;
    robot_document_path: string | null;
};

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

    const { user, isAdmin } = await requireAdmin();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminSupabase = createAdminClient();
    const { data: registration, error: lookupError } = await adminSupabase
        .from("mechatura_registrations")
        .select("member_document_path,robot_document_path")
        .eq("id", parsed.data.id)
        .maybeSingle<MechaturaDeleteTarget>();

    if (lookupError) {
        console.error("Mechatura registration lookup failed", lookupError.message);
        return serverError();
    }

    if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const { error: membersError } = await adminSupabase
        .from("mechatura_members")
        .delete()
        .eq("registration_id", parsed.data.id);

    if (membersError) {
        console.error("Mechatura members delete failed", membersError.message);
        return serverError();
    }

    const { error: registrationError } = await adminSupabase
        .from("mechatura_registrations")
        .delete()
        .eq("id", parsed.data.id);

    if (registrationError) {
        console.error("Mechatura registration delete failed", registrationError.message);
        return serverError();
    }

    const documentPaths = [
        registration.member_document_path,
        registration.robot_document_path,
    ].filter((path): path is string => Boolean(path));

    if (documentPaths.length) {
        const { error: storageError } = await adminSupabase.storage
            .from(MECHATURA_DOCUMENT_BUCKET)
            .remove(documentPaths);

        if (storageError) {
            console.error("Mechatura document cleanup failed", storageError.message);
        }
    }

    return NextResponse.json({ ok: true });
}
