/** Prefer actual start, else joining open, else created. */
export function gameStartedAt(game) {
  return game?.startedAt || game?.joiningWindow?.startsAt || game?.createdAt || null;
}

export function formatGameStartedAt(game, { fallback = "Start time unknown" } = {}) {
  const raw = gameStartedAt(game);
  if (!raw) return fallback;
  const normalized = String(raw).includes("T") ? String(raw) : `${String(raw).replace(" ", "T")}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return String(raw);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusLabel(status) {
  const s = String(status || "").trim();
  if (!s) return "Unknown";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Display labels are Qualifying | Competition.
 * Wire contestMode remains practice | definitive | contest (nullable treated as qualifying).
 */
export function contestModeLabel(game) {
  const mode = String(game?.contestMode || "").toLowerCase();
  if (mode === "definitive" || mode === "contest" || game?.contestSeriesId) {
    return "Competition";
  }
  return "Qualifying";
}

export function contestModeTagClass(game) {
  const label = contestModeLabel(game);
  if (label === "Competition") return "definitive";
  return "practice";
}
