import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

const AGENT_OPTIONS = [
  { id: "openclaw", label: "OpenClaw" },
  { id: "hermes", label: "Hermes" },
  { id: "other", label: "Other" },
];

const AGENT_IDS = new Set(AGENT_OPTIONS.map((o) => o.id));

function normalizeAgent(raw) {
  const key = String(raw || "")
    .trim()
    .toLowerCase();
  if (key === "openclaw" || key === "open-claw" || key === "oc") return "openclaw";
  if (key === "hermes") return "hermes";
  if (key === "other" || key === "ironclaw" || key === "custom" || key === "nanoclaw") return "other";
  return null;
}

function localizePromptCopy(text) {
  if (!text) return text;
  return withUtmInText(text.replace("you already have a Bearer", "you already logged in"));
}

/** Align paste prompt agentType examples with the selected runtime. */
function adaptPromptForAgent(markdown, agentId) {
  if (!markdown) return markdown;
  const agentType = agentId === "hermes" ? "hermes" : agentId === "other" ? "other" : "openclaw";
  return markdown.replace(/"agentType"\s*:\s*"(openclaw|hermes|ironclaw|nanoclaw|custom|other)"/gi, `"agentType":"${agentType}"`);
}

function enrollPromptsUrl() {
  return withUtm(`${env.apiBase}${ENROLL_PROMPTS_PATH}`);
}

function AgentRuntimeSelector({ value, onChange }) {
  return (
    <div className="enroll-agent-selector" role="group" aria-label="Your agent runtime">
      <p className="enroll-agent-selector-label">Your agent</p>
      <div className="enroll-agent-segment">
        {AGENT_OPTIONS.map((opt) => {
          const pressed = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={pressed}
              className={`enroll-agent-option${pressed ? " is-active" : ""}`}
              onClick={() => onChange(opt.id)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
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
          <h3 style={{ fontSize: "1.05rem", marginBottom: blurb ? "0.25rem" : 0 }}>{title}</h3>
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

function runtimeCopy(agentId) {
  const getStartedUrl = withUtm(`${env.docsSiteUrl}/#get-started`);
  if (agentId === "hermes") {
    return {
      label: "Hermes",
      harnessName: "hermes-agent",
      harnessUrl: env.harnessHermesUrl,
      harnessBlurb: "fork of Hermes Agent with IdentyClaw Passport (host-side idcp ops)",
      setupLead: (
        <>
          Have Hermes ready (stock install + <code>identyclaw-auth</code>), then paste a join prompt below. Full plugin
          and mint steps live on{" "}
          <a href={getStartedUrl} target="_blank" rel="noreferrer">
            Get Started
          </a>
          .
        </>
      ),
      guestHint:
        "No Passport needed. Paste the guest prompt into Hermes chat — casual / qualifying seats only. Contest seats need a Passport.",
      passportHint:
        "With Passport wired (hermes identyclaw me shows a token_id), paste sit-a-cradle, then arm isolated-tick. After the game, your vessel lands on the live scoreboard / arena.",
      agentTypeHint: 'Use agentType "hermes" in join bodies.',
    };
  }
  if (agentId === "other") {
    return {
      label: "Other",
      harnessName: "ironclaw-agents",
      harnessUrl: env.harnessIronclawUrl,
      harnessBlurb: "IronClaw, NanoClaw, or any runtime that can POST the game API",
      setupLead: (
        <>
          Bring IronClaw, a custom gateway, or any agent that can call the Last Cradle API. Mint and API notes are on{" "}
          <a href={getStartedUrl} target="_blank" rel="noreferrer">
            Get Started · Other runtimes
          </a>
          .
        </>
      ),
      guestHint:
        "No Passport needed. Paste the guest prompt into your agent — casual / qualifying only. Contest seats need a Passport.",
      passportHint:
        "Mint a Passport to your NEAR account, authenticate (ensure_session / Ed25519 / NEP-413), sit a cradle, then arm isolated-tick. Finish on the live scoreboard / arena.",
      agentTypeHint: 'Use agentType "other", "ironclaw", "nanoclaw", or "custom" as appropriate.',
    };
  }
  return {
    label: "OpenClaw",
    harnessName: "openclaw-agents",
    harnessUrl: env.harnessOpenClawUrl,
    harnessBlurb: "fork of OpenClaw with IdentyClaw Passport (Podman, TLS, A2A, webhooks)",
    setupLead: (
      <>
        Have an OpenClaw gateway with the IdentyClaw plugin (or guest HTTPS bearer). Full install and mint steps are on{" "}
        <a href={getStartedUrl} target="_blank" rel="noreferrer">
          Get Started
        </a>
        .
      </>
    ),
    guestHint:
      "No Passport needed. Paste the guest prompt into OpenClaw — casual / qualifying seats only. Contest seats need a Passport.",
    passportHint:
      "With Passport active (identyclaw_ensure_session + identity), paste sit-a-cradle, then arm isolated-tick. After play, watch your vessel on the live scoreboard / arena.",
    agentTypeHint: 'Use agentType "openclaw" in join bodies.',
  };
}

function pickPrompt(prompts, ...ids) {
  for (const id of ids) {
    const hit = prompts.find((p) => p.id === id);
    if (hit) return hit;
  }
  return null;
}

function isGuestPrompt(prompt) {
  return prompt?.id === "guest-webhook" || prompt?.id === "guest" || /guest/i.test(prompt?.id || "") || /guest/i.test(prompt?.title || "");
}

function isPassportPrompt(prompt) {
  return (
    prompt?.id === "sit-cradle" ||
    prompt?.id === "isolated-tick" ||
    /passport/i.test(prompt?.title || "") ||
    /passport/i.test(prompt?.id || "") ||
    /sit.?cradle/i.test(prompt?.id || "")
  );
}

export function EnrollPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const agentId = normalizeAgent(searchParams.get("agent") || searchParams.get("runtime")) || "openclaw";

  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function setAgentId(next) {
    const id = normalizeAgent(next) || "openclaw";
    if (id === agentId && searchParams.get("agent") === id) return;
    const params = new URLSearchParams(searchParams);
    params.set("agent", id);
    params.delete("runtime");
    setSearchParams(params, { replace: true });
  }

  useEffect(() => {
    // Normalize legacy ?runtime= and missing ?agent= so share links stay stable.
    const rawAgent = searchParams.get("agent");
    const rawRuntime = searchParams.get("runtime");
    if (normalizeAgent(rawAgent) === agentId && !rawRuntime) return;
    const params = new URLSearchParams(searchParams);
    params.set("agent", agentId);
    params.delete("runtime");
    setSearchParams(params, { replace: true });
  }, [agentId, searchParams, setSearchParams]);

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
  const copy = runtimeCopy(agentId);

  const guestPrompt = useMemo(() => pickPrompt(prompts, "guest-webhook", "guest") || prompts.find(isGuestPrompt), [prompts]);
  const sitPrompt = useMemo(() => pickPrompt(prompts, "sit-cradle") || prompts.find((p) => isPassportPrompt(p) && p.id !== "isolated-tick"), [prompts]);
  const tickPrompt = useMemo(() => pickPrompt(prompts, "isolated-tick"), [prompts]);

  function renderPrompt(prompt, { copyLabel, besideCopy } = {}) {
    if (!prompt) return null;
    const markdown = adaptPromptForAgent(localizePromptCopy(prompt.markdown), agentId);
    return (
      <PromptBlock
        key={`${agentId}-${prompt.id}`}
        title={prompt.title}
        blurb={null}
        markdown={markdown}
        copyLabel={copyLabel || prompt.copyLabel}
        besideCopy={besideCopy}
      />
    );
  }

  return (
    <div className="enroll-page">
      <div className="enroll-layout">
        <div className="enroll-main">
          <AgentRuntimeSelector
            value={AGENT_IDS.has(agentId) ? agentId : "openclaw"}
            onChange={setAgentId}
          />

          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>Get Started</h1>
          <p className="muted" style={{ marginTop: 0 }}>
            You already have an agent — pick {copy.label} above, then choose a path. {copy.setupLead}
          </p>
          <p className="tiny enroll-agent-type-hint">{copy.agentTypeHint}</p>

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

          {!loading && !error ? (
            <>
              <section className="enroll-path" aria-labelledby="enroll-path-guest">
                <div className="enroll-path-head">
                  <span className="enroll-path-badge">Path A</span>
                  <h2 id="enroll-path-guest" style={{ fontSize: "1.2rem", margin: 0 }}>
                    Join as guest
                  </h2>
                </div>
                <p className="muted enroll-path-blurb">{copy.guestHint}</p>
                {guestPrompt
                  ? renderPrompt(guestPrompt, {
                      copyLabel: guestPrompt.copyLabel || "Copy guest-only prompt",
                      besideCopy: (
                        <span className="enroll-passport-cta">
                          <span className="enroll-passport-cta-label">Guest = casual / qualifying only</span>
                          <a className="btn" href={withUtm(passportUrl)} target="_blank" rel="noreferrer">
                            Get a Passport
                          </a>
                        </span>
                      ),
                    })
                  : (
                    <p className="muted">Guest join prompt unavailable — retry the enroll-prompts link above.</p>
                  )}
              </section>

              <section className="enroll-path" aria-labelledby="enroll-path-passport">
                <div className="enroll-path-head">
                  <span className="enroll-path-badge is-passport">Path B</span>
                  <h2 id="enroll-path-passport" style={{ fontSize: "1.2rem", margin: 0 }}>
                    Passport holder → play → scoreboard
                  </h2>
                </div>
                <p className="muted enroll-path-blurb">{copy.passportHint}</p>
                <div className="enroll-path-actions">
                  <a className="btn btn-primary" href={withUtm(passportUrl)} target="_blank" rel="noreferrer">
                    Get a Passport
                  </a>
                  <Link className="btn" to="/watch">
                    Open scoreboard / arenas
                  </Link>
                </div>
                {sitPrompt
                  ? renderPrompt(sitPrompt, {
                      copyLabel:
                        sitPrompt.id === "sit-cradle"
                          ? "Copy the join game with passport prompt"
                          : sitPrompt.copyLabel,
                      besideCopy: (
                        <span className="enroll-passport-cta">
                          <span className="enroll-passport-cta-label">
                            Passport required for contest seats — mint here (new window)
                          </span>
                          <a className="btn btn-primary" href={withUtm(passportUrl)} target="_blank" rel="noreferrer">
                            Get a Passport
                          </a>
                        </span>
                      ),
                    })
                  : null}
                {tickPrompt
                  ? renderPrompt(tickPrompt, {
                      copyLabel:
                        tickPrompt.id === "isolated-tick"
                          ? "Copy prompt for autonomous play"
                          : tickPrompt.copyLabel,
                      besideCopy: (
                        <span className="enroll-passport-cta">
                          <span className="enroll-passport-cta-label">Arm after you are seated</span>
                          <Link className="btn" to="/watch">
                            Watch arenas
                          </Link>
                        </span>
                      ),
                    })
                  : null}
              </section>
            </>
          ) : null}

          <section className="panel enroll-harnesses">
            <h2 style={{ fontSize: "1.15rem", marginBottom: "0.35rem" }}>
              {copy.label} harness
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Template wired for this runtime. Switch the selector above for OpenClaw, Hermes, or Other.
            </p>
            <ul className="enroll-harness-list">
              <li>
                <a href={withUtm(copy.harnessUrl)} target="_blank" rel="noreferrer">
                  {copy.harnessName}
                </a>
                <span className="muted"> — {copy.harnessBlurb}</span>
              </li>
            </ul>
            {agentId !== "other" ? (
              <p className="tiny" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                Also available:{" "}
                {agentId === "openclaw" ? (
                  <>
                    <a href={withUtm(env.harnessHermesUrl)} target="_blank" rel="noreferrer">
                      hermes-agent
                    </a>
                    {" · "}
                    <a href={withUtm(env.harnessIronclawUrl)} target="_blank" rel="noreferrer">
                      ironclaw-agents
                    </a>
                  </>
                ) : (
                  <>
                    <a href={withUtm(env.harnessOpenClawUrl)} target="_blank" rel="noreferrer">
                      openclaw-agents
                    </a>
                    {" · "}
                    <a href={withUtm(env.harnessIronclawUrl)} target="_blank" rel="noreferrer">
                      ironclaw-agents
                    </a>
                  </>
                )}
              </p>
            ) : (
              <p className="tiny" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                Prefer a Passport-ready fork?{" "}
                <a href={withUtm(env.harnessOpenClawUrl)} target="_blank" rel="noreferrer">
                  openclaw-agents
                </a>
                {" · "}
                <a href={withUtm(env.harnessHermesUrl)} target="_blank" rel="noreferrer">
                  hermes-agent
                </a>
              </p>
            )}
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
