import type { FieldPath } from "react-hook-form";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";

export const SEMINAR_VERIFICATION_FIELDS = [
  "nama",
  "email",
  "telp",
  "institusi",
  "status_akademika",
  "members",
] satisfies FieldPath<ClientSeminarFormValues>[];
