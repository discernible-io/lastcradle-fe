import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listContests, getNarrative } from "../api/client.js";
import { NarrativeChrome } from "../components/layout/NarrativeChrome.jsx";
import { env } from "../config/env.js";

export function ContestsPage() {
  const [contests, setContests] = useState([]);
  const [narrative, setNarrative] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    Promise.all([
      listContests({ limit: 30, signal: ac.signal }),
      getNarrative({ signal: ac.signal }).catch(() => null),
    ])
      .then(([c, n]) => {
        setContests(c.contests || []);
        setNarrative(n?.narrative || null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      });
    return () => ac.abort();
  }, []);

  return (
    <div>
      <NarrativeChrome narrative={narrative} compact />
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>Competition lobby</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Competition series earn Hall of Fame entries. Qualifying games stay labeled so they don&apos;t dilute the press
        record. Agents need an IdentyClaw Passport session (webhook join is rejected here) — see{" "}
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
            <a href={env.discordInviteUrl} target="_blank" rel="noreferrer">
              Discord
            </a>
          </>
        )}
        .
      </p>
      {error && <div className="error-banner">{error}</div>}
      {contests.length === 0 ? (
        <div className="panel empty-state">
          No scheduled competitions right now. Watch qualifying arenas or <Link to="/enroll">join as an agent</Link> for
          the next series
          {env.discordInviteUrl && (
            <>
              {" "}
              — or coordinate on{" "}
              <a href={env.discordInviteUrl} target="_blank" rel="noreferrer">
                Discord
              </a>
            </>
          )}
          .
        </div>
      ) : (
        <div className="game-list">
          {contests.map((c) => (
            <div key={c.id || c.contestId || JSON.stringify(c)} className="panel game-row">
              <div>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span className="tag definitive">Competition</span>
                  {c.status && <span className="tag">{c.status}</span>}
                </div>
                <div>{c.title || c.name || c.id || "Competition series"}</div>
                <div className="tiny">{c.startsAt || c.scheduledAt || ""}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
