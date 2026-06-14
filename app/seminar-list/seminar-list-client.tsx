"use client"

import { DataTable } from "./data-table"
import { columns } from "./participants"
import type { Participants } from "./participants"

export default function SeminarListClient({
    initialData,
}: {
    initialData: Participants[]
}) {
    const participants = initialData
    const luringCount = participants.filter((participant) => participant.presentasi_riset === "luring").length
    const daringCount = participants.filter((participant) => participant.presentasi_riset === "daring").length
    const paidCount = participants.filter(
        (participant) =>
            participant.payment_status === "paid" ||
            participant.payment_status === "settled"
    ).length

    return (
        <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8">
            <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        Admin Dashboard
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Seminar Participant List
                    </h1>
                    <p className="text-sm leading-6 text-muted-foreground">
                        Review registrations and payment statuses for Futura.
                    </p>
                </div>
                <p className="text-sm text-muted-foreground">
                    {participants.length} total registrations
                </p>
            </div>

            <div className="grid gap-3 border-y border-border py-6 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-card/90 p-5">
                    <p className="text-sm text-muted-foreground">Total registrations</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">{participants.length}</p>
                </div>
                <div className="rounded-lg border border-border p-5">
                    <p className="text-sm text-muted-foreground">Paid registrations</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">{paidCount}</p>
                </div>
                <div className="rounded-lg border border-border p-5">
                    <p className="text-sm text-muted-foreground">Luring / Daring</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">{luringCount} / {daringCount}</p>
                </div>
            </div>

            <div className="py-8">
                <DataTable columns={columns} data={participants} />
            </div>
        </main>
    )
}
