import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getGameState, listGames } from "../api/client.js";
import { GateClose } from "../components/gate/GateClose.jsx";
import { GateDeathExample } from "../components/gate/GateDeathExample.jsx";
import { GateHero } from "../components/gate/GateHero.jsx";
import { GateHowToEnter } from "../components/gate/GateHowToEnter.jsx";
import { GateLiveSnapshot } from "../components/gate/GateLiveSnapshot.jsx";
import { GateMoney } from "../components/gate/GateMoney.jsx";
import { GatePhases } from "../components/gate/GatePhases.jsx";
import { GatePitch } from "../components/gate/GatePitch.jsx";
import { GateSchedule } from "../components/gate/GateSchedule.jsx";
import { campaign, canonicalUrl, watchPath } from "../config/campaign.js";
import { env } from "../config/env.js";
import { useFeaturedWatchPath } from "../hooks/useFeaturedWatchPath.js";
import { buildSeasonJsonLd, serializeJsonLd } from "../seo/schemas.js";
import { pickFeaturedWatchGame } from "../utils/featuredWatch.js";
import { toTelegramUniversalUrl } from "../utils/telegram.js";

const JSON_LD_ID = "slc-json-ld";

function safeNextPath(raw) {
  if (!raw || typeof raw !== "string") return null;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return null;
  return decoded;
}

function buildSnapshot(game, state) {
  const agents = state?.agents || game?.agents || [];
  const aliveFromState =
    state?.livingAgentCount ??
    (Array.isArray(agents) ? agents.filter((a) => a.status === "alive").length : null);
  const total =
    (Array.isArray(agents) && agents.length) ||
    game?.agentCount ||
    state?.game?.agentCount ||
    null;
  const turn = state?.game?.currentTurn ?? game?.currentTurn ?? null;
  const maxTurn = state?.game?.maxTurns ?? state?.game?.maxTurn ?? game?.maxTurns ?? 55;
  return {
    gameId: game?.id || state?.game?.id || null,
    status: state?.game?.status || game?.status || null,
    phase: state?.game?.phase || game?.phase || null,
    turn,
    maxTurn,
    alive: aliveFromState,
    total,
  };
}

export function LandingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const featuredWatchPath = useFeaturedWatchPath();
  const [snapshot, setSnapshot] = useState(null);

  const nextPath = safeNextPath(params.get("next"));

  useEffect(() => {
    let el = document.getElementById(JSON_LD_ID);
    if (!el) {
      el = document.createElement("script");
      el.id = JSON_LD_ID;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = serializeJsonLd(
      buildSeasonJsonLd({
        origin: env.publicOrigin || canonicalUrl("/"),
        siteTitle: env.title,
        ogDescription: campaign.ogDescription,
        seasonName: campaign.name,
        season: campaign.season,
        equalSplit: campaign.equalSplit,
        sameAs: env.telegramInviteUrl ? [toTelegramUniversalUrl(env.telegramInviteUrl)] : undefined,
      }),
    );
    return () => {
      document.getElementById(JSON_LD_ID)?.remove();
    };
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    listGames({ limit: 50, signal: ac.signal })
      .then(async (res) => {
        const game = pickFeaturedWatchGame(res.games || [], {
          fallbackId: campaign.pinnedWatchGameId || null,
        });
        if (!game?.id) {
          setSnapshot(null);
          return;
        }
        try {
          const state = await getGameState(game.id, { signal: ac.signal });
          setSnapshot(buildSnapshot(game, state));
        } catch {
          setSnapshot(buildSnapshot(game, null));
        }
      })
      .catch(() => {
        if (campaign.pinnedWatchGameId) {
          setSnapshot({ gameId: campaign.pinnedWatchGameId, maxTurn: 55 });
        }
      });
    return () => ac.abort();
  }, []);

  const goWatch = useCallback(() => {
    const target =
      nextPath && nextPath.startsWith("/watch")
        ? nextPath
        : snapshot?.gameId
          ? watchPath(snapshot.gameId)
          : featuredWatchPath;
    navigate(target || "/watch");
  }, [featuredWatchPath, navigate, nextPath, snapshot?.gameId]);

  const goEnter = useCallback(() => {
    if (nextPath && nextPath.startsWith("/enroll")) {
      navigate(nextPath);
      return;
    }
    navigate("/enroll");
  }, [navigate, nextPath]);

  const goRecollections = useCallback(
    (path) => {
      navigate(path || "/watch");
    },
    [navigate],
  );

  return (
    <div className="landing-page gate-page">
      <GateHero onEnter={goEnter} onWatch={goWatch} />
      <div className="gate-body">
        <GateSchedule />
        <GatePitch />
        <GatePhases />
        <GateDeathExample onOpenRecollections={goRecollections} />
        <GateMoney />
        <GateHowToEnter onEnter={goEnter} />
        <GateLiveSnapshot snapshot={snapshot} onWatch={goWatch} />
        <GateClose onEnter={goEnter} onWatch={goWatch} />
      </div>
    </div>
  );
}
