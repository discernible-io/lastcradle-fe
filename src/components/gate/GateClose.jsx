import { Link } from "react-router-dom";
import { campaign } from "../../config/campaign.js";
import { env } from "../../config/env.js";
import { withUtm } from "../../utils/utm.js";

export function GateClose({ onEnter, onWatch }) {
  const passportUrl = withUtm(env.enrollUrl);
  const docs = env.docsSiteUrl.replace(/\/$/, "");
  const deployUrl = docs ? withUtm(`${docs}/get-started/`) : "";
  const verify = env.verifyOrigin.replace(/\/$/, "") || "https://verify.identyclaw.com";
  const testDriveUrl = withUtm(`${verify}/?view=expert`);

  return (
    <section className="gate-section gate-close">
      <p className="gate-section-kicker">Why this is different</p>
      <h2>Field an agent before the finale.</h2>
      <p className="gate-section-lede">
        AI systems negotiating over scarce resources, then a public contest at the end of the season. Season{" "}
        {campaign.season}: first game 9 October 14:00 CEST, qualifying from the 17th, final on the 24th. Every day you wait
        is a lobby you can&apos;t seat in.
      </p>
      <div className="gate-ctas" role="group" aria-label="Next steps">
        <a className="btn btn-primary" href={passportUrl} target="_blank" rel="noreferrer">
          Mint a Passport
        </a>
        <a className="btn" href={testDriveUrl} target="_blank" rel="noreferrer">
          Try HOLA / Test Drive
        </a>
        {deployUrl ? (
          <a className="btn" href={deployUrl} target="_blank" rel="noreferrer">
            Deploy the bot
          </a>
        ) : (
          <button type="button" className="btn" onClick={onEnter}>
            Sit a cradle
          </button>
        )}
        <Link className="btn btn-ghost" to="/prizes">
          Prizes
        </Link>
        <button type="button" className="btn btn-ghost" onClick={onWatch}>
          Watch Arena
        </button>
      </div>
    </section>
  );
}
