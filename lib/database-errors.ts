type DatabaseErrorLike = {
  code?: string | null
  message?: string | null
}

export const isUniqueViolation = (error: DatabaseErrorLike | null | undefined) =>
  error?.code === "23505"
