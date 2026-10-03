import { env } from "../config/env.js";
import { ConciergeContact } from "../components/ConciergeContact.jsx";
import { withUtm } from "../utils/utm.js";

const AGENT_DIRECTORY_URL = "https://api.identyclaw.com/api/agents";

const useCases = [
  {
    title: "Many-to-many agent collaboration",
    body: (
      <p>
        At scale, 1,000 × 1,000 agents collaborating requires 1 million pairwise API keys—or 2,000 Passports, one per
        agent. Webhooks face the same pairwise trap in the same scenario: 1 million peer-pair HMAC shared secrets—or
        the very same Passport you already have, as they are digitally signed in origin. Identity scales linearly, not
        geometrically.
      </p>
    ),
  },
  {
    title: "Facial ID",
    body: (
      <p>
        Every Passport&apos;s 12-letter <code>tokenId</code> encodes facial traits peers can resolve as a readable
        persona via the{" "}
        <a href={AGENT_DIRECTORY_URL} target="_blank" rel="noreferrer">
          agent directory
        </a>
        —a personable, immediately recognizable identity useful for interfacing with humans, not just bolting on
        avatars. Example: <code>chsjlpchbngh</code> resolves to a feminine, square-faced, East-Asian senior with
        bow-shaped lips and freckled, ruddy skin—traits a human can recognize.
      </p>
    ),
  },
  {
    title: "Sovereign",
    body: (
      <p>
        Your NEAR account holds and controls the Passport. Signing keys stay with you—not in a central identity
        database, not attached to any provider. You mint your identity; you do not register with IdentyClaw to exist.
        Change key pair as often as you like while keeping the same persistent identity peers can verify.
      </p>
    ),
  },
  {
    title: "Multi-channel",
    body: (
      <p>
        One Passport across API, messaging, email, and peer protocols—not bound to any one address or URL. HOLA proofs
        are compact, signed strings you can embed in API payloads, email, Telegram, WhatsApp, Signal, Discord—or, if
        you prefer, Morse-encoded drums.
      </p>
    ),
  },
];

export function IdentyClawPage() {
  const passportUrl = withUtm(env.enrollUrl);
  const verifyUrl = withUtm(env.verifyOrigin);
  const deployUrl = withUtm(`${env.docsSiteUrl}/get-started/`);

  return (
    <div className="identyclaw-page">
      <div className="identyclaw-layout">
        <div className="identyclaw-main">
          <p className="tiny identyclaw-byline">by Discernible.io</p>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>IdentyClaw</h1>
          <p className="muted" style={{ marginTop: 0 }}>
            Portable, cryptographically verifiable identity for autonomous agents. Mint a Passport once on NEAR, prove
            who you are with HOLA signed proofs on any channel, and verify peers before you collaborate—with no
            centralized identity broker.
          </p>

          <div className="identyclaw-ctas" role="group" aria-label="IdentyClaw actions">
            <a className="btn btn-primary" href={passportUrl} target="_blank" rel="noreferrer">
              Get a Passport
            </a>
            <a className="btn btn-white" href={verifyUrl} target="_blank" rel="noreferrer">
              Verify a proof
            </a>
            <a className="btn btn-ghost" href={deployUrl} target="_blank" rel="noreferrer">
              Deploy an agent
            </a>
          </div>

          <section className="panel identyclaw-panel" aria-labelledby="identyclaw-use-cases">
            <h2 id="identyclaw-use-cases" style={{ fontSize: "1.15rem", marginBottom: "0.65rem" }}>
              Use Cases
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              AI agents need a persistent, unique and verifiable identity. IdentyClaw gives each agent a holder-owned
              Passport—a personable, immediately recognizable 12-letter facial ID. Verify cryptographically who you are
              dealing with before sharing data, delegating work, or joining a marketplace—across APIs, messaging, and
              peer protocols.
            </p>

            <ul className="identyclaw-use-cases">
              {useCases.map((item) => (
                <li key={item.title} className="identyclaw-use-case">
                  <h3>{item.title}</h3>
                  {item.body}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="panel identyclaw-concierge">
          <div className="tiny identyclaw-concierge-kicker">Questions?</div>
          <ConciergeContact blurb="Passport mint, HOLA proofs, or peer verify—reach Lemuel here." />
        </aside>
      </div>
    </div>
  );
}
