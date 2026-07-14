import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

type SeminarExportRegistration = {
    id: string
    registration_type: string | null
    nama_lengkap: string | null
    email: string | null
    no_telepon: string | null
    asal_institusi: string | null
    status_akademika: string | null
    created_at: string | null
    group_id: string | null
    is_main_contact: boolean | null
}

type GroupedRegistration = {
    main: SeminarExportRegistration | null
    members: SeminarExportRegistration[]
}

type CompleteGroupedRegistration = {
    main: SeminarExportRegistration
    members: SeminarExportRegistration[]
}

const exportColumns = [
    "id",
    "registration_type",
    "nama_lengkap",
    "email",
    "no_telepon",
    "asal_institusi",
    "status_akademika",
    "created_at",
    "group_id",
    "is_main_contact",
].join(",")

const escapeCSV = (field: string | null | undefined) => {
    if (!field) return ""
    const stringField = String(field)
    if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
        return `"${stringField.replace(/"/g, '""')}"`
    }
    return stringField
}

export async function GET() {
    const { user, isAdmin } = await requireAdmin()

    if (!user || !isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminSupabase = createAdminClient()
    const registrations: SeminarExportRegistration[] = []
    const batchSize = 1000
    let offset = 0

    while (true) {
        const { data, error } = await adminSupabase
            .from("seminar_registrations")
            .select(exportColumns)
            .order("group_id", { ascending: true })
            .order("is_main_contact", { ascending: false })
            .order("created_at", { ascending: true })
            .range(offset, offset + batchSize - 1)
            .returns<SeminarExportRegistration[]>()

        if (error) {
            return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
        }

        registrations.push(...(data ?? []))

        if (!data || data.length < batchSize) {
            break
        }

        offset += batchSize
    }

    // Group registrations by group_id so each submission is exactly 1 row
    const groupedRegistrations = new Map<string, GroupedRegistration>()
    const individualRegistrations: GroupedRegistration[] = []

    for (const reg of registrations) {
        if (reg.group_id) {
            if (!groupedRegistrations.has(reg.group_id)) {
                groupedRegistrations.set(reg.group_id, { main: null, members: [] })
            }
            const group = groupedRegistrations.get(reg.group_id)!
            if (reg.is_main_contact) {
                group.main = reg
            } else {
                group.members.push(reg)
            }
        } else {
            individualRegistrations.push({ main: reg, members: [] })
        }
    }

    // Combine them into a single array, filtering out any anomalous groups without a main contact
    const allGrouped: CompleteGroupedRegistration[] = [
        ...individualRegistrations,
        ...Array.from(groupedRegistrations.values()),
    ].flatMap((group) =>
        group.main ? [{ main: group.main, members: group.members }] : []
    )

    let maxMembers = 0;
    allGrouped.forEach(group => {
        if (group.members.length > maxMembers) maxMembers = group.members.length;
    });

    // CSV Header
    const headers = [
        "Registration ID",
        "Registration Type",
        "Name (Main Contact)",
        "Email",
        "Phone",
        "Institution",
        "Status Akademika",
        "Registered At",
    ];

    for (let i = 0; i < maxMembers; i++) {
        headers.push(`Member ${i + 1} Name`);
        headers.push(`Member ${i + 1} Institution`);
    }

    // Convert data to CSV rows
    const rows = allGrouped.map(({ main, members }) => {
        const type = main.registration_type === "grup" || main.registration_type === "group" ? "Group" : "Individual"
        const date = main.created_at ? new Date(main.created_at).toISOString() : ""

        const baseRow = [
            escapeCSV(main.id),
            escapeCSV(type),
            escapeCSV(main.nama_lengkap),
            escapeCSV(main.email),
            escapeCSV(main.no_telepon),
            escapeCSV(main.asal_institusi),
            escapeCSV(main.status_akademika),
            escapeCSV(date),
        ];

        const memberCols: string[] = [];
        for (let i = 0; i < maxMembers; i++) {
            const m = members[i];
            memberCols.push(escapeCSV(m?.nama_lengkap));
            memberCols.push(escapeCSV(m?.asal_institusi));
        }

        return [...baseRow, ...memberCols].join(",")
    })

    const csvContent = [headers.join(","), ...rows].join("\n")

    return new NextResponse(csvContent, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="seminar-registrations-${new Date().toISOString().split('T')[0]}.csv"`,
        },
    })
}
