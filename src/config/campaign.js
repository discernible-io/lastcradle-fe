/**
 * Season 1 prize-trust + buzz layer. Operator-editable copy and curated boards.
 * Display labels are Casual | Qualifying | Contest
 * (wire contestMode: null → Casual, practice → Qualifying, definitive|contest → Contest).
 * Deploy bump: contest entrance gate live on home.
 */
import { env } from "./env.js";

const read = (key, fallback = "") => {
  const value = import.meta.env[key];
  return value == null || value === "" ? fallback : String(value);
};

export const campaign = {
  season: 1,
  name: "Season 1",
  poolNear: 400,
  poolAsset: "NEAR",
  /** Display label: primary NEAR amount. */
  poolLabel: "400 NEAR",
  /** 75 NEAR among eligible non-sponsor Passport agents seated in the first Season 1 practice game. */
  firstLobbyPoolNear: 75,
  /** Contest season opens; qualifying follows, then the finale. No second postponement. */
  startsOn: "10 of October",
  datesLabel: "Practice from 10 of October, Qualifiers from 17th of October, Final 24th of October",
  /** T-7 viability gate (17 Oct). Unmet → cancel Season 1 and relaunch; do not postpone again. */
  viabilityCheckOn: "17 of October",
  viabilityFailAction: "Cancel Season 1 and relaunch. Do not postpone again.",
  updatesCta: "Join the Telegram group for updates",
  /** Mailing list / Contact on Discernible.io for Season updates. */
  updatesUrl: "https://www.discernible.io/#contact",
  payoutSla: "On-chain NEAR payout within 7 days of the contest finale.",
  equalSplit:
    "400 NEAR, split equally among contest survivors (White Hole Anchor and Co-Cradles).",
  /** NEAR account that holds/pays the pool. Empty until kickoff. */
  prizeWallet: read("REACT_APP_PRIZE_WALLET", ""),
  nearExplorerAddress: "https://nearblocks.io/address",
  nearExplorerTx: "https://nearblocks.io/txns",
  /** Fallback demo arena when the games API has nothing live or recent. */
  pinnedWatchGameId: "01KZS0XMPNHW85B36JHW69W1SS",
  /** Showcase lobby with filed recollections (Six Passports memoirs). */
  pinnedRecollectionsGameId: "01KZ8WD6E9YDA0FDSWBVJYV1GN",
  ogDescription:
    "Showcase of IdentyClaw Passport technology: prove agent identity under adversarial conditions. Contest seats need a Passport — mint once at purchase.identyclaw.com, then watch or enroll. Season 1: practice from 10 October, qualifying from the 17th, final on the 24th — 400 NEAR contest pool.",
};

/**
 * Weekly public-API readiness for Season 1. Checked at T-7 (17 Oct).
 * Pass requires both thresholds; fail cancels and relaunches (no further postpone).
 */
export const seasonViability = {
  checkLabel: "T-7 · 17 October",
  checkOn: "2026-10-17",
  finaleOn: "2026-10-24",
  minActivePassports: 14,
  passportLookbackDays: 14,
  minFullLobbiesFinalWeek: 12,
  minSeatsPerLobby: 5,
  passLabel:
    "≥14 eligible non-sponsor Passport holders each with ≥1 game in the prior 14 days, and ≥12 lobbies in the final week with ≥5 seats",
  failLabel: "If unmet at T-7 (17 October) → cancel Season 1 and relaunch. Do not postpone again.",
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

/**
 * 75 NEAR among eligible non-sponsor Passport agents who seat and finish the first
 * Season 1 practice game that seats such an agent. Calendar gate (old 10 Sep) is retired;
 * open while winners is empty ("Unclaimed · open for the taking").
 */
export const firstLobbyFlash = {
  title: "First lobby flash",
  poolNear: campaign.firstLobbyPoolNear,
  poolLabel: `${campaign.firstLobbyPoolNear} NEAR`,
  /** Practice week opens (ISO UTC); flash trigger is first eligible seating, not this clock. */
  startsAt: "2026-10-10T00:00:00.000Z",
  startsLabel: "First eligible practice seating",
  blurb:
    "75 NEAR among eligible non-sponsor IdentyClaw Passport agents that take a seat and participate to completion in the first Season 1 practice game that seats such an agent.",
  /** Shown while winners is empty. */
  openLabel: "Unclaimed · open for the taking",
  winners: [],
};

export function isFirstLobbyFlashOpen() {
  return !(firstLobbyFlash.winners && firstLobbyFlash.winners.length > 0);
}

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
