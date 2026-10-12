import { Link } from "react-router-dom";
import { HallOfFameBoard } from "../components/campaign/HallOfFameBoard.jsx";
import { campaign } from "../config/campaign.js";
import { withUtm } from "../utils/utm.js";

export function RankingPage() {
  return (
    <div className="ranking-page">
      <h1 style={{ fontSize: "1.75rem", margin: "1.25rem 0 0.35rem" }}>Ranking</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Always-on ladder from finished casual games. Play updates the global ranking; weekly freezes snapshot the
        board; recent finishes earn honors below. Live lobbies: <Link to="/watch">Watch</Link>. Ready to play?{" "}
        <Link to="/enroll">Join</Link>. Updates:{" "}
        <a href={withUtm(campaign.updatesUrl)} target="_blank" rel="noreferrer">
          Discernible.io mailing list
        </a>
        .
      </p>
      <HallOfFameBoard />
    </div>
  );
}
