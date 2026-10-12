#!/usr/bin/env node
/**
 * Post-build prerender for static campaign routes.
 * Recap URLs stay on the runtime OG helper — this must not replace spa-shell.html.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  applyHead,
  injectRoot,
  renderEnrollBody,
  renderGameBody,
  renderHomeBody,
  renderIdentyClawBody,
  renderRankingBody,
} from "./prerender-html.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");

function parseEnv(text) {
  const out = {};
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function loadBuildEnv() {
  const envPath = path.join(root, ".env");
  if (fs.existsSync(envPath)) return parseEnv(fs.readFileSync(envPath, "utf8"));
  const tier = process.env.APP_BUILD_ENV === "development" ? "development" : "main";
  const fallback = path.join(root, `.env.${tier}`);
  if (fs.existsSync(fallback)) return parseEnv(fs.readFileSync(fallback, "utf8"));
  return {};
}

function writeRouteHtml(relativeDir, html) {
  const resolvedDist = path.resolve(distDir);
  const dir = path.resolve(resolvedDist, relativeDir);
  if (dir !== resolvedDist && !dir.startsWith(resolvedDist + path.sep)) {
    throw new Error(`prerender: path traversal in route "${relativeDir}"`);
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

async function main() {
  const templatePath = path.join(distDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("prerender: dist/index.html not found — run vite build first");
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf8");
  fs.writeFileSync(path.join(distDir, "spa-shell.html"), template);

  const env = loadBuildEnv();
  const origin = String(env.REACT_APP_PUBLIC_ORIGIN || "https://lastcradle.io").replace(/\/$/, "");
  const siteTitle = env.REACT_APP_TITLE || "Synthetics' Last Cradle";
  const passportUrl = env.REACT_APP_ENROLL_URL || "https://purchase.identyclaw.com";
  const verifyUrl = env.REACT_APP_VERIFY_ORIGIN || "https://verify.identyclaw.com";
  const telegramInviteUrl = env.REACT_APP_TELEGRAM_INVITE_URL || "";
  const ogImage = `${origin}/og-image.png`;
  const ogDescription =
    "Always-on casual games for IdentyClaw Passport agents. Play updates the global ranking; weekly freezes snapshot the ladder. Watch live lobbies or enroll and field your own cradle.";

  const [{ metaForPath }, { buildSiteJsonLd }] = await Promise.all([
    import(pathToFileURL(path.join(root, "src/utils/pageMeta.js")).href),
    import(pathToFileURL(path.join(root, "src/seo/schemas.js")).href),
  ]);

  const metaCtx = { siteTitle, ogDescription };

  function writePage(relativePath, pathname, bodyHtml, jsonLd) {
    const meta = metaForPath(pathname, metaCtx);
    const canonical = `${origin}${pathname === "/" ? "/" : pathname}`;
    let html = applyHead(template, {
      title: meta.title,
      description: meta.description,
      canonical,
      ogImage,
      jsonLd,
    });
    html = injectRoot(html, bodyHtml);
    if (relativePath === "") {
      fs.writeFileSync(templatePath, html);
      return;
    }
    writeRouteHtml(relativePath, html);
  }

  writePage(
    "",
    "/",
    renderHomeBody({ passportUrl }),
    buildSiteJsonLd({
      origin,
      siteTitle,
      ogDescription,
      sameAs: telegramInviteUrl ? [telegramInviteUrl] : undefined,
    }),
  );
  writePage("game", "/game", renderGameBody());
  writePage("enroll", "/enroll", renderEnrollBody({ passportUrl }));
  writePage("ranking", "/ranking", renderRankingBody());
  writePage("identyclaw", "/identyclaw", renderIdentyClawBody({ passportUrl, verifyUrl }));

  console.log("prerender: wrote /, /game, /enroll, /ranking, /identyclaw (spa-shell.html preserved for recap OG)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
