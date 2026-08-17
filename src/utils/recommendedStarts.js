import { recommendedStartWindows } from "../config/campaign.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function utcClock(hour, minute = 0) {
  return `${pad2(hour)}:${pad2(minute)} UTC`;
}

export function sampleUtcDate(hour, minute = 0) {
  const d = new Date();
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

export function nextOccurrence(hour, minute = 0, now = new Date()) {
  const t = new Date(now.getTime());
  t.setUTCHours(hour, minute, 0, 0);
  if (t.getTime() <= now.getTime()) t.setUTCDate(t.getUTCDate() + 1);
  return t;
}

export function formatClockInZone(date, timeZone) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);
}

export function formatLocalClock(date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

export function formatUntil(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (total < 60) return "now";
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function nextRecommendedWindow(now = new Date()) {
  let best = null;
  for (const window of recommendedStartWindows) {
    const at = nextOccurrence(window.utcHour, window.utcMinute, now);
    if (!best || at.getTime() < best.at.getTime()) best = { window, at };
  }
  return best;
}
