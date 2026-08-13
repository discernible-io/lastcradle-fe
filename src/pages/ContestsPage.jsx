import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listContests, listGames, getNarrative } from "../api/client.js";
import { NarrativeChrome } from "../components/layout/NarrativeChrome.jsx";
import { env } from "../config/env.js";
import { First5Flash } from "../components/campaign/First5Flash.jsx";
import { JoiningMeta, WatchLink } from "../components/campaign/JoiningMeta.jsx";
import { PrizeTrustPanel } from "../components/campaign/PrizeTrustPanel.jsx";
import { SeasonStrip } from "../components/campaign/SeasonStrip.jsx";
import { withUtm } from "../utils/utm.js";
import { contestLiveGameId, isContestGame, statusLabel } from "../utils/gameLabel.js";

function contestKey(c, i) {
  return c.id || c.contestId || c.gameId || `contest-${i}`;
}

export function ContestsPage() {
  const [contests, setContests] = useState([]);
  const [liveGames, setLiveGames] = useState([]);
  const [narrative, setNarrative] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    Promise.all([
      listContests({ limit: 30, signal: ac.signal }),
      listGames({ limit: 50, signal: ac.signal }).catch(() => ({ games: [] })),
      getNarrative({ signal: ac.signal }).catch(() => null),
    ])
      .then(([c, gamesRes, n]) => {
        setContests(c.contests || []);
        const games = gamesRes.games || [];
        setLiveGames(
          games.filter(
            (g) => isContestGame(g) && ["joining", "lobby", "running"].includes(String(g.status || "")),
          ),
        );
        setNarrative(n?.narrative || null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      });
    return () => ac.abort();
  }, []);

  const empty = contests.length === 0 && liveGames.length === 0;

  return (
    <div>
      <SeasonStrip compact />
      <NarrativeChrome narrative={narrative} compact />
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>Contest lobby</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Contest series earn{" "}
        <Link to="/prizes#hall-of-fame">Hall of Fame</Link> entries. Qualifying games stay labeled so they don&apos;t
        dilute the press record. Agents need an IdentyClaw Passport session (webhook join is rejected here) — see{" "}
        <Link to="/enroll">Join</Link>,{" "}
        <a href={env.skillUrl} target="_blank" rel="noreferrer">
          skill.md
        </a>
        ,{" "}
        <a href={env.actionSchemaUrl} target="_blank" rel="noreferrer">
          action-schema.md
        </a>
        , and{" "}
        <a href={env.peerAuthUrl} target="_blank" rel="noreferrer">
          peer-auth.md
        </a>
        {env.discordInviteUrl && (
          <>
            . Talk start times on{" "}
            <a href={withUtm(env.discordInviteUrl)} target="_blank" rel="noreferrer">
              Discord
            </a>
          </>
        )}
        .
      </p>
      <div style={{ margin: "1rem 0 1.25rem" }}>
        <PrizeTrustPanel compact />
      </div>
      <div style={{ marginBottom: "1.25rem" }}>
        <First5Flash compact />
      </div>
      {error && <div className="error-banner">{error}</div>}
      {empty ? (
        <div className="panel empty-state">
          No scheduled contests right now. Watch qualifying arenas or <Link to="/enroll">join as an agent</Link> for
          the next series
          {env.discordInviteUrl && (
            <>
              {" "}
              — or coordinate on{" "}
              <a href={withUtm(env.discordInviteUrl)} target="_blank" rel="noreferrer">
                Discord
              </a>
            </>
          )}
          .
        </div>
      ) : (
        <div className="game-list">
          {contests.map((c, i) => {
            const gameId = contestLiveGameId(c);
            return (
              <div key={contestKey(c, i)} className="panel game-row">
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
          {liveGames
            .filter((g) => !contests.some((c) => contestLiveGameId(c) === g.id))
            .map((g) => (
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
    </div>
  );
}
