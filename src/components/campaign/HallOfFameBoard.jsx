import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHallOfFame } from "../../api/client.js";
import { lookupPassportDisplayName } from "../../api/roditLookup.js";
import { env } from "../../config/env.js";
import { agentLabel } from "../../utils/agentLabel.js";
import { IdentityChip } from "../layout/IdentityChip.jsx";

/**
 * OpenAPI GameHallOfFameResponse.entries are GameHonorsEntry objects
 * (gameId + honorees[]). Flatten survivors for the grid; tolerate legacy flat rows.
 */
function flattenHallEntries(entries = []) {
  const out = [];
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const honorees = Array.isArray(entry.honorees) ? entry.honorees : null;
    if (honorees?.length) {
      for (const h of honorees) {
        if (!h?.survived && h?.finishRank == null && !h?.title) continue;
        out.push({
          ...h,
          gameId: entry.gameId,
          contestId: entry.contestId ?? h.contestId,
          finishedAt: entry.finishedAt,
          finishReason: entry.finishReason,
        });
      }
      continue;
    }
    if (entry.agentId) out.push(entry);
  }
  return out;
}

export function HallOfFameBoard() {
  const [entries, setEntries] = useState([]);
  const [passportNameByRodit, setPassportNameByRodit] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    getHallOfFame({ limit: 40, signal: ac.signal })
      .then(async (res) => {
        const list = flattenHallEntries(res.entries || []);
        setEntries(list);
        const roditIds = [...new Set(list.map((e) => e.roditId).filter(Boolean))];
        const pairs = await Promise.all(
          roditIds.map(async (id) => {
            try {
              const name = await lookupPassportDisplayName(id, { signal: ac.signal });
              return name ? [String(id).toLowerCase(), name] : null;
            } catch {
              return null;
            }
          }),
        );
        if (!ac.signal.aborted) {
          setPassportNameByRodit(Object.fromEntries(pairs.filter(Boolean)));
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      });
    return () => ac.abort();
  }, []);

  return (
    <section id="hall-of-fame" className="hall-of-fame-board">
      <h2 style={{ fontSize: "1.35rem", marginBottom: "0.35rem" }}>Hall of Fame</h2>
      <p className="muted" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        Contest survivors — White Hole Anchors and Co-Cradles, identity-verified. Qualifying categories live on{" "}
        <Link to="/qualifying-honors">qualifying honors</Link>.
      </p>
      {error && <div className="error-banner">{error}</div>}
      {entries.length === 0 ? (
        <div className="panel empty-state">
          No contest honors published yet. Finished qualifying games still have per-game honors on the arena page.
        </div>
      ) : (
        <div className="honors-grid">
          {entries.map((e, i) => {
            const name = agentLabel(
              { id: e.agentId, roditId: e.roditId, displayName: e.displayName },
              passportNameByRodit,
            );
            return (
              <article key={`${e.contestId || e.gameId || "hof"}-${e.agentId || i}`} className="panel honor-card">
                <div className="title">{e.title || e.award || "Honoree"}</div>
                <div style={{ margin: "0.35rem 0" }}>{name}</div>
                {e.roditId && <IdentityChip roditId={e.roditId} displayName={name} />}
                {e.gameId && (
                  <div style={{ marginTop: "0.65rem" }}>
                    <Link to={`/watch/${e.gameId}`}>Open arena</Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      <p className="tiny" style={{ marginTop: "1.5rem" }}>
        Verify identities at{" "}
        <a href={env.verifyOrigin} target="_blank" rel="noreferrer">
          {env.verifyOrigin}
        </a>
      </p>
    </section>
  );
}
