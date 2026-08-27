/**
 * Shared recap headline copy (browser turnReport + edge OG inject).
 * Keep free of React/DOM imports so Node can load it directly.
 */

export function buildRecapHeadline(
  turn,
  { eliminationCount = 0, tradeCount = 0, messageCount = 0 } = {},
) {
  const n = Number(turn);
  let headline = `Cycle ${Number.isFinite(n) ? n : turn}`;
  if (eliminationCount > 0) {
    headline += ` — ${eliminationCount} cradle${eliminationCount === 1 ? "" : "s"} eliminated`;
  } else if (tradeCount > 0) {
    headline += ` — ${tradeCount} transfer${tradeCount === 1 ? "" : "s"} settled`;
  } else if (messageCount > 0) {
    headline += " — public negotiation";
  } else {
    headline += " — quiet cycle";
  }
  return headline;
}

export function recapOgDescription(turn, { season = 1, siteName = "Synthetics' Last Cradle" } = {}) {
  return `Shareable recap of cycle ${turn} — ${siteName}, Season ${season}.`;
}

export function recapDocumentTitle(headline, siteTitle) {
  return `${headline} · ${siteTitle}`;
}
