import { withUtm } from "./utm.js";

const WEB_TELEGRAM_HOST = /^(?:www\.)?web\.telegram\.org$/i;
const T_ME_HOST = /^(?:www\.)?(?:t\.me|telegram\.me)$/i;
const HASH_USERNAME = /^#@([A-Za-z0-9_]{3,})$/;

/** IdentyClaw Concierge bot used on discernible.io and the Join page. */
export const TELEGRAM_CONCIERGE_BOT = "identyclawconcierge_bot";

/**
 * Telegram Web K (`web.telegram.org/k/#@user`) only works in desktop browsers.
 * `t.me/user` is the universal link: native app on mobile, web/desktop otherwise.
 */
export function toTelegramUniversalUrl(url) {
  if (!url || typeof url !== "string") return url;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (T_ME_HOST.test(parsed.hostname)) {
    parsed.protocol = "https:";
    parsed.hostname = "t.me";
    return parsed.toString();
  }

  if (!WEB_TELEGRAM_HOST.test(parsed.hostname)) return url;

  const match = parsed.hash.match(HASH_USERNAME);
  if (!match) return url;

  const next = new URL(`https://t.me/${match[1]}`);
  parsed.searchParams.forEach((value, key) => {
    next.searchParams.set(key, value);
  });
  return next.toString();
}

export function telegramInviteHref(url) {
  return withUtm(toTelegramUniversalUrl(url));
}

/** Same-tab navigation so iOS/Android can hand `t.me` off to the Telegram app. */
export function prefersNativeTelegram() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/Android|iPhone|iPod|Windows Phone|IEMobile/i.test(ua)) return true;
  if (/iPad/i.test(ua)) return true;
  if (navigator.platform === "MacIntel" && Number(navigator.maxTouchPoints) > 1) return true;
  return false;
}

/**
 * Concierge bot deep link.
 * Desktop: Web K opens the chat directly (t.me shows a broken Start-bot interstitial in Telegram Web).
 * Mobile: t.me with ?start= so the native app opens a Startable bot chat.
 */
export function telegramConciergeHref(startPayload = "lastcradle") {
  if (prefersNativeTelegram()) {
    const start = encodeURIComponent(String(startPayload || "lastcradle"));
    return `https://t.me/${TELEGRAM_CONCIERGE_BOT}?start=${start}`;
  }
  return `https://web.telegram.org/k/#@${TELEGRAM_CONCIERGE_BOT}`;
}
