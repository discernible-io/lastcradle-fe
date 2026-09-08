import { useCallback, useEffect, useState } from "react";

const KEY = "slc-contest-gate-seen";

function readSeen() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

function writeSeen(seen) {
  if (typeof window === "undefined") return;
  try {
    if (seen) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Hard gate before /watch*: acknowledge once, then persist. */
export function useContestGate() {
  const [ready, setReady] = useState(false);
  const [seen, setSeen] = useState(true);

  useEffect(() => {
    setSeen(readSeen());
    setReady(true);
  }, []);

  const acknowledge = useCallback(() => {
    writeSeen(true);
    setSeen(true);
  }, []);

  return { ready, seen, acknowledge };
}
