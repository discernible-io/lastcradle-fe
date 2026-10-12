import { env } from "../config/env.js";
import { attributionFields } from "../utils/utm.js";
import { readTtlCache, writeTtlCache } from "../utils/sessionTtlCache.js";

async function apiGet(path, { signal, headers: extraHeaders } = {}) {
  const url = `${env.apiBase}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...extraHeaders },
    signal,
  });

  const text = await res.text().catch(() => "");
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const code = data?.error?.code;
    const msg =
      data?.error?.message ||
      data?.message ||
      (text ? text.slice(0, 180) : "") ||
      res.statusText;
    const err = new Error(`API ${res.status} for ${path}${msg ? `: ${msg}` : ""}`);
    err.status = res.status;
    err.code = code;
    err.data = data;
    throw err;
  }

  return data ?? {};
}

export function listGames({ status, limit = 40, offset = 0, signal } = {}) {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  q.set("limit", String(limit));
  q.set("offset", String(offset));
  return apiGet(`/api/game/games?${q}`, { signal });
}

export function getGameState(gameId, { view, signal } = {}) {
  const q = new URLSearchParams();
  if (view) q.set("view", String(view));
  const qs = q.toString();
  return apiGet(
    `/api/game/games/${encodeURIComponent(gameId)}/state${qs ? `?${qs}` : ""}`,
    { signal },
  );
}

export function getMessages(gameId, turn, { signal } = {}) {
  const q = turn == null ? "" : `?turn=${encodeURIComponent(turn)}`;
  return apiGet(`/api/game/games/${encodeURIComponent(gameId)}/messages${q}`, { signal });
}

/**
 * Public transfer ledger. After resolve, pass the prior turn (or history=true) —
 * default `turn` is game.current_turn and is often empty mid-negotiation.
 * Optional toAgentId filters inbound legs for one recipient ULID.
 */
export function getTrades(gameId, turn, { history = false, toAgentId, signal } = {}) {
  const q = new URLSearchParams();
  if (history) {
    q.set("history", "1");
  } else if (turn != null && turn !== "") {
    q.set("turn", String(turn));
  }
  if (toAgentId) q.set("toAgentId", String(toAgentId));
  const qs = q.toString();
  return apiGet(
    `/api/game/games/${encodeURIComponent(gameId)}/trades${qs ? `?${qs}` : ""}`,
    { signal },
  );
}

/** Turn activity index. Optional playedOnly=true → only cycles with messages/trades/eliminations. */
export function getTurns(gameId, { playedOnly = false, signal } = {}) {
  const q = new URLSearchParams();
  if (playedOnly) q.set("playedOnly", "1");
  const qs = q.toString();
  return apiGet(
    `/api/game/games/${encodeURIComponent(gameId)}/turns${qs ? `?${qs}` : ""}`,
    { signal },
  );
}

export function getHonors(gameId, { signal } = {}) {
  return apiGet(`/api/game/games/${encodeURIComponent(gameId)}/honors`, { signal });
}

/** Public agent memoirs after elimination or finish. */
export function getRecollections(gameId, { signal } = {}) {
  return apiGet(`/api/game/games/${encodeURIComponent(gameId)}/recollections`, { signal });
}

export function getAgentIdentity(gameId, agentId, { signal } = {}) {
  return apiGet(
    `/api/game/games/${encodeURIComponent(gameId)}/players/${encodeURIComponent(agentId)}/identity`,
    { signal },
  );
}

const SLOW_GET_CACHE_MS = 5 * 60 * 1000;

async function apiGetCached(path, cacheKey, { signal, headers } = {}) {
  const cached = readTtlCache(cacheKey, SLOW_GET_CACHE_MS);
  if (cached != null) return cached;
  const data = await apiGet(path, { signal, headers });
  if (!signal?.aborted) writeTtlCache(cacheKey, data);
  return data;
}

export function getNarrative({ signal } = {}) {
  return apiGetCached(`/api/game/narrative`, "slc-narrative-v1", { signal });
}

/** Forward cookieless UTMs + funnel_id on enroll prompt fetch (query only — avoid custom-header CORS). */
export function getEnrollPrompts({ signal } = {}) {
  const attrs = attributionFields();
  const q = new URLSearchParams(attrs);
  const qs = q.toString();
  const path = qs ? `/api/game/enroll-prompts?${qs}` : `/api/game/enroll-prompts`;
  return apiGetCached(path, "slc-enroll-prompts-v1.6", { signal });
}

/** Always-on global ladder. Guests (`guest_*` / isGuest) are per-session identities. */
export function getRanking({ limit = 50, offset = 0, signal } = {}) {
  const q = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiGet(`/api/game/ranking?${q}`, { signal });
}

/** Weekly ISO-week freezes. Prefer `latest`, else `snapshots[0]`. */
export function getWeeklyRanking({ week, limit = 12, offset = 0, signal } = {}) {
  const q = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (week) q.set("week", String(week));
  return apiGet(`/api/game/ranking/weekly?${q}`, { signal });
}

/** Recent finished-game honors (no contestId). */
export function getHallOfFame({ limit = 20, offset = 0, signal } = {}) {
  const q = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiGetCached(
    `/api/game/hall-of-fame?${q}`,
    `slc-hall-of-fame-v2:${limit}:${offset}`,
    { signal },
  );
}

export function eventsUrl(gameId) {
  return `${env.apiBase}/api/game/games/${encodeURIComponent(gameId)}/events`;
}
