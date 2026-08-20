const STORAGE_KEY = "slc_utm";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

function readStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function captureUtm(search) {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(search || window.location.search);
  const next = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) next[key] = value;
  }
  if (Object.keys(next).length === 0) return readStored();
  const merged = { ...readStored(), ...next };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* ignore quota / private mode */
  }
  return merged;
}

export function getUtm() {
  return readStored();
}

/** Stamp stored utm_* onto an absolute URL (Telegram, mint, etc.). */
export function withUtm(url) {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("/") || url.startsWith("#")) return url;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  const utm = getUtm();
  for (const key of UTM_KEYS) {
    if (utm[key] && !parsed.searchParams.has(key)) parsed.searchParams.set(key, utm[key]);
  }
  return parsed.toString();
}
