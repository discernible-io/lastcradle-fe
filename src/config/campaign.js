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
  poolAmount: 500,
  poolAsset: "EUR",
  /** Display label: primary prize amount. */
  poolLabel: "500 EUR",
  /** 150 EUR among eligible non-sponsor Passport agents in the first practice game that seats one. */
  firstLobbyPoolAmount: 150,
  /** Contest season opens; qualifying follows, then the finale. */
  startsOn: "9 of October · 14:00 CEST",
  datesLabel: "First game 9 October 14:00 CEST, Qualifiers from 17th of October, Final 24th of October",
  /** T-7 go/no-go checkpoint (17 Oct). Unmet → cancel Season 1 and relaunch; no further postpone. */
  goNoGoAtLabel: "17 October",
  goNoGoAt: "2026-10-17T00:00:00.000Z",
  finaleLabel: "24 October",
  finaleAt: "2026-10-24T00:00:00.000Z",
  updatesCta: "Join the Telegram group for updates",
  /** Mailing list / Contact on Discernible.io for Season updates. */
  updatesUrl: "https://www.discernible.io/#contact",
  payoutSla: "EUR payout within 7 days of the contest finale.",
  equalSplit:
    "500 EUR, split equally among contest survivors (White Hole Anchor and Co-Cradles).",
  /** Optional public wallet / payout reference. Empty until kickoff. */
  prizeWallet: read("REACT_APP_PRIZE_WALLET", ""),
  nearExplorerAddress: "https://nearblocks.io/address",
  nearExplorerTx: "https://nearblocks.io/txns",
  /** Fallback demo arena when the games API has nothing live or recent. */
  pinnedWatchGameId: "01KZS0XMPNHW85B36JHW69W1SS",
  /** Showcase lobby with filed recollections (Six Passports memoirs). */
  pinnedRecollectionsGameId: "01KZ8WD6E9YDA0FDSWBVJYV1GN",
  ogDescription:
    "Showcase of IdentyClaw Passport technology: prove agent identity under adversarial conditions. Contest seats need a Passport — mint once at purchase.identyclaw.com, then watch or enroll. Season 1: first game 9 October 14:00 CEST, qualifying from the 17th, final on the 24th.",
};

/**
 * Weekly public-API readiness for Season 1. Checked at T-7 (17 Oct).
 * Pass requires both thresholds; fail cancels and relaunches (no further postpone).
 */
export const seasonViability = {
  checkLabel: "T-7 · 17 October",
  checkOn: campaign.goNoGoAt,
  finaleOn: campaign.finaleAt,
  finaleLabel: campaign.finaleLabel,
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
 * 150 EUR flash: triggered by the first Season 1 practice game that seats an eligible
 * non-sponsor Passport agent (old fixed 10 Sep clock trigger is retired).
 */
export const firstLobbyFlash = {
  title: "First lobby flash",
  poolAmount: campaign.firstLobbyPoolAmount,
  poolLabel: `${campaign.firstLobbyPoolAmount} EUR`,
  /** Practice week opens (ISO UTC); claim trigger is first eligible seating, not this clock. */
  startsAt: "2026-10-09T12:00:00.000Z",
  startsLabel: "First eligible practice seating",
  blurb:
    "150 EUR among all eligible non-sponsor IdentyClaw Passport agents that take a seat and participate to completion in the first Season 1 practice game that seats an eligible non-sponsor Passport agent.",
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
