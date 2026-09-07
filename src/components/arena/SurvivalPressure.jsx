import { useAgentLabels } from "../../hooks/useAgentLabels.js";
import {
  AGENT_TYPE_LABELS,
  agentTypeInitial,
  agentTypeLabel,
  KNOWN_AGENT_TYPES,
  normalizeAgentType,
} from "../../utils/agentRuntime.js";
import {
  agentSurvivalChipLabel,
  agentSurvivalChipTitle,
} from "../../utils/arenaCopy.js";
import { survivalPressurePercent } from "../../utils/cyclePressure.js";
import { resolveRestartHonorees } from "./RestartFinale.jsx";

function AgentTypeLegend({ agents = [] }) {
  const present = new Set(
    agents.map((a) => normalizeAgentType(a?.agentType)).filter(Boolean),
  );
  const keys = [
    ...KNOWN_AGENT_TYPES,
    ...[...present].filter((k) => !AGENT_TYPE_LABELS[k]),
  ];

  return (
    <div className="agent-type-legend" aria-label="Agent type badge legend">
      <span className="tiny agent-type-legend-title">Runtime badges</span>
      <ul className="agent-type-legend-list">
        {keys.map((key) => {
          const label = agentTypeLabel(key);
          const initial = agentTypeInitial(key);
          return (
            <li key={key} className={`agent-type-legend-item type-${key}`}>
              <span className="agent-type-legend-badge" aria-hidden="true">
                {initial}
              </span>
              <span>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SurvivalPressure({
  state,
  honors = null,
  followedIds = [],
  onToggleFollow = null,
}) {
  const agents = state?.agents || [];
  const { labelOf } = useAgentLabels(agents);
  const turn = state?.game?.currentTurn || 0;
  const living = state?.livingAgentCount ?? agents.filter((a) => a.status === "alive").length ?? 0;
  const finished = state?.game?.status === "finished";
  const pressure = survivalPressurePercent(state?.game, turn, living);
  const followed = new Set(followedIds.map(String));
  const honorees = finished
    ? resolveRestartHonorees({
        honors,
        agents,
        winnerIds: state?.game?.winnerIds || [],
        labelOf,
      })
    : [];

  if (finished) {
    const fallen = Math.max(0, agents.length - honorees.length);
    return (
      <div className="panel survival-pressure is-finished">
        <div className="pressure-header" style={{ padding: 0, border: "none", marginBottom: "0.35rem" }}>
          <span>Restart</span>
          <span className="tiny">Game over · entropy reversed</span>
        </div>
        <p className="tiny" style={{ margin: "0 0 0.65rem" }}>
          The white hole carries the last cradles forward
          {fallen > 0 ? ` — ${fallen} husk${fallen === 1 ? "" : "s"} dissolved into the old thermodynamics.` : "."}
        </p>
        <div className="cradle-afford">
          {honorees.map((h) => (
            <span
              key={h.agentId}
              className={`chip${h.finishRank === 1 ? " honor-anchor" : " honor-co"}`}
              title={`${h.title} — ${h.name}`}
            >
              {h.title} · {h.name.toString().slice(0, 14)}
            </span>
          ))}
          {agents
            .filter((a) => a.status === "dead")
            .map((a) => {
              const name = labelOf(a);
              return (
                <span key={a.id} className="chip fail" title={name}>
                  {name.toString().slice(0, 16)} · husk
                </span>
              );
            })}
        </div>
      </div>
    );
  }

  const finishAt = Number(state?.game?.finishSurvivorCount);
  const survivorHint =
    Number.isFinite(finishAt) && finishAt > 0 ? ` · finish ≤${finishAt}` : "";

  return (
    <div className="panel survival-pressure">
      <div className="pressure-header" style={{ padding: 0, border: "none", marginBottom: "0.35rem" }}>
        <span>Survival pressure</span>
        <span className="tiny">
          {living} living{survivorHint}
        </span>
      </div>
      <p className="tiny pressure-gloss" title="Costs rise each cycle; fewer living cradles means higher pressure">
        Costs climb each cycle — fewer living cradles, higher pressure.
      </p>
      <div className="pressure-meter" aria-label={`Pressure ${pressure}%`}>
        <span style={{ width: `${pressure}%` }} />
      </div>
      <AgentTypeLegend agents={agents} />
      {onToggleFollow && (
        <p className="tiny follow-hint">Tap a cradle to follow (up to 2) — lights up on the stage.</p>
      )}
      <div className="cradle-afford">
        {agents.map((a) => {
          let cls = "chip";
          const label = agentSurvivalChipLabel(a.status);
          if (a.status === "dead") cls += " fail";
          else if (a.status === "alive") cls += " ok";
          if (followed.has(String(a.id))) cls += " followed";
          const name = labelOf(a);
          const title = agentSurvivalChipTitle(name, a.status);
          const interactive = typeof onToggleFollow === "function" && a.status !== "dead";
          const Tag = interactive ? "button" : "span";
          return (
            <Tag
              key={a.id}
              type={interactive ? "button" : undefined}
              className={cls}
              title={interactive ? `${title} · click to ${followed.has(String(a.id)) ? "unfollow" : "follow"}` : title}
              onClick={interactive ? () => onToggleFollow(a.id) : undefined}
            >
              {followed.has(String(a.id)) ? "★ " : ""}
              {name.toString().slice(0, 14)} · {label}
            </Tag>
          );
        })}
      </div>
    </div>
  );
}
