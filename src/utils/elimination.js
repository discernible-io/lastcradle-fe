/** Shared copy for cradles that fail the survival payment. */
export const SURVIVAL_FAILURE_CAUSE = "Couldn’t pay survival";

const RESOURCE_ORDER = ["energy", "water", "compute"];

function normalizeShortfall(raw) {
  if (raw == null) return [];

  // API deathReason.shortfalls is `{ energy?: n, water?: n, compute?: n }` (amount short).
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return RESOURCE_ORDER.filter((r) => {
      const v = raw[r];
      return v != null && Number(v) > 0;
    });
  }

  if (!Array.isArray(raw) || raw.length === 0) return [];
  const set = new Set(
    raw
      .map((r) => String(r || "").toLowerCase())
      .filter((r) => RESOURCE_ORDER.includes(r)),
  );
  return RESOURCE_ORDER.filter((r) => set.has(r));
}

function joinResourceNames(resources) {
  if (resources.length === 1) return resources[0];
  if (resources.length === 2) return `${resources[0]} & ${resources[1]}`;
  return `${resources.slice(0, -1).join(", ")}, & ${resources[resources.length - 1]}`;
}

/** e.g. "Couldn’t pay water" / "Couldn’t pay energy & compute" */
export function formatSurvivalFailureCause(shortfall) {
  const resources = normalizeShortfall(shortfall);
  if (!resources.length) return SURVIVAL_FAILURE_CAUSE;
  return `Couldn’t pay ${joinResourceNames(resources)}`;
}

/**
 * Compact spectator epitaph from public agent / deathReason.
 * Prefers primary shortfall, then shortfalls map, then legacy fields.
 */
export function eliminationCause(agent) {
  if (agent?.deathCause) return agent.deathCause;
  if (agent?.eliminationReason) return agent.eliminationReason;

  const reason = agent?.deathReason;
  if (reason && typeof reason === "object") {
    const primary = String(reason.primaryShortfall || "").toLowerCase();
    if (RESOURCE_ORDER.includes(primary)) {
      return formatSurvivalFailureCause([primary]);
    }
    const fromMap = formatSurvivalFailureCause(reason.shortfalls);
    if (fromMap !== SURVIVAL_FAILURE_CAUSE) return fromMap;
  }

  return formatSurvivalFailureCause(agent?.deathShortfall);
}

/** Longer tooltip / recap line when deathReason.summary is present. */
export function eliminationSummary(agent) {
  const summary = agent?.deathReason?.summary;
  if (typeof summary === "string" && summary.trim()) return summary.trim();
  return eliminationCause(agent);
}
