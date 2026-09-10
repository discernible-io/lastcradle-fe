import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getGameState, getHonors, getRecollections } from "../api/client.js";
import { RecollectionsView } from "../components/recap/RecollectionsView.jsx";
import { useGameEvents } from "../hooks/useGameEvents.js";
import { usePollWhenDisconnected } from "../hooks/usePollWhenDisconnected.js";

export function RecollectionsPage() {
  const { gameId } = useParams();
  const [recollections, setRecollections] = useState([]);
  const [agents, setAgents] = useState([]);
  const [honors, setHonors] = useState(null);
  const [winnerIds, setWinnerIds] = useState([]);
  const [finishingTurn, setFinishingTurn] = useState(null);
  const [gameStatus, setGameStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (!gameId) {
      setError("Invalid game");
      setLoading(false);
      return;
    }
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const [state, recRes] = await Promise.all([
        getGameState(gameId, { signal: ac.signal }),
        getRecollections(gameId, { signal: ac.signal }),
      ]);
      if (ac.signal.aborted) return;
      const status = state?.game?.status ?? null;
      setGameStatus(status);
      setFinishingTurn(state?.game?.currentTurn ?? null);
      setAgents(state?.agents || []);
      setWinnerIds(state?.game?.winnerIds || []);
      setRecollections(recRes?.recollections || []);
      setError(null);

      if (status === "finished") {
        try {
          const honorsRes = await getHonors(gameId, { signal: ac.signal });
          if (!ac.signal.aborted) setHonors(honorsRes?.honors ?? honorsRes);
        } catch {
          if (!ac.signal.aborted) setHonors(null);
        }
      } else {
        setHonors(null);
      }
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, [gameId]);

  const { connected } = useGameEvents(gameId, {
    enabled: Boolean(gameId),
    onEvent: (ev) => {
      if (
        ev.type === "recollection_submitted" ||
        ev.type === "game_started" ||
        ev.type === "game_cancelled" ||
        ev.type === "game_finished" ||
        ev.type === "phase_change" ||
        ev.type === "turn_advanced"
      ) {
        load();
      }
    },
  });

  useEffect(() => {
    setLoading(true);
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  usePollWhenDisconnected(load, connected);

  return (
    <div>
      {loading && recollections.length === 0 && (
        <div className="muted">Gathering recollections…</div>
      )}
      {error && <div className="error-banner">{error}</div>}
      <RecollectionsView
        gameId={gameId}
        agents={agents}
        honors={honors}
        winnerIds={winnerIds}
        recollections={recollections}
        finishingTurn={finishingTurn}
        loading={loading}
      />
    </div>
  );
}
