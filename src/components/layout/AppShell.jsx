import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { env } from "../../config/env.js";
import { withUtm } from "../../utils/utm.js";

/** Top nav: The Game · Watch · Ranking · Join · Test Drive · Passport · Contact. */
function navItems() {
  const docs = env.docsSiteUrl.replace(/\/$/, "");
  const verify = env.verifyOrigin.replace(/\/$/, "") || "https://verify.identyclaw.com";
  return [
    { to: "/game", label: "The Game" },
    { to: "/watch", label: "Watch" },
    { to: "/ranking", label: "Ranking" },
    { to: "/enroll", label: "Join" },
    {
      href: withUtm(`${verify}/?view=expert`),
      label: "Test Drive",
    },
    { href: withUtm(`${docs}/#use-cases`), label: "Passport" },
    { href: withUtm(`${docs}/#contact`), label: "Contact" },
  ];
}

export function AppShell({ children, bleed = false }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = navItems();
  const docsHomeHref = withUtm(env.docsSiteUrl);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="shell">
      <header>
        <nav className={`shell-nav${menuOpen ? " is-open" : ""}`} aria-label="Main">
          <div className="shell-nav-brand">
            <div className="brand">
              <NavLink to="/" className="brand-name" onClick={closeMenu} end>
                Synthetics&apos; Last Cradle by
              </NavLink>
              <a
                className="brand-logo-link"
                href={docsHomeHref}
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
                aria-label="Discernible"
              >
                <img
                  className="brand-logo"
                  src="/discernible-logo.png"
                  alt="Discernible"
                  width="1413"
                  height="321"
                />
              </a>
            </div>
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
