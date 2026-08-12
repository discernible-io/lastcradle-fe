import { useEffect, useState } from "react";
import { cycleCapLabel } from "../../utils/cyclePressure.js";

/** Public GameSubmissionStatus from GET .../state during execution. */
function executionProgressLabel(execution) {
  if (!execution || typeof execution !== "object") return null;
  const living = Number(execution.livingCount);
  const submitted = Number(execution.submittedCount);
  if (!Number.isFinite(living) || living <= 0 || !Number.isFinite(submitted)) return null;
  return `${submitted}/${living} submitted`;
}

function useCountdown(targetIso) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (!targetIso) {
      setLeft(null);
      return undefined;
    }
    const tick = () => {
      const ms = new Date(targetIso).getTime() - Date.now();
      setLeft(Math.max(0, ms));
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [targetIso]);
  return left;
}

function fmt(ms) {
  if (ms == null) return "—";
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}

const STEPS = [
  { id: "negotiation", label: "Negotiation" },
  { id: "execution", label: "Execution" },
];

function normalizePhase(phase) {
  if (!phase) return null;
  const p = String(phase).toLowerCase();
  if (p.includes("negot")) return "negotiation";
  // Resolve/advance are instantaneous — fold into Execution.
  if (p.includes("exec") || p.includes("resol") || p.includes("advance")) return "execution";
  return p;
}

export function PhaseStrip({ game, execution = null }) {
  const phase = normalizePhase(game?.phase);
  const status = game?.status;
  const endsAt =
    phase === "negotiation"
      ? game?.negotiationEndsAt
      : phase === "execution"
        ? game?.executionEndsAt
        : null;
  const left = useCountdown(endsAt);
  const submitProgress =
    phase === "execution" && status === "running" ? executionProgressLabel(execution) : null;

  return (
    <div className="panel phase-strip">
      {STEPS.map((step) => {
        const active =
          status === "finished"
            ? step.id === "execution"
            : phase === step.id || (status === "running" && !phase && step.id === "negotiation");
        return (
          <div key={step.id} className={`phase-step${active ? " active" : ""}`}>
            <div className="label">{step.label}</div>
            <div className="countdown">
              {active && status === "running"
                ? step.id === "execution" && submitProgress
                  ? `${fmt(left)} · ${submitProgress}`
                  : fmt(left)
                : active && status === "finished"
                  ? "restart"
                  : ""}
            </div>
          </div>
        );
      })}
      <div className="phase-step" style={{ flex: "0 0 auto", opacity: 1, minWidth: "7rem" }}>
        <div className="label">{status === "finished" ? "Restart" : "Cycle"}</div>
        <div className="countdown">
          {status === "finished" ? `Cycle ${game?.currentTurn ?? "—"}` : cycleCapLabel(game)}
        </div>
      </div>
    </div>
  );
}
