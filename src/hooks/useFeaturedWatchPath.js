import { useEffect, useState } from "react";
import { listGames } from "../api/client.js";
import { campaign, watchPath } from "../config/campaign.js";
import { pickFeaturedWatchGame } from "../utils/featuredWatch.js";

let cachedPath = null;
let inflight = null;

function resolveFeaturedWatchPath() {
  if (cachedPath) return Promise.resolve(cachedPath);
  if (!inflight) {
    inflight = listGames({ limit: 50 })
      .then((res) => {
        const picked = pickFeaturedWatchGame(res.games || [], {
          fallbackId: campaign.pinnedWatchGameId || null,
        });
        cachedPath = watchPath(picked?.id);
        return cachedPath;
      })
      .catch(() => {
        cachedPath = watchPath(campaign.pinnedWatchGameId || null);
        return cachedPath;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Resolves CTA path to a live or recent arena (falls back to lobby, then pinned demo). */
export function useFeaturedWatchPath() {
  const [path, setPath] = useState(() => cachedPath || "/watch");

  useEffect(() => {
    let cancelled = false;
    if (cachedPath) {
      setPath(cachedPath);
      return undefined;
    }
    resolveFeaturedWatchPath().then((next) => {
      if (!cancelled) setPath(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return path;
}
