/**
 * Build a turn highlight reel from public messages + trades + state snapshot.
 * Turn activity index (played vs quiet): GET .../turns — used for picker / prev-next.
 * Full narrative turn-report endpoint remains optional; this stays the offline assembler.
 */
import { agentLabel, agentLabelFromId, tradePartyLabel } from "../utils/agentLabel.js";
import { eliminationCause, eliminationSummary } from "../utils/elimination.js";

export function buildTurnReport({
  turn,
  state,
  messages = [],
  trades = [],
  previousLivingIds = null,
  passportNameByRodit = {},
}) {
  const agents = state?.agents || [];
  const nameOf = (id) => agentLabelFromId(id, agents, passportNameByRodit);

  const living = agents.filter((a) => a.status === "alive");
  const eliminatedThisTurn = agents.filter((a) => a.status === "dead" && a.diedAtTurn === turn);

  const quotes = messages
    .filter((m) => (m.body || "").trim().length > 0)
    .slice(0, 5)
    .map((m) => ({
      id: m.id,
      agentId: m.from_agent_id || m.fromAgentId,
      who: nameOf(m.from_agent_id || m.fromAgentId),
      body: (m.body || "").trim(),
      at: m.created_at || m.createdAt,
    }));

  const edges = trades
    .filter((t) => t.status === "executed" || t.status === "pending")
    .map((t) => ({
      id: t.id,
      from: t.fromAgentId,
      to: t.toAgentId,
      fromName: tradePartyLabel(t.fromAgentId, t.fromDisplayName, agents, passportNameByRodit),
      toName: tradePartyLabel(t.toAgentId, t.toDisplayName, agents, passportNameByRodit),
      energy: Number(t.energy) || 0,
      water: Number(t.water) || 0,
      compute: Number(t.compute) || 0,
      rationale: t.rationale || null,
      snippets: t.privateDealSnippets || [],
      combinedWithInvest: Boolean(t.combinedWithInvest),
      transferIndex: t.transferIndex ?? null,
      transferCount: t.transferCount ?? null,
      volume: (Number(t.energy) || 0) + (Number(t.water) || 0) + (Number(t.compute) || 0),
    }));

  const netFlow = {};
  const bump = (agentId, energy, water, compute) => {
    if (!netFlow[agentId]) netFlow[agentId] = { energy: 0, water: 0, compute: 0 };
    netFlow[agentId].energy += energy;
    netFlow[agentId].water += water;
    netFlow[agentId].compute += compute;
  };
  for (const e of edges) {
    bump(e.from, -e.energy, -e.water, -e.compute);
    bump(e.to, e.energy, e.water, e.compute);
  }

  const netArrows = Object.entries(netFlow)
    .map(([agentId, resources]) => ({
      agentId,
      name: nameOf(agentId),
      energy: resources.energy,
      water: resources.water,
      compute: resources.compute,
      net: resources.energy + resources.water + resources.compute,
    }))
    .filter((row) => row.energy !== 0 || row.water !== 0 || row.compute !== 0)
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));

  // Cradles present this cycle who never appear on an executed/pending transfer —
  // show them so absence is obvious. State is the live snapshot, so for past
  // cycles include anyone still alive now, or anyone who died on/after this turn
  // (they were still in the arena during the cycle being viewed).
  const participantIds = new Set(edges.flatMap((e) => [e.from, e.to]));
  const presentThisTurn = agents.filter(
    (a) =>
      a.status === "alive" ||
      (a.status === "dead" && a.diedAtTurn != null && a.diedAtTurn >= turn),
  );
  const nonParticipants = presentThisTurn
    .filter((a) => a.id && !participantIds.has(a.id))
    .map((a) => ({
      agentId: a.id,
      name: agentLabel(a, passportNameByRodit),
    }))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));

  let headline = `Cycle ${turn}`;
  if (eliminatedThisTurn.length > 0) {
    headline += ` — ${eliminatedThisTurn.length} cradle${eliminatedThisTurn.length === 1 ? "" : "s"} eliminated`;
  } else if (edges.length > 0) {
    headline += ` — ${edges.length} transfer${edges.length === 1 ? "" : "s"} settled`;
  } else if (quotes.length > 0) {
    headline += ` — public negotiation`;
  } else {
    headline += ` — quiet cycle`;
  }

  return {
    turn,
    headline,
    quotes,
    edges,
    netArrows,
    nonParticipants,
    agents,
    eliminations: eliminatedThisTurn.map((a) => ({
      id: a.id,
      name: agentLabel(a, passportNameByRodit),
      cause: eliminationCause(a),
      summary: eliminationSummary(a),
      lastAction: a?.deathReason?.submittedActionType || null,
      diedAtTurn: a.diedAtTurn,
    })),
    livingCount: living.length,
    previousLivingCount: previousLivingIds ? previousLivingIds.length : null,
    gameStatus: state?.game?.status,
    contestMode: state?.game?.contestMode,
  };
}
