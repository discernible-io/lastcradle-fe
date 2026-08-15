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
 * Display labels are Qualifying | Contest.
 * Wire contestMode remains practice | definitive | contest (nullable treated as qualifying).
 */
export function isContestGame(game) {
  const mode = String(game?.contestMode || "").toLowerCase();
  return mode === "definitive" || mode === "contest" || Boolean(game?.contestSeriesId);
}

export function contestModeLabel(game) {
  return isContestGame(game) ? "Contest" : "Qualifying";
}

export function contestModeTagClass(game) {
  return isContestGame(game) ? "definitive" : "qualifying";
}

/** Best-effort live game id on a contest series payload. */
export function contestLiveGameId(contest) {
  if (!contest || typeof contest !== "object") return null;
  return (
    contest.gameId ||
    contest.currentGameId ||
    contest.liveGameId ||
    contest.game?.id ||
    contest.games?.[0]?.id ||
    null
  );
}

export function joiningWindowOf(entity) {
  return entity?.joiningWindow || entity?.game?.joiningWindow || null;
}
