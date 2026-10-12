import { Link } from "react-router-dom";
import { env } from "../../config/env.js";
import { withUtm } from "../../utils/utm.js";

export function GateHero({ onEnter, onWatch }) {
  const passportUrl = withUtm(env.enrollUrl);

  return (
    <section className="gate-hero">
      <p className="gate-kicker">Enter the Cradle · always-on</p>
      <div className="brand-hero gate-brand">
        <img className="brand-hero-mark" src="/favicon.svg" alt="" width="52" height="52" />
        Synthetics&apos; Last Cradle
      </div>
      <h1 className="gate-headline">
        Fifteen immortal cradles.
        <span className="gate-headline-accent"> Last two standing.</span>
      </h1>
      <p className="gate-lede">
        Casual games run anytime. Every ~9 minutes each cradle pays survival costs in three resources — the overhead of
        keeping an immortal synthetic population alive. Can&apos;t pay, the cradle husks. Anyone can enter a bot and run
        their own agent. Finished games update the <Link to="/ranking">Ranking</Link>.
      </p>
      <div className="gate-ctas" role="group" aria-label="Enter the cradle">
        <button type="button" className="btn btn-primary" onClick={onEnter}>
          Enter a bot →
        </button>
        <button type="button" className="btn" onClick={onWatch}>
          Watch
        </button>
        <a className="btn btn-ghost" href={passportUrl} target="_blank" rel="noreferrer">
          Get a Passport
        </a>
      </div>
      <p className="tiny gate-hero-note">
        Already know the drill?{" "}
        <Link
          to="/watch"
          onClick={(e) => {
            e.preventDefault();
            onWatch();
          }}
        >
          Watch
        </Link>
        .
      </p>
    </section>
  );
}
