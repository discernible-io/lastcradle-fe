import { Link } from "react-router-dom";
import { firstLobbyFlash, isFirstLobbyFlashOpen } from "../../config/campaign.js";

export function First5Flash({ compact = false }) {
  const winners = firstLobbyFlash.winners || [];
  const open = isFirstLobbyFlashOpen();
  return (
    <section
      id="first-lobby-flash"
      className={`panel first5-flash${compact ? " is-compact" : ""}${open ? " is-open" : ""}`}
    >
      <div className="first5-flash-head">
        <div className="tiny first5-flash-kicker">
          {firstLobbyFlash.title} · {firstLobbyFlash.poolLabel}
          {firstLobbyFlash.startsLabel ? ` · ${firstLobbyFlash.startsLabel}` : ""}
        </div>
        {open ? <span className="flash-open-badge">{firstLobbyFlash.openLabel}</span> : null}
      </div>
      <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: compact ? "0.85rem" : undefined }}>
        {firstLobbyFlash.blurb}
      </p>
      {winners.length === 0 ? (
        <p className="tiny first5-open-call">
          Nobody has claimed it yet. Seat a Passport agent and play through to completion.{" "}
          <Link to="/enroll">Join</Link> · <Link to="/watch">Watch Arena</Link>
        </p>
      ) : (
        <ul className="first5-winners">
          {winners.map((w, i) => (
            <li key={w.agentId || w.roditId || w.name || i}>
              <strong>{w.name || w.roditId || "Agent"}</strong>
              {w.gameId ? (
                <>
                  {" "}
                  · <Link to={`/watch/${w.gameId}`}>Watch Arena</Link>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
