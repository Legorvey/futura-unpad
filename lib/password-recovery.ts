import crypto from "node:crypto";

export const PASSWORD_RECOVERY_COOKIE = "futura_password_recovery";

export const PASSWORD_RECOVERY_MAX_AGE_SECONDS = 15 * 60;

export const passwordRecoveryCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

const getRecoverySecret = () => {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SESSION_SECRET ||
    "futura_recovery_fallback_secret_key_32_bytes_min"
  );
};

export function createPasswordRecoveryToken(userId: string): string {
  const expiresAt = Date.now() + PASSWORD_RECOVERY_MAX_AGE_SECONDS * 1000;
  const payload = `${userId}:${expiresAt}:recovery`;
  const signature = crypto
    .createHmac("sha256", getRecoverySecret())
    .update(payload)
    .digest("hex");
  return `${userId}.${expiresAt}.${signature}`;
}

export function verifyPasswordRecoveryToken(
  token: string | undefined | null,
  userId?: string
): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [tokenUserId, expiresAtStr, signature] = parts;
  if (!tokenUserId || !expiresAtStr || !signature) return false;

  if (userId && tokenUserId !== userId) return false;

  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || Number.isNaN(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  const payload = `${tokenUserId}:${expiresAt}:recovery`;
  const expectedSignature = crypto
    .createHmac("sha256", getRecoverySecret())
    .update(payload)
    .digest("hex");

  if (signature.length !== expectedSignature.length) return false;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}
