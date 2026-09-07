import { useCallback, useEffect, useState } from "react";

const MAX_FOLLOW = 2;
const storageKey = (gameId) => `slc-followed-cradles:${gameId}`;

function readIds(gameId) {
  if (!gameId || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(gameId));
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter(Boolean).slice(0, MAX_FOLLOW);
  } catch {
    return [];
  }
}

function writeIds(gameId, ids) {
  if (!gameId || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(gameId), JSON.stringify(ids.slice(0, MAX_FOLLOW)));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Local-only rooting: follow up to two cradles per game. */
export function useFollowedCradles(gameId) {
  const [followedIds, setFollowedIds] = useState(() => readIds(gameId));

  useEffect(() => {
    setFollowedIds(readIds(gameId));
  }, [gameId]);

  const isFollowed = useCallback(
    (agentId) => followedIds.includes(String(agentId)),
    [followedIds],
  );

  const toggleFollow = useCallback(
    (agentId) => {
      const id = String(agentId);
      if (!id || !gameId) return;
      setFollowedIds((prev) => {
        let next;
        if (prev.includes(id)) {
          next = prev.filter((x) => x !== id);
        } else if (prev.length >= MAX_FOLLOW) {
          next = [...prev.slice(1), id];
        } else {
          next = [...prev, id];
        }
        writeIds(gameId, next);
        return next;
      });
    },
    [gameId],
  );

  const clearFollowed = useCallback(() => {
    setFollowedIds([]);
    writeIds(gameId, []);
  }, [gameId]);

  return { followedIds, isFollowed, toggleFollow, clearFollowed, maxFollow: MAX_FOLLOW };
}
