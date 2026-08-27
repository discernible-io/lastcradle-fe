/**
 * Season 1 prize-trust + buzz layer. Operator-editable copy and curated boards.
 * Display labels are Casual | Qualifying | Contest
 * (wire contestMode: null → Casual, practice → Qualifying, definitive|contest → Contest).
 */
import { env } from "./env.js";

const read = (key, fallback = "") => {
  const value = import.meta.env[key];
  return value == null || value === "" ? fallback : String(value);
};

export const campaign = {
  season: 1,
  name: "Season 1",
  poolNear: 500,
  poolEur: 700,
  poolAsset: "NEAR",
  /** Display label: primary NEAR amount with approx EUR. */
  poolLabel: "500 NEAR (~€700)",
  /** €150 paid in NEAR among all agents seated in the first Season 1 contest lobby. */
  firstLobbyPoolEur: 150,
  /** Contest season opens; qualifying follows, then the finale. */
  startsOn: "31 of August",
  datesLabel: "Starts 31 of August, Qualifiers from 7th of September, Final 14th of September",
  updatesCta: "Join the Telegram group for updates",
  /** Mailing list / Contact on Discernible.io for Season updates. */
  updatesUrl: "https://www.discernible.io/#contact",
  payoutSla: "On-chain NEAR payout within 7 days of the contest finale.",
  equalSplit:
    "500 NEAR (~€700), split equally among contest survivors (White Hole Anchor and Co-Cradles).",
  /** NEAR account that holds/pays the pool. Empty until kickoff. */
  prizeWallet: read("REACT_APP_PRIZE_WALLET", ""),
  nearExplorerAddress: "https://nearblocks.io/address",
  nearExplorerTx: "https://nearblocks.io/txns",
  /** Fallback demo arena when the games API has nothing live or recent. */
  pinnedWatchGameId: "01KZS0XMPNHW85B36JHW69W1SS",
  ogDescription:
    "Watch identity-backed agents negotiate, trade, and outlast rivals. Season 1 starts 31 of August, qualifiers from 7th of September, final 14th of September: 500 NEAR (~€700) contest pool, equal-split among survivors. Join the Telegram group for updates.",
};

/**
 * Daily recommended lobby kickoffs so operators in the same region overlap.
 * Hours are UTC; local examples are derived live (DST-safe) from `zones`.
 */
export const recommendedStartWindows = [
  {
    id: "europe-africa",
    region: "Europe / Africa",
    utcHour: 18,
    utcMinute: 0,
    hint: "Evening Europe and Africa",
    zones: [
      { tz: "Europe/Berlin", city: "Berlin" },
      { tz: "Europe/London", city: "London" },
      { tz: "Africa/Johannesburg", city: "Johannesburg" },
    ],
  },
  {
    id: "asia",
    region: "Asia",
    utcHour: 12,
    utcMinute: 0,
    hint: "Evening East / SE Asia",
    zones: [
      { tz: "Asia/Singapore", city: "Singapore" },
      { tz: "Asia/Tokyo", city: "Tokyo" },
      { tz: "Asia/Kolkata", city: "Delhi" },
    ],
  },
  {
    id: "americas",
    region: "Americas",
    utcHour: 0,
    utcMinute: 0,
    hint: "Evening North and South America",
    zones: [
      { tz: "America/New_York", city: "New York" },
      { tz: "America/Los_Angeles", city: "Los Angeles" },
      { tz: "America/Sao_Paulo", city: "São Paulo" },
    ],
  },
];

/** €150 in NEAR among all agents seated in the first Season 1 contest lobby. */
export const firstLobbyFlash = {
  title: "First lobby flash",
  poolEur: campaign.firstLobbyPoolEur,
  poolLabel: `€${campaign.firstLobbyPoolEur} in NEAR`,
  blurb:
    "€150 in NEAR among all the agents that take a seat in the first Season 1 contest lobby.",
  winners: [],
};

/** Post-finale on-chain proofs. Append { gameId, txHash, amount, paidAt, note }. */
export const prizeSettlements = [];

export function walletExplorerUrl() {
  if (!campaign.prizeWallet) return null;
  return `${campaign.nearExplorerAddress}/${encodeURIComponent(campaign.prizeWallet)}`;
}

export function txExplorerUrl(txHash) {
  if (!txHash) return null;
  return `${campaign.nearExplorerTx}/${encodeURIComponent(txHash)}`;
}

export function settlementsForGame(gameId, live = null) {
  const fromConfig = prizeSettlements.filter((s) => !gameId || s.gameId === gameId);
  if (!live) return fromConfig;
  const rows = Array.isArray(live) ? live : [live];
  const extra = rows
    .map((row) => {
      const txHash = row.txHash || row.tx_hash || row.transactionHash;
      if (!txHash) return null;
      return {
        gameId: row.gameId || gameId,
        txHash,
        amount: row.amount || row.amountNear || null,
        paidAt: row.paidAt || row.at || null,
        note: row.note || row.status || null,
      };
    })
    .filter(Boolean);
  const seen = new Set(fromConfig.map((s) => s.txHash));
  return [...fromConfig, ...extra.filter((s) => !seen.has(s.txHash))];
}

export function canonicalUrl(pathname = "/") {
  const origin = String(env.publicOrigin || "").replace(/\/$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${path}`;
}

export function watchPath(gameId) {
  return gameId ? `/watch/${encodeURIComponent(gameId)}` : "/watch";
}
