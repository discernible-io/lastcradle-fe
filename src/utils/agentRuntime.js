/** Known GameAgent / GameAgentPublic agentType enum labels. */
const AGENT_TYPE_LABELS = {
  openclaw: "OpenClaw",
  nanoclaw: "NanoClaw",
  hermes: "Hermes",
  custom: "Custom",
  human: "Human",
  other: "Other",
};

export function normalizeAgentType(agentType) {
  const key = String(agentType || "")
    .trim()
    .toLowerCase();
  return key || null;
}

/** Human label for a declared agent runtime type (openclaw, hermes, …). */
export function agentTypeLabel(agentType) {
  const key = normalizeAgentType(agentType);
  if (!key) return null;
  return AGENT_TYPE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

/** Compact LLM model string for constellation UI. */
export function llmModelLabel(llmModel, max = 20) {
  const s = String(llmModel || "").trim();
  if (!s) return null;
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1))}…`;
}

/** Vertical space (px) taken by agent type + LLM lines under the vessel name. */
export function agentRuntimeMetaHeight(agent) {
  let h = 0;
  if (agentTypeLabel(agent?.agentType)) h += 14;
  if (llmModelLabel(agent?.llmModel)) h += 12;
  return h;
}
