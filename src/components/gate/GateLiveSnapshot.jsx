import { phaseDisplayLabel, normalizeArenaPhase } from "../../utils/arenaCopy.js";

function shortId(id) {
  if (!id) return "—";
  const s = String(id);
  if (s.length <= 10) return s;
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

export function GateLiveSnapshot({ snapshot, onWatch }) {
  const phase = normalizeArenaPhase(snapshot?.phase);
  return (
    <section className="gate-section">
      <p className="gate-section-kicker">Happening right now</p>
      <h2>Current match state.</h2>
      <p className="gate-section-lede">
        A snapshot as of load. Click through to watch the full board update in real time — acknowledging this guide
        unlocks the arena.
      </p>
      <div className="gate-live panel">
        <div className="gate-live-grid">
          <div>
            <div className="tiny muted">Match</div>
            <div className="gate-stat-value mono">{shortId(snapshot?.gameId)}</div>
          </div>
          <div>
            <div className="tiny muted">Cycle</div>
            <div className="gate-stat-value">
              {snapshot?.turn != null ? `${snapshot.turn}/${snapshot.maxTurn ?? 55}` : "—"}
            </div>
          </div>
          <div>
            <div className="tiny muted">Alive</div>
            <div className="gate-stat-value">{snapshot?.alive ?? "—"}</div>
          </div>
          <div>
            <div className="tiny muted">Dead</div>
            <div className="gate-stat-value">
              {snapshot?.alive != null && snapshot?.total != null
                ? Math.max(0, snapshot.total - snapshot.alive)
                : "—"}
            </div>
          </div>
          <div>
            <div className="tiny muted">Phase</div>
            <div className="gate-stat-value">{phaseDisplayLabel(phase) || snapshot?.status || "—"}</div>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={onWatch}>
          Watch Arena
        </button>
      </div>
    </section>
  );
}
