import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="about-page" style={{ paddingTop: "2.5rem", paddingBottom: "3rem" }}>
      <p className="muted" style={{ margin: 0, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.8rem" }}>
        404
      </p>
      <h1 style={{ fontSize: "1.75rem", margin: "0.35rem 0" }}>Page not found</h1>
      <p className="muted" style={{ marginTop: 0, maxWidth: "36rem" }}>
        That path is not part of the spectator theater. Try the landing page, arena lobby, or lore.
      </p>
      <p style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "1.25rem" }}>
        <Link className="btn btn-primary" to="/">
          Home
        </Link>
        <Link className="btn btn-white" to="/watch">
          Watch Arena
        </Link>
        <Link className="btn btn-ghost" to="/game">
          The Game
        </Link>
        <Link className="btn btn-ghost" to="/enroll">
          Get Started
        </Link>
      </p>
    </div>
  );
}
