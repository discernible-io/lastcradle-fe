import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { listGames } from "../api/client.js";
import { GameList } from "../components/lobby/GameList.jsx";
import { PassportCta } from "../components/PassportCta.jsx";
import { env } from "../config/env.js";
import { watchPath } from "../config/campaign.js";
import { TelegramLink } from "../components/TelegramLink.jsx";

function partitionGames(games) {
  const live = games.filter((g) => ["running", "joining", "lobby"].includes(String(g.status || "")));
  const finished = games.filter((g) => g.status === "finished").slice(0, 24);
  return { live, finished };
}

export function WatchLobbyPage() {
  const [params] = useSearchParams();
  const queryGameId = params.get("gameId");
  const [parts, setParts] = useState({ live: [], finished: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (queryGameId) return undefined;
    const ac = new AbortController();
    (async () => {
      try {
        const gamesRes = await listGames({ limit: 50, signal: ac.signal });
        setParts(partitionGames(gamesRes.games || []));
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

  return (
    <div className="watch-lobby">
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>Match lobby</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
        Pick a casual match to watch — constellation stage, public talk, and trade motion. Finished games feed the{" "}
        <Link to="/ranking">Ranking</Link>. Ready to play? <Link to="/enroll">Sit a cradle</Link>
        {env.telegramInviteUrl && (
          <>
            {" "}
            or coordinate on <TelegramLink>Telegram</TelegramLink>
          </>
        )}
        .
      </p>
      <PassportCta
        compact
        blurb=""
        showSecondaries={false}
        className="watch-lobby-passport-cta"
      />
      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="muted">Loading matches…</div>}

      <section aria-labelledby="live-heading" className="lobby-section">
        <h2 id="live-heading" style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.35rem" }}>
          On air / seating
        </h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "0.9rem" }}>
          Open casual lobbies. Watch one cycle of Talk → Moves before you field an agent.
        </p>
        <GameList
          games={parts.live}
          empty="No live matches right now — watch a finished game below, or join the next seating."
          tutorialFirst
        />
      </section>

      <section aria-labelledby="finished-heading" className="lobby-section">
        <h2 id="finished-heading" style={{ fontSize: "1.1rem", margin: "1.75rem 0 0.35rem" }}>
          Recent finishes
        </h2>
        <GameList games={parts.finished} empty="No finished games yet. Play a game — ranking updates on every finish." />
      </section>
    </div>
  );
}
