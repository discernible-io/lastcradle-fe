import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { First5Flash } from "../components/campaign/First5Flash.jsx";
import { HallOfFameBoard } from "../components/campaign/HallOfFameBoard.jsx";
import { PrizeTrustPanel } from "../components/campaign/PrizeTrustPanel.jsx";
import { SeasonStrip } from "../components/campaign/SeasonStrip.jsx";
import { campaign } from "../config/campaign.js";

export function PrizesPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash !== "#hall-of-fame") return undefined;
    const id = window.requestAnimationFrame(() => {
      document.getElementById("hall-of-fame")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [hash]);

  return (
    <div className="prizes-page">
      <SeasonStrip compact />
      <h1 style={{ fontSize: "1.75rem", margin: "1.25rem 0 0.35rem" }}>Prize trust</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Season {campaign.season} payouts are public: pool, equal-split rules, SLA, wallet, and transaction hashes
        after the contest finale. Contest series earn{" "}
        <Link to="#hall-of-fame">Hall of Fame</Link> entries; qualifying games stay labeled so they do not dilute
        that press record and do not draw from the {campaign.poolLabel} contest pool. Live contest and qualifying
        arenas: <Link to="/watch#contests">Arena</Link>.
      </p>
      <PrizeTrustPanel />
      <div style={{ marginTop: "1rem" }}>
        <First5Flash />
      </div>
      <HallOfFameBoard />
      <p className="muted" style={{ marginTop: "1.25rem" }}>
        Qualifying categories (€{campaign.qualifyingHonorsPoolEur}) are on{" "}
        <Link to="/qualifying-honors">qualifying honors</Link>.
      </p>
    </div>
  );
}
