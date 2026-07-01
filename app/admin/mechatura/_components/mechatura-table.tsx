"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/confirm-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    isMechaturaCompetitionType,
    mechaturaCompetitionLabels,
    paymentStatusLabels,
    type PaymentStatus,
} from "@/lib/payment";
import { formatMechaturaDateTime } from "@/lib/mechatura/format";
import { Eye, Mail, MoreHorizontal, Phone, Tags, Trash, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type AdminMechaturaRegistration = {
    id: string;
    team_id: string;
    team_name: string;
    institution: string;
    competition_type: unknown;
    robot_name: string;
    payment_status: string | null;
    created_at: string | null;
};

export type AdminMechaturaLeader = {
    registration_id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
};

const statusClassName: Record<PaymentStatus, string> = {
    unpaid: "bg-zinc-100 text-zinc-700",
    pending: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    expired: "bg-slate-100 text-slate-700",
    cancelled: "bg-neutral-100 text-neutral-700",
    settled: "bg-blue-100 text-blue-800",
};

const getStatus = (status: string | null): PaymentStatus =>
    status && status in statusClassName ? (status as PaymentStatus) : "unpaid";

const copyText = async (value: string | null | undefined) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
};

const deleteTeam = async (id: string) => {
    const res = await fetch(`/api/admin/mechatura-registrations/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error(data?.error ?? "Delete failed");
        throw new Error("Failed to delete team.");
    }
};

type MechaturaTableProps = {
    registrations: AdminMechaturaRegistration[];
    leaderByRegistrationId: Map<string, AdminMechaturaLeader>;
};

function TeamActions({
    registration,
    leader,
}: {
    registration: AdminMechaturaRegistration;
    leader?: AdminMechaturaLeader;
}) {
    const router = useRouter();
    const [deleteOpen, setDeleteOpen] = useState(false);

    const handleDelete = async () => {
        await deleteTeam(registration.id);
        router.refresh();
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/mechatura/${registration.id}`}>
                            <Eye className="h-4 w-4" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Copy</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => copyText(registration.team_id)}>
                            <Tags className="h-4 w-4" />
                            Team ID
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyText(leader?.email)}>
                            <Mail className="h-4 w-4" />
                            Leader Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyText(leader?.phone)}>
                            <Phone className="h-4 w-4" />
                            Leader Phone
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete team?"
                description="This will permanently remove this Mechatura team, its registered people, and uploaded documents. This action cannot be undone."
                confirmText="Delete team"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </>
    );
}

export default function MechaturaTable({
    registrations,
    leaderByRegistrationId,
}: MechaturaTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card/90">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="h-12 w-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            #
                        </TableHead>
                        <TableHead className="h-12 min-w-72 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Team
                        </TableHead>
                        <TableHead className="h-12 min-w-56 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Category
                        </TableHead>
                        <TableHead className="h-12 min-w-64 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Leader
                        </TableHead>
                        <TableHead className="h-12 min-w-36 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Payment
                        </TableHead>
                        <TableHead className="h-12 min-w-36 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Submitted
                        </TableHead>
                        <TableHead className="h-12 w-12 px-4">
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {registrations.length ? (
                        registrations.map((registration, index) => {
                            const leader = leaderByRegistrationId.get(registration.id);
                            const status = getStatus(registration.payment_status);
                            const category = isMechaturaCompetitionType(
                                registration.competition_type
                            )
                                ? mechaturaCompetitionLabels[registration.competition_type]
                                : "-";
                            return (
                                <TableRow key={registration.id}>
                                    <TableCell className="px-4 py-3 text-muted-foreground">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="font-medium">{registration.team_name}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {registration.team_id}
                                            </p>
                                            <p className="mt-1 max-w-72 truncate text-xs text-muted-foreground">
                                                {registration.institution}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <p className="font-medium">{category}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {registration.robot_name}
                                        </p>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="font-medium">
                                                {leader?.full_name ?? "-"}
                                            </p>
                                            <p className="mt-1 max-w-64 truncate text-xs text-muted-foreground">
                                                {leader?.email ?? "-"}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {leader?.phone ?? "-"}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName[status]}`}
                                        >
                                            {paymentStatusLabels[status]}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <p className="text-sm font-medium">
                                            {formatMechaturaDateTime(registration.created_at)}
                                        </p>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-right">
                                        <TeamActions registration={registration} leader={leader} />
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="h-32 px-4 text-center text-muted-foreground"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    <span>No Mechatura teams match the current filters.</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
