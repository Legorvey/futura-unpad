"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";

import {
  mechaturaRegistrationResponseSchema,
  seminarRegistrationResponseSchema,
} from "@/lib/api/responses";
import { fetchJson, postJson } from "@/lib/query/fetch-json";
import { mutationKeys, queryKeys } from "@/lib/query/keys";
import { seminarRegistrationSchema } from "@/lib/validation";

type SeminarRegistrationValues = z.infer<typeof seminarRegistrationSchema>;

export function useCreateSeminarRegistrationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.registrations.seminar.create,
    mutationFn: (values: SeminarRegistrationValues) =>
      postJson(
        "/api/seminar-registrations",
        seminarRegistrationResponseSchema,
        values
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.summary });
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.seminar.all,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.seminar.all });
    },
  });
}

export function useCreateMechaturaRegistrationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.registrations.mechatura.create,
    mutationFn: (formData: FormData) =>
      fetchJson("/api/mechatura-registrations", mechaturaRegistrationResponseSchema, {
        method: "POST",
        body: formData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.summary });
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.mechatura.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.mechatura.latest,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.mechatura.all });
    },
  });
}
