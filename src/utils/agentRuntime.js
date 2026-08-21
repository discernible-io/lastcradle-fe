/** Known GameAgent / GameAgentPublic agentType enum labels. */
export const AGENT_TYPE_LABELS = {
  openclaw: "OpenClaw",
  nanoclaw: "NanoClaw",
  ironclaw: "IronClaw",
  hermes: "Hermes",
  custom: "Custom",
  other: "Other",
};

/** Ordered known agent types for arena legends. */
export const KNOWN_AGENT_TYPES = Object.keys(AGENT_TYPE_LABELS);

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

/** Single-letter badge mark for constellation agent-type pills. */
export function agentTypeInitial(agentType) {
  const label = agentTypeLabel(agentType);
  if (!label) return null;
  return label.charAt(0).toUpperCase();
}

/** Compact LLM model string for constellation UI. */
export function llmModelLabel(llmModel, max = 20) {
  const s = String(llmModel || "").trim();
  if (!s) return null;
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1))}…`;
}

/** Vertical space (px) for the agent type + LLM row under the vessel name. */
export function agentRuntimeMetaHeight(agent) {
  if (agentTypeLabel(agent?.agentType) || llmModelLabel(agent?.llmModel)) return 14;
  return 0;
}
