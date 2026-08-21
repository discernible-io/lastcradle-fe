import { gameStartedAt, isContestGame } from "./gameLabel.js";

const LIVE_STATUS_RANK = { running: 0, joining: 1, lobby: 2 };

function timeMs(game) {
  const raw = game?.finishedAt || game?.endedAt || gameStartedAt(game);
  if (!raw) return 0;
  const normalized = String(raw).includes("T") ? String(raw) : `${String(raw).replace(" ", "T")}Z`;
  const t = Date.parse(normalized);
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Prefer a live arena (contest over qualifying; running > joining > lobby),
 * else the most recent finished game. Optional fallback id when the list is empty.
 */
export function pickFeaturedWatchGame(games, { fallbackId = null } = {}) {
  const list = Array.isArray(games) ? games.filter((g) => g?.id) : [];

  const live = list
    .filter((g) => LIVE_STATUS_RANK[String(g.status || "")] != null)
    .sort((a, b) => {
      const contestDiff = Number(isContestGame(b)) - Number(isContestGame(a));
      if (contestDiff) return contestDiff;
      const statusDiff =
        LIVE_STATUS_RANK[String(a.status)] - LIVE_STATUS_RANK[String(b.status)];
      if (statusDiff) return statusDiff;
      return timeMs(b) - timeMs(a);
    });
  if (live[0]) return live[0];

  const finished = list
    .filter((g) => String(g.status || "") === "finished")
    .sort((a, b) => timeMs(b) - timeMs(a));
  if (finished[0]) return finished[0];

  if (fallbackId) return { id: fallbackId };
  return null;
}
