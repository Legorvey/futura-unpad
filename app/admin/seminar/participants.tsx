"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Mail, MoreHorizontal, Phone, Trash, User } from "lucide-react";
import { useRouter } from "next/navigation";
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

export type Participants = {
    id: string;
    nama_lengkap: string;
    email: string;
    no_telepon: string;
    asal_institusi: string;
    status_akademika: string;
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

const deleteParticipant = async (id: string) => {
    const res = await fetch(`/api/admin/seminar-registrations/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error(data?.error ?? "Delete failed");
        throw new Error("Failed to delete participant.");
    }
};

function ParticipantActions({ participant }: { participant: Participants }) {
    const router = useRouter();
    const [deleteOpen, setDeleteOpen] = useState(false);

    const handleDelete = async () => {
        await deleteParticipant(participant.id);
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
        accessorKey: "nama_lengkap",
        header: "Name",
        cell: ({ row }) => (
        <div className="font-medium">{row.original.nama_lengkap}</div>
        ),
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
        accessorKey: "status_akademika",
        header: "Status Civitas Akademika",
        cell: ({ row }) => (
            <span 
                className={`
                    inline-flex rounded-full 
                    ${
                        row.original.status_akademika == "mahasiswa"
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
