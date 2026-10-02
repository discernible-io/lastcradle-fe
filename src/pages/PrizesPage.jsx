import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { First5Flash } from "../components/campaign/First5Flash.jsx";
import { HallOfFameBoard } from "../components/campaign/HallOfFameBoard.jsx";
import { OfficialPrizeRules } from "../components/campaign/OfficialPrizeRules.jsx";
import { PrizeTrustPanel } from "../components/campaign/PrizeTrustPanel.jsx";
import { SeasonStrip } from "../components/campaign/SeasonStrip.jsx";
import { campaign } from "../config/campaign.js";
import { withUtm } from "../utils/utm.js";

const PRIZE_HASHES = new Set(["#hall-of-fame", "#prize-rules"]);

export function PrizesPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!PRIZE_HASHES.has(hash)) return undefined;
    const id = window.requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [hash]);

  return (
    <div className="prizes-page">
      <SeasonStrip compact />
      <h1 style={{ fontSize: "1.75rem", margin: "1.25rem 0 0.35rem" }}>Prize trust</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Season {campaign.season} starts {campaign.startsOn}. Payouts are public: pool, equal-split rules, SLA, and
        proof of payment after the contest finale. Contest series earn{" "}
        <Link to="#hall-of-fame">Hall of Fame</Link> entries. Live contest and qualifying arenas:{" "}
        <Link to="/watch#contests">Watch Arena</Link>. <Link to="#prize-rules">Official Prize Rules</Link> are below.
        Updates:{" "}
        <a href={withUtm(campaign.updatesUrl)} target="_blank" rel="noreferrer">
          Discernible.io mailing list
        </a>
        .
      </p>
      <OfficialPrizeRules />
      <PrizeTrustPanel />
      <div style={{ marginTop: "1rem" }}>
        <First5Flash />
      </div>
      <HallOfFameBoard />
    </div>
  );
}
