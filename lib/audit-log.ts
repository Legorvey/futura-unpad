import "server-only";

export type AdminAuditEvent = {
  actorId: string;
  action:
    | "seminar.registration.delete"
    | "seminar.registration.export"
    | "seminar.attendance.verify"
    | "seminar.attendance.toggle";
  targetId?: string | null;
  outcome: "success" | "failure";
  details?: Record<string, string | number | boolean | null | undefined>;
};

export function logAdminAudit(event: AdminAuditEvent) {
  console.info(
    JSON.stringify({
      type: "admin_audit",
      timestamp: new Date().toISOString(),
      ...event,
    })
  );
}
