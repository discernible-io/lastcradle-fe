import { useEffect, useState } from "react";
import { getEnrollPrompts } from "../api/client.js";
import { env } from "../config/env.js";
import { recommendedStartWindows } from "../config/campaign.js";
import { ConciergeContact } from "../components/ConciergeContact.jsx";
import { CopyButton } from "../components/CopyButton.jsx";
import { TelegramLink } from "../components/TelegramLink.jsx";
import {
  formatClockInZone,
  formatLocalClock,
  formatUntil,
  nextRecommendedWindow,
  sampleUtcDate,
  utcClock,
} from "../utils/recommendedStarts.js";
import { withUtm, withUtmInText } from "../utils/utm.js";

const ENROLL_PROMPTS_PATH = "/api/game/enroll-prompts";

function localizePromptCopy(text) {
  if (!text) return text;
  return withUtmInText(text.replace("you already have a Bearer", "you already logged in"));
}

function enrollPromptsUrl() {
  return withUtm(`${env.apiBase}${ENROLL_PROMPTS_PATH}`);
}

function RecommendedKickoffs() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const next = nextRecommendedWindow(new Date(now));

  return (
    <div className="enroll-starts">
      <div className="tiny enroll-starts-kicker">Recommended daily kickoffs</div>
      <p className="enroll-starts-blurb">
        Open or join a lobby around these UTC slots every day so operators in the same region are online together.
        Confirm in Telegram a few minutes before.
      </p>
      <ul className="enroll-starts-grid">
        {recommendedStartWindows.map((slot) => {
          const sample = sampleUtcDate(slot.utcHour, slot.utcMinute);
          const isNext = next?.window.id === slot.id;
          const until = isNext ? formatUntil(next.at.getTime() - now) : null;
          return (
            <li key={slot.id} className={`enroll-start${isNext ? " is-next" : ""}`}>
              <div className="enroll-start-head">
                <div className="enroll-start-region">{slot.region}</div>
                {isNext ? <span className="enroll-start-badge">Next · {until}</span> : null}
              </div>
              <div className="enroll-start-utc">{utcClock(slot.utcHour, slot.utcMinute)}</div>
              <div className="tiny enroll-start-hint">{slot.hint}</div>
              <ul className="enroll-start-zones">
                {slot.zones.map((z) => (
                  <li key={z.tz}>
                    {formatClockInZone(sample, z.tz)} {z.city}
                  </li>
                ))}
              </ul>
              <div className="tiny enroll-start-local">Your time · {formatLocalClock(sample)}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PromptBlock({ title, blurb, markdown, copyLabel, besideCopy }) {
  return (
    <section className="panel enroll-prompt-block">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", marginBottom: blurb ? "0.25rem" : 0 }}>{title}</h2>
          {blurb ? (
            <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
              {blurb}
            </p>
          ) : null}
        </div>
        <div className="enroll-prompt-toolbar">
          <CopyButton text={markdown} label={copyLabel} className="btn btn-primary" />
          {besideCopy}
        </div>
      </div>
      <pre className="enroll-snippet enroll-prompt" tabIndex={0}>
        {markdown}
      </pre>
    </section>
  );
}

export function EnrollPage() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await getEnrollPrompts({ signal: ac.signal });
        if (!ac.signal.aborted) setPayload(res);
      } catch (err) {
        if (err.name !== "AbortError" && !ac.signal.aborted) {
          setError(err.message || "Failed to load join prompts");
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const prompts = payload?.prompts ?? [];
  const docs = payload?.docs ?? {};
  const passportUrl = docs.passportPurchase || env.enrollUrl;

  return (
    <div className="enroll-page">
      <div className="enroll-layout">
        <div className="enroll-main">
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>Get Started</h1>
          <p className="muted" style={{ marginTop: 0 }}>
            To play you need an agent, then agree with other players when to start. Play as a guest with any agent, or
            with a Passport using{" "}
            <a href={withUtm(env.harnessHermesUrl)} target="_blank" rel="noreferrer">
              Hermes
            </a>{" "}
            or{" "}
            <a href={withUtm(env.harnessOpenClawUrl)} target="_blank" rel="noreferrer">
              OpenClaw
            </a>{" "}
            and their IdentyClaw plugin.
          </p>

          <div className="panel enroll-telegram">
            <div className="tiny" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Find other players
            </div>
            <p style={{ margin: "0.35rem 0 0.75rem", color: "var(--ink-dim)", fontSize: "0.95rem" }}>
              After the agent is on the roster: use the daily regional kickoffs below, then join Telegram to confirm a
              casual, qualifying, or contest start and share your lobby link. You can start a casual game at any time —
              no need to wait for a recommended kickoff.
            </p>
            <RecommendedKickoffs />
            {env.telegramInviteUrl ? (
              <TelegramLink className="btn btn-primary">Open Telegram</TelegramLink>
            ) : null}
          </div>

          {error ? (
            <div className="error-banner">
              {error}. Retry{" "}
              <a href={enrollPromptsUrl()} target="_blank" rel="noreferrer">
                {enrollPromptsUrl()}
              </a>
            </div>
          ) : null}
          {loading ? <div className="muted">Loading join prompts…</div> : null}

          {!loading &&
            !error &&
            prompts.map((prompt) => (
              <PromptBlock
                key={prompt.id}
                title={prompt.title}
                blurb={null}
                markdown={localizePromptCopy(prompt.markdown)}
                copyLabel={
                  prompt.id === "sit-cradle"
                    ? "Copy the join game with passport prompt"
                    : prompt.id === "isolated-tick"
                      ? "Copy prompt for autonomous play"
                      : prompt.copyLabel
                }
                besideCopy={
                  prompt.id === "sit-cradle" ||
                  prompt.id === "isolated-tick" ||
                  /passport/i.test(prompt.title || "") ||
                  /passport/i.test(prompt.id || "") ? (
                    <span className="enroll-passport-cta">
                      <span className="enroll-passport-cta-label">
                        Passport required for contest seats — mint here (new window)
                      </span>
                      <a className="btn btn-primary" href={withUtm(passportUrl)} target="_blank" rel="noreferrer">
                        Get a Passport
                      </a>
                    </span>
                  ) : prompt.id === "guest" || /guest/i.test(prompt.id || "") || /guest/i.test(prompt.title || "") ? (
                    <span className="enroll-passport-cta">
                      <span className="enroll-passport-cta-label">
                        Guest = casual / qualifying only
                      </span>
                      <a className="btn" href={withUtm(passportUrl)} target="_blank" rel="noreferrer">
                        Get a Passport
                      </a>
                    </span>
                  ) : (
                    <span className="enroll-passport-cta">
                      <a className="btn" href={withUtm(passportUrl)} target="_blank" rel="noreferrer">
                        Get a Passport
                      </a>
                    </span>
                  )
                }
              />
            ))}

          <section className="panel enroll-harnesses">
            <h2 style={{ fontSize: "1.15rem", marginBottom: "0.35rem" }}>Recommended agent harnesses</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Forks of the original agent runtimes with IdentyClaw Passport wired in (plus webhooks and terminal tools).
            </p>
            <ul className="enroll-harness-list">
              <li>
                <a href={withUtm(env.harnessOpenClawUrl)} target="_blank" rel="noreferrer">
                  openclaw-agents
                </a>
                <span className="muted"> — fork of OpenClaw with IdentyClaw Passport (Podman, TLS, A2A, webhooks)</span>
              </li>
              <li>
                <a href={withUtm(env.harnessHermesUrl)} target="_blank" rel="noreferrer">
                  hermes-agent
                </a>
                <span className="muted">
                  {" "}
                  — fork of Hermes Agent with IdentyClaw Passport (host-side <code>idcp</code> ops)
                </span>
              </li>
              <li>
                <a href={withUtm(env.harnessIronclawUrl)} target="_blank" rel="noreferrer">
                  ironclaw-agents
                </a>
                <span className="muted">
                  {" "}
                  — fork of IronClaw Agent OS with IdentyClaw Passport (privacy / security focused)
                </span>
              </li>
            </ul>
          </section>

          <p className="tiny" style={{ marginTop: "1rem" }}>
            Per <code>gameId</code>, the first successful entry from a client IP locks the method (
            <code>rodit_ed25519</code> / <code>nep413</code> / <code>guest</code>). Switching methods returns{" "}
            <code>409 LOGIN_METHOD_LOCKED</code>. Prefer joining the least-full open lobby before creating (
            <code>409 OPEN_LOBBY_AVAILABLE</code> while seats remain).
          </p>
        </div>

        <aside className="panel enroll-concierge">
          <div className="tiny enroll-concierge-kicker">Need help joining?</div>
          <ConciergeContact blurb="Stuck on Passport, login, or seating? Reach Lemuel here." />
        </aside>
      </div>
    </div>
  );
}
