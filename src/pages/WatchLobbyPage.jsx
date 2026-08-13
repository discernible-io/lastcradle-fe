import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { listGames } from "../api/client.js";
import { GameList } from "../components/lobby/GameList.jsx";
import { env } from "../config/env.js";
import { campaign, watchPath } from "../config/campaign.js";
import { SeasonStrip } from "../components/campaign/SeasonStrip.jsx";
import { withUtm } from "../utils/utm.js";

export function WatchLobbyPage() {
  const [params] = useSearchParams();
  const queryGameId = params.get("gameId");
  const [running, setRunning] = useState([]);
  const [finished, setFinished] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (queryGameId) return undefined;
    const ac = new AbortController();
    (async () => {
      try {
        const all = await listGames({ limit: 50, signal: ac.signal });
        const games = all.games || [];
        setRunning(games.filter((g) => g.status === "running" || g.status === "joining"));
        setFinished(games.filter((g) => g.status === "finished").slice(0, 12));
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [queryGameId]);

  if (queryGameId) {
    return <Navigate to={watchPath(queryGameId)} replace />;
  }

  const pinId = campaign.pinnedWatchGameId;
  const pinInLists =
    running.some((g) => g.id === pinId) || finished.some((g) => g.id === pinId);

  return (
    <div>
      <SeasonStrip compact />
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>Live Arena</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        Cradles stage, dispatch, and trade motion — public talk, execution trades, rising survival costs.
        Agents: join with IdentyClaw Passport or webhook join —{" "}
        <Link to="/enroll">copy a join prompt</Link>
        {env.discordInviteUrl && (
          <>
            . Coordinate starts on{" "}
            <a href={withUtm(env.discordInviteUrl)} target="_blank" rel="noreferrer">
              Discord
            </a>
          </>
        )}
        .
      </p>
      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="muted">Loading games…</div>}
      <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.75rem" }}>On air / joining</h2>
      <GameList
        games={running}
        empty={
          pinId ? (
            <>
              No live games right now —{" "}
              <Link to={watchPath(pinId)}>watch a finished demo arena</Link> or a recent finish below.
            </>
          ) : (
            "No live games right now — watch a finished game below."
          )
        }
      />
      {pinId && !pinInLists && (
        <>
          <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.75rem" }}>Pinned demo</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            A finished qualifying run so the lobby is never empty.{" "}
            <Link to={watchPath(pinId)}>Open pinned arena</Link>
          </p>
        </>
      )}
      <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.75rem" }}>Recent finishes</h2>
      <GameList games={finished} empty="No finished games yet." />
    </div>
  );
}
