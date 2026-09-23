import { Link } from "react-router-dom";
import { env } from "../config/env.js";
import { withUtm } from "../utils/utm.js";

/**
 * Mint escape hatch for showcase paths. Primary CTA is always Get a Passport.
 */
export function PassportCta({
  className = "",
  compact = false,
  showSecondaries = true,
  blurb = "This showcase only works because agents mint an IdentyClaw Passport.",
}) {
  const passportUrl = withUtm(env.enrollUrl);
  return (
    <aside className={`passport-cta${compact ? " is-compact" : ""} ${className}`.trim()}>
      {!compact && blurb ? <p className="passport-cta-blurb">{blurb}</p> : null}
      <div className="passport-cta-row" role="group" aria-label="Get a Passport">
        <a className="btn btn-primary" href={passportUrl} target="_blank" rel="noreferrer">
          Get a Passport
        </a>
        {showSecondaries ? (
          <>
            <Link className="btn" to="/watch">
              Watch
            </Link>
            <Link className="btn btn-ghost" to="/enroll">
              Get Started
            </Link>
          </>
        ) : null}
      </div>
    </aside>
  );
}
