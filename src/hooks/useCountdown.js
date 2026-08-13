import { useEffect, useState } from "react";

function formatRemaining(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function useCountdown(iso) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!iso) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [iso]);

  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) return null;
  const ms = target - now;
  return {
    expired: ms <= 0,
    ms,
    label: ms <= 0 ? "closed" : formatRemaining(ms),
  };
}
