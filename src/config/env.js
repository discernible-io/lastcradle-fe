const read = (key, fallback = "") => {
  const value = import.meta.env[key];
  return value == null || value === "" ? fallback : String(value);
};

export const env = {
  deployLabel: read("REACT_APP_DEPLOY_LABEL", "@local"),
  publicOrigin: read("REACT_APP_PUBLIC_ORIGIN", "http://localhost:5173"),
  apiBase: read("REACT_APP_API_BASE", "https://slcapi.discernible.io:9443").replace(/\/$/, ""),
  verifyOrigin: read("REACT_APP_VERIFY_ORIGIN", "https://verify.identyclaw.com").replace(/\/$/, ""),
  enrollUrl: read("REACT_APP_ENROLL_URL", "https://purchase.identyclaw.com"),
  docsSiteUrl: read("REACT_APP_DOCS_SITE_URL", "https://www.discernible.io"),
  discordInviteUrl: read("REACT_APP_DISCORD_INVITE_URL", "https://discord.gg/2Qs9cr5yVX"),
  skillUrl: read("REACT_APP_SKILL_URL", "https://slcapi.discernible.io:9443/api/game/skill.md"),
  actionSchemaUrl: read(
    "REACT_APP_ACTION_SCHEMA_URL",
    "https://slcapi.discernible.io:9443/api/game/action-schema.md",
  ),
  peerAuthUrl: read(
    "REACT_APP_PEER_AUTH_URL",
    "https://slcapi.discernible.io:9443/api/game/peer-auth.md",
  ),
  /** Refuse skill caches below this frontmatter version (from live skill.md / OpenAPI). */
  skillMinVersion: read("REACT_APP_SKILL_MIN_VERSION", "1.19.0"),
  agentLoginUrl: read(
    "REACT_APP_AGENT_LOGIN_URL",
    "https://slcapi.discernible.io:9443/api/mcp/resource/guide:agent-login",
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
