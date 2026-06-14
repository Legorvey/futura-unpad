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
    const { error } = await adminSupabase
        .from("seminar_registrations")
        .delete()
        .eq("id", parsed.data.id)

    if (error) {
        console.error("Admin delete failed", error.message)
        return serverError()
    }

    return NextResponse.json({ ok: true })
}
