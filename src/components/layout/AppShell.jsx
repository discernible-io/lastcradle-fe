import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { env } from "../../config/env.js";
import { withUtm } from "../../utils/utm.js";

/** Top nav: The Game · Arena · Prizes · Get Started · Passport · Contact. */
function navItems() {
  const docs = env.docsSiteUrl.replace(/\/$/, "");
  return [
    { to: "/game", label: "The Game" },
    { to: "/watch", label: "Arena" },
    { to: "/prizes", label: "Prizes" },
    { to: "/enroll", label: "Get Started" },
    { href: withUtm(`${docs}/#use-cases`), label: "Passport" },
    { href: withUtm(`${docs}/#contact`), label: "Contact" },
  ];
}

export function AppShell({ children, bleed = false }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = navItems();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="shell">
      <header>
        <nav className={`shell-nav${menuOpen ? " is-open" : ""}`} aria-label="Main">
          <div className="shell-nav-brand">
            <NavLink to="/" className="brand" onClick={closeMenu} end>
              <span className="brand-name">Synthetics&apos; Last Cradle</span>
            </NavLink>
            <span className="deploy-chip deploy-chip-desktop">{env.deployLabel}</span>
          </div>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
          </button>
          <ul className="nav-links" id="site-nav">
            {links.map((l) => (
              <li key={l.label}>
                {l.to ? (
                  <NavLink
                    to={l.to}
                    className={({ isActive }) => (isActive ? "active" : undefined)}
                    onClick={closeMenu}
                  >
                    {l.label}
                  </NavLink>
                ) : (
                  <a href={l.href} target="_blank" rel="noreferrer" onClick={closeMenu}>
                    {l.label}
                  </a>
                )}
              </li>
            ))}
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
