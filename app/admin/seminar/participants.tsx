/* eslint-disable */
"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Mail, MoreHorizontal, Phone, Trash, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmDialog from "@/components/confirm-dialog";
import {
    useDeleteSeminarRegistrationMutation,
    useToggleSeminarAttendanceMutation,
} from "@/hooks/mutations/use-admin-mutations";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Participants = {
    id: string;
    nama_lengkap: string;
    email: string;
    no_telepon: string;
    asal_institusi: string;
    status_akademika: string;
    registration_type?: string;
    group_name?: string | null;
    group_id?: string | null;
    created_at?: string;
    is_main_contact?: boolean;
    members?: { id: string; nama_lengkap: string; asal_institusi?: string; attended?: boolean }[];
    attended?: boolean;
    check_in_time?: string | null;
};

const copyActions = [
    {
        label: "Name",
        icon: User,
        getValue: (participant: Participants) => participant.nama_lengkap,
    },
    {
        label: "Phone",
        icon: Phone,
        getValue: (participant: Participants) => participant.no_telepon,
    },
    {
        label: "Email",
        icon: Mail,
        getValue: (participant: Participants) => participant.email,
    },
];

import { Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function AttendanceCheckbox({ participant }: { participant: Participants }) {
    const router = useRouter();
    const toggleAttendance = useToggleSeminarAttendanceMutation();

    const handleToggle = async (id: string, checked: boolean, bulk: boolean = false) => {
        try {
            await toggleAttendance.mutateAsync({
                registration_id: id,
                attended: checked,
                bulk
            });
            router.refresh();
        } catch (e) {
            console.error("Error toggling attendance", e);
        }
    };

    const isGroup = participant.members && participant.members.length > 0;

    let mainCheckboxState: boolean | "indeterminate" = !!participant.attended;
    if (isGroup) {
        const allGroupMembers = [participant, ...(participant.members || [])];
        const checkedCount = allGroupMembers.filter(m => m.attended).length;
        if (checkedCount === 0) mainCheckboxState = false;
        else if (checkedCount === allGroupMembers.length) mainCheckboxState = true;
        else mainCheckboxState = "indeterminate";
    }

    const handleMainToggle = (checked: boolean | "indeterminate") => {
        // If it was true or indeterminate, we uncheck all. Otherwise check all.
        const newChecked = checked === true;
        handleToggle(participant.id, newChecked, isGroup);
    };

    return (
        <div className="flex items-center gap-1">
            <Checkbox
                checked={mainCheckboxState}
                onCheckedChange={handleMainToggle}
                disabled={toggleAttendance.isPending}
                aria-label="Attendance status"
                className={toggleAttendance.isPending ? "opacity-50" : ""}
            />
            {isGroup && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-6 w-6 ml-1 shrink-0" title="Manage Group Attendance">
                            <Users className="h-3 w-3 text-muted-foreground" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Group Attendance</DialogTitle>
                            <DialogDescription>
                                Manage individual check-ins for the members of this group.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-3 py-4 max-h-[60vh] overflow-y-auto px-1">
                            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <Checkbox
                                    id={`main-${participant.id}`}
                                    checked={!!participant.attended}
                                    disabled={toggleAttendance.isPending}
                                    onCheckedChange={(c) => handleToggle(participant.id, !!c, false)}
                                />
                                <label
                                    htmlFor={`main-${participant.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                                >
                                    {participant.nama_lengkap} <span className="text-xs text-muted-foreground ml-1 uppercase">(Main Contact)</span>
                                </label>
                            </div>

                            {participant.members!.map(member => (
                                <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                    <Checkbox
                                        id={`member-${member.id}`}
                                        checked={!!member.attended}
                                        disabled={toggleAttendance.isPending}
                                        onCheckedChange={(c) => handleToggle(member.id, !!c, false)}
                                    />
                                    <label
                                        htmlFor={`member-${member.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                                    >
                                        {member.nama_lengkap}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export function ParticipantActions({ participant, hideViewDetails }: { participant: Participants, hideViewDetails?: boolean }) {
    const router = useRouter();
    const deleteParticipant = useDeleteSeminarRegistrationMutation();
    const [deleteOpen, setDeleteOpen] = useState(false);

    const handleDelete = async () => {
        await deleteParticipant.mutateAsync(participant.id);
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
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {!hideViewDetails && (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/seminar/${participant.id}`} prefetch={false}>
                                    <Eye className="h-4 w-4" />
                                    View Details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Copy</DropdownMenuLabel>
                        {copyActions.map((action) => {
                            const Icon = action.icon;

                            return (
                                <DropdownMenuItem
                                    key={action.label}
                                    onClick={() =>
                                        navigator.clipboard.writeText(action.getValue(participant))
                                    }
                                >
                                    <Icon className="h-4 w-4" />
                                    {action.label}
                                </DropdownMenuItem>
                            );
                        })}
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
                title="Delete registration?"
                description="This will permanently remove this participant registration. This action cannot be undone."
                confirmText="Delete registration"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </>
    );
}

export const columns: ColumnDef<Participants>[] = [
    {
        id: "index",
        header: "#",
        cell: ({ row }) => (
            <div className="text-muted-foreground">{row.index + 1}</div>
        ),
    },
    {
        accessorKey: "attended",
        header: () => <div className="text-center">Checked In</div>,
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <AttendanceCheckbox participant={row.original} />
            </div>
        )
    },
    {
        accessorKey: "nama_lengkap",
        header: "Name",
        cell: ({ row }) => {
            const participant = row.original;
            const isGroup = participant.registration_type === "group" || participant.registration_type === "grup";
            const displayName = isGroup
                ? participant.group_name?.trim() || participant.nama_lengkap
                : participant.nama_lengkap;

            return <div className="font-medium">{displayName}</div>;
        },
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "no_telepon",
        header: "Phone",
    },
    {
        accessorKey: "asal_institusi",
        header: "Institution",
    },
    {
        accessorKey: "registration_type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.original.registration_type;
            const isGroup = type === "group" || type === "grup";
            return (
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${isGroup ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {isGroup ? "Group" : "Individual"}
                </span>
            )
        }
    },
    {
        accessorKey: "status_akademika",
        header: "Status Civitas Akademika",
        cell: ({ row }) => (
            <span
                className={`
                    inline-flex rounded-full 
                    ${row.original.status_akademika == "mahasiswa"
                        ? "bg-blue-100 text-blue-600"
                        : row.original.status_akademika == "siswa"
                            ? "bg-emerald-100 text-emerald-700"
                            : row.original.status_akademika == "dosen"
                                ? "bg-violet-100 text-violet-700"
                                : "bg-zinc-100 text-zinc-700"
                    } 
                    px-2.5 py-1 text-xs font-medium capitalize 
                `}>
                {row.original.status_akademika}
            </span>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return <ParticipantActions participant={row.original} />;
        },
    },
];
