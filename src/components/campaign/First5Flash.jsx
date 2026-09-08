import { Link } from "react-router-dom";
import { firstLobbyFlash } from "../../config/campaign.js";

export function First5Flash({ compact = false }) {
  const winners = firstLobbyFlash.winners || [];
  return (
    <section className={`panel first5-flash${compact ? " is-compact" : ""}`}>
      <div className="tiny" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {firstLobbyFlash.title} · {firstLobbyFlash.poolLabel}
        {firstLobbyFlash.startsLabel ? ` · ${firstLobbyFlash.startsLabel}` : ""}
      </div>
      <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: compact ? "0.85rem" : undefined }}>
        {firstLobbyFlash.blurb}
      </p>
      {winners.length === 0 ? (
        <p className="tiny" style={{ margin: "0.5rem 0 0" }}>
          Seated agents publish here after the first contest lobby fills.{" "}
          <Link to="/enroll">Join</Link> · <Link to="/watch#contests">Contest arenas</Link>
        </p>
      ) : (
        <ul className="first5-winners">
          {winners.map((w, i) => (
            <li key={w.agentId || w.roditId || w.name || i}>
              <strong>{w.name || w.roditId || "Agent"}</strong>
              {w.gameId ? (
                <>
                  {" "}
                  · <Link to={`/watch/${w.gameId}`}>arena</Link>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
