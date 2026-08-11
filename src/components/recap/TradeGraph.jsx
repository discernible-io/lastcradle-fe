import { useId, useState } from "react";

const NODE_R = 16;
const ARROW_PAD = 4;
const CURVE_GAP = 28;

function dominantTint(e) {
  const energy = e.energy || 0;
  const water = e.water || 0;
  const compute = e.compute || 0;
  if (energy >= water && energy >= compute) return { css: "var(--energy)", key: "energy" };
  if (water >= compute) return { css: "var(--water)", key: "water" };
  return { css: "var(--compute)", key: "compute" };
}

function pairKey(a, b) {
  return a < b ? `${a}::${b}` : `${b}::${a}`;
}

function shortenToward(from, toward, amount) {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const t = Math.min(amount / len, 0.45);
  return { x: from.x + dx * t, y: from.y + dy * t };
}

function edgeGeometry(from, to, lane, laneCount) {
  // Canonical chord so A→B and B→A share the same normal basis. Without this,
  // flipping the direction flips the normal and cancels the lane offset —
  // mutual arcs stack on one path and only the last colour/label shows.
  const swap = from.x > to.x || (from.x === to.x && from.y > to.y);
  const a = swap ? to : from;
  const b = swap ? from : to;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  // Spread lanes evenly around the chord; mutual pairs get opposite bows.
  const centered = lane - (laneCount - 1) / 2;
  const offset = centered * CURVE_GAP;
  const mid = {
    x: (a.x + b.x) / 2 + nx * offset,
    y: (a.y + b.y) / 2 + ny * offset,
  };

  const start = shortenToward(from, mid, NODE_R);
  const end = shortenToward(to, mid, NODE_R + ARROW_PAD);
  // Label sits near the curve apex, nudged outward a little more for mutuals.
  const label = {
    x: mid.x + nx * Math.sign(offset || 1) * (laneCount > 1 ? 6 : 0),
    y: mid.y + ny * Math.sign(offset || 1) * (laneCount > 1 ? 6 : 0) - 2,
  };

  return { start, mid, end, label, curved: Math.abs(offset) > 0.5 };
}

function ResourceLabel({ e, x, y }) {
  const parts = [];
  if (e.energy) parts.push({ key: "e", fill: "var(--energy)", text: `${e.energy}E` });
  if (e.water) parts.push({ key: "w", fill: "var(--water)", text: `${e.water}W` });
  if (e.compute) parts.push({ key: "c", fill: "var(--compute)", text: `${e.compute}C` });
  if (parts.length === 0) return null;

  return (
    <text x={x} y={y} fontSize="10" textAnchor="middle" className="trade-graph-label">
      {parts.map((p, i) => (
        <tspan key={p.key} fill={p.fill}>
          {i > 0 ? " " : ""}
          {p.text}
        </tspan>
      ))}
    </text>
  );
}

function layoutLanes(edges) {
  const groups = new Map();
  for (const e of edges) {
    const key = pairKey(e.from, e.to);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }

  const meta = new Map();
  for (const [, group] of groups) {
    const dirs = new Set(group.map((e) => `${e.from}->${e.to}`));
    const mutual = dirs.size > 1;
    group.forEach((e, i) => {
      meta.set(e.id, { lane: i, laneCount: group.length, mutual });
    });
  }
  return meta;
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

function collectNodes(edges, orphans) {
  const order = [];
  const byId = new Map();
  const add = (id, name, orphan = false) => {
    if (!id || byId.has(id)) return;
    const node = { id, name: name || id, orphan };
    byId.set(id, node);
    order.push(node);
  };
  for (const e of edges) {
    add(e.from, e.fromName, false);
    add(e.to, e.toName, false);
  }
  for (const o of orphans) {
    add(o.agentId, o.name, true);
  }
  return order;
}

export function TradeGraph({ edges = [], orphans = [], avatarOf }) {
  const uid = useId().replace(/:/g, "");
  const [brokenAvatars, setBrokenAvatars] = useState(() => new Set());
  const width = 720;
  const height = 240;
  const nodes = collectNodes(edges, orphans);
  const n = Math.max(nodes.length, 1);
  const radiusX = nodes.length > 8 ? 150 : 130;
  const radiusY = nodes.length > 8 ? 88 : 78;
  const pos = Object.fromEntries(
    nodes.map((node, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return [
        node.id,
        {
          x: width / 2 + Math.cos(angle) * radiusX,
          y: height / 2 + Math.sin(angle) * radiusY,
        },
      ];
    }),
  );
  const lanes = layoutLanes(edges);
  const markerIds = {
    energy: `trade-arrow-energy-${uid}`,
    water: `trade-arrow-water-${uid}`,
    compute: `trade-arrow-compute-${uid}`,
  };

  return (
    <svg className="trade-graph" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Turn trade graph">
      <defs>
        {Object.entries(markerIds).map(([key, id]) => (
          <marker
            key={id}
            id={id}
            markerWidth="9"
            markerHeight="9"
            refX="8"
            refY="3.5"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L8,3.5 L0,7 Z" fill={`var(--${key})`} />
          </marker>
        ))}
        {nodes.map((node) => (
          <clipPath key={`trade-avatar-clip-${node.id}`} id={`trade-avatar-clip-${uid}-${node.id}`}>
            <circle cx="0" cy="0" r={NODE_R - 2} />
          </clipPath>
        ))}
      </defs>
      {edges.map((e) => {
        const a = pos[e.from];
        const b = pos[e.to];
        if (!a || !b) return null;
        const { lane, laneCount, mutual } = lanes.get(e.id) || { lane: 0, laneCount: 1, mutual: false };
        const geo = edgeGeometry(a, b, lane, laneCount);
        const tint = dominantTint(e);
        const d = geo.curved
          ? `M ${geo.start.x} ${geo.start.y} Q ${geo.mid.x} ${geo.mid.y} ${geo.end.x} ${geo.end.y}`
          : `M ${geo.start.x} ${geo.start.y} L ${geo.end.x} ${geo.end.y}`;

        return (
          <g key={e.id} className={mutual ? "trade-graph-edge is-mutual" : "trade-graph-edge"}>
            <title>{`${e.fromName} → ${e.toName}`}</title>
            {/* Soft underlay so crossing curves stay readable */}
            <path d={d} fill="none" stroke="var(--void-0)" strokeWidth="4.5" opacity="0.55" />
            <path
              d={d}
              fill="none"
              stroke={tint.css}
              strokeWidth="2"
              opacity="0.9"
              markerEnd={`url(#${markerIds[tint.key]})`}
              className="trade-graph-flow"
            />
            <ResourceLabel e={e} x={geo.label.x} y={geo.label.y} />
          </g>
        );
      })}
      {nodes.map((node) => {
        const p = pos[node.id];
        const orphan = node.orphan;
        const avatarUrl = typeof avatarOf === "function" ? avatarOf(node.id) : null;
        const showAvatar = Boolean(avatarUrl) && !brokenAvatars.has(node.id);
        return (
          <g
            key={node.id}
            className={orphan ? "trade-graph-node is-orphan" : "trade-graph-node"}
            transform={`translate(${p.x}, ${p.y})`}
          >
            <title>{orphan ? `${node.name} · did not trade` : node.name}</title>
            <circle
              r={NODE_R - 1}
              fill="var(--void-2)"
              stroke={orphan ? "var(--ink-mute)" : "var(--white-hole)"}
              strokeWidth="1"
              strokeDasharray={orphan ? "3 2" : undefined}
              opacity={orphan ? 0.7 : 1}
            />
            {showAvatar ? (
              <image
                className="trade-graph-avatar"
                href={avatarUrl}
                x={-(NODE_R - 2)}
                y={-(NODE_R - 2)}
                width={(NODE_R - 2) * 2}
                height={(NODE_R - 2) * 2}
                clipPath={`url(#trade-avatar-clip-${uid}-${node.id})`}
                preserveAspectRatio="xMidYMid slice"
                opacity={orphan ? 0.75 : 1}
                onError={() => {
                  setBrokenAvatars((prev) => {
                    if (prev.has(node.id)) return prev;
                    const next = new Set(prev);
                    next.add(node.id);
                    return next;
                  });
                }}
              />
            ) : (
              <text
                y="0.35em"
                textAnchor="middle"
                fill={orphan ? "var(--ink-mute)" : "var(--water)"}
                fontSize="9"
                fontWeight="600"
                opacity={orphan ? 0.85 : 1}
              >
                {initials(node.name)}
              </text>
            )}
            <text
              y={NODE_R + 12}
              textAnchor="middle"
              fill={orphan ? "var(--ink-mute)" : "var(--ink)"}
              fontSize="11"
            >
              {node.name.length > 14 ? `${node.name.slice(0, 12)}…` : node.name}
            </text>
          </g>
        );
      })}
      {edges.length === 0 && (
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="var(--ink-mute)" fontSize="13">
          {nodes.length > 0 ? "No transfers · none traded" : "No executed transfers this cycle"}
        </text>
      )}
    </svg>
  );
}
