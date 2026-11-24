import "server-only";

const DEFAULT_SEMINAR_WA_GROUP_URL =
  "https://chat.whatsapp.com/BDGFMtpiHS71Ku3WvXwOlj?s=cl&p=a&iam=2";

export function getSeminarWaGroupUrl(): string | null {
  const raw =
    process.env.SEMINAR_WA_GROUP_URL?.trim() || DEFAULT_SEMINAR_WA_GROUP_URL;
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
