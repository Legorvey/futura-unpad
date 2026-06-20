import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"
import { invalidRequest, rateLimited, serverError } from "@/lib/http"
import { rateLimit } from "@/lib/rate-limit"
import { idParamSchema } from "@/lib/validation"

type DeleteParams = Promise<{
    id: string
}>

export async function DELETE(
    request: Request,
    { params }: { params: DeleteParams }
) {
    const limit = await rateLimit(request, {
        key: "admin-delete-registration",
        limit: 30,
        windowSeconds: 60,
    })

    if (!limit.success) {
        return rateLimited(limit.retryAfter)
    }

    const { id } = await params
    const parsed = idParamSchema.safeParse({ id })

    if (!parsed.success) {
        return invalidRequest()
    }

    const { user, isAdmin } = await requireAdmin()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const adminSupabase = createAdminClient()
    
    // First find if this is a group registration to get the group_id
    const { data: registration } = await adminSupabase
        .from("seminar_registrations")
        .select("group_id, is_main_contact")
        .eq("id", parsed.data.id)
        .single()

    let deleteQuery = adminSupabase.from("seminar_registrations").delete()

    // If it's a main contact with a group, delete the whole group
    if (registration?.group_id && registration.is_main_contact) {
        deleteQuery = deleteQuery.eq("group_id", registration.group_id)
    } else {
        // Otherwise just delete the specific row
        deleteQuery = deleteQuery.eq("id", parsed.data.id)
    }

    const { error } = await deleteQuery

    if (error) {
        console.error("Admin delete failed", error.message)
        return serverError()
    }

    return NextResponse.json({ ok: true })
}
