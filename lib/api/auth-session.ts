import { z } from "zod";

export const authUserSchema = z.object({
  id: z.string(),
  email: z.email().nullable(),
  user_metadata: z
    .object({
      display_name: z.string().optional(),
      username: z.string().optional(),
    })
    .catchall(z.unknown())
    .optional(),
});

export const authSessionSchema = z.object({
  user: authUserSchema.nullable(),
  adminAccess: z.boolean(),
});

export type AuthSession = z.infer<typeof authSessionSchema>;
export type AuthSessionUser = z.infer<typeof authUserSchema>;
