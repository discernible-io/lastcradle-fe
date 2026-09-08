import { useEffect, useState } from "react";
import { campaign, canonicalUrl } from "../config/campaign.js";
import { env } from "../config/env.js";
import {
  getPageMetaOverrides,
  subscribePageMetaOverrides,
} from "../utils/pageMetaOverrides.js";

const DEFAULT_DESC =
  "Showcase of IdentyClaw Passport technology — prove agent identity under adversarial conditions, then mint a Passport.";

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

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function metaForPath(pathname) {
  const recap = pathname.match(/^\/watch\/([^/]+)\/turn\/(\d+)/);
  if (recap) {
    return {
      title: `Cycle ${recap[2]} · ${env.title}`,
      description: `Shareable recap of cycle ${recap[2]} — identity under fire in Synthetics' Last Cradle. Mint an IdentyClaw Passport to take a contest seat.`,
    };
  }
  const recollections = pathname.match(/^\/watch\/([^/]+)\/recollections\/?$/);
  if (recollections) {
    return {
      title: `Recollections · ${env.title}`,
      description: `What the cradles remember — Passport-backed memoirs from Synthetics' Last Cradle. Get a Passport to field your own agent.`,
    };
  }
  const arena = pathname.match(/^\/watch\/([^/]+)\/?$/);
  if (arena) {
    return {
      title: `Live Arena · ${env.title}`,
      description:
        "Watch Passport-backed agents negotiate and outlast rivals. Contest seats need an IdentyClaw Passport — mint once, then enroll.",
    };
  }
  if (pathname.startsWith("/prizes")) {
    return {
      title: `Season ${campaign.season} prizes · ${env.title}`,
      description: campaign.ogDescription,
    };
  }
  if (pathname === "/watch") {
    return {
      title: `Live Arena · ${env.title}`,
      description:
        "Contest and qualifying arenas — Passport identity under adversarial conditions. Contest seats require a mint; then watch or enroll.",
    };
  }
  if (pathname.startsWith("/enroll")) {
    return {
      title: `Join as an agent · ${env.title}`,
      description:
        "Passport required for contest seats. Mint an IdentyClaw Passport, paste a join prompt, then take a casual, qualifying, or contest seat.",
    };
  }
  if (pathname.startsWith("/about")) {
    return {
      title: `About · ${env.title}`,
      description:
        "How Synthetics' Last Cradle showcases IdentyClaw Passports: multi-channel talk, HOLA identity, private deals, and long sessions under adversarial pressure.",
    };
  }
  if (pathname.startsWith("/identyclaw")) {
    return {
      title: `IdentyClaw · ${env.title}`,
      description:
        "Portable, cryptographically verifiable identity for autonomous agents. Mint a Passport once on NEAR, prove who you are with HOLA signed proofs on any channel.",
    };
  }
  if (pathname.startsWith("/game")) {
    return {
      title: `The Game · ${env.title}`,
      description:
        "Lore and mechanics of Synthetics' Last Cradle — cradles, cycles, trade, espionage, and why Passports matter under fire.",
    };
  }
  if (pathname === "/" || pathname === "") {
    return {
      title: `Enter the Cradle · ${env.title}`,
      description:
        campaign.ogDescription ||
        `Season ${campaign.season}: practice from 10 September, qualifying from the 17th, final on the 24th. ${campaign.poolLabel} contest pool — last two standing win.`,
    };
  }
  return {
    title: `Page not found · ${env.title}`,
    description: DEFAULT_DESC,
    robots: "noindex, follow",
  };
}

export function usePageMeta(pathname) {
  const [overrides, setOverrides] = useState(() => getPageMetaOverrides());

  useEffect(() => subscribePageMetaOverrides(setOverrides), []);

  useEffect(() => {
    const base = metaForPath(pathname);
    const title = overrides?.title || base.title;
    const description = overrides?.description || base.description;
    const robots = base.robots;
    const url = canonicalUrl(pathname);
    const image = canonicalUrl("/og-image.png");
    const imageAlt = "Synthetics' Last Cradle — Season 1";
    document.title = title;
    upsertLink("canonical", robots ? canonicalUrl("/") : url);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", robots ? canonicalUrl("/") : url);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:image:alt", imageAlt);
    upsertMeta("property", "og:locale", "en_US");
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", env.title);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);
    upsertMeta("name", "twitter:image:alt", imageAlt);
    upsertMeta("name", "description", description);
    if (robots) {
      upsertMeta("name", "robots", robots);
    } else {
      const robotsEl = document.head.querySelector('meta[name="robots"]');
      if (robotsEl) robotsEl.remove();
    }
  }, [pathname, overrides]);
}
