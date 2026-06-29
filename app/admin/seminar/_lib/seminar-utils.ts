import type { Participants } from "../participants";

export type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;
export type StatusFilter = "all" | "mahasiswa" | "siswa" | "dosen" | "umum";
export type RegistrationTypeFilter = "all" | "individual" | "group";
export type AttendanceFilter = "all" | "checked-in" | "pending" | "partial";

export const statusFilters: StatusFilter[] = ["all", "mahasiswa", "siswa", "dosen", "umum"];
export const typeFilters: RegistrationTypeFilter[] = ["all", "individual", "group"];
export const attendanceFilters: AttendanceFilter[] = ["all", "checked-in", "pending", "partial"];
export const pageSizeOptions = [10, 20, 30, 40] as const;
export const defaultPageSize = 10;

export const seminarListColumns = [
    "id",
    "nama_lengkap",
    "email",
    "no_telepon",
    "asal_institusi",
    "status_akademika",
    "registration_type",
    "group_name",
    "group_id",
    "created_at",
    "is_main_contact",
    "attended",
    "check_in_time",
].join(",");

export const seminarStatsColumns = [
    "is_main_contact",
    "registration_type",
    "attended",
].join(",");

export const seminarCandidateColumns = [
    "id",
    "registration_type",
    "group_id",
    "is_main_contact",
    "attended",
].join(",");

export const seminarAttendanceColumns = [
    "id",
    "group_id",
    "attended",
].join(",");

export const firstParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

export const normalizeFilter = <T extends string>(
    value: string | undefined,
    filters: readonly T[],
    fallback: T
) => (value && filters.includes(value as T) ? (value as T) : fallback);

export const normalizePositiveInt = (value: string | undefined, fallback: number) => {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const toSearchPattern = (value: string) => {
    const sanitized = value.replace(/[,%()]/g, " ").trim();
    return sanitized ? `%${sanitized}%` : "";
};

export const isGroupRegistration = (participant: Participants) =>
    participant.registration_type === "group" || participant.registration_type === "grup";

export const getAttendanceState = (
    participant: Participants
): Exclude<AttendanceFilter, "all"> => {
    const attendees = [participant, ...(participant.members ?? [])];
    const checkedCount = attendees.filter((attendee) => attendee.attended).length;

    if (checkedCount === 0) {
        return "pending";
    }

    if (checkedCount === attendees.length) {
        return "checked-in";
    }

    return "partial";
};

export const getSeminarStats = (allParticipants: Participants[]) => {
    const mainRegistrations = allParticipants.filter((p) => p.is_main_contact !== false);

    return {
        totalRegistrations: allParticipants.length,
        checkedInAttendees: allParticipants.filter((p) => p.attended).length,
        groupRegistrations: mainRegistrations.filter(isGroupRegistration).length,
        individualRegistrations: mainRegistrations.filter((p) => !isGroupRegistration(p)).length,
    };
};

export const attachGroupMembers = (
    mainParticipants: Participants[],
    memberParticipants: Participants[]
) => {
    const membersByGroup = new Map<string, Participants[]>();

    for (const participant of memberParticipants) {
        if (participant.group_id) {
            const members = membersByGroup.get(participant.group_id) ?? [];
            members.push(participant);
            membersByGroup.set(participant.group_id, members);
        }
    }

    return mainParticipants.map((participant) => {
        if (isGroupRegistration(participant) && participant.group_id) {
            return {
                ...participant,
                members: membersByGroup.get(participant.group_id) ?? [],
            };
        }

        return participant;
    });
};
