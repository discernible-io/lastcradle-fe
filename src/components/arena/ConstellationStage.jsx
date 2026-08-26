import { useMemo, useState } from "react";
import { useAgentLabels } from "../../hooks/useAgentLabels.js";
import {
  agentRuntimeMetaHeight,
  agentTypeInitial,
  agentTypeLabel,
  llmModelLabel,
  normalizeAgentType,
} from "../../utils/agentRuntime.js";
import { eliminationCause, eliminationSummary } from "../../utils/elimination.js";
import { honorTitleByAgentId, RestartFinale, resolveRestartHonorees } from "./RestartFinale.jsx";

const AVATAR = {
  r: 32,
  y: -78,
};

const AGENT_TYPE_BADGE = {
  fontSize: 8,
  padX: 5,
  padY: 2.5,
  charW: 5.35,
};

function layoutPositions(agents, width, height) {
  const living = agents.filter((a) => a.status === "alive");
  const dead = agents.filter((a) => a.status === "dead");
  const nLiving = Math.max(living.length, 1);
  const nDead = dead.length;

  // Fallen cradles settle along the bottom; reserve that band so the living ring
  // stays clear of husk avatars / epitaphs.
  const deadBand = nDead > 0 ? 128 : 0;
  const cx = width / 2;
  const cy = (height - deadBand) / 2;
  const radius = Math.min(width, height - deadBand) * 0.34;

  const pos = {};
  living.forEach((a, i) => {
    const angle = (Math.PI * 2 * i) / nLiving - Math.PI / 2;
    pos[a.id] = {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius * 0.85,
    };
  });

  if (nDead > 0) {
    // Vessel origin sits above the epitaph; keep ~52px below so text doesn't clip.
    const vesselBottomPad = 52;
    const minSpacing = 78;
    const sidePad = 48;
    const usableW = Math.max(minSpacing, width - sidePad * 2);
    const maxPerRow = Math.max(1, Math.floor(usableW / minSpacing));
    const cols = Math.min(nDead, maxPerRow);
    const rows = Math.ceil(nDead / cols);
    const rowGap = 108;

    dead.forEach((a, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const rowFromBottom = rows - 1 - row;
      const countInRow =
        row === rows - 1 ? nDead - row * cols : cols;
      const idealSpacing = 96;
      const spacing =
        countInRow > 1
          ? Math.min(idealSpacing, usableW / (countInRow - 1))
          : 0;
      const rowWidth = spacing * Math.max(countInRow - 1, 0);
      const startX = cx - rowWidth / 2;
      pos[a.id] = {
        x: startX + col * spacing,
        y: height - vesselBottomPad - rowFromBottom * rowGap,
      };
    });
  }

  return { pos, cx, cy };
}

function truncateLabel(value, max = 24) {
  const s = String(value || "");
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1))}…`;
}

function compactA2aLabel(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/+$/, "") || "";
    return truncateLabel(`${u.host}${path}`, 26);
  } catch {
    return truncateLabel(url, 26);
  }
}

/** Agent type pill + LLM model beside it under the vessel name (from public state). */
function AgentRuntimeMeta({ agentType, llmModel, dead = false, startY = 28 }) {
  const typeLabel = agentTypeLabel(agentType);
  const typeInitial = agentTypeInitial(agentType);
  const typeKey = normalizeAgentType(agentType);
  const modelFull = String(llmModel || "").trim();
  const modelLabel = llmModelLabel(modelFull);
  if (!typeInitial && !modelLabel) return null;

  const modelFontSize = 8;
  const modelCharW = 4.55;
  const gap = 4;
  const badgeH = AGENT_TYPE_BADGE.fontSize + AGENT_TYPE_BADGE.padY * 2;
  const badgeW = typeInitial
    ? Math.max(badgeH, AGENT_TYPE_BADGE.charW + AGENT_TYPE_BADGE.padX * 2)
    : 0;
  const modelW = modelLabel ? modelLabel.length * modelCharW : 0;
  const totalW = badgeW + (typeInitial && modelLabel ? gap : 0) + modelW;
  const originX = -totalW / 2;
  const rectY = startY - AGENT_TYPE_BADGE.fontSize + 1;

  return (
    <g className={`vessel-runtime${dead ? " dead" : ""}`} aria-hidden="true">
      {typeInitial && (
        <g className={`vessel-agent-type${typeKey ? ` type-${typeKey}` : ""}`}>
          <title>{typeLabel}</title>
          <rect
            x={originX}
            y={rectY}
            width={badgeW}
            height={badgeH}
            rx={3}
            ry={3}
            className="vessel-agent-type-bg"
          />
          <text
            className="vessel-agent-type-label"
            x={originX + badgeW / 2}
            y={startY}
            textAnchor="middle"
            fontSize={AGENT_TYPE_BADGE.fontSize}
            fontFamily="var(--font-body)"
            fontWeight="700"
            letterSpacing="0.03em"
          >
            {typeInitial}
          </text>
        </g>
      )}
      {modelLabel && (
        <text
          className="vessel-llm"
          x={originX + badgeW + (typeInitial ? gap : 0)}
          y={startY}
          textAnchor="start"
          fontSize={modelFontSize}
          fontFamily="var(--font-body)"
        >
          <title>{modelFull}</title>
          {modelLabel}
        </text>
      )}
    </g>
  );
}

function CradleContact({ email, a2aUrl, dead = false }) {
  const lines = [];
  if (email) {
    lines.push({
      kind: "email",
      href: `mailto:${email}`,
      label: truncateLabel(email, 26),
      full: email,
      external: false,
    });
  }
  if (a2aUrl) {
    lines.push({
      kind: "a2a",
      href: a2aUrl,
      label: compactA2aLabel(a2aUrl),
      full: a2aUrl,
      external: true,
    });
  }

  if (!lines.length) {
    return (
      <g className="cradle-contact empty">
        <text
          y={-12}
          textAnchor="middle"
          fill="var(--ink-dim)"
          fontSize="9"
          fontFamily="var(--font-body)"
          opacity="0.5"
        >
          no public contact
        </text>
      </g>
    );
  }

  const startY = lines.length === 1 ? -14 : -26;
  return (
    <g className={`cradle-contact${dead ? " dead" : ""}`}>
      {lines.map((line, i) => (
        <a
          key={line.kind}
          href={line.href}
          {...(line.external ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          <text
            className={`cradle-contact-line cradle-contact-${line.kind}`}
            y={startY + i * 13}
            textAnchor="middle"
            fill={line.kind === "email" ? "var(--water)" : "var(--compute)"}
            fontSize="9"
            fontFamily="var(--font-body)"
            opacity={dead ? 0.55 : 0.92}
          >
            <title>{line.full}</title>
            {line.label}
          </text>
        </a>
      ))}
    </g>
  );
}

export function ConstellationStage({
  agents = [],
  flashTrades = [],
  honors = null,
  phase,
  turn,
  status = null,
  winnerIds = [],
  finishReason = null,
  gameId = null,
  contestMode = null,
  contestSeriesId = null,
  prizeSettlement = null,
}) {
  const width = 900;
  const height = 560;
  const { labelOf, avatarOf, contactOf } = useAgentLabels(agents);
  const [brokenAvatars, setBrokenAvatars] = useState(() => new Set());

  const { pos, cx, cy } = useMemo(() => layoutPositions(agents, width, height), [agents]);

  const finished = status === "finished";
  const livingCount = agents.filter((a) => a.status === "alive").length;
  const climax = finished || (livingCount <= 2 && agents.length > 0);
  const honorees = useMemo(
    () => (finished ? resolveRestartHonorees({ honors, agents, winnerIds, labelOf }) : []),
    [finished, honors, agents, winnerIds, labelOf],
  );
  const titlesById = useMemo(() => honorTitleByAgentId(honorees), [honorees]);

  return (
    <div
      className={`panel arena-stage${finished ? " is-finished" : ""}`}
      style={{ padding: 0 }}
    >
      <div
        style={{
          position: "absolute",
          top: "0.75rem",
          left: "0.85rem",
          zIndex: 2,
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span className="tag">Cradle Constellation</span>
        {turn != null && <span className="tiny">Cycle {turn}</span>}
        {phase && !finished && <span className="tiny">{phase}</span>}
        {finished && <span className="tag white-hole">Restart</span>}
      </div>

      {!finished && (
        <div className="cradle-legend" aria-hidden="true">
          <span className="cradle-legend-swatch">
            <i style={{ background: "var(--water)" }} />
            email
          </span>
          <span className="cradle-legend-swatch">
            <i style={{ background: "var(--compute)" }} />
            a2a
          </span>
          <span className="tiny">from RODiT ContactURI + webhook</span>
        </div>
      )}

      <svg
        className={`constellation${finished ? " constellation-finished" : ""}`}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={finished ? "White hole restart — entropy reversed" : "Cradle constellation stage"}
      >
        <defs>
          <radialGradient id="voidGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={finished ? "rgba(255,69,0,0.18)" : "rgba(0,0,0,0.06)"} />
            <stop offset="55%" stopColor="rgba(0,0,0,0.02)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {agents.map((agent) => (
            <clipPath key={`avatar-clip-${agent.id}`} id={`avatar-clip-${agent.id}`}>
              <circle cx="0" cy={AVATAR.y} r={AVATAR.r} />
            </clipPath>
          ))}
        </defs>

        <rect width={width} height={height} fill="var(--void-1)" />
        <rect width={width} height={height} fill="url(#voidGlow)" opacity="0.9" />

        <g className={`white-hole-core${finished ? " ignited" : ""}`} transform={`translate(${cx}, ${cy})`}>
          <circle r={finished ? 56 : climax ? 42 : 22} fill="rgba(255,69,0,0.12)" />
          <circle
            r={finished ? 22 : climax ? 16 : 8}
            fill="var(--energy)"
            opacity={finished || climax ? 0.95 : 0.7}
            filter="url(#softGlow)"
          />
          {(finished || climax) && (
            <text y={finished ? 72 : 58} textAnchor="middle" fill="var(--ink-dim)" fontSize="11" fontFamily="var(--font-body)">
              {finished ? "entropy reversed" : "white hole forming"}
            </text>
          )}
        </g>

        {flashTrades.map((t) => {
          const a = pos[t.fromAgentId];
          const b = pos[t.toAgentId];
          if (!a || !b) return null;
          const midX = (a.x + b.x) / 2 + (b.y - a.y) * 0.12;
          const midY = (a.y + b.y) / 2 - (b.x - a.x) * 0.12;
          const tint =
            (t.energy || 0) >= (t.water || 0) && (t.energy || 0) >= (t.compute || 0)
              ? "var(--energy)"
              : (t.water || 0) >= (t.compute || 0)
                ? "var(--water)"
                : "var(--compute)";
          return (
            <path
              key={t.id}
              className="trade-arc"
              d={`M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`}
              fill="none"
              stroke={tint}
              strokeWidth="2"
              opacity="0.85"
            />
          );
        })}

        {agents.map((agent) => {
          const p = pos[agent.id];
          if (!p) return null;
          const label = labelOf(agent);
          const contact = contactOf(agent);
          const dead = agent.status === "dead";
          const justPassed = dead && turn != null && agent.diedAtTurn === turn;
          const cause = dead ? eliminationCause(agent) : null;
          const causeDetail = dead ? eliminationSummary(agent) : null;
          const passedCycle =
            dead && agent.diedAtTurn != null ? `Cycle ${agent.diedAtTurn}` : dead ? "Passed" : null;
          const avatarUrl = avatarOf(agent);
          const showAvatar = Boolean(avatarUrl) && !brokenAvatars.has(agent.id);
          const honorTitle = !dead ? titlesById.get(agent.id) : null;
          const isAnchor = honorTitle === "White Hole Anchor";
          const typeLabel = agentTypeLabel(agent.agentType);
          const modelFull = String(agent.llmModel || "").trim();
          const runtimeBits = [typeLabel, modelFull].filter(Boolean);
          const metaH = agentRuntimeMetaHeight(agent);
          const belowNameY = 28 + metaH;
          const contactBits = [contact.email, contact.a2aUrl].filter(Boolean);
          const epitaph = dead
            ? [passedCycle, causeDetail || cause, ...runtimeBits].filter(Boolean).join(" — ")
            : honorTitle
              ? `${honorTitle} — ${label}${runtimeBits.length ? ` · ${runtimeBits.join(" · ")}` : ""}`
              : [label, ...runtimeBits, ...contactBits].filter(Boolean).join(" · ");

          return (
            <g
              key={agent.id}
              className={`vessel ${agent.status}${justPassed ? " just-passed" : ""}${honorTitle ? " honoree" : ""}${isAnchor ? " anchor" : ""}`}
              transform={`translate(${p.x}, ${p.y})`}
            >
              <title>{epitaph}</title>
              <CradleContact email={contact.email} a2aUrl={contact.a2aUrl} dead={dead} />
              {showAvatar && (
                <g className="vessel-avatar">
                  <circle
                    cx="0"
                    cy={AVATAR.y}
                    r={AVATAR.r + 1.5}
                    fill="var(--void-2)"
                    stroke={
                      dead
                        ? "rgba(180,35,24,0.55)"
                        : isAnchor
                          ? "rgba(255,69,0,0.9)"
                          : honorTitle
                            ? "rgba(0,0,0,0.7)"
                            : "rgba(0,0,0,0.18)"
                    }
                    strokeWidth={honorTitle ? 1.75 : 1.25}
                  />
                  <image
                    href={avatarUrl}
                    x={-AVATAR.r}
                    y={AVATAR.y - AVATAR.r}
                    width={AVATAR.r * 2}
                    height={AVATAR.r * 2}
                    clipPath={`url(#avatar-clip-${agent.id})`}
                    preserveAspectRatio="xMidYMid slice"
                    onError={() => {
                      setBrokenAvatars((prev) => {
                        if (prev.has(agent.id)) return prev;
                        const next = new Set(prev);
                        next.add(agent.id);
                        return next;
                      });
                    }}
                  />
                </g>
              )}
              {honorTitle && (
                <circle
                  className="vessel-honor-ring"
                  cx="0"
                  cy={AVATAR.y}
                  r={AVATAR.r + 6}
                  fill="none"
                  stroke={isAnchor ? "rgba(255,69,0,0.7)" : "rgba(0,0,0,0.45)"}
                  strokeWidth="1.25"
                />
              )}
              {dead && (
                <g className="vessel-memorial" aria-hidden="true">
                  <circle
                    cx="0"
                    cy={AVATAR.y}
                    r={AVATAR.r + 5}
                    fill="none"
                    stroke="rgba(180,35,24,0.4)"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                  <path
                    d="M -7 -7 L 7 7 M 7 -7 L -7 7"
                    transform={`translate(0, ${AVATAR.y})`}
                    stroke="rgba(180,35,24,0.7)"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </g>
              )}
              <text
                className="vessel-name"
                y={14}
                textAnchor="middle"
                fill="var(--ink)"
                fontSize="13"
                fontFamily="var(--font-body)"
              >
                {label.length > 16 ? `${label.slice(0, 14)}…` : label}
              </text>
              <AgentRuntimeMeta
                agentType={agent.agentType}
                llmModel={agent.llmModel}
                dead={dead}
                startY={28}
              />
              {honorTitle && (
                <text
                  className="vessel-honor-title"
                  y={belowNameY}
                  textAnchor="middle"
                  fill={isAnchor ? "var(--white-hole)" : "var(--water)"}
                  fontSize="9"
                  fontFamily="var(--font-display)"
                >
                  {honorTitle.length > 26 ? `${honorTitle.slice(0, 24)}…` : honorTitle}
                </text>
              )}
              {dead && (
                <g className="vessel-epitaph">
                  <text
                    y={belowNameY}
                    textAnchor="middle"
                    fill="var(--danger)"
                    fontSize="9"
                    fontFamily="var(--font-body)"
                  >
                    {passedCycle}
                  </text>
                  <text
                    y={belowNameY + 12}
                    textAnchor="middle"
                    fill="var(--ink-dim)"
                    fontSize="8"
                    fontFamily="var(--font-body)"
                  >
                    {cause.length > 28 ? `${cause.slice(0, 26)}…` : cause}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {finished && (
        <RestartFinale
          honors={honors}
          agents={agents}
          winnerIds={winnerIds}
          finishReason={finishReason}
          turn={turn}
          labelOf={labelOf}
          gameId={gameId}
          game={{ contestMode, contestSeriesId }}
          prizeSettlement={prizeSettlement}
        />
      )}
    </div>
  );
}
