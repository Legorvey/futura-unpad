import type { FieldPath } from "react-hook-form";

import type { ClientLombaEssayFormValues } from "@/lib/validation/essay";

export const ESSAY_VERIFICATION_FIELDS = [
  "team_name",
  "institution",
  "faculty",
  "paper_title",
  "sub_theme",
  "leader_name",
  "leader_nim",
  "leader_email",
  "leader_phone",
  "member2_name",
  "member2_nim",
  "member3_name",
  "member3_nim",
] satisfies FieldPath<ClientLombaEssayFormValues>[];
