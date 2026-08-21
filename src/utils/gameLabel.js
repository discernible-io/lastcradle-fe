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
 * Display labels are Casual | Qualifying | Contest.
 * Wire contestMode: null/absent → Casual, practice → Qualifying, definitive|contest → Contest.
 */
export function wireContestMode(game) {
  const raw = game?.contestMode;
  if (raw == null || raw === "") return null;
  return String(raw).toLowerCase();
}

export function isContestGame(game) {
  const mode = wireContestMode(game);
  return mode === "definitive" || mode === "contest" || Boolean(game?.contestSeriesId);
}

export function isQualifyingGame(game) {
  return wireContestMode(game) === "practice";
}

export function isCasualGame(game) {
  return !isContestGame(game) && !isQualifyingGame(game);
}

export function contestModeLabel(game) {
  if (isContestGame(game)) return "Contest";
  if (isQualifyingGame(game)) return "Qualifying";
  return "Casual";
}

export function contestModeTagClass(game) {
  if (isContestGame(game)) return "definitive";
  if (isQualifyingGame(game)) return "qualifying";
  return "casual";
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
