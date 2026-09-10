import { useEffect } from "react";
import { env } from "../config/env.js";

/** Poll `load` only while SSE is down. Event-driven refresh stays on `useGameEvents`. */
export function usePollWhenDisconnected(load, connected) {
  useEffect(() => {
    if (!load || connected) return undefined;
    const id = setInterval(load, env.pollIntervalMs);
    return () => clearInterval(id);
  }, [load, connected]);
}
