import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getGameState, getMessages, getTrades, getTurns } from "../api/client.js";
import { publicTradesTurn } from "../utils/tradeTurn.js";
import { buildVisibleTurns } from "../utils/visibleTurns.js";
import { useGameEvents } from "./useGameEvents.js";
import { usePollWhenDisconnected } from "./usePollWhenDisconnected.js";

export function useArenaData(gameId) {
  const [state, setState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [trades, setTrades] = useState([]);
  const [tradesTurn, setTradesTurn] = useState(null);
  const [turnActivity, setTurnActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashTrades, setFlashTrades] = useState([]);
  const abortRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!gameId) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const nextState = await getGameState(gameId, { signal: ac.signal });
      const turn = nextState?.game?.currentTurn;
      const ledgerTurn = publicTradesTurn(nextState?.game);
      const [msgRes, tradeRes, turnsRes] = await Promise.all([
        getMessages(gameId, turn, { signal: ac.signal }).catch(() => ({ messages: [] })),
        getTrades(gameId, ledgerTurn, { signal: ac.signal }).catch(() => ({ trades: [] })),
        getTurns(gameId, { playedOnly: true, signal: ac.signal }).catch(() => null),
      ]);
      if (ac.signal.aborted) return;
      setState(nextState);
      setMessages(msgRes.messages || []);
      setTrades(tradeRes.trades || []);
      setTradesTurn(tradeRes.turnNumber ?? ledgerTurn);
      setTurnActivity(
        turnsRes || {
          currentTurn: turn ?? 0,
          turns: [],
        },
      );
      setError(null);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to load arena");
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, [gameId]);

  const { connected, lastEvent, error: sseError } = useGameEvents(gameId, {
    enabled: Boolean(gameId),
    onEvent: (ev) => {
      if (
        ev.type === "phase_change" ||
        ev.type === "turn_advanced" ||
        ev.type === "game_started" ||
        ev.type === "game_cancelled" ||
        ev.type === "game_finished" ||
        ev.type === "recollection_submitted"
      ) {
        refresh();
      }
    },
  });

  useEffect(() => {
    setLoading(true);
    refresh();
    return () => abortRef.current?.abort();
  }, [refresh]);

  usePollWhenDisconnected(refresh, connected);

  useEffect(() => {
    const executed = (trades || []).filter((t) => t.status === "executed");
    if (executed.length === 0) return undefined;
    setFlashTrades(executed);
    const t = setTimeout(() => setFlashTrades([]), 4500);
    return () => clearTimeout(t);
  }, [trades]);

  const { currentTurn, visible: visibleTurns } = useMemo(
    () => buildVisibleTurns(turnActivity),
    [turnActivity],
  );

  return {
    state,
    messages,
    trades,
    tradesTurn,
    turnActivity,
    visibleTurns,
    activityCurrentTurn: currentTurn,
    flashTrades,
    loading,
    error: error || sseError,
    sseConnected: connected,
    lastEvent,
    refresh,
  };
}
