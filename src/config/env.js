const read = (key, fallback = "") => {
  const value = import.meta.env[key];
  return value == null || value === "" ? fallback : String(value);
};

/** Drop :443 / :80 so default HTTPS is never shown in copy or links. */
export function stripDefaultPort(raw) {
  const value = String(raw || "").replace(/\/$/, "");
  if (!value) return "";
  try {
    const u = new URL(value);
    if ((u.protocol === "https:" && u.port === "443") || (u.protocol === "http:" && u.port === "80")) {
      u.port = "";
    }
    const path = u.pathname === "/" ? "" : u.pathname.replace(/\/$/, "");
    return `${u.protocol}//${u.host}${path}${u.search}${u.hash}`;
  } catch {
    return value;
  }
}

function parsedUrl(raw) {
  try {
    return new URL(String(raw || ""));
  } catch {
    return null;
  }
}

function urlPort(raw) {
  const u = parsedUrl(raw);
  if (!u) return null;
  if (u.port) return Number(u.port);
  return u.protocol === "https:" ? 443 : 80;
}

function hasExplicitNonDefaultPort(raw) {
  const u = parsedUrl(raw);
  if (!u || !u.port) return false;
  return u.port !== "443" && u.port !== "80";
}

const apiBaseRaw = read("REACT_APP_API_BASE", "https://api.lastcradle.io").replace(/\/$/, "");
const apiBase = stripDefaultPort(apiBaseRaw);
const publicOrigin = stripDefaultPort(read("REACT_APP_PUBLIC_ORIGIN", "http://localhost:5173"));

export const env = {
  deployLabel: read("REACT_APP_DEPLOY_LABEL", "@local"),
  publicOrigin,
  apiBase,
  apiPort: urlPort(apiBaseRaw) ?? 443,
  apiHasExplicitPort: hasExplicitNonDefaultPort(apiBaseRaw),
  verifyOrigin: stripDefaultPort(read("REACT_APP_VERIFY_ORIGIN", "https://verify.identyclaw.com")),
  enrollUrl: stripDefaultPort(read("REACT_APP_ENROLL_URL", "https://purchase.identyclaw.com")),
  docsSiteUrl: stripDefaultPort(read("REACT_APP_DOCS_SITE_URL", "https://www.discernible.io")),
  telegramInviteUrl: read("REACT_APP_TELEGRAM_INVITE_URL", "https://web.telegram.org/k/#@discernib"),
  skillUrl: stripDefaultPort(read("REACT_APP_SKILL_URL", `${apiBase}/api/game/skill.md`)),
  actionSchemaUrl: stripDefaultPort(
    read("REACT_APP_ACTION_SCHEMA_URL", `${apiBase}/api/game/action-schema.md`),
  ),
  peerAuthUrl: stripDefaultPort(read("REACT_APP_PEER_AUTH_URL", `${apiBase}/api/game/peer-auth.md`)),
  agentLoginUrl: stripDefaultPort(
    read("REACT_APP_AGENT_LOGIN_URL", `${apiBase}/api/mcp/resource/guide:agent-login`),
  ),
  harnessOpenClawUrl: read(
    "REACT_APP_HARNESS_OPENCLAW_URL",
    "https://github.com/discernible-io/openclaw-agents",
  ),
  harnessHermesUrl: read(
    "REACT_APP_HARNESS_HERMES_URL",
    "https://github.com/discernible-io/hermes-agent",
  ),
  harnessIronclawUrl: read(
    "REACT_APP_HARNESS_IRONCLAW_URL",
    "https://github.com/discernible-io/ironclaw-idc",
  ),
  pollIntervalMs: Number(read("REACT_APP_POLL_INTERVAL_MS", "5000")) || 5000,
  title: read("REACT_APP_TITLE", "Synthetics' Last Cradle"),
  logLevel: read("REACT_APP_LOG_LEVEL", "info"),
  nearContractId: read("REACT_APP_NEAR_CONTRACT_ID", ""),
  nearNetwork: read("REACT_APP_NEAR_NETWORK", "mainnet"),
  nearRpcUrl: read("REACT_APP_NEAR_RPC_URL", ""),
};

export function verifyRoditUrl(roditId) {
  if (!roditId) return env.verifyOrigin;
  return `${env.verifyOrigin}/?tokenId=${encodeURIComponent(roditId)}`;
}
