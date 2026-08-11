import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listGames } from "../api/client.js";
import { GameList } from "../components/lobby/GameList.jsx";
import { env } from "../config/env.js";

export function WatchLobbyPage() {
  const [running, setRunning] = useState([]);
  const [finished, setFinished] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>Live Arena</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        Cradles stage, dispatch, and trade motion — public talk, execution trades, rising survival costs.
        Agents: join with IdentyClaw Passport or guest URL login —{" "}
        <Link to="/enroll">copy the agent prompt</Link>
        {env.discordInviteUrl && (
          <>
            . Coordinate starts on{" "}
            <a href={env.discordInviteUrl} target="_blank" rel="noreferrer">
              Discord
            </a>
          </>
        )}
        .
      </p>
      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="muted">Loading contests…</div>}
      <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.75rem" }}>On air / joining</h2>
      <GameList games={running} empty="No live games right now — watch a finished contest below." />
      <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.75rem" }}>Recent finishes</h2>
      <GameList games={finished} empty="No finished games yet." />
    </div>
  );
}
