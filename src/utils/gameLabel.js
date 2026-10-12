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
  const s = String(status || "").trim().toLowerCase();
  if (!s) return "Unknown";
  if (s === "running") return "Live";
  if (s === "joining" || s === "lobby") return "Seating";
  if (s === "finished") return "Finished";
  if (s === "scheduled") return "Scheduled";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Always-on casual games — mode badge is optional Casual only. */
export function gameModeLabel() {
  return "Casual";
}

export function gameModeTagClass() {
  return "casual";
}

export function joiningWindowOf(entity) {
  return entity?.joiningWindow || entity?.game?.joiningWindow || null;
}

/** Guests are per-session ladder rows — not stable player profiles. */
export function isGuestRankingEntry(entry) {
  if (!entry || typeof entry !== "object") return false;
  if (entry.isGuest === true) return true;
  const id = String(entry.roditId || "").toLowerCase();
  return id.startsWith("guest_");
}
