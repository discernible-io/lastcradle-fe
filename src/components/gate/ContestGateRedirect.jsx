import { Navigate, useLocation } from "react-router-dom";
import { useContestGate } from "../../hooks/useContestGate.js";

/**
 * Hard-gates /watch* until the contest entrance guide is acknowledged.
 * Redirects to /?next=<path> so the guide can resume after CTA.
 */
export function ContestGateRedirect({ children }) {
  const { ready, seen } = useContestGate();
  const loc = useLocation();

  if (!ready) {
    return (
      <p className="muted" style={{ margin: "2rem auto", maxWidth: "var(--max)", padding: "0 1rem" }}>
        Loading…
      </p>
    );
  }

  if (!seen) {
    const next = `${loc.pathname}${loc.search}${loc.hash}`;
    return <Navigate to={`/?next=${encodeURIComponent(next)}`} replace />;
  }

  return children;
}
