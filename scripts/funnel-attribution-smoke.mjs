/**
 * Smoke checks for cookieless Last Cradle attribution helpers.
 * Run: node scripts/funnel-attribution-smoke.mjs
 */
import assert from "node:assert/strict";

const fetchCalls = [];

globalThis.window = {
  location: {
    href: "https://lastcradle.io/enroll?utm_source=test&utm_medium=paid&vid=legacy-vid",
    hostname: "lastcradle.io",
    pathname: "/enroll",
    search: "?utm_source=test&utm_medium=paid&vid=legacy-vid",
    hash: "",
  },
  history: {
    replaceState(_state, _title, url) {
      const full = new URL(url, "https://lastcradle.io");
      window.location.pathname = full.pathname;
      window.location.search = full.search;
      window.location.hash = full.hash;
      window.location.href = full.toString();
    },
  },
};
globalThis.document = { title: "Last Cradle" };
globalThis.fetch = async (href) => {
  fetchCalls.push(String(href));
  return { ok: true };
};

const mod = await import("../src/utils/utm.js");

const fromUrl = mod.readAttributionFromSearch(window.location.search);
assert.equal(fromUrl.utm_source, "test");
assert.equal(fromUrl.funnel_id, "legacy-vid");

const captured = mod.captureUtm(window.location.search);
assert.equal(captured.utm_source, "test");
assert.equal(captured.funnel_id, "legacy-vid");
assert.ok(window.location.search.includes("funnel_id=legacy-vid"));
assert.ok(!window.location.search.includes("vid="));

const stamped = mod.withUtm("https://purchase.identyclaw.com/");
assert.ok(stamped.includes("utm_source=test"));
assert.ok(stamped.includes("funnel_id=legacy-vid"));

const verifyStamped = mod.withUtm(
  "https://verify.identyclaw.com/?tokenId=abc123",
);
assert.ok(verifyStamped.includes("tokenId=abc123"));
assert.ok(verifyStamped.includes("utm_source=test"));
assert.ok(verifyStamped.includes("funnel_id=legacy-vid"));

assert.equal(mod.resolveFunnelLandDomain("lastcradle.io"), "lastcradle.io");
assert.equal(mod.resolveFunnelLandDomain("slc.dihola.io"), null);

fetchCalls.length = 0;
mod.emitFunnelLandOnce();
mod.emitFunnelLandOnce(); // idempotent

assert.equal(fetchCalls.length, 2);
assert.ok(
  fetchCalls.some((u) => u.startsWith("https://api.lastcradle.io/?") || u === "https://api.lastcradle.io/"),
);
assert.ok(
  fetchCalls.some((u) => u.includes("https://api.identyclaw.com/api/funnel/land?")),
);
const homeLand = fetchCalls.find((u) => u.includes("/api/funnel/land"));
assert.ok(homeLand.includes("domain=lastcradle.io"));
assert.ok(homeLand.includes("utm_source=test"));
assert.ok(homeLand.includes("funnel_id=legacy-vid"));
assert.ok(!homeLand.includes("funnel_surface="));

console.log("funnel-attribution-smoke: ok");
