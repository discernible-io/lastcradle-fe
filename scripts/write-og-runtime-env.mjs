#!/usr/bin/env node
/**
 * Emit /app/server/og-runtime.json from the synced Vite .env (build-time).
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env");
const outPath = path.join(root, "server", "og-runtime.json");

function parseEnv(text) {
  const out = {};
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = parseEnv(fs.readFileSync(envPath, "utf8"));
const apiBase = String(env.REACT_APP_API_BASE || "").replace(/\/$/, "");
const publicOrigin = String(env.REACT_APP_PUBLIC_ORIGIN || "").replace(/\/$/, "");
const siteTitle = env.REACT_APP_TITLE || "Synthetics' Last Cradle";
const tlsInsecure = /:(9443)\b/.test(apiBase) || /dihola\.io/.test(publicOrigin);

const body = {
  apiBase,
  publicOrigin,
  siteTitle,
  season: 1,
  htmlPath: "/usr/share/nginx/html/spa-shell.html",
  listenHost: "127.0.0.1",
  listenPort: 8080,
  tlsInsecure,
  cacheTtlMs: 60000,
  fetchTimeoutMs: 2500,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(body, null, 2)}\n`);
console.log(`wrote ${outPath}`);
