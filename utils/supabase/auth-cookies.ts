export const AUTH_PERSISTENCE_COOKIE = "futura-auth-persistence";
export const SESSION_AUTH_PERSISTENCE = "session";

export type AuthCookiePersistence = "persistent" | "session";

export const authPersistenceCookieOptions = {
  httpOnly: false,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export const getAuthCookiePersistence = (
  keepSignedIn: boolean
): AuthCookiePersistence => (keepSignedIn ? "persistent" : "session");

export const isSessionAuthPersistence = (value: string | null | undefined) =>
  value === SESSION_AUTH_PERSISTENCE;
