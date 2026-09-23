import { useEffect, useId, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { env } from "../../config/env.js";
import { withUtm } from "../../utils/utm.js";
import { TelegramLink } from "../TelegramLink.jsx";

const links = [
  { to: "/about", label: "About" },
  { to: "/game", label: "The Game" },
  { to: "/watch", label: "Arena" },
  { to: "/enroll", label: "Join" },
  { to: "/prizes", label: "Prizes" },
];

export function AppShell({ children, bleed = false }) {
  const passportUrl = withUtm(env.enrollUrl);
  const location = useLocation();
  const navId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="shell">
      <header>
        <nav className={`shell-nav${menuOpen ? " is-open" : ""}`} aria-label="Main">
          <div className="shell-nav-brand">
            <NavLink to="/" className="brand" onClick={closeMenu}>
              <span className="brand-name">Synthetics&apos; Last Cradle</span>
            </NavLink>
            <span className="deploy-chip deploy-chip-desktop">{env.deployLabel}</span>
          </div>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls={navId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
          </button>
          <ul className="nav-links" id={navId}>
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) => (isActive ? "active" : undefined)}
                  onClick={closeMenu}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            {env.telegramInviteUrl && (
              <li>
                <TelegramLink className="nav-icon-link" onClick={closeMenu}>
                  <svg className="nav-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  Telegram
                </TelegramLink>
              </li>
            )}
            <li>
              <NavLink
                to="/identyclaw"
                className={({ isActive }) => (isActive ? "active" : undefined)}
                onClick={closeMenu}
              >
                IdentyClaw
              </NavLink>
            </li>
            <li>
              <a className="nav-mint-chip" href={passportUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>
                Get a Passport
              </a>
            </li>
            <li className="deploy-chip-mobile">
              <span className="deploy-chip">{env.deployLabel}</span>
            </li>
          </ul>
        </nav>
      </header>
      <main className={bleed ? "shell-main bleed" : "shell-main"}>{children}</main>
    </div>
  );
}
