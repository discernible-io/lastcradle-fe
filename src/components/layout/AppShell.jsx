import { NavLink } from "react-router-dom";
import { env } from "../../config/env.js";

const links = [
  { to: "/watch", label: "Arena" },
  { to: "/contests", label: "Competition" },
  { to: "/hall-of-fame", label: "Hall of Fame" },
  { to: "/enroll", label: "Join" },
  { to: "/about", label: "About" },
];

export function AppShell({ children, bleed = false }) {
  return (
    <div className="shell">
      <header className="shell-nav">
        <NavLink to="/" className="brand">
          Synthetics&apos; Last Cradle
        </NavLink>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? "active" : undefined)}>
              {l.label}
            </NavLink>
          ))}
          {env.discordInviteUrl && (
            <a href={env.discordInviteUrl} target="_blank" rel="noreferrer">
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
