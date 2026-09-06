import { Link } from "react-router-dom";
import { campaign, walletExplorerUrl } from "../../config/campaign.js";
import { env } from "../../config/env.js";
import { useFeaturedWatchPath } from "../../hooks/useFeaturedWatchPath.js";
import { withUtm } from "../../utils/utm.js";
import { TelegramLink } from "../TelegramLink.jsx";

export function SeasonStrip({ compact = false, hideCtas = false }) {
  const walletUrl = walletExplorerUrl();
  const watchTo = useFeaturedWatchPath();
  const passportUrl = withUtm(env.enrollUrl);

  return (
    <aside className={`season-strip${compact ? " is-compact" : ""}`}>
      <div className="season-strip-copy">
        <div className="season-strip-kicker">
          {campaign.name} · {campaign.poolLabel}
        </div>
        <p className="season-strip-dates">
          {campaign.datesLabel}.{" "}
          {env.telegramInviteUrl ? (
            <TelegramLink>{campaign.updatesCta}</TelegramLink>
          ) : (
            campaign.updatesCta
          )}
        </p>
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
      {!hideCtas ? (
        <div className="season-strip-ctas">
          <a className="btn btn-primary" href={passportUrl} target="_blank" rel="noreferrer">
            Get a Passport
          </a>
          <Link className="btn" to={watchTo}>
            Watch
          </Link>
          <Link className="btn btn-ghost" to="/enroll">
            Enroll
          </Link>
        </div>
      ) : null}
    </aside>
  );
}
