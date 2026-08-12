export const STORAGE_VERSION = 3;
export const PROGRESS_TTL_MS = 30 * 60 * 1000;

export function getQuizStorageKey(slug: string, locale: string) {
  return `rainbowhub:quiz-progress:v${STORAGE_VERSION}:${slug}:${locale}`;
}

export function isProgressTimestampFresh(updatedAt: unknown, now = Date.now()) {
  if (typeof updatedAt !== "string") return false;
  const savedAt = Date.parse(updatedAt);
  if (!Number.isFinite(savedAt)) return false;
  const age = now - savedAt;
  return age >= 0 && age < PROGRESS_TTL_MS;
}
