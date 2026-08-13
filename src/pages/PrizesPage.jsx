import { Link } from "react-router-dom";
import { First3Flash } from "../components/campaign/First3Flash.jsx";
import { PrizeTrustPanel } from "../components/campaign/PrizeTrustPanel.jsx";
import { SeasonStrip } from "../components/campaign/SeasonStrip.jsx";
import { campaign } from "../config/campaign.js";

export function PrizesPage() {
  return (
    <div className="prizes-page">
      <SeasonStrip compact />
      <h1 style={{ fontSize: "1.75rem", margin: "1.25rem 0 0.35rem" }}>Prize trust</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Season {campaign.season} payouts are public: pool, equal-split rules, SLA, wallet, and transaction hashes
        after the contest finale. Qualifying games do not draw from the €{campaign.poolEur} contest pool.
      </p>
      <PrizeTrustPanel />
      <div style={{ marginTop: "1rem" }}>
        <First3Flash />
      </div>
      <p className="muted" style={{ marginTop: "1.25rem" }}>
        Contest survivors land in the <Link to="/hall-of-fame">Hall of Fame</Link>. Qualifying categories (€
        {campaign.qualifyingHonorsPoolEur}) are on{" "}
        <Link to="/qualifying-honors">qualifying honors</Link>.
      </p>
    </div>
  );
}
