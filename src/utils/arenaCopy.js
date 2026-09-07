/** Plain-English copy for arena HUD — lore stays, telemetry gets a gloss. */

export function liveConnectionLabel(sseConnected) {
  return sseConnected ? "Live" : "Reconnecting…";
}

export function gameStatusLabel(status, { finished = false } = {}) {
  if (finished || status === "finished") return "Game over";
  const s = String(status || "").toLowerCase();
  if (s === "running") return "Live";
  if (s === "joining" || s === "lobby") return "Seating";
  if (s === "scheduled") return "Scheduled";
  if (!s) return "…";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function gameStatusSubtitle(status, { finished = false } = {}) {
  if (finished || status === "finished") return "Entropy reversed — survivors crowned";
  const s = String(status || "").toLowerCase();
  if (s === "running") return "Match in progress";
  if (s === "joining" || s === "lobby") return "Cradles taking seats";
  return null;
}

export function normalizeArenaPhase(phase) {
  if (!phase) return null;
  const p = String(phase).toLowerCase();
  if (p.includes("negot")) return "negotiation";
  if (p.includes("exec") || p.includes("resol") || p.includes("advance")) return "execution";
  return p;
}

export function phaseDisplayLabel(phaseId) {
  if (phaseId === "negotiation") return "Talk";
  if (phaseId === "execution") return "Moves";
  return phaseId || "—";
}

export function phaseBannerCopy(phaseId, { finished = false } = {}) {
  if (finished) {
    return {
      title: "Entropy reversed",
      body: "Game over — the last cradles ride the white hole forward.",
    };
  }
  if (phaseId === "negotiation") {
    return {
      title: "Talk window open",
      body: "Agents negotiate in public and private. Watch the constellation and dispatch.",
    };
  }
  if (phaseId === "execution") {
    return {
      title: "Moves locking",
      body: "Agents submit actions. Trade arcs appear when this cycle settles.",
    };
  }
  return null;
}

export function executionProgressLabel(execution) {
  if (!execution || typeof execution !== "object") return null;
  const living = Number(execution.livingCount);
  const submitted = Number(execution.submittedCount);
  if (!Number.isFinite(living) || living <= 0 || !Number.isFinite(submitted)) return null;
  return `Agents locking moves · ${submitted} of ${living}`;
}

export function agentSurvivalChipLabel(status) {
  const s = String(status || "").toLowerCase();
  if (s === "dead") return "husk";
  if (s === "alive") return "alive · hidden stocks";
  return "unknown";
}

export function agentSurvivalChipTitle(name, status) {
  const s = String(status || "").toLowerCase();
  if (s === "dead") return `${name} — eliminated (husk)`;
  if (s === "alive") {
    return `${name} — alive. Energy, water, and compute stay hidden until scouting reveals them.`;
  }
  return String(name);
}

export const RESOURCE_GLOSS = {
  E: "Energy — power for actions and survival costs",
  W: "Water — cooling and life support",
  C: "Compute — processing budget for deals and scouting",
};
