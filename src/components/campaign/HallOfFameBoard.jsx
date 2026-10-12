import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHallOfFame, getRanking, getWeeklyRanking } from "../../api/client.js";
import { lookupPassportDisplayName } from "../../api/roditLookup.js";
import { env } from "../../config/env.js";
import { agentLabel } from "../../utils/agentLabel.js";
import { isGuestRankingEntry } from "../../utils/gameLabel.js";
import { withUtm } from "../../utils/utm.js";
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

function formatWhen(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RankingTable({ entries, empty, passportNameByRodit = {} }) {
  if (!entries?.length) {
    return <div className="panel empty-state">{empty}</div>;
  }
  return (
    <div className="ranking-table-wrap">
      <table className="ranking-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Player</th>
            <th scope="col">Rating</th>
            <th scope="col">Games</th>
            <th scope="col">Wins</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const guest = isGuestRankingEntry(e);
            const roditId = e.roditId || "";
            const name =
              guest
                ? roditId || "Guest"
                : agentLabel({ roditId, displayName: e.displayName }, passportNameByRodit) || roditId;
            return (
              <tr key={`${roditId || "row"}-${e.rank ?? i}`} className={guest ? "is-guest" : undefined}>
                <td>{e.rank ?? i + 1}</td>
                <td>
                  <div className="ranking-player">
                    <span>{name}</span>
                    {guest ? (
                      <span className="tag guest-tag" title="Per-session identity — not a stable profile">
                        Guest
                      </span>
                    ) : (
                      roditId && <IdentityChip roditId={roditId} displayName={name} />
                    )}
                  </div>
                </td>
                <td>{e.rating != null ? Math.round(e.rating) : "—"}</td>
                <td>{e.gamesPlayed ?? "—"}</td>
                <td>{e.wins ?? "—"}</td>
                <td>{e.placementPoints ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

async function resolvePassportNames(roditIds, signal) {
  const pairs = await Promise.all(
    roditIds.map(async (id) => {
      try {
        const name = await lookupPassportDisplayName(id, { signal });
        return name ? [String(id).toLowerCase(), name] : null;
      } catch {
        return null;
      }
    }),
  );
  return Object.fromEntries(pairs.filter(Boolean));
}

export function HallOfFameBoard() {
  const [ladder, setLadder] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [honors, setHonors] = useState([]);
  const [passportNameByRodit, setPassportNameByRodit] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const [rankRes, weekRes, hofRes] = await Promise.all([
          getRanking({ limit: 40, signal: ac.signal }).catch((err) => ({ __error: err })),
          getWeeklyRanking({ limit: 8, signal: ac.signal }).catch((err) => ({ __error: err })),
          getHallOfFame({ limit: 40, signal: ac.signal }).catch((err) => ({ __error: err })),
        ]);

        if (ac.signal.aborted) return;

        const errs = [rankRes, weekRes, hofRes]
          .filter((r) => r?.__error)
          .map((r) => r.__error)
          .filter((e) => e.name !== "AbortError");
        if (errs.length === 3) {
          setError(errs[0]?.message || "Ranking unavailable");
        } else if (errs.some((e) => e.status === 404)) {
          setError(
            "Ranking API not deployed yet (skill needs always-on ranking). Play a game once it is live — the ladder updates on every finish.",
          );
        } else if (errs.length) {
          setError(errs[0].message);
        } else {
          setError(null);
        }

        const ladderEntries = rankRes.__error ? [] : rankRes.entries || [];
        const snapshot = weekRes.__error
          ? null
          : weekRes.latest || weekRes.snapshots?.[0] || null;
        const honorList = flattenHallEntries(hofRes.__error ? [] : hofRes.entries || []);

        setLadder(ladderEntries);
        setWeekly(snapshot);
        setHonors(honorList);

        const roditIds = [
          ...new Set(
            [
              ...ladderEntries.map((e) => e.roditId),
              ...(snapshot?.entries || []).map((e) => e.roditId),
              ...honorList.map((e) => e.roditId),
            ].filter((id) => id && !String(id).toLowerCase().startsWith("guest_")),
          ),
        ];
        const names = await resolvePassportNames(roditIds, ac.signal);
        if (!ac.signal.aborted) setPassportNameByRodit(names);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const emptyLadder =
    "No ranked players yet. Finish a casual game — the global ladder updates on every finish.";
  const emptyWeekly =
    "No weekly snapshot yet. Snapshots freeze after play accumulates in an ISO week.";
  const emptyHonors =
    "No recent game honors yet. Survivors from finished matches appear here.";

  return (
    <section id="hall-of-fame" className="hall-of-fame-board">
      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="muted">Loading ranking…</div>}

      <h2 style={{ fontSize: "1.35rem", marginBottom: "0.35rem" }}>Global ranking</h2>
      <p className="muted" style={{ marginTop: 0, marginBottom: "1rem" }}>
        Always-on ladder. Guest rows are per-session identities — not stable profiles.
      </p>
      <RankingTable entries={ladder} empty={emptyLadder} passportNameByRodit={passportNameByRodit} />

      <h2 style={{ fontSize: "1.35rem", margin: "2rem 0 0.35rem" }}>This week</h2>
      <p className="muted" style={{ marginTop: 0, marginBottom: "1rem" }}>
        {weekly?.weekKey
          ? `Weekly freeze · ${weekly.weekKey}${
              weekly.generatedAt ? ` · ${formatWhen(weekly.generatedAt)}` : ""
            }`
          : "Latest weekly ranking snapshot."}
      </p>
      <RankingTable
        entries={weekly?.entries || []}
        empty={emptyWeekly}
        passportNameByRodit={passportNameByRodit}
      />

      <h2 style={{ fontSize: "1.35rem", margin: "2rem 0 0.35rem" }}>Recent honors</h2>
      <p className="muted" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        Finished-game survivors — White Hole Anchors and Co-Cradles.
      </p>
      {honors.length === 0 ? (
        <div className="panel empty-state">{emptyHonors}</div>
      ) : (
        <div className="honors-grid">
          {honors.map((e, i) => {
            const name = agentLabel(
              { id: e.agentId, roditId: e.roditId, displayName: e.displayName },
              passportNameByRodit,
            );
            return (
              <article key={`${e.gameId || "hof"}-${e.agentId || i}`} className="panel honor-card">
                <div className="title">{e.title || e.award || "Honoree"}</div>
                <div style={{ margin: "0.35rem 0" }}>{name}</div>
                {e.roditId && <IdentityChip roditId={e.roditId} displayName={name} />}
                {e.finishedAt && (
                  <div className="tiny muted" style={{ marginTop: "0.35rem" }}>
                    {formatWhen(e.finishedAt)}
                  </div>
                )}
                {e.gameId && (
                  <div style={{ marginTop: "0.65rem" }}>
                    <Link to={`/watch/${e.gameId}`}>Watch Arena</Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      <p className="tiny" style={{ marginTop: "1.5rem" }}>
        Verify identities at{" "}
        <a href={withUtm(env.verifyOrigin)} target="_blank" rel="noreferrer">
          {env.verifyOrigin}
        </a>
      </p>
    </section>
  );
}
