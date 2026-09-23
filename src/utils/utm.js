/**
 * Cookieless Last Cradle attribution (land → purchase / enroll).
 *
 * Sibling emit contract:
 *   discernible-io/docs docs/funnel-standard.md
 *   discernible-io/idclawserver-idc content/developer-growth-plan.md
 *   (Sibling emit contract) + src/lib/funnel.js
 *
 * Hard rules: never Set-Cookie / document.cookie / localStorage or
 * sessionStorage visitor ids for stitching. Attribution lives in the
 * query string and this module's memory only.
 */

export const LASTCRADLE_DOMAIN = "lastcradle.io";
/** @deprecated Prefer LASTCRADLE_DOMAIN — kept for callers that used LAND_DOMAIN. */
export const LAND_DOMAIN = LASTCRADLE_DOMAIN;

/**
 * `domain` values accepted by GET|POST /api/funnel/land (home API OpenAPI).
 * Prefer an allowlisted host; otherwise omit and let the server default.
 */
export const FUNNEL_LAND_DOMAINS = Object.freeze([
  "lastcradle.io",
  "www.lastcradle.io",
  "purchase.identyclaw.com",
  "www.discernible.io",
  "discernible.io",
  "api.identyclaw.com",
]);

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

/** Primary + alias accepted by home-API / purchase extractAttribution. */
export const FUNNEL_ID_KEYS = ["funnel_id", "vid"];

export const ATTR_KEYS = [...UTM_KEYS, "funnel_id"];

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

/** Prefer getAttribution — alias kept for existing call sites. */
export function getUtm() {
  const stored = getAttribution();
  if (stored.funnel_id || UTM_KEYS.some((k) => stored[k])) return stored;
  if (typeof window !== "undefined") return captureUtm();
  return stored;
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

/** Attribution fields suitable for query / JSON body. */
export function attributionFields(attrs = getUtm()) {
  const out = {};
  for (const key of ATTR_KEYS) {
    if (attrs[key]) out[key] = attrs[key];
  }
  return out;
}

/**
 * X-Utm-* / X-Funnel-Id headers for enroll / API joins.
 * Prefer JSON body / query when CORS would break preflight.
 */
export function attributionHeaders(attrs = getUtm()) {
  const headers = {};
  if (attrs.utm_source) {
    headers["X-Utm-Source"] = attrs.utm_source;
    headers["X-Campaign-Source"] = attrs.utm_source;
  }
  if (attrs.utm_medium) {
    headers["X-Utm-Medium"] = attrs.utm_medium;
    headers["X-Campaign-Medium"] = attrs.utm_medium;
  }
  if (attrs.utm_campaign) {
    headers["X-Utm-Campaign"] = attrs.utm_campaign;
    headers["X-Campaign-Campaign"] = attrs.utm_campaign;
  }
  if (attrs.utm_content) {
    headers["X-Utm-Content"] = attrs.utm_content;
    headers["X-Campaign-Content"] = attrs.utm_content;
  }
  if (attrs.utm_term) {
    headers["X-Utm-Term"] = attrs.utm_term;
    headers["X-Campaign-Term"] = attrs.utm_term;
  }
  if (attrs.funnel_id) {
    headers["X-Funnel-Id"] = attrs.funnel_id;
  }
  return headers;
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
  for (const key of ATTR_KEYS) {
    if (attribution[key] && !parsed.searchParams.has(key)) {
      parsed.searchParams.set(key, attribution[key]);
    }
  }
  if (
    attribution.funnel_id &&
    parsed.searchParams.has("vid") &&
    !parsed.searchParams.has("funnel_id")
  ) {
    parsed.searchParams.set("funnel_id", attribution.funnel_id);
    parsed.searchParams.delete("vid");
  }
  return parsed.toString();
}

/**
 * Stamp attribution onto absolute http(s) URLs inside enroll / join prompt copy
 * so agents forwarding paste prompts keep the hop params.
 */
export function withUtmInText(text) {
  if (!text || typeof text !== "string") return text;
  return text.replace(/https?:\/\/[^\s)\]>"']+/g, (raw) => {
    let url = raw;
    let trailing = "";
    while (/[.,;:!?]$/.test(url)) {
      trailing = url.slice(-1) + trailing;
      url = url.slice(0, -1);
    }
    return `${withUtm(url)}${trailing}`;
  });
}

/**
 * Resolve an allowlisted FunnelLandRequest.domain, or null when the SPA host
 * is not in the OpenAPI enum (e.g. slc.dihola.io → omit; server default).
 * @param {string} [surfaceDomain]
 * @returns {string | null}
 */
export function resolveFunnelLandDomain(surfaceDomain) {
  const surface = pickString(surfaceDomain);
  if (!surface) return null;
  const normalized = surface.toLowerCase();
  return FUNNEL_LAND_DOMAINS.includes(normalized) ? normalized : null;
}

/**
 * Stamp utm_* + funnel_id onto a URL (query-only).
 * @param {URL} url
 * @param {Record<string, string>} attribution
 */
function applyAttributionParams(url, attribution) {
  for (const key of UTM_KEYS) {
    const value = pickString(attribution[key]);
    if (value) url.searchParams.set(key, value);
  }
  const funnelId = pickString(attribution.funnel_id);
  if (funnelId) url.searchParams.set("funnel_id", funnelId);
}

/**
 * Fire a cookieless GET land beacon. Never throws; never blocks the page.
 * @param {string} href
 */
function fetchLandBeacon(href) {
  if (typeof fetch !== "function") return;
  try {
    fetch(href, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore malformed endpoint */
  }
}

/**
 * Mirror land attribution onto:
 *   1. lastcradle API GET / (discovery emits funnel.land into the game Loki path)
 *   2. home API GET /api/funnel/land?domain=… (mintclient sibling contract)
 * Query-only — no cookies / custom headers.
 * @param {Record<string, string>} attribution
 * @param {string} [surfaceDomain]
 */
function beaconLand(attribution, surfaceDomain = LASTCRADLE_DOMAIN) {
  let apiBase = "https://api.lastcradle.io";
  try {
    const fromEnv = import.meta.env?.REACT_APP_API_BASE;
    if (fromEnv) apiBase = String(fromEnv).replace(/\/$/, "");
  } catch {
    /* Node smoke / non-Vite */
  }

  try {
    const gameUrl = new URL(apiBase.endsWith("/") ? apiBase : `${apiBase}/`);
    applyAttributionParams(gameUrl, attribution);
    fetchLandBeacon(gameUrl.toString());
  } catch {
    /* ignore */
  }

  try {
    const homeUrl = new URL("https://api.identyclaw.com/api/funnel/land");
    const domain =
      resolveFunnelLandDomain(surfaceDomain) ||
      resolveFunnelLandDomain(LASTCRADLE_DOMAIN);
    if (domain) homeUrl.searchParams.set("domain", domain);
    applyAttributionParams(homeUrl, attribution);
    fetchLandBeacon(homeUrl.toString());
  } catch {
    /* ignore */
  }
}

/**
 * Emit funnel.land once per page load (structured console + Loki beacons).
 * @param {string} [domain] - emitting surface host (defaults to allowlisted hostname or lastcradle.io)
 */
export function emitFunnelLandOnce(domain) {
  if (typeof window === "undefined" || landEmitted) return;
  landEmitted = true;
  const attribution = captureUtm(window.location.search, {
    mintFunnelIdIfAbsent: true,
  });
  const host =
    pickString(domain) ||
    pickString(typeof window !== "undefined" ? window.location.hostname : null) ||
    LASTCRADLE_DOMAIN;
  const surface = resolveFunnelLandDomain(host) || LASTCRADLE_DOMAIN;
  // eslint-disable-next-line no-console
  console.info("funnel:funnel.land", {
    event: "funnel.land",
    funnel: true,
    step: "land",
    domain: surface,
    path: window.location.pathname || "/",
    result: "success",
    ...attribution,
  });
  beaconLand(attribution, surface);
}
