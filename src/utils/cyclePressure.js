/** Games often expose maxTurns; some payloads may only have finishSurvivorCount. */
export function cycleCapLabel(game) {
  const turn = game?.currentTurn ?? "—";
  const max = Number(game?.maxTurns);
  if (Number.isFinite(max) && max > 0) return `${turn} / ${max}`;
  return String(turn);
}

/** Soft pressure meter — use maxTurns when present; else climb toward finishSurvivorCount. */
export function survivalPressurePercent(game, turn, living) {
  const maxTurns = Number(game?.maxTurns);
  const finishAt = Number(game?.finishSurvivorCount);
  const survivorFloor = Number.isFinite(finishAt) && finishAt > 0 ? finishAt : 2;

  if (Number.isFinite(maxTurns) && maxTurns > 0) {
    const turnPart = Math.min(70, Math.round((turn / maxTurns) * 70));
    const livingPart = Math.max(0, living - survivorFloor) * 8;
    return Math.min(100, turnPart + livingPart);
  }

  // Qualifying / uncapped: emphasize attrition toward the survivor threshold.
  const livingPart = Math.min(85, Math.max(0, living - survivorFloor) * 12);
  const turnPart = Math.min(40, Math.round(Math.max(0, turn) * 1.5));
  return Math.min(100, turnPart + livingPart);
}
