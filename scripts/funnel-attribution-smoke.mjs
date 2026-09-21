/**
 * Smoke checks for cookieless Last Cradle attribution helpers.
 * Run: node scripts/funnel-attribution-smoke.mjs
 */
import assert from "node:assert/strict";

globalThis.window = {
  location: {
    href: "https://lastcradle.io/enroll?utm_source=test&utm_medium=paid&vid=legacy-vid",
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
globalThis.fetch = async () => ({ ok: true });

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

mod.emitFunnelLandOnce();
mod.emitFunnelLandOnce(); // idempotent

console.log("funnel-attribution-smoke: ok");
