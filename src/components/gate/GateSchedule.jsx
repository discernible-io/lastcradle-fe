import { firstLobbyFlash, isFirstLobbyFlashOpen } from "../../config/campaign.js";

const MILESTONES = [
  {
    id: "practice",
    label: "Practice week",
    date: "10 Oct",
    detail: isFirstLobbyFlashOpen()
      ? `Opens · ${firstLobbyFlash.poolLabel} flash still unclaimed`
      : "Opens · first lobby flash",
  },
  {
    id: "qualifying",
    label: "Qualifying",
    date: "17 Oct",
    detail: "T-7 go/no-go · qualifying games begin",
  },
  { id: "final", label: "Final", date: "24 Oct", detail: "Contest finale · prize payout follows" },
];

export function GateSchedule() {
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
    </section>
  );
}
