import { Link } from "react-router-dom";
import {
  campaign,
  firstLobbyFlash,
  isFirstLobbyFlashOpen,
  settlementsForGame,
  txExplorerUrl,
  walletExplorerUrl,
} from "../../config/campaign.js";

export function PrizeTrustPanel({ compact = false, gameId = null, liveSettlement = null }) {
  const walletUrl = walletExplorerUrl();
  const rows = settlementsForGame(gameId, liveSettlement);

  return (
    <section className={`panel prize-trust${compact ? " is-compact" : ""}`}>
      <div className="tiny prize-trust-kicker">Prize trust · {campaign.name}</div>
      <h2 style={{ fontSize: compact ? "1.05rem" : "1.2rem", margin: "0.15rem 0 0.45rem" }}>
        {campaign.poolLabel} · equal split
      </h2>
      <p className="muted" style={{ margin: "0 0 0.75rem", fontSize: compact ? "0.85rem" : undefined }}>
        {campaign.equalSplit} {campaign.payoutSla}
      </p>
      <dl className="prize-trust-meta">
        <div>
          <dt>Contest pool</dt>
          <dd>{campaign.poolLabel}</dd>
        </div>
        <div>
          <dt>{firstLobbyFlash.title}</dt>
          <dd>
            {firstLobbyFlash.poolLabel}
            {isFirstLobbyFlashOpen() ? (
              <div className="tiny prize-open-label">{firstLobbyFlash.openLabel}</div>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>Wallet</dt>
          <dd>
            {campaign.prizeWallet ? (
              walletUrl ? (
                <a href={walletUrl} target="_blank" rel="noreferrer">
                  {campaign.prizeWallet}
                </a>
              ) : (
                <code>{campaign.prizeWallet}</code>
              )
            ) : (
              <span className="muted">Published at contest kickoff</span>
            )}
          </dd>
        </div>
      </dl>
      <div className="prize-trust-settlements">
        <div className="tiny" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
          On-chain payouts
        </div>
        {rows.length === 0 ? (
          <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
            No tx hashes yet. After the finale, hashes land here and on the arena banner.
          </p>
        ) : (
          <ul className="prize-tx-list">
            {rows.map((row) => (
              <li key={row.txHash}>
                {txExplorerUrl(row.txHash) ? (
                  <a href={txExplorerUrl(row.txHash)} target="_blank" rel="noreferrer">
                    {row.txHash}
                  </a>
                ) : (
                  <code>{row.txHash}</code>
                )}
                {row.amount ? <span className="tiny"> · {row.amount}</span> : null}
                {row.note ? <span className="tiny"> · {row.note}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      {!compact && (
        <p className="tiny" style={{ margin: "0.85rem 0 0" }}>
          Contest survivors are on the <Link to="/prizes#hall-of-fame">Hall of Fame</Link>.{" "}
          <Link to="/prizes#prize-rules">Official Prize Rules</Link>.
        </p>
      )}
    </section>
  );
}
