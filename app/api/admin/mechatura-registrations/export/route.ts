import { NextResponse } from "next/server";
import {
    isMechaturaCompetitionType,
    mechaturaCompetitionLabels,
    paymentStatusLabels,
} from "@/lib/payment";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
   export const dynamic = "force-dynamic";

    type MechaturaExportRegistration = {
        id: string;
        team_id: string | null;
        team_name: string | null;
        institution: string | null;
        province: string | null;
        competition_type: unknown;
        robot_name: string | null;
        payment_status: string | null;
        created_at: string | null;
    };

    type MechaturaExportMember = {
        registration_id: string;
        full_name: string | null;
        email: string | null;
        phone: string | null;
        is_leader: boolean | null;
    };

    const registrationColumns = [
        "id",
        "team_id",
        "team_name",
        "institution",
        "province",
        "competition_type",
        "robot_name",
        "payment_status",
        "created_at",
    ].join(",");

    const memberColumns = [
        "registration_id",
        "full_name",
        "email",
        "phone",
        "is_leader",
    ].join(",");

    const escapeCSV = (field: string | number | null | undefined) => {
        if (field === null || field === undefined) return "";
        let stringField = String(field);

        // Prevent CSV Formula Injection
        if (/^[=+\-@]/.test(stringField)) {
            stringField = "'" + stringField;
        }

        if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n"))
  {
            return `"${stringField.replace(/"/g, '""')}"`;
        }

        return stringField;
    };

    const formatPaymentStatus = (status: string | null) =>
        status && status in paymentStatusLabels
            ? paymentStatusLabels[status as keyof typeof paymentStatusLabels]
            : paymentStatusLabels.unpaid;

    const formatCompetition = (value: unknown) =>
        isMechaturaCompetitionType(value) ? mechaturaCompetitionLabels[value] : "";

    const chunk = <T,>(items: T[], size: number) => {
        const chunks: T[][] = [];

        for (let index = 0; index < items.length; index += size) {
            chunks.push(items.slice(index, index + size));
        }

        return chunks;
    };

    export async function GET() {
        const { user, adminAccess } = await requireAdmin();

        if (!user || !adminAccess) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminSupabase = createAdminClient();
        const registrations: MechaturaExportRegistration[] = [];
        const batchSize = 1000;
        let offset = 0;

        while (true) {
            const { data, error } = await adminSupabase
                .from("mechatura_registrations")
                .select(registrationColumns)
                .order("created_at", { ascending: false })
                .order("team_name", { ascending: true })
                .range(offset, offset + batchSize - 1)
                .returns<MechaturaExportRegistration[]>();

            if (error) {
                return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
            }

            registrations.push(...(data ?? []));

            if (!data || data.length < batchSize) {
                break;
            }

            offset += batchSize;
        }

        const members: MechaturaExportMember[] = [];
        const registrationIds = registrations.map((registration) => registration.id);

        for (const ids of chunk(registrationIds, batchSize)) {
            const { data, error } = await adminSupabase
                .from("mechatura_members")
                .select(memberColumns)
                .in("registration_id", ids)
                .order("is_leader", { ascending: false })
                .order("full_name", { ascending: true })
                .returns<MechaturaExportMember[]>();

            if (error) {
                return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
            }

            members.push(...(data ?? []));
        }

        const membersByRegistrationId = new Map<string, MechaturaExportMember[]>();

        for (const member of members) {
            const registrationMembers = membersByRegistrationId.get(member.registration_id) ?? [];
            registrationMembers.push(member);
            membersByRegistrationId.set(member.registration_id, registrationMembers);
        }

        const headers = [
            "Registration ID",
            "Team ID",
            "Team Name",
            "Institution",
            "Province",
            "Category",
            "Robot Name",
            "Leader Name",
            "Leader Email",
            "Leader Phone",
            "Payment Status",
            "Registered At",
        ];

        let maxMembers = 0;
        const registrationsWithMembers = registrations.map((registration) => {
            const registrationMembers = membersByRegistrationId.get(registration.id) ?? [];
            const leader = registrationMembers.find((member) => member.is_leader);
            const membersOnly = registrationMembers.filter((m) => !m.is_leader);
            if (membersOnly.length > maxMembers) maxMembers = membersOnly.length;
            return { registration, leader, membersOnly };
        });

        for (let i = 0; i < maxMembers; i++) {
            headers.push(`Member ${i + 1} Name`);
            headers.push(`Member ${i + 1} Email`);
            headers.push(`Member ${i + 1} Phone`);
        }

        const rows = registrationsWithMembers.map(({ registration, leader, membersOnly }) => {
        const date = registration.created_at ? new Date(registration.created_at).toISOString() : "";

        const baseRow = [
            escapeCSV(registration.id),
            escapeCSV(registration.team_id),
            escapeCSV(registration.team_name),
            escapeCSV(registration.institution),
            escapeCSV(registration.province),
            escapeCSV(formatCompetition(registration.competition_type)),
            escapeCSV(registration.robot_name),
            escapeCSV(leader?.full_name),
            escapeCSV(leader?.email),
            escapeCSV(leader?.phone),
            escapeCSV(formatPaymentStatus(registration.payment_status)),
            escapeCSV(date),
        ];

        const memberCols: string[] = [];
        for (let i = 0; i < maxMembers; i++) {
            const m = membersOnly[i];
            memberCols.push(escapeCSV(m?.full_name));
            memberCols.push(escapeCSV(m?.email));
            memberCols.push(escapeCSV(m?.phone));
        }

        return [...baseRow, ...memberCols].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="mechatura-registrations-${new Date().toISOString().split("T")[0]}.csv"`,
        },
    });
}