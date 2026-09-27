export function getQuizNavigationHref(pathname: string, search: string, transition: string) {
  const params = new URLSearchParams(search);
  params.set("quizStep", transition);
  return `${pathname}?${params.toString()}`;
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
    } catch { /* Never reload if neither backend can preserve progress. */ }
  }
  return saved;
}

export function removeQuizProgress(key: string) {
  for (const storage of ["sessionStorage", "localStorage"] as const) {
    try { window[storage].removeItem(key); } catch { /* Best-effort cleanup. */ }
  }
}
