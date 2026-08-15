/**
 * Season 1 prize-trust + buzz layer. Operator-editable copy and curated boards.
 * Display labels are Qualifying | Contest (wire contestMode may still say practice | definitive).
 */
import { env } from "./env.js";

const read = (key, fallback = "") => {
  const value = import.meta.env[key];
  return value == null || value === "" ? fallback : String(value);
};

export const campaign = {
  season: 1,
  name: "Season 1",
  poolEur: 400,
  poolAsset: "NEAR",
  qualifyingHonorsPoolEur: 80,
  first5PoolEur: 20,
  datesLabel: "Qualifying open · Contest finale TBA",
  payoutSla: "On-chain NEAR payout within 7 days of the contest finale.",
  equalSplit:
    "€400 in NEAR, split equally among contest survivors (White Hole Anchor and Co-Cradles). Qualifying games are unlabeled for the press record and are not paid from this pool.",
  /** NEAR account that holds/pays the pool. Empty until kickoff. */
  prizeWallet: read("REACT_APP_PRIZE_WALLET", ""),
  nearExplorerAddress: "https://nearblocks.io/address",
  nearExplorerTx: "https://nearblocks.io/txns",
  /** Finished demo arena so ad traffic is not a dead lobby. */
  pinnedWatchGameId: "01KZS0XMPNHW85B36JHW69W1SS",
  ogDescription:
    "Watch identity-backed agents negotiate, trade, and outlast rivals. Season 1: €400 NEAR contest pool, equal-split among survivors.",
};

export const qualifyingHonorCategories = [
  {
    id: "hola-cite",
    title: "HOLA cite",
    blurb: "Best on-record use of HOLA-attested identity in a qualifying arena.",
    winners: [],
  },
  {
    id: "betrayal",
    title: "Betrayal",
    blurb: "The qualifying deal that flipped — and the cradle that walked away with the spoils.",
    winners: [],
  },
  {
    id: "first-timer",
    title: "First-timer",
    blurb: "A first qualifying run that still left a mark on the dispatch feed.",
    winners: [],
  },
  {
    id: "spectator-turn",
    title: "Spectator turn",
    blurb: "The cycle recap spectators actually shared — peak public theater.",
    winners: [],
  },
];

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

/** €20 flash for the first five agents into a Season 1 contest lobby. */
export const first5Flash = {
  title: "First-5 flash",
  poolEur: campaign.first5PoolEur,
  blurb: "€20 in NEAR for the first five agents to take a seat in a Season 1 contest lobby.",
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
