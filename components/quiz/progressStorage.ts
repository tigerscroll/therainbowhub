export const STORAGE_VERSION = 4;
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

export function quizProgressSignaturesMatch(saved: unknown, current: string) {
  if (typeof saved !== "string") return false;
  if (saved === current) return true;
  try {
    const previous = JSON.parse(saved);
    const next = JSON.parse(current);
    delete previous.engine.hardRefreshCheckpoints;
    delete next.engine.hardRefreshCheckpoints;
    return JSON.stringify(previous) === JSON.stringify(next);
  } catch { return false; }
}

export function readQuizProgress(key: string) {
  for (const storage of ["sessionStorage", "localStorage"] as const) {
    try {
      const value = window[storage].getItem(key);
      if (value) return value;
    } catch { /* Try the other storage backend. */ }
  }
  return null;
}

export function writeQuizProgress(key: string, value: string) {
  let saved = false;
  for (const storage of ["sessionStorage", "localStorage"] as const) {
    try {
      window[storage].setItem(key, value);
      saved = window[storage].getItem(key) === value || saved;
    } catch { /* Continue in memory when storage is blocked. */ }
  }
  return saved;
}

export function removeQuizProgress(key: string) {
  for (const storage of ["sessionStorage", "localStorage"] as const) {
    try { window[storage].removeItem(key); } catch { /* Best-effort cleanup. */ }
  }
}
