"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";

import {
  authRegisterResponseSchema,
  okResponseSchema,
} from "@/lib/api/responses";
import { fetchJson, postJson } from "@/lib/query/fetch-json";
import { mutationKeys, queryKeys } from "@/lib/query/keys";
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  RegisterFormValues,
  resetPasswordSchema,
} from "@/lib/validation";

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function useForgotPasswordMutation() {
  return useMutation({
    mutationKey: mutationKeys.auth.forgotPassword,
    mutationFn: (values: ForgotPasswordFormValues) =>
      postJson("/api/auth/forgot-password", okResponseSchema, values),
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.auth.login,
    mutationFn: (values: LoginFormValues) =>
      postJson("/api/auth/login", okResponseSchema, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.auth.register,
    mutationFn: (values: RegisterFormValues) =>
      postJson("/api/auth/register", authRegisterResponseSchema, values),
    onSuccess: (data) => {
      if (data.authenticated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
      }
    },
  });
}

export function useResetPasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.auth.resetPassword,
    mutationFn: (values: ResetPasswordValues) =>
      postJson("/api/auth/reset-password", okResponseSchema, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
    },
  });
}

export function useSetRecoveryCookieMutation() {
  return useMutation({
    mutationKey: mutationKeys.auth.setRecoveryCookie,
    mutationFn: () =>
      fetchJson("/api/auth/set-recovery-cookie", okResponseSchema, {
        method: "POST",
      }),
  });
}
