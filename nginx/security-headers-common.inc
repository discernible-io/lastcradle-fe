# Shared browser security headers (included by nginx.main / nginx.development server blocks)
#
# ---------------------------------------------------------------------------
# SEO backlog (not done yet) vs shipped nearby
# ---------------------------------------------------------------------------
# Shipped (see nginx.*.conf + app + server/og-inject.mjs):
# - www.lastcradle.io → 301 https://lastcradle.io$request_uri (canonical host)
# - identyclaw.com / www.identyclaw.com → 301 https://purchase.identyclaw.com$request_uri
# - public/robots.txt + public/sitemap.xml (stable marketing routes)
# - staging X-Robots-Tag: noindex, nofollow (nginx.development.conf)
# - SPA NotFoundPage (no longer soft-redirects unknown paths to /)
# - client <link rel="canonical"> + expanded usePageMeta; landing JSON-LD
# - favicon.svg; arena/recap/recollections code-split via React.lazy
# - Recap OG inject: nginx proxies /watch/:gameId/turn/:n → localhost:8080 Node
#   helper (API turns → headline in <title>/OG). Fail-open to index.html on
#   502/503/504 or helper/API errors. Client also applies report.headline meta.
#
# Still open:
# - True HTTP 404 status: try_files still falls through to /index.html (200).
#   Client 404 is UX + noindex meta only; allowlist SPA paths in nginx if needed.
# - Prerender marketing routes so <title>/OG exist in dist HTML before React.
# - Prefer real paths over hash targets for /contests and /hall-of-fame if ranking.
# - Optional FAQPage JSON-LD on /about.
# - HSTS is set only in nginx.main.conf (production); keep it off development.
# ---------------------------------------------------------------------------
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-Frame-Options "DENY" always;
add_header Permissions-Policy "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" always;
# Google Fonts + game API (main api.lastcradle.io / development :9443) + EventSource
add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://api.lastcradle.io https://slcapi.discernible.io https://slcapi.discernible.io:9443 https://slcapi.dihola.io:9443 https:; worker-src 'self' blob:" always;
