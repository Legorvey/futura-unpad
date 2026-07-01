"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  okResponseSchema,
  verifyRegistrationResponseSchema,
} from "@/lib/api/responses";
import { fetchJson, postJson } from "@/lib/query/fetch-json";
import { mutationKeys, queryKeys } from "@/lib/query/keys";

type VerifyRegistrationValues = {
  registration_id: string;
};

type ToggleAttendanceValues = {
  registration_id: string;
  attended: boolean;
  bulk?: boolean;
};

export function useVerifySeminarRegistrationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.admin.seminar.verify,
    mutationFn: (values: VerifyRegistrationValues) =>
      postJson(
        "/api/admin/verify-registration",
        verifyRegistrationResponseSchema,
        values
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.seminar.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.summary });
    },
  });
}

export function useToggleSeminarAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.admin.seminar.toggleAttendance,
    mutationFn: (values: ToggleAttendanceValues) =>
      postJson("/api/admin/toggle-attendance", okResponseSchema, values),
    onSuccess: (_data, values) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.seminar.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.seminar.detail(values.registration_id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.summary });
    },
  });
}

export function useDeleteSeminarRegistrationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.admin.seminar.delete,
    mutationFn: (id: string) =>
      fetchJson(`/api/admin/seminar-registrations/${id}`, okResponseSchema, {
        method: "DELETE",
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.seminar.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.seminar.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.summary });
    },
  });
}

export function useDeleteMechaturaRegistrationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.admin.mechatura.delete,
    mutationFn: (id: string) =>
      fetchJson(`/api/admin/mechatura-registrations/${id}`, okResponseSchema, {
        method: "DELETE",
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.mechatura.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.mechatura.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.summary });
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.mechatura.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.mechatura.latest,
      });
    },
  });
}
