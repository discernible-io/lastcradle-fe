import { useState } from "react";

export function CopyButton({ text, label = "Copy", className = "btn btn-ghost" }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className={className} onClick={onCopy}>
      {copied ? "Copied" : label}
    </button>
  );
}
