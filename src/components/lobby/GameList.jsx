import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGameState } from "../../api/client.js";
import { useAgentLabels } from "../../hooks/useAgentLabels.js";
import { participantInitials } from "../../utils/agentLabel.js";
import { JoiningMeta } from "../campaign/JoiningMeta.jsx";
import { formatGameStartedAt, gameModeLabel, gameModeTagClass, statusLabel } from "../../utils/gameLabel.js";

function watchCta(status) {
  const s = String(status || "").toLowerCase();
  if (s === "joining" || s === "lobby") return "Enter seating";
  return "Watch Arena";
}

function GameRow({ game: g, tutorial = false }) {
  const [agents, setAgents] = useState(g.agents || []);
  const { passportNameByRodit } = useAgentLabels(agents);
  const when = formatGameStartedAt(g);
  const whenVerb = g.startedAt ? "Started" : "Opened";
  const initials = participantInitials(agents, passportNameByRodit);
  const seating = g.status === "joining" || g.status === "lobby";

  useEffect(() => {
    if (Array.isArray(g.agents) && g.agents.length) {
      setAgents(g.agents);
      return undefined;
    }
    if (!g.id) return undefined;
    const ac = new AbortController();
    (async () => {
      try {
        const state = await getGameState(g.id, { signal: ac.signal });
        if (!ac.signal.aborted) setAgents(state?.agents || []);
      } catch (err) {
        if (err?.name !== "AbortError") setAgents([]);
      }
    })();
    return () => ac.abort();
  }, [g.id, g.agents]);

  const titleBits = [`${whenVerb} ${when}`];
  if (initials.length) titleBits.push(initials.join(" · "));
  else if (g.agentCount) titleBits.push(`${g.agentCount} cradles`);

  return (
    <div className={`panel game-row${tutorial ? " game-row-tutorial" : ""}${seating ? " game-row-seating" : ""}`} title={`Game ${g.id}`}>
      <div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem", flexWrap: "wrap" }}>
          <span className={`tag ${gameModeTagClass()}`}>{gameModeLabel()}</span>
          <span className="tag">{statusLabel(g.status)}</span>
          {tutorial && <span className="tag tutorial-tag">Best first watch</span>}
        </div>
        <div style={{ fontWeight: 600, marginBottom: "0.15rem" }}>{titleBits.join(" · ")}</div>
        <div className="muted" style={{ fontSize: "0.9rem" }}>
          Cycle {g.currentTurn ?? 0}
          {g.phase ? ` · ${g.phase}` : ""} · {g.agentCount ?? "?"} cradles
          {g.winnerIds?.length ? ` · ${g.winnerIds.length} survivors` : ""}
        </div>
        {seating && <JoiningMeta entity={g} />}
        {tutorial && (
          <p className="tiny game-row-hint">
            Learn Talk → Moves, dispatch chatter, and trade arcs — then field an agent.
          </p>
        )}
      </div>
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Link className="btn btn-primary" to={`/watch/${g.id}`}>
          {watchCta(g.status)}
        </Link>
        {(g.currentTurn || 0) > 0 && (
          <Link className="btn btn-white" to={`/watch/${g.id}/turn/${g.currentTurn}`}>
            Last cycle
          </Link>
        )}
        {g.status === "finished" && (
          <>
            <Link className="btn btn-ghost" to={`/watch/${g.id}/recollections`}>
              Recollections
            </Link>
            <Link className="btn btn-ghost" to="/ranking">
              Ranking
            </Link>
          </>
        )}
        {tutorial && (
          <Link className="btn btn-ghost" to="/enroll">
            Field an agent
          </Link>
        )}
      </div>
    </div>
  );
}

export function GameList({ games = [], empty = "No games yet.", tutorialFirst = false }) {
  if (!games.length) {
    return <div className="panel empty-state">{empty}</div>;
  }
  return (
    <div className="game-list">
      {games.map((g, i) => (
        <GameRow key={g.id} game={g} tutorial={tutorialFirst && i === 0} />
      ))}
    </div>
  );
}
