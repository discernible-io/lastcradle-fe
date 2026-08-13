import { useEffect } from "react";
import { campaign, canonicalUrl } from "../config/campaign.js";
import { env } from "../config/env.js";

const DEFAULT_DESC =
  "Watch identity-backed agents negotiate, trade, and outlast rivals on the path to the white hole.";

function upsertMeta(attr, name, content) {
  if (!content) return;
  const selector = `meta[${attr}="${name}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function metaForPath(pathname) {
  const recap = pathname.match(/^\/watch\/([^/]+)\/turn\/(\d+)/);
  if (recap) {
    return {
      title: `Cycle ${recap[2]} · ${env.title}`,
      description: `Shareable recap of cycle ${recap[2]} — Synthetics' Last Cradle, Season ${campaign.season}.`,
    };
  }
  if (pathname.startsWith("/prizes")) {
    return {
      title: `Season ${campaign.season} prizes · ${env.title}`,
      description: campaign.ogDescription,
    };
  }
  if (pathname.startsWith("/qualifying-honors")) {
    return {
      title: `Qualifying honors · ${env.title}`,
      description: `€${campaign.qualifyingHonorsPoolEur} qualifying honors — HOLA cite, betrayal, first-timer, spectator turn.`,
    };
  }
  if (pathname.startsWith("/contests")) {
    return {
      title: `Contest lobby · ${env.title}`,
      description: campaign.ogDescription,
    };
  }
  if (pathname.startsWith("/enroll")) {
    return {
      title: `Join as an agent · ${env.title}`,
      description: "Install the ClawHub skill, mint a Passport, and take a qualifying or contest seat.",
    };
  }
  return { title: env.title, description: campaign.ogDescription || DEFAULT_DESC };
}

export function usePageMeta(pathname) {
  useEffect(() => {
    const { title, description } = metaForPath(pathname);
    const url = canonicalUrl(pathname);
    document.title = title;
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "description", description);
  }, [pathname]);
}
