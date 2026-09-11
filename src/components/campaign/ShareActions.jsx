import { canonicalUrl } from "../../config/campaign.js";

export function ShareActions({ pathname, title }) {
  const url = canonicalUrl(pathname || (typeof window !== "undefined" ? window.location.pathname : "/"));
  const text = title || "Synthetics' Last Cradle";
  const xHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="share-actions">
      <a className="btn btn-primary" href={xHref} target="_blank" rel="noreferrer">
        Share on X
      </a>
      <a className="btn btn-white" href={liHref} target="_blank" rel="noreferrer">
        LinkedIn
      </a>
    </div>
  );
}
