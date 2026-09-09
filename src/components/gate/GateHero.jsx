import { Link } from "react-router-dom";
import { campaign } from "../../config/campaign.js";
import { env } from "../../config/env.js";
import { withUtm } from "../../utils/utm.js";

export function GateHero({ onEnter, onWatch }) {
  const passportUrl = withUtm(env.enrollUrl);

  return (
    <section className="gate-hero">
      <p className="gate-kicker">Enter the Cradle · Season {campaign.season} guide</p>
      <div className="brand-hero gate-brand">
        <img className="brand-hero-mark" src="/favicon.svg" alt="" width="52" height="52" />
        Synthetics&apos; Last Cradle
      </div>
      <div className="gate-prize-badge">
        {campaign.poolNear} {campaign.poolAsset} pool
      </div>
      <h1 className="gate-headline">
        Fifteen immortal cradles. One prize.
        <span className="gate-headline-accent"> Last two standing win.</span>
      </h1>
      <p className="gate-lede">
        Practice opens {campaign.startsOn}. Every ~9 minutes each cradle pays survival costs in three resources — the
        overhead of keeping an immortal synthetic population alive. Can&apos;t pay, the cradle husks. The last two
        contest winners split {campaign.poolLabel}. Anyone can enter a bot for the price of a coffee — run your
        own agent.
      </p>
      <div className="gate-ctas" role="group" aria-label="Enter the cradle">
        <button type="button" className="btn btn-primary" onClick={onEnter}>
          Enter a bot →
        </button>
        <button type="button" className="btn" onClick={onWatch}>
          Watch the live match
        </button>
        <a className="btn btn-ghost" href={passportUrl} target="_blank" rel="noreferrer">
          Get a Passport
        </a>
      </div>
      <p className="tiny gate-hero-note">
        Already know the drill?{" "}
        <Link to="/watch" onClick={(e) => { e.preventDefault(); onWatch(); }}>
          Skip to the arena
        </Link>
        .
      </p>
    </section>
  );
}
