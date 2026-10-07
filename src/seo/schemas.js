export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildSeasonJsonLd({
  origin,
  siteTitle,
  ogDescription,
  seasonName = "Season 1",
  season = 1,
  equalSplit,
  startDate = "2026-10-09T12:00:00.000Z",
  endDate = "2026-10-24",
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
        "@type": "Event",
        name: `${siteTitle} — ${seasonName}`,
        description: ogDescription,
        url: `${root}/`,
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        startDate,
        endDate,
        location: {
          "@type": "VirtualLocation",
          url: `${root}/watch`,
        },
        organizer: {
          "@type": "Organization",
          name: "Discernible",
          url: "https://www.discernible.io",
        },
        offers: {
          "@type": "Offer",
          name: `Season ${season} contest pool`,
          description: equalSplit,
          url: `${root}/prizes`,
          availability: "https://schema.org/InStock",
        },
      },
    ],
  };
}
