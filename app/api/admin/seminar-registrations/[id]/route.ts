import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { logAdminAudit } from "@/lib/audit-log"
import { createAdminClient } from "@/lib/supabase-admin"
import {
    NO_STORE_HEADERS,
    invalidRequest,
    isSameOriginRequest,
    jsonError,
    rateLimited,
    serverError,
} from "@/lib/http"
import { rateLimit } from "@/lib/rate-limit"

type DeleteParams = Promise<{
    id: string
}>

const uuidParamSchema = z.object({
    id: z.uuid(),
})

export async function DELETE(
    request: Request,
    { params }: { params: DeleteParams }
) {
    if (!isSameOriginRequest(request)) {
        return jsonError("Forbidden", 403)
    }

    const { user, adminAccess } = await requireAdmin()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!adminAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const limit = await rateLimit(user.id, {
        key: "admin-delete-registration",
        limit: 30,
        windowSeconds: 60,
    })

    if (!limit.success) {
        return rateLimited(limit.retryAfter)
    }

    const { id } = await params
    const parsed = uuidParamSchema.safeParse({ id })

    if (!parsed.success) {
        return invalidRequest()
    }

    const supabase = createAdminClient()

    // First find if this is a group registration to get the group_id
    const { data: registration, error: lookupError } = await supabase
        .from("seminar_registrations")
        .select("group_id, is_main_contact")
        .eq("id", parsed.data.id)
        .maybeSingle()

    if (lookupError) {
        console.error("Admin delete lookup failed", lookupError.message)
        return serverError()
    }

    if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    let deleteQuery = supabase.from("seminar_registrations").delete()
    const isGroupDelete = Boolean(registration.group_id && registration.is_main_contact)

    // If it's a main contact with a group, delete the whole group
    if (isGroupDelete && registration.group_id) {
        deleteQuery = deleteQuery.eq("group_id", registration.group_id)
    } else {
        // Otherwise just delete the specific row
        deleteQuery = deleteQuery.eq("id", parsed.data.id)
    }

    const { error } = await deleteQuery

    if (error) {
        console.error("Admin delete failed", error.message)
        logAdminAudit({
            actorId: user.id,
            action: "seminar.registration.delete",
            targetId: parsed.data.id,
            outcome: "failure",
            details: { isGroupDelete },
        })
        return serverError()
    }

    logAdminAudit({
        actorId: user.id,
        action: "seminar.registration.delete",
        targetId: parsed.data.id,
        outcome: "success",
        details: { isGroupDelete, groupId: isGroupDelete ? registration.group_id : null },
    })

    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS })
}
