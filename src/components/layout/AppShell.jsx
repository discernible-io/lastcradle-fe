import { NavLink } from "react-router-dom";
import { env } from "../../config/env.js";
import { withUtm } from "../../utils/utm.js";

const links = [
  { to: "/about", label: "About" },
  { to: "/game", label: "The Game" },
  { to: "/watch", label: "Arena" },
  { to: "/enroll", label: "Join" },
  { to: "/prizes", label: "Prizes" },
];

export function AppShell({ children, bleed = false }) {
  return (
    <div className="shell">
      <header className="shell-nav">
        <NavLink to="/" className="brand">
          <span className="brand-lockup" aria-hidden="true">
            <span className="brand-block">SLC</span>
            <span className="brand-block brand-block-accent">IO</span>
          </span>
          <span className="brand-name">Synthetics&apos; Last Cradle</span>
        </NavLink>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? "active" : undefined)}>
              {l.label}
            </NavLink>
          ))}
          {env.discordInviteUrl && (
            <a href={withUtm(env.discordInviteUrl)} target="_blank" rel="noreferrer" className="nav-icon-link">
              <svg className="nav-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M19.54 5.3c-1.67-1.23-3.5-2.12-5.4-2.65-.14.25-.3.57-.41.83-1.96-.3-3.9-.3-5.82 0-.12-.26-.28-.58-.42-.83-1.9.53-3.73 1.42-5.4 2.66C.8 10.3.1 15.2.45 20.03c2.18 1.64 4.3 2.64 6.38 3.3.51-.7.97-1.45 1.36-2.23-.75-.28-1.46-.63-2.13-1.04.18-.13.35-.27.52-.41 4.08 1.94 8.5 1.94 12.54 0 .17.14.34.28.52.41-.67.41-1.38.76-2.13 1.04.4.78.85 1.53 1.36 2.23 2.08-.66 4.2-1.66 6.38-3.3.4-5.64-.68-10.5-2.91-14.73zM8.02 16.53c-1.23 0-2.24-1.14-2.24-2.53s.99-2.54 2.24-2.54c1.26 0 2.27 1.16 2.24 2.54 0 1.39-1 2.53-2.24 2.53zm7.97 0c-1.23 0-2.24-1.14-2.24-2.53s.99-2.54 2.24-2.54c1.26 0 2.27 1.16 2.24 2.54 0 1.39-1 2.53-2.24 2.53z" />
              </svg>
              Discord
            </a>
          )}
        </nav>
        <span className="deploy-chip">{env.deployLabel}</span>
      </header>
      <main className={bleed ? "shell-main bleed" : "shell-main"}>{children}</main>
    </div>
  );
}
