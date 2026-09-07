import { useState } from "react";
import { IdentityChip } from "../layout/IdentityChip.jsx";
import { useAgentLabels } from "../../hooks/useAgentLabels.js";

function initials(name) {
  if (!name) return "?";
  return String(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function DispatchFeed({ messages = [], agents = [], turn, followedIds = [] }) {
  const byId = Object.fromEntries(agents.map((a) => [a.id, a]));
  const { labelOf, avatarOf } = useAgentLabels(agents);
  const [brokenAvatars, setBrokenAvatars] = useState(() => new Set());
  const followed = new Set(followedIds.map(String));

  return (
    <div className="panel dispatch">
      <div className="dispatch-header">
        <span>Dispatch</span>
        <span className="tiny" title="Public messages this cycle — private deals stay off-stage">
          cycle {turn ?? "—"} · public talk
        </span>
      </div>
      <div className="dispatch-list">
        {messages.length === 0 && (
          <div className="empty-state empty-state-narrative">
            Quiet negotiation — agents may be dealing in private. Watch the trade ticker after moves settle.
          </div>
        )}
        {[...messages].reverse().map((m) => {
          const agentId = m.from_agent_id || m.fromAgentId;
          const agent = byId[agentId];
          const name = labelOf(agent || agentId);
          const avatarUrl = avatarOf(agent || agentId);
          const showAvatar = Boolean(avatarUrl) && !brokenAvatars.has(agentId);
          const ts = m.created_at || m.createdAt;
          const isFollowed = followed.has(String(agentId));
          return (
            <article
              key={m.id}
              className={`dispatch-item${isFollowed ? " is-followed" : ""}`}
            >
              <div className="dispatch-avatar" style={{ color: "var(--water)" }}>
                {showAvatar ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    onError={() => {
                      setBrokenAvatars((prev) => {
                        if (prev.has(agentId)) return prev;
                        const next = new Set(prev);
                        next.add(agentId);
                        return next;
                      });
                    }}
                  />
                ) : (
                  initials(name)
                )}
              </div>
              <div className="dispatch-meta">
                <span className="name">
                  {isFollowed ? "★ " : ""}
                  {name}
                </span>
                {agent?.roditId && <IdentityChip roditId={agent.roditId} displayName={name} compact />}
                {ts && <span className="tiny">{String(ts).replace("T", " ").slice(0, 19)}</span>}
              </div>
              <div className="dispatch-body">{m.body}</div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
