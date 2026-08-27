#!/usr/bin/env node
/**
 * Fail-open OG/meta injector for /watch/:gameId/turn/:n
 * Nginx proxies matching HTML GETs here; on any failure we serve stock index.html.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRecapHeadline, recapDocumentTitle, recapOgDescription } from "../shared/recapHeadline.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = process.env.OG_RUNTIME_CONFIG || path.join(__dirname, "og-runtime.json");

function loadConfig() {
  const defaults = {
    apiBase: "",
    publicOrigin: "",
    siteTitle: "Synthetics' Last Cradle",
    season: 1,
    htmlPath: "/usr/share/nginx/html/index.html",
    listenHost: "127.0.0.1",
    listenPort: 8080,
    tlsInsecure: false,
    cacheTtlMs: 60000,
    fetchTimeoutMs: 2500,
  };
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    return { ...defaults, ...raw };
  } catch {
    return defaults;
  }
}

const cfg = loadConfig();
if (cfg.tlsInsecure) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const LISTEN_HOST = cfg.listenHost || "127.0.0.1";
const LISTEN_PORT = Number(cfg.listenPort) || 8080;
const HTML_PATH = cfg.htmlPath || "/usr/share/nginx/html/index.html";
const API_BASE = String(cfg.apiBase || "").replace(/\/$/, "");
const PUBLIC_ORIGIN = String(cfg.publicOrigin || "").replace(/\/$/, "");
const SITE_TITLE = cfg.siteTitle || "Synthetics' Last Cradle";
const SEASON = Number(cfg.season) || 1;
const CACHE_TTL_MS = Number(cfg.cacheTtlMs) || 60000;
const FETCH_TIMEOUT_MS = Number(cfg.fetchTimeoutMs) || 2500;

const RECAP_PATH = /^\/watch\/([^/]+)\/turn\/(\d+)\/?$/;
const cache = new Map();

function log(msg, extra) {
  const line = extra ? `${msg} ${JSON.stringify(extra)}` : msg;
  console.log(`[og-inject] ${line}`);
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function upsertMeta(html, attr, name, content) {
  const safe = escapeAttr(content);
  const re = new RegExp(`<meta\\s+[^>]*${attr}=["']${name}["'][^>]*>`, "i");
  const tag = `<meta ${attr}="${name}" content="${safe}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function upsertLinkCanonical(html, href) {
  const safe = escapeAttr(href);
  const re = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
  const tag = `<link rel="canonical" href="${safe}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function injectMeta(html, { title, description, url, image }) {
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(title)}</title>`);
  out = upsertLinkCanonical(out, url);
  out = upsertMeta(out, "name", "description", description);
  out = upsertMeta(out, "property", "og:title", title);
  out = upsertMeta(out, "property", "og:description", description);
  out = upsertMeta(out, "property", "og:url", url);
  out = upsertMeta(out, "property", "og:image", image);
  out = upsertMeta(out, "property", "og:type", "website");
  out = upsertMeta(out, "property", "og:site_name", SITE_TITLE);
  out = upsertMeta(out, "name", "twitter:card", "summary_large_image");
  out = upsertMeta(out, "name", "twitter:title", title);
  out = upsertMeta(out, "name", "twitter:description", description);
  out = upsertMeta(out, "name", "twitter:image", image);
  return out;
}

function readIndexHtml() {
  return fs.readFileSync(HTML_PATH, "utf8");
}

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    cache.delete(key);
    return null;
  }
  return hit.html;
}

function cacheSet(key, html) {
  cache.set(key, { html, expires: Date.now() + CACHE_TTL_MS });
  if (cache.size > 200) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

async function fetchTurnCounts(gameId, turn) {
  if (!API_BASE) return null;
  const url = `${API_BASE}/api/game/games/${encodeURIComponent(gameId)}/turns?playedOnly=1`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`turns HTTP ${res.status}`);
  const data = await res.json();
  const turns = Array.isArray(data?.turns) ? data.turns : Array.isArray(data) ? data : [];
  const row = turns.find((t) => Number(t.turn) === turn);
  if (!row) return { eliminationCount: 0, tradeCount: 0, messageCount: 0, known: false };
  return {
    known: true,
    eliminationCount: Number(row.eliminationCount) || 0,
    tradeCount: Number(row.tradeCount) || (row.hasTrades ? 1 : 0),
    messageCount: Number(row.messageCount) || (row.hasMessages ? 1 : 0),
  };
}

async function buildInjectedHtml(gameId, turn) {
  const cacheKey = `${gameId}:${turn}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const base = readIndexHtml();
  const pathname = `/watch/${encodeURIComponent(gameId)}/turn/${turn}`;
  const url = `${PUBLIC_ORIGIN}${pathname}`;
  const image = `${PUBLIC_ORIGIN}/og-image.png`;

  let headline = buildRecapHeadline(turn);
  try {
    const counts = await fetchTurnCounts(gameId, turn);
    if (counts) {
      headline = buildRecapHeadline(turn, counts);
    }
  } catch (err) {
    log("api_fallback", { gameId, turn, error: String(err?.message || err) });
  }

  const title = recapDocumentTitle(headline, SITE_TITLE);
  const description = recapOgDescription(turn, { season: SEASON, siteName: SITE_TITLE });
  const html = injectMeta(base, { title, description, url, image });
  cacheSet(cacheKey, html);
  return html;
}

function sendHtml(res, status, html) {
  const body = Buffer.from(html, "utf8");
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "public, max-age=60",
  });
  res.end(body);
}

function sendFallback(res) {
  try {
    sendHtml(res, 200, readIndexHtml());
  } catch (err) {
    log("fallback_read_failed", { error: String(err?.message || err) });
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Unavailable");
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end();
      return;
    }
    const pathOnly = String(req.url || "/").split("?")[0];
    if (pathOnly === "/healthz") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }
    const match = pathOnly.match(RECAP_PATH);
    if (!match) {
      sendFallback(res);
      return;
    }
    const gameId = decodeURIComponent(match[1]);
    const turn = Number(match[2]);
    if (!gameId || !Number.isFinite(turn) || turn < 1) {
      sendFallback(res);
      return;
    }
    const html = await buildInjectedHtml(gameId, turn);
    if (req.method === "HEAD") {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": Buffer.byteLength(html, "utf8"),
        "Cache-Control": "public, max-age=60",
      });
      res.end();
      return;
    }
    sendHtml(res, 200, html);
  } catch (err) {
    log("request_error", { error: String(err?.message || err) });
    sendFallback(res);
  }
});

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
  log("listening", {
    host: LISTEN_HOST,
    port: LISTEN_PORT,
    apiBase: API_BASE || null,
    publicOrigin: PUBLIC_ORIGIN || null,
    config: CONFIG_PATH,
  });
});
