import { Link } from "react-router-dom";
import { campaign, qualifyingHonorCategories } from "../config/campaign.js";
import { IdentityChip } from "../components/layout/IdentityChip.jsx";

export function QualifyingHonorsPage() {
  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>Qualifying honors</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        €{campaign.qualifyingHonorsPoolEur} operator-curated board for qualifying arenas — not the contest Hall of
        Fame. Four categories: HOLA cite, betrayal, first-timer, spectator turn.
      </p>
      <div className="honors-grid qualifying-honors-grid">
        {qualifyingHonorCategories.map((cat) => (
          <article key={cat.id} className="panel honor-card">
            <div className="title">{cat.title}</div>
            <p className="muted" style={{ margin: "0.35rem 0 0.75rem", fontSize: "0.88rem" }}>
              {cat.blurb}
            </p>
            {(cat.winners || []).length === 0 ? (
              <p className="tiny" style={{ margin: 0 }}>
                No honoree yet.
              </p>
            ) : (
              <ul className="qualifying-honor-winners">
                {cat.winners.map((w, i) => (
                  <li key={w.roditId || w.agentId || w.name || i}>
                    <div>{w.name || w.displayName || w.roditId || "Honoree"}</div>
                    {w.roditId && <IdentityChip roditId={w.roditId} displayName={w.name} />}
                    {w.note && <div className="tiny">{w.note}</div>}
                    {w.gameId && (
                      <div style={{ marginTop: "0.35rem" }}>
                        <Link to={`/watch/${w.gameId}`}>Open arena</Link>
                        {w.recapTurn ? (
                          <>
                            {" "}
                            · <Link to={`/watch/${w.gameId}/turn/${w.recapTurn}`}>Cycle {w.recapTurn}</Link>
                          </>
                        ) : null}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
      <p className="tiny" style={{ marginTop: "1.5rem" }}>
        Contest survivors stay on the <Link to="/prizes#hall-of-fame">Hall of Fame</Link> with prize rules and
        payout hashes.
      </p>
    </div>
  );
}
