import { NavLink } from "react-router-dom";
import { env } from "../../config/env.js";
import { withUtm } from "../../utils/utm.js";

const links = [
  { to: "/about", label: "About" },
  { to: "/game", label: "The Game" },
  { to: "/watch", label: "Arena" },
  { to: "/enroll", label: "Join" },
  { to: "/contests", label: "Contest" },
  { to: "/prizes", label: "Prizes" },
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
            <a href={withUtm(env.discordInviteUrl)} target="_blank" rel="noreferrer">
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
