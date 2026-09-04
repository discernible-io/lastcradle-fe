import { env } from "../config/env.js";

async function apiGet(path, { signal } = {}) {
  const url = `${env.apiBase}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
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

export function listGames({ status, contestMode, limit = 40, offset = 0, signal } = {}) {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  if (contestMode) q.set("contestMode", contestMode);
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

export function getNarrative({ signal } = {}) {
  return apiGet(`/api/game/narrative`, { signal });
}

export function getEnrollPrompts({ signal } = {}) {
  return apiGet(`/api/game/enroll-prompts`, { signal });
}

export function listContests({ status, limit = 20, offset = 0, signal } = {}) {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  q.set("limit", String(limit));
  q.set("offset", String(offset));
  return apiGet(`/api/game/contests?${q}`, { signal });
}

export function getHallOfFame({ limit = 20, offset = 0, signal } = {}) {
  const q = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiGet(`/api/game/hall-of-fame?${q}`, { signal });
}

export function eventsUrl(gameId) {
  return `${env.apiBase}/api/game/games/${encodeURIComponent(gameId)}/events`;
}
