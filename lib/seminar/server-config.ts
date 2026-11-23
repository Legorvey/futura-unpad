import "server-only";

export function getSeminarWaGroupUrl(): string | null {
  const raw = process.env.SEMINAR_WA_GROUP_URL?.trim();
  if (!raw) {
    return null;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}
