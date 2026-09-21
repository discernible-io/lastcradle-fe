/**
 * Cookieless Last Cradle attribution (land → purchase / enroll).
 *
 * Sibling emit contract:
 *   discernible-io/idclawserver-idc content/developer-growth-plan.md
 *   (Sibling emit contract) + src/lib/funnel.js
 *
 * Hard rules: never Set-Cookie / document.cookie / localStorage or
 * sessionStorage visitor ids for stitching. Attribution lives in the
 * query string and this module's memory only.
 */

export const LASTCRADLE_DOMAIN = "lastcradle.io";

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

/** Primary + alias accepted by home-API / purchase extractAttribution. */
export const FUNNEL_ID_KEYS = ["funnel_id", "vid"];

/** In-memory only — never persist to cookie / localStorage / sessionStorage. */
let memoryAttribution = null;
let landEmitted = false;

function pickString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function mintFunnelId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * @param {string} [search]
 * @returns {Record<string, string>}
 */
export function readAttributionFromSearch(search) {
  const attribution = {};
  if (typeof search !== "string" || !search) return attribution;
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  for (const key of UTM_KEYS) {
    const value = pickString(params.get(key));
    if (value) attribution[key] = value;
  }
  for (const key of FUNNEL_ID_KEYS) {
    const value = pickString(params.get(key));
    if (value) {
      attribution.funnel_id = value;
      break;
    }
  }
  return attribution;
}

/** @returns {Record<string, string>} */
export function getAttribution() {
  return memoryAttribution ? { ...memoryAttribution } : {};
}

/** @deprecated Prefer getAttribution — kept for existing call sites. */
export function getUtm() {
  return getAttribution();
}

/**
 * Merge inbound query attribution into memory; mint opaque funnel_id when absent.
 * Syncs UTMs + funnel_id onto the current URL (replaceState) — not a cookie.
 *
 * @param {string} [search]
 * @param {{ mintFunnelIdIfAbsent?: boolean }} [options]
 * @returns {Record<string, string>}
 */
export function captureUtm(search, options = {}) {
  const { mintFunnelIdIfAbsent = true } = options;
  if (typeof window === "undefined") return getAttribution();

  const fromUrl = readAttributionFromSearch(
    typeof search === "string" ? search : window.location.search,
  );
  const next = { ...(memoryAttribution || {}), ...fromUrl };

  if (mintFunnelIdIfAbsent && !pickString(next.funnel_id)) {
    next.funnel_id = mintFunnelId();
  }

  memoryAttribution = next;
  syncAttributionToUrl();
  return getAttribution();
}

function syncAttributionToUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const attribution = getAttribution();
  for (const key of UTM_KEYS) {
    const value = pickString(attribution[key]);
    if (value) url.searchParams.set(key, value);
  }
  const funnelId = pickString(attribution.funnel_id);
  if (funnelId) {
    url.searchParams.set("funnel_id", funnelId);
    url.searchParams.delete("vid");
  }
  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) {
    window.history.replaceState({}, document.title, next);
  }
}

/**
 * Stamp memory attribution (utm_* + funnel_id) onto an absolute URL.
 * Used for purchase.identyclaw.com CTAs and other outbound funnel hops.
 */
export function withUtm(url) {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("/") || url.startsWith("#")) return url;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  const attribution = getAttribution();
  for (const key of UTM_KEYS) {
    if (attribution[key] && !parsed.searchParams.has(key)) {
      parsed.searchParams.set(key, attribution[key]);
    }
  }
  const funnelId = pickString(attribution.funnel_id);
  if (funnelId && !parsed.searchParams.has("funnel_id")) {
    parsed.searchParams.set("funnel_id", funnelId);
  }
  return parsed.toString();
}

/**
 * Mirror land attribution onto lastcradle API GET / (and home API) so UTMs
 * reach the shared Loki tenant. Query-only — no cookies / custom headers.
 * @param {Record<string, string>} attribution
 */
function beaconLand(attribution) {
  if (typeof fetch !== "function") return;
  let apiBase = "https://api.lastcradle.io";
  try {
    const fromEnv = import.meta.env?.REACT_APP_API_BASE;
    if (fromEnv) apiBase = String(fromEnv).replace(/\/$/, "");
  } catch {
    /* Node smoke / non-Vite */
  }
  const bases = [apiBase, "https://api.identyclaw.com"].filter(Boolean);

  for (const base of bases) {
    try {
      const url = new URL(base.endsWith("/") ? base : `${base}/`);
      for (const key of UTM_KEYS) {
        const value = pickString(attribution[key]);
        if (value) url.searchParams.set(key, value);
      }
      const funnelId = pickString(attribution.funnel_id);
      if (funnelId) url.searchParams.set("funnel_id", funnelId);
      url.searchParams.set("funnel_surface", LASTCRADLE_DOMAIN);
      fetch(url.toString(), {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* ignore malformed endpoint */
    }
  }
}

/**
 * Emit funnel.land once per page load (structured console + Loki beacons).
 */
export function emitFunnelLandOnce() {
  if (typeof window === "undefined" || landEmitted) return;
  landEmitted = true;
  const attribution = captureUtm(window.location.search, {
    mintFunnelIdIfAbsent: true,
  });
  // eslint-disable-next-line no-console
  console.info("funnel:funnel.land", {
    event: "funnel.land",
    funnel: true,
    step: "land",
    domain: LASTCRADLE_DOMAIN,
    path: window.location.pathname || "/",
    result: "success",
    ...attribution,
  });
  beaconLand(attribution);
}
