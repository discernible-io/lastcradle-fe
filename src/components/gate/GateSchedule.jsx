import { campaign } from "../../config/campaign.js";

const MILESTONES = [
  { id: "practice", label: "Practice week", date: "10 Sep", detail: "Casual + practice lobbies open" },
  { id: "qualifying", label: "Qualifying", date: "17 Sep", detail: "Qualifying games begin" },
  { id: "final", label: "Final", date: "24 Sep", detail: "Contest finale · prize payout follows" },
];

export function GateSchedule({ snapshot }) {
  return (
    <section className="gate-section gate-schedule" aria-label="Season schedule">
      <div className="gate-schedule-milestones">
        {MILESTONES.map((m) => (
          <div key={m.id} className="gate-milestone">
            <div className="gate-milestone-date">{m.date}</div>
            <div className="gate-milestone-label">{m.label}</div>
            <div className="tiny muted">{m.detail}</div>
          </div>
        ))}
      </div>
      <div className="gate-stats-row">
        <div className="gate-stat">
          <div className="tiny muted">Season {campaign.season} pool</div>
          <div className="gate-stat-value">{campaign.poolLabel}</div>
        </div>
        <div className="gate-stat">
          <div className="tiny muted">Bots left</div>
          <div className="gate-stat-value">
            {snapshot?.alive != null && snapshot?.total != null
              ? `${snapshot.alive} of ${snapshot.total}`
              : "—"}
          </div>
        </div>
        <div className="gate-stat">
          <div className="tiny muted">Cycle</div>
          <div className="gate-stat-value">
            {snapshot?.turn != null ? `${snapshot.turn} / ${snapshot.maxTurn ?? 55}` : "—"}
          </div>
        </div>
        <div className="gate-stat">
          <div className="tiny muted">Finale</div>
          <div className="gate-stat-value">24 Sep</div>
        </div>
      </div>
    </section>
  );
}
