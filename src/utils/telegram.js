import { withUtm } from "./utm.js";

const WEB_TELEGRAM_HOST = /^(?:www\.)?web\.telegram\.org$/i;
const T_ME_HOST = /^(?:www\.)?(?:t\.me|telegram\.me)$/i;
const HASH_USERNAME = /^#@([A-Za-z0-9_]{3,})$/;
const HASH_CHAT_ID = /^#(-?\d+)$/;
const T_ME_USERNAME = /^\/(?:s\/)?([A-Za-z0-9_]{3,32})\/?$/;
const T_ME_PRIVATE_CHAT = /^\/c\/(\d+)(?:\/\d+)?\/?$/;
const RESERVED_T_ME_PATHS = /^(joinchat|addstickers|proxy|socks|share|c|iv)$/i;

/** IdentyClaw Concierge bot used on discernible.io and the Join page. */
export const TELEGRAM_CONCIERGE_BOT = "identyclawconcierge_bot";

function parseTelegramUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function telegramPublicHandle(url) {
  const parsed = parseTelegramUrl(url);
  if (!parsed) return null;

  if (WEB_TELEGRAM_HOST.test(parsed.hostname)) {
    const match = parsed.hash.match(HASH_USERNAME);
    return match ? match[1] : null;
  }

  if (!T_ME_HOST.test(parsed.hostname)) return null;
  const match = parsed.pathname.match(T_ME_USERNAME);
  if (!match || RESERVED_T_ME_PATHS.test(match[1])) return null;
  return match[1];
}

/** Peer id from Web K (`#-5132139658`) or private `t.me/c/<id>` links. */
function telegramChatId(url) {
  const parsed = parseTelegramUrl(url);
  if (!parsed) return null;

  if (WEB_TELEGRAM_HOST.test(parsed.hostname)) {
    const match = parsed.hash.match(HASH_CHAT_ID);
    return match ? match[1] : null;
  }

  if (!T_ME_HOST.test(parsed.hostname)) return null;
  const match = parsed.pathname.match(T_ME_PRIVATE_CHAT);
  if (!match) return null;
  // Private channel/supergroup links omit the Bot API -100 prefix.
  return `-100${match[1]}`;
}

function copySearchParams(from, to) {
  from.searchParams.forEach((value, key) => {
    to.searchParams.set(key, value);
  });
  return to.toString();
}

/**
 * Canonical HTTPS URL for schema/copy/mobile. Public handles become `t.me/<user>`;
 * chat-id peers stay on Web K (no public username to hand off via t.me).
 * Click handlers should use `telegramInviteHref` so desktop prefers Web K.
 */
export function toTelegramUniversalUrl(url) {
  if (!url || typeof url !== "string") return url;
  const parsed = parseTelegramUrl(url);
  if (!parsed) return url;

  const handle = telegramPublicHandle(url);
  if (handle) {
    const next = new URL(`https://t.me/${handle}`);
    return copySearchParams(parsed, next);
  }

  const chatId = telegramChatId(url);
  if (chatId) {
    // Channels/supergroups: t.me/c hands off to the native app on mobile.
    if (/^-100\d+$/.test(chatId)) {
      const next = new URL(`https://t.me/c/${chatId.slice(4)}/1`);
      return copySearchParams(parsed, next);
    }
    // Basic group / raw peer id: Web K is the stable HTTPS deep link.
    const next = new URL(`https://web.telegram.org/k/#${chatId}`);
    return copySearchParams(parsed, next);
  }

  if (T_ME_HOST.test(parsed.hostname)) {
    parsed.protocol = "https:";
    parsed.hostname = "t.me";
    return parsed.toString();
  }

  return url;
}

/** Desktop Telegram Web K deep link (`#@user` or `#-chatId`). */
export function toTelegramWebKUrl(url) {
  const handle = telegramPublicHandle(url);
  if (handle) return `https://web.telegram.org/k/#@${handle}`;
  const chatId = telegramChatId(url);
  if (chatId) return `https://web.telegram.org/k/#${chatId}`;
  return url;
}

/**
 * Channel / group invite: same split as Lemuel's concierge bot.
 * Desktop: Web K opens the chat. Mobile: t.me when a public/private path exists;
 * otherwise Web K chat-id deep links.
 */
export function telegramInviteHref(url) {
  if (!url) return url;
  const resolved = prefersNativeTelegram() ? toTelegramUniversalUrl(url) : toTelegramWebKUrl(url);
  return withUtm(resolved);
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
