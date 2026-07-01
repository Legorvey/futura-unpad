"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { midtransPaymentResponseSchema } from "@/lib/api/responses";
import { postJson } from "@/lib/query/fetch-json";
import { mutationKeys, queryKeys } from "@/lib/query/keys";

type CreateMidtransPaymentValues = {
  order_id: string;
};

export function useCreateMidtransPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.payment.midtrans.create,
    mutationFn: (values: CreateMidtransPaymentValues) =>
      postJson("/api/payment/midtrans", midtransPaymentResponseSchema, values),
    onSuccess: (_data, values) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payment.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payment.order(values.order_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.mechatura.latest,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.mechatura.all,
      });
    },
  });
}
