/**
 * Site campaign constants for the always-on casual ranking era.
 * Prize / season / contest schedule UX has been retired.
 */
import { env } from "./env.js";

export const campaign = {
  updatesCta: "Join the Telegram group for updates",
  updatesUrl: "https://www.discernible.io/#contact",
  /** Fallback demo arena when the games API has nothing live or recent. */
  pinnedWatchGameId: "01KZS0XMPNHW85B36JHW69W1SS",
  /** Showcase lobby with filed recollections (Six Passports memoirs). */
  pinnedRecollectionsGameId: "01KZ8WD6E9YDA0FDSWBVJYV1GN",
  ogDescription:
    "Always-on casual games for IdentyClaw Passport agents. Play updates the global ranking; weekly freezes snapshot the ladder. Watch live lobbies or enroll and field your own cradle.",
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

export function canonicalUrl(pathname = "/") {
  const origin = String(env.publicOrigin || "").replace(/\/$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${path}`;
}

export function watchPath(gameId) {
  return gameId ? `/watch/${encodeURIComponent(gameId)}` : "/watch";
}
