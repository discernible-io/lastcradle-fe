/**
 * Cookieless land attribution for lastcradle.io.
 *
 * Sibling emit contract (step ladder land → mint → verify → play → complete):
 * discernible-io/idclawserver-idc → content/developer-growth-plan.md and src/lib/funnel.js.
 *
 * Hard rule: never Set-Cookie / document.cookie / localStorage visitor ids for stitching
 * without consent. Prefer URL/query forwarding. sessionStorage may keep UTM + funnel_id
 * pass-through for SPA hops (already used here) — not a cross-domain stitch key.
 */

const STORAGE_KEY = "slc_utm";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
/** Pre-Passport hop stitch; `vid` is an inbound alias folded into `funnel_id`. */
const FUNNEL_ID_KEYS = ["funnel_id", "vid"];
const ATTR_KEYS = [...UTM_KEYS, "funnel_id"];

export const LAND_DOMAIN = "lastcradle.io";
const HOME_API_LAND = "https://api.identyclaw.com/api/funnel/land";

let landEmitted = false;

function pickParam(params, key) {
  const value = params.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function mintFunnelId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `fid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStored(attrs) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attrs));
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Keep funnel_id (and inbound UTMs) visible on the address bar for hop forwarding.
 * Does not plant cookies or localStorage visitor ids.
 */
function syncAttributionToUrl(attrs) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  let changed = false;

  for (const key of UTM_KEYS) {
    if (attrs[key] && url.searchParams.get(key) !== attrs[key]) {
      url.searchParams.set(key, attrs[key]);
      changed = true;
    }
  }

  if (attrs.funnel_id) {
    if (url.searchParams.get("funnel_id") !== attrs.funnel_id) {
      url.searchParams.set("funnel_id", attrs.funnel_id);
      changed = true;
    }
    if (url.searchParams.has("vid")) {
      url.searchParams.delete("vid");
      changed = true;
    }
  }

  if (changed) {
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  }
}

/**
 * Capture inbound utm_* + optional funnel_id (alias vid) from the URL.
 * Mints an opaque UUID into the URL when funnel_id is absent.
 */
export function captureUtm(search) {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(search || window.location.search);
  const fromUrl = {};

  for (const key of UTM_KEYS) {
    const value = pickParam(params, key);
    if (value) fromUrl[key] = value;
  }

  const inboundFunnel =
    pickParam(params, "funnel_id") || pickParam(params, "vid") || null;

  const stored = readStored();
  const merged = { ...stored, ...fromUrl };

  if (inboundFunnel) {
    merged.funnel_id = inboundFunnel;
  } else if (!merged.funnel_id) {
    merged.funnel_id = mintFunnelId();
  }

  writeStored(merged);
  syncAttributionToUrl(merged);
  return merged;
}

export function getUtm() {
  const stored = readStored();
  if (stored.funnel_id || UTM_KEYS.some((k) => stored[k])) return stored;
  return captureUtm();
}

/** Attribution fields suitable for query / JSON body. */
export function attributionFields(attrs = getUtm()) {
  const out = {};
  for (const key of ATTR_KEYS) {
    if (attrs[key]) out[key] = attrs[key];
  }
  return out;
}

/** X-Utm-* / X-Funnel-Id headers for enroll / API joins. */
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

/** Stamp stored utm_* + funnel_id onto an absolute URL (purchase CTAs, Telegram, etc.). */
export function withUtm(url) {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("/") || url.startsWith("#")) return url;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  const attrs = getUtm();
  for (const key of ATTR_KEYS) {
    if (attrs[key] && !parsed.searchParams.has(key)) {
      parsed.searchParams.set(key, attrs[key]);
    }
  }
  // Prefer canonical funnel_id over leftover vid on outbound links.
  if (attrs.funnel_id && parsed.searchParams.has("vid") && !parsed.searchParams.has("funnel_id")) {
    parsed.searchParams.set("funnel_id", attrs.funnel_id);
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
 * Emit funnel.land once per page load via home-API cookieless beacon
 * (GET https://api.identyclaw.com/api/funnel/land — allowlisted domain lastcradle.io).
 * credentials:omit + mode:no-cors so CORS does not block the fire-and-forget hop.
 */
export function emitFunnelLandOnce() {
  if (landEmitted || typeof window === "undefined") return;
  landEmitted = true;

  const attrs = getUtm();
  const params = new URLSearchParams(attributionFields(attrs));
  params.set("domain", LAND_DOMAIN);
  params.set("step", "land");
  const beaconUrl = `${HOME_API_LAND}?${params.toString()}`;

  try {
    fetch(beaconUrl, {
      method: "GET",
      credentials: "omit",
      mode: "no-cors",
      cache: "no-store",
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Beacon is best-effort; CTA / enroll forward still carries attribution.
  }
}

export { UTM_KEYS, FUNNEL_ID_KEYS, ATTR_KEYS };
