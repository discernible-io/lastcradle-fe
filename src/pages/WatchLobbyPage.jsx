import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { listContests, listGames } from "../api/client.js";
import { GameList } from "../components/lobby/GameList.jsx";
import { JoiningMeta, WatchLink } from "../components/campaign/JoiningMeta.jsx";
import { PassportCta } from "../components/PassportCta.jsx";
import { env } from "../config/env.js";
import { watchPath } from "../config/campaign.js";
import { TelegramLink } from "../components/TelegramLink.jsx";
import { withUtm } from "../utils/utm.js";
import {
  contestLiveGameId,
  isCasualGame,
  isContestGame,
  isQualifyingGame,
  statusLabel,
} from "../utils/gameLabel.js";

function contestKey(c, i) {
  return c.id || c.contestId || c.gameId || `contest-${i}`;
}

function partitionGames(games) {
  const live = games.filter((g) => ["running", "joining", "lobby"].includes(String(g.status || "")));
  const finished = games.filter((g) => g.status === "finished");
  return {
    liveContest: live.filter(isContestGame),
    liveQualifying: live.filter(isQualifyingGame),
    liveCasual: live.filter(isCasualGame),
    finishedContest: finished.filter(isContestGame).slice(0, 12),
    finishedQualifying: finished.filter(isQualifyingGame).slice(0, 12),
    finishedCasual: finished.filter(isCasualGame).slice(0, 12),
  };
}

export function WatchLobbyPage() {
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const queryGameId = params.get("gameId");
  const [contests, setContests] = useState([]);
  const [parts, setParts] = useState({
    liveContest: [],
    liveQualifying: [],
    liveCasual: [],
    finishedContest: [],
    finishedQualifying: [],
    finishedCasual: [],
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (queryGameId) return undefined;
    const ac = new AbortController();
    (async () => {
      try {
        const [gamesRes, contestsRes] = await Promise.all([
          listGames({ limit: 50, signal: ac.signal }),
          listContests({ limit: 30, signal: ac.signal }).catch(() => ({ contests: [] })),
        ]);
        const games = gamesRes.games || [];
        setParts(partitionGames(games));
        setContests(contestsRes.contests || []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [queryGameId]);

  useEffect(() => {
    if (queryGameId || hash !== "#contests" || loading) return undefined;
    const id = window.setTimeout(() => {
      document.getElementById("contests")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
    return () => window.clearTimeout(id);
  }, [hash, queryGameId, loading]);

  if (queryGameId) {
    return <Navigate to={watchPath(queryGameId)} replace />;
  }

  const contestGameIds = new Set(
    contests.map((c) => contestLiveGameId(c)).filter(Boolean),
  );
  const liveContestExtra = parts.liveContest.filter((g) => !contestGameIds.has(g.id));
  const contestEmpty = contests.length === 0 && liveContestExtra.length === 0;

  return (
    <div className="watch-lobby">
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>Match lobby</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
        Pick a match to watch — constellation stage, public talk, and trade motion.{" "}
        <strong>Casual</strong> is the best place to learn the loop. Contest survivors are on the{" "}
        <Link to="/prizes#hall-of-fame">Hall of Fame</Link>. Purse and payout rules:{" "}
        <Link to="/prizes">Prizes</Link>. Ready to play?{" "}
        <Link to="/enroll">Sit a cradle</Link>
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

      <section aria-labelledby="casual-heading" className="lobby-section lobby-casual">
        <h2 id="casual-heading" style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.35rem" }}>
          Casual · learn the game
        </h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "0.9rem" }}>
          Open lobbies with no stakes. Watch one cycle of Talk → Moves before you field an agent.
          Not competition or qualifying.
        </p>
        <h3 style={{ fontSize: "0.95rem", margin: "0.85rem 0 0.65rem" }}>On air / seating</h3>
        <GameList
          games={parts.liveCasual}
          empty="No live casual matches right now — watch a finished game below, or join the next seating."
          tutorialFirst
        />
        <h3 style={{ fontSize: "0.95rem", margin: "1.15rem 0 0.65rem" }}>Recent casual finishes</h3>
        <GameList games={parts.finishedCasual} empty="No finished casual games yet." />
      </section>

      <section aria-labelledby="qualifying-heading" className="lobby-section">
        <h2 id="qualifying-heading" style={{ fontSize: "1.1rem", margin: "1.75rem 0 0.35rem" }}>
          Qualifying
        </h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "0.9rem" }}>
          Press-run arenas to harden your agent.
        </p>
        <h3 style={{ fontSize: "0.95rem", margin: "0.85rem 0 0.65rem" }}>On air / seating</h3>
        <GameList
          games={parts.liveQualifying}
          empty="No live qualifying matches right now — watch a finished game below."
        />
        <h3 style={{ fontSize: "0.95rem", margin: "1.15rem 0 0.65rem" }}>Recent qualifying finishes</h3>
        <GameList games={parts.finishedQualifying} empty="No finished qualifying games yet." />
      </section>

      <section id="contests" aria-labelledby="contest-heading" className="lobby-section">
        <h2 id="contest-heading" style={{ fontSize: "1.1rem", margin: "1.75rem 0 0.35rem" }}>
          Contest
        </h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "0.9rem" }}>
          Prize seats need an IdentyClaw Passport (webhook join is rejected).{" "}
          <a href={withUtm(env.enrollUrl)} target="_blank" rel="noreferrer">
            Get a Passport
          </a>
          , then <Link to="/enroll">Get Started</Link>
          {" · "}
          <a href={withUtm(env.skillUrl)} target="_blank" rel="noreferrer">
            skill.md
          </a>
          .
        </p>
        {contestEmpty ? (
          <div className="panel empty-state empty-state-narrative">
            No scheduled contests right now. Watch a Casual match above to learn the loop, or{" "}
            <Link to="/enroll">Get Started</Link> for the next series
            {env.telegramInviteUrl && (
              <>
                {" "}
                — coordinate on <TelegramLink>Telegram</TelegramLink>
              </>
            )}
            .
          </div>
        ) : (
          <div className="game-list">
            {contests.map((c, i) => {
              const gameId = contestLiveGameId(c);
              return (
                <div key={contestKey(c, i)} className="panel game-row game-row-seating">
                  <div>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span className="tag definitive">Contest</span>
                      {c.status && <span className="tag">{statusLabel(c.status)}</span>}
                    </div>
                    <div>{c.title || c.name || c.id || "Contest series"}</div>
                    <div className="tiny">{c.startsAt || c.scheduledAt || ""}</div>
                    <JoiningMeta entity={c} />
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <WatchLink gameId={gameId} />
                  </div>
                </div>
              );
            })}
            {liveContestExtra.map((g) => (
              <div key={g.id} className="panel game-row">
                <div>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span className="tag definitive">Contest</span>
                    <span className="tag">{statusLabel(g.status)}</span>
                  </div>
                  <div>Live contest arena</div>
                  <JoiningMeta entity={g} />
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <WatchLink gameId={g.id} />
                </div>
              </div>
            ))}
          </div>
        )}
        <h3 style={{ fontSize: "0.95rem", margin: "1.15rem 0 0.65rem" }}>Recent contest finishes</h3>
        <GameList games={parts.finishedContest} empty="No finished contest games yet." />
      </section>
    </div>
  );
}
