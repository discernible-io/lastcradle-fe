import { useCallback, useEffect, useState } from "react";

const KEY = "slc-watch-guide-seen";

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

/** First-visit coach for the live arena; reopenable via Help. */
export function useWatchGuide() {
  const [seen, setSeen] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const already = readSeen();
    setSeen(already);
    if (!already) setOpen(true);
  }, []);

  const dismiss = useCallback(() => {
    writeSeen(true);
    setSeen(true);
    setOpen(false);
  }, []);

  const reopen = useCallback(() => {
    setOpen(true);
  }, []);

  return { open, seen, dismiss, reopen };
}
