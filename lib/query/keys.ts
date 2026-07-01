export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  profile: {
    summary: ["profile", "summary"] as const,
  },
  registrations: {
    seminar: {
      all: ["registrations", "seminar"] as const,
    },
    mechatura: {
      all: ["registrations", "mechatura"] as const,
      latest: ["registrations", "mechatura", "latest"] as const,
    },
  },
  payment: {
    all: ["payment"] as const,
    order: (orderId: string) => ["payment", "order", orderId] as const,
  },
  admin: {
    seminar: {
      all: ["admin", "seminar"] as const,
      detail: (id: string) => ["admin", "seminar", id] as const,
    },
    mechatura: {
      all: ["admin", "mechatura"] as const,
      detail: (id: string) => ["admin", "mechatura", id] as const,
    },
  },
} as const;

export const mutationKeys = {
  auth: {
    forgotPassword: ["auth", "forgot-password"] as const,
    login: ["auth", "login"] as const,
    register: ["auth", "register"] as const,
    resetPassword: ["auth", "reset-password"] as const,
    setRecoveryCookie: ["auth", "set-recovery-cookie"] as const,
  },
  registrations: {
    seminar: {
      create: ["registrations", "seminar", "create"] as const,
    },
    mechatura: {
      create: ["registrations", "mechatura", "create"] as const,
    },
  },
  payment: {
    midtrans: {
      create: ["payment", "midtrans", "create"] as const,
    },
  },
  admin: {
    seminar: {
      verify: ["admin", "seminar", "verify"] as const,
      toggleAttendance: ["admin", "seminar", "toggle-attendance"] as const,
      delete: ["admin", "seminar", "delete"] as const,
    },
    mechatura: {
      delete: ["admin", "mechatura", "delete"] as const,
    },
  },
} as const;
