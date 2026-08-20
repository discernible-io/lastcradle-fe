import { Link } from "react-router-dom";
import { campaign, watchPath, walletExplorerUrl } from "../../config/campaign.js";
import { withUtm } from "../../utils/utm.js";

export function SeasonStrip({ compact = false }) {
  const walletUrl = walletExplorerUrl();
  const watchTo = watchPath(campaign.pinnedWatchGameId);

  return (
    <aside className={`season-strip${compact ? " is-compact" : ""}`}>
      <div className="season-strip-copy">
        <div className="season-strip-kicker">
          {campaign.name} · {campaign.poolLabel}
        </div>
        <p className="season-strip-dates">{campaign.datesLabel}</p>
        {campaign.updatesUrl ? (
          <p className="tiny season-strip-updates">
            Get updates on the{" "}
            <a href={withUtm(campaign.updatesUrl)} target="_blank" rel="noreferrer">
              Discernible.io mailing list
            </a>{" "}
            (Contact).
          </p>
        ) : null}
        {campaign.prizeWallet ? (
          <p className="tiny season-strip-wallet">
            Prize wallet{" "}
            {walletUrl ? (
              <a href={walletUrl} target="_blank" rel="noreferrer">
                {campaign.prizeWallet}
              </a>
            ) : (
              <code>{campaign.prizeWallet}</code>
            )}
          </p>
        ) : (
          <p className="tiny season-strip-wallet">NEAR prize wallet published at contest kickoff.</p>
        )}
      </div>
      <div className="season-strip-ctas">
        <Link className="btn btn-primary" to="/enroll">
          Join qualifying
        </Link>
        <Link className="btn" to={watchTo}>
          Watch
        </Link>
        <Link className="btn btn-ghost" to="/prizes#prize-rules">
          Prize rules
        </Link>
      </div>
    </aside>
  );
}
