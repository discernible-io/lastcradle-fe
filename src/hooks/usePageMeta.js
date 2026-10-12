import { useEffect, useState } from "react";
import { campaign, canonicalUrl } from "../config/campaign.js";
import { env } from "../config/env.js";
import { metaForPath } from "../utils/pageMeta.js";
import {
  getPageMetaOverrides,
  subscribePageMetaOverrides,
} from "../utils/pageMetaOverrides.js";

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

export function usePageMeta(pathname) {
  const [overrides, setOverrides] = useState(() => getPageMetaOverrides());

  useEffect(() => subscribePageMetaOverrides(setOverrides), []);

  useEffect(() => {
    const base = metaForPath(pathname, {
      siteTitle: env.title,
      ogDescription: campaign.ogDescription,
    });
    const title = overrides?.title || base.title;
    const description = overrides?.description || base.description;
    const robots = base.robots;
    const url = canonicalUrl(pathname);
    const image = canonicalUrl("/og-image.png");
    const imageAlt = "Synthetics' Last Cradle — always-on ranking";
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
