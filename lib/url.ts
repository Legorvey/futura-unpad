import { z } from "zod";

/**
 * Validates whether a given URL string uses a safe protocol (http or https).
 * Returns the normalized URL string if safe, or undefined if invalid/unsafe.
 */
export function getSafeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // Malformed URL
  }
  return undefined;
}

/**
 * Returns true if the string is a valid HTTP or HTTPS URL.
 */
export function isSafeHttpUrl(url: string | null | undefined): boolean {
  return getSafeUrl(url) !== undefined;
}

/**
 * Reusable Zod schema that enforces valid HTTP or HTTPS URLs,
 * preventing pseudo-protocols like javascript:, data:, vbscript:, and file:.
 */
export const safeHttpUrlSchema = (
  max = 1000,
  message = "URL harus menggunakan format http:// atau https://"
) =>
  z
    .string()
    .trim()
    .max(max, `URL maksimal ${max} karakter`)
    .url("Format URL tidak valid")
    .refine((val) => isSafeHttpUrl(val), { message });
