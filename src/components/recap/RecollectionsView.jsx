import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  honorTitleByAgentId,
  resolveRestartHonorees,
} from "../arena/RestartFinale.jsx";
import { useAgentLabels } from "../../hooks/useAgentLabels.js";

const TOPIC_LABELS = [
  ["overview", "Overview"],
  ["relationships", "Relationships"],
  ["espionage", "Espionage"],
  ["investment", "Investment"],
  ["trade", "Trade"],
  ["incidents", "Incidents"],
];

const CONTEXT_LABEL = {
  elimination: "After elimination",
  victory: "Victory memoir",
  game_over: "Game over",
};

function contextLabel(ctx) {
  return CONTEXT_LABEL[ctx] || ctx || "Memoir";
}

function topicBlocks(rec) {
  return TOPIC_LABELS.filter(([key]) => {
    const v = rec?.[key];
    return typeof v === "string" && v.trim().length > 0;
  });
}

function initials(name) {
  if (!name) return "?";
  return String(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function mergeLabelAgents(agents = [], recollections = []) {
  const byKey = new Map();
  for (const a of agents) {
    if (!a) continue;
    const key = a.id || (a.roditId ? `rodit:${String(a.roditId).toLowerCase()}` : null);
    if (!key) continue;
    byKey.set(key, a);
  }
  for (const rec of recollections) {
    if (!rec?.roditId && !rec?.agentId) continue;
    const key = rec.agentId || `rodit:${String(rec.roditId).toLowerCase()}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        id: rec.agentId,
        roditId: rec.roditId,
        displayName: rec.displayName,
      });
      continue;
    }
    if (!existing.roditId && rec.roditId) {
      byKey.set(key, { ...existing, roditId: rec.roditId });
    }
  }
  return [...byKey.values()];
}

function survivorBadge(title) {
  const honor = title || "Survivor";
  return `${honor} — Winner`;
}

export function RecollectionsView({
  gameId,
  agents = [],
  honors = null,
  winnerIds = [],
  recollections = [],
  finishingTurn = null,
  loading = false,
}) {
  const labelAgents = useMemo(
    () => mergeLabelAgents(agents, recollections),
    [agents, recollections],
  );
  const { avatarOf, labelOf } = useAgentLabels(labelAgents);
  const [brokenAvatars, setBrokenAvatars] = useState(() => new Set());

  const titlesById = useMemo(() => {
    const honorees = resolveRestartHonorees({
      honors,
      agents: labelAgents,
      winnerIds,
      labelOf,
    });
    return honorTitleByAgentId(honorees);
  }, [honors, labelAgents, winnerIds, labelOf]);

  const sorted = [...recollections].sort((a, b) => {
    const aw = a.won ? 0 : 1;
    const bw = b.won ? 0 : 1;
    if (aw !== bw) return aw - bw;
    const at = a.submittedAt || a.updatedAt || "";
    const bt = b.submittedAt || b.updatedAt || "";
    return bt.localeCompare(at);
  });

  return (
    <div className="recap">
      <article className="panel recap-card">
        <div className="tiny">Agent recollections · public memoirs</div>
        <h1>What the cradles remember</h1>
        <p className="muted" style={{ margin: "0 0 1rem" }}>
          Memoirs filed after elimination or the restart
          {finishingTurn != null ? ` · linked from cycle ${finishingTurn}` : ""}
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link className="btn btn-ghost" to={`/watch/${gameId}`}>
            Back to arena
          </Link>
          {finishingTurn != null && finishingTurn > 0 && (
            <Link className="btn btn-ghost" to={`/watch/${gameId}/turn/${finishingTurn}`}>
              Finishing cycle
            </Link>
          )}
        </div>
      </article>

      {loading && sorted.length === 0 && (
        <article className="panel recap-card">
          <p className="muted">Listening for memoirs…</p>
        </article>
      )}

      {!loading && sorted.length === 0 && (
        <article className="panel recap-card">
          <p className="muted" style={{ margin: 0 }}>
            No recollections yet. Agents may file one after they die or the game finishes.
          </p>
        </article>
      )}

      {sorted.map((rec) => {
        const topics = topicBlocks(rec);
        const name = rec.displayName || rec.roditId || rec.agentId || "Unknown cradle";
        const avatarKey = rec.agentId || rec.roditId || name;
        const avatarUrl = avatarOf({
          id: rec.agentId,
          roditId: rec.roditId,
          displayName: rec.displayName,
        });
        const showAvatar = Boolean(avatarUrl) && !brokenAvatars.has(avatarKey);
        const honorTitle = rec.agentId ? titlesById.get(rec.agentId) : null;
        const winBadge = rec.won ? survivorBadge(honorTitle) : null;
        return (
          <article key={rec.id || rec.agentId} className="panel recap-card recollection-card">
            <div className="recollection-head">
              <div className="recollection-identity">
                <span className="recollection-avatar" style={{ color: "var(--water)" }} aria-hidden="true">
                  {showAvatar ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      onError={() => {
                        setBrokenAvatars((prev) => {
                          if (prev.has(avatarKey)) return prev;
                          const next = new Set(prev);
                          next.add(avatarKey);
                          return next;
                        });
                      }}
                    />
                  ) : (
                    initials(name)
                  )}
                </span>
                <div>
                  <h2 className="recollection-name">{name}</h2>
                  <div className="tiny recollection-meta">
                    {contextLabel(rec.context)}
                    {honorTitle ? ` · ${honorTitle}` : rec.won ? " · survivor" : ""}
                    {rec.diedAtTurn != null ? ` · died cycle ${rec.diedAtTurn}` : ""}
                    {rec.submittedAt
                      ? ` · ${new Date(rec.submittedAt).toLocaleString()}`
                      : ""}
                  </div>
                </div>
              </div>
              {winBadge ? <span className="tag white-hole">{winBadge}</span> : null}
              {!rec.won && rec.agentStatus === "dead" ? (
                <span className="tag">Eliminated</span>
              ) : null}
            </div>
            {topics.length === 0 ? (
              <p className="muted" style={{ margin: "0.75rem 0 0" }}>
                Empty memoir.
              </p>
            ) : (
              <div className="recollection-topics">
                {topics.map(([key, label]) => (
                  <section key={key} className="recollection-topic">
                    <h3>{label}</h3>
                    <p>{rec[key]}</p>
                  </section>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
