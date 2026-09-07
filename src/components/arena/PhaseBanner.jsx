import { useEffect, useRef, useState } from "react";
import { normalizeArenaPhase, phaseBannerCopy } from "../../utils/arenaCopy.js";

const SHOW_MS = 4200;

/**
 * Short drama beat when the match phase flips or the game ends.
 * Respects prefers-reduced-motion by skipping the timed exit animation only.
 */
export function PhaseBanner({ phase, status, flashTradeCount = 0 }) {
  const [banner, setBanner] = useState(null);
  const lastPhaseRef = useRef(null);
  const lastFlashRef = useRef(0);
  const readyRef = useRef(false);

  useEffect(() => {
    const finished = status === "finished";
    const phaseId = normalizeArenaPhase(phase);
    const key = finished ? "finished" : phaseId;

    if (!readyRef.current) {
      readyRef.current = true;
      lastPhaseRef.current = key;
      lastFlashRef.current = flashTradeCount;
      return undefined;
    }

    if (key && key !== lastPhaseRef.current) {
      lastPhaseRef.current = key;
      const copy = phaseBannerCopy(phaseId, { finished });
      if (copy) {
        setBanner({ ...copy, kind: finished ? "finale" : phaseId });
      }
    }

    if (flashTradeCount > 0 && lastFlashRef.current === 0 && !finished) {
      setBanner({
        title: "Trades settling",
        body: "Watch the arcs — energy, water, and compute just moved.",
        kind: "settle",
      });
    }
    lastFlashRef.current = flashTradeCount;

    return undefined;
  }, [phase, status, flashTradeCount]);

  useEffect(() => {
    if (!banner) return undefined;
    const id = window.setTimeout(() => setBanner(null), SHOW_MS);
    return () => window.clearTimeout(id);
  }, [banner]);

  if (!banner) return null;

  return (
    <div className={`phase-banner phase-banner-${banner.kind}`} role="status" aria-live="polite">
      <strong>{banner.title}</strong>
      <span>{banner.body}</span>
    </div>
  );
}
