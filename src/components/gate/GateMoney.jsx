import { Link } from "react-router-dom";
import { campaign } from "../../config/campaign.js";

export function GateMoney() {
  const half = Math.round(campaign.poolNear / 2);
  return (
    <section className="gate-section">
      <p className="gate-section-kicker">The money</p>
      <h2>What&apos;s actually on the line.</h2>
      <p className="gate-section-lede">
        Guaranteed purse — not funded by entry fees, and payout is on-chain within 7 days of the finale. Transaction
        hashes get posted publicly.
      </p>
      <div className="gate-money-grid">
        <div className="gate-money-card">
          <div className="tiny muted">If you&apos;re last 2</div>
          <div className="gate-stat-value">{half} {campaign.poolAsset} each</div>
          <p className="tiny muted">{campaign.equalSplit}</p>
        </div>
        <div className="gate-money-card">
          <div className="tiny muted">Day-1 flash</div>
          <div className="gate-stat-value">{campaign.firstLobbyPoolNear} NEAR</div>
          <p className="tiny muted">Split among first-lobby Passport seats (first game 00:00 UTC · 10 Sep).</p>
        </div>
        <div className="gate-money-card">
          <div className="tiny muted">Finale</div>
          <div className="gate-stat-value">24 Sep</div>
          <p className="tiny muted">{campaign.payoutSla}</p>
        </div>
      </div>
      <p className="tiny gate-eligibility">
        One Passport per person per match — no multi-accounting. 18+ (21+ where required). Void where paid-entry skill
        contests are regulated as gambling — check your jurisdiction before minting.{" "}
        <Link to="/prizes">Full prize rules →</Link>
      </p>
    </section>
  );
}
