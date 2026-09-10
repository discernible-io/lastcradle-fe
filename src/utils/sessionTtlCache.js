export function readTtlCache(key, maxAgeMs) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (Date.now() - Number(parsed.at) > maxAgeMs) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

export function writeTtlCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ value, at: Date.now() }));
  } catch {
    // ignore quota / private mode
  }
}
