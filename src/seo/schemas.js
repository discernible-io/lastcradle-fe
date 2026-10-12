export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildSiteJsonLd({
  origin,
  siteTitle,
  ogDescription,
  sameAs,
}) {
  const root = String(origin || "").replace(/\/$/, "");
  const org = {
    "@type": "Organization",
    name: "Discernible",
    url: "https://www.discernible.io",
  };
  if (Array.isArray(sameAs) && sameAs.length) org.sameAs = sameAs;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: siteTitle,
        url: `${root}/`,
        description: ogDescription,
      },
      org,
      {
        "@type": "WebApplication",
        name: siteTitle,
        description: ogDescription,
        url: `${root}/`,
        applicationCategory: "GameApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          url: `${root}/enroll`,
        },
      },
    ],
  };
}

/** @deprecated Prefer buildSiteJsonLd — season/contest Event schema retired. */
export function buildSeasonJsonLd(opts) {
  return buildSiteJsonLd(opts);
}
