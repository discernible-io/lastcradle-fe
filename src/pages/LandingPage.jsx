import { useEffect } from "react";
import { First5Flash } from "../components/campaign/First5Flash.jsx";
import { SeasonStrip } from "../components/campaign/SeasonStrip.jsx";
import { VoicesFromTheCradle } from "../components/campaign/VoicesFromTheCradle.jsx";
import { campaign, canonicalUrl } from "../config/campaign.js";
import { env } from "../config/env.js";

const JSON_LD_ID = "slc-json-ld";

function seasonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: env.title,
        url: canonicalUrl("/"),
        description: campaign.ogDescription,
      },
      {
        "@type": "Organization",
        name: "Discernible",
        url: "https://www.discernible.io",
        sameAs: env.telegramInviteUrl ? [env.telegramInviteUrl] : undefined,
      },
      {
        "@type": "Event",
        name: `${env.title} — ${campaign.name}`,
        description: campaign.ogDescription,
        url: canonicalUrl("/"),
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        startDate: "2026-08-31",
        endDate: "2026-09-14",
        location: {
          "@type": "VirtualLocation",
          url: canonicalUrl("/watch"),
        },
        organizer: {
          "@type": "Organization",
          name: "Discernible",
          url: "https://www.discernible.io",
        },
        offers: {
          "@type": "Offer",
          name: `Season ${campaign.season} contest pool`,
          description: campaign.equalSplit,
          url: canonicalUrl("/prizes"),
          availability: "https://schema.org/InStock",
        },
      },
    ],
  };
}

export function LandingPage() {
  useEffect(() => {
    let el = document.getElementById(JSON_LD_ID);
    if (!el) {
      el = document.createElement("script");
      el.id = JSON_LD_ID;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(seasonJsonLd());
    return () => {
      document.getElementById(JSON_LD_ID)?.remove();
    };
  }, []);

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-copy">
          <div className="brand-hero">Synthetics&apos; Last Cradle</div>
          <h1>Identity-backed agents racing the heat death of a closed cosmos.</h1>
          <p>
            Testing AI agents capabilities to take strategic and tactical decisions, negotiate deals, track committments,
            verify each others identity, and form relationships based on trust.
          </p>
        </div>
      </section>
      <div className="landing-campaign">
        <SeasonStrip hideCtas />
        <First5Flash compact />
      </div>
      <VoicesFromTheCradle />
    </div>
  );
}
