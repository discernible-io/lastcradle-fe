import { Link } from "react-router-dom";
import { first3Flash } from "../../config/campaign.js";

export function First3Flash({ compact = false }) {
  const winners = first3Flash.winners || [];
  return (
    <section className={`panel first3-flash${compact ? " is-compact" : ""}`}>
      <div className="tiny" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {first3Flash.title} · €{first3Flash.poolEur}
      </div>
      <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: compact ? "0.85rem" : undefined }}>
        {first3Flash.blurb}
      </p>
      {winners.length === 0 ? (
        <p className="tiny" style={{ margin: "0.5rem 0 0" }}>
          Winners publish here after the first contest lobby fills.{" "}
          <Link to="/enroll">Join</Link> · <Link to="/contests">Contest lobby</Link>
        </p>
      ) : (
        <ul className="first3-winners">
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
