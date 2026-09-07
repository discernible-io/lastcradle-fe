import { useEffect, useState } from "react";
import { cycleCapLabel } from "../../utils/cyclePressure.js";
import {
  executionProgressLabel,
  normalizeArenaPhase,
  phaseDisplayLabel,
} from "../../utils/arenaCopy.js";

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
  {
    id: "negotiation",
    label: "Talk",
    hint: "Negotiate",
  },
  {
    id: "execution",
    label: "Moves",
    hint: "Lock actions",
  },
];

export function PhaseStrip({ game, execution = null }) {
  const phase = normalizeArenaPhase(game?.phase);
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
    <div className="panel phase-strip" title="Each cycle: talk window, then moves window">
      {STEPS.map((step) => {
        const active =
          status === "finished"
            ? step.id === "execution"
            : phase === step.id || (status === "running" && !phase && step.id === "negotiation");
        return (
          <div key={step.id} className={`phase-step${active ? " active" : ""}`}>
            <div className="label">{step.label}</div>
            <div className="phase-hint tiny">{step.hint}</div>
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
      <div className="phase-step phase-cycle" style={{ flex: "0 0 auto", opacity: 1, minWidth: "7rem" }}>
        <div className="label">{status === "finished" ? "Restart" : "Cycle"}</div>
        <div className="phase-hint tiny">
          {status === "finished" ? "Finale" : phaseDisplayLabel(phase)}
        </div>
        <div className="countdown">
          {status === "finished" ? `Cycle ${game?.currentTurn ?? "—"}` : cycleCapLabel(game)}
        </div>
      </div>
    </div>
  );
}
