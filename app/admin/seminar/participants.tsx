"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Mail, MoreHorizontal, Phone, Trash, User, Users } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { toast } from "sonner";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

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
        label: "Nama",
        icon: User,
        getValue: (participant: Participants) => participant.nama_lengkap,
    },
    {
        label: "Telepon",
        icon: Phone,
        getValue: (participant: Participants) => participant.no_telepon,
    },
    {
        label: "Email",
        icon: Mail,
        getValue: (participant: Participants) => participant.email,
    },
];

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
            toast.success("Status kehadiran berhasil diperbarui");
            router.refresh();
        } catch (e) {
            console.error("Error toggling attendance", e);
            toast.error("Gagal memperbarui status kehadiran");
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

    const handleMainToggle = () => {
        const shouldCheckAll = mainCheckboxState === false;
        handleToggle(participant.id, shouldCheckAll, isGroup);
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
                            <DialogTitle>Kehadiran Grup</DialogTitle>
                            <DialogDescription>
                                Kelola check-in individu untuk anggota grup ini.
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
                                    {participant.nama_lengkap} <span className="text-xs text-muted-foreground ml-1 uppercase">(Kontak Utama)</span>
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
        try {
            await deleteParticipant.mutateAsync(participant.id);
            toast.success("Peserta berhasil dihapus");
            router.refresh();
        } catch (e) {
            toast.error("Gagal menghapus peserta");
            throw e; // Let ConfirmDialog handle UI error state
        }
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
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {!hideViewDetails && (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/seminar/${participant.id}`} prefetch={false}>
                                    <Eye className="h-4 w-4" />
                                    Lihat Detail
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Salin</DropdownMenuLabel>
                        {copyActions.map((action) => {
                            const Icon = action.icon;

                            return (
                                <DropdownMenuItem
                                    key={action.label}
                                    onClick={async () => {
                                        const val = action.getValue(participant);
                                        if (!val) {
                                            toast.error(`Tidak ada ${action.label} untuk disalin`);
                                            return;
                                        }
                                        await navigator.clipboard.writeText(val);
                                        toast.success(`Berhasil menyalin ${action.label} ke papan klip`);
                                    }}
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
                        Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Hapus pendaftaran?"
                description="Tindakan ini akan menghapus permanen pendaftaran peserta ini. Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus pendaftaran"
                cancelText="Batal"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </>
    );
}

export const columns: ColumnDef<Participants>[] = [
    {
        accessorKey: "attended",
        header: () => <div className="text-center">Hadir</div>,
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <AttendanceCheckbox participant={row.original} />
            </div>
        )
    },
    {
        accessorKey: "nama_lengkap",
        header: "Peserta",
        cell: ({ row }) => {
            const participant = row.original;
            const isGroup = participant.registration_type === "group" || participant.registration_type === "grup";
            const displayName = isGroup
                ? participant.group_name?.trim() || participant.nama_lengkap
                : participant.nama_lengkap;

            return (
                <div className="min-w-0 flex flex-col min-w-[180px]">
                    <span className="font-medium text-sm text-zinc-100 truncate">
                        {displayName}
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate">
                        {participant.asal_institusi || "-"}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <div className="text-xs text-zinc-300 font-mono">
                {row.original.email}
            </div>
        )
    },
    {
        accessorKey: "no_telepon",
        header: "Telepon",
        cell: ({ row }) => (
            <div className="text-xs text-zinc-400 font-mono">
                {row.original.no_telepon || "-"}
            </div>
        )
    },
    {
        accessorKey: "registration_type",
        header: "Tipe",
        cell: ({ row }) => {
            const type = row.original.registration_type;
            const isGroup = type === "group" || type === "grup";
            return (
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    isGroup
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }`}>
                    {isGroup ? "Grup" : "Individu"}
                </span>
            );
        }
    },
    {
        accessorKey: "status_akademika",
        header: "Civitas",
        cell: ({ row }) => {
            const status = row.original.status_akademika;
            return (
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                    status === "mahasiswa"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : status === "siswa"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : status === "dosen"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-zinc-800/60 text-zinc-400 border-zinc-700/40"
                }`}>
                    {status}
                </span>
            );
        }
    },
    {
        accessorKey: "created_at",
        header: "Waktu",
        cell: ({ row }) => {
            const timestamp = row.original.created_at;
            return (
                <span suppressHydrationWarning className="text-xs text-zinc-400 font-mono whitespace-nowrap" title={timestamp || ""}>
                    {formatRelativeTime(timestamp)}
                </span>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return <ParticipantActions participant={row.original} />;
        },
    },
];
