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
import { useContestGate } from "../hooks/useContestGate.js";
import { useFeaturedWatchPath } from "../hooks/useFeaturedWatchPath.js";
import { pickFeaturedWatchGame } from "../utils/featuredWatch.js";
import { toTelegramUniversalUrl } from "../utils/telegram.js";

const JSON_LD_ID = "slc-json-ld";

function seasonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: env.title,
        url: canonicalUrl("/"),
        description: campaign.ogDescription,
      },
      {
        "@type": "Organization",
        name: "Discernible",
        url: "https://www.discernible.io",
        sameAs: env.telegramInviteUrl ? [toTelegramUniversalUrl(env.telegramInviteUrl)] : undefined,
      },
      {
        "@type": "Event",
        name: `${env.title} — ${campaign.name}`,
        description: campaign.ogDescription,
        url: canonicalUrl("/"),
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        startDate: "2026-09-10",
        endDate: "2026-09-24",
        location: {
          "@type": "VirtualLocation",
          url: canonicalUrl("/watch"),
        },
        organizer: {
          "@type": "Organization",
          name: "Discernible",
          url: "https://www.discernible.io",
        },
        offers: {
          "@type": "Offer",
          name: `Season ${campaign.season} contest pool`,
          description: campaign.equalSplit,
          url: canonicalUrl("/prizes"),
          availability: "https://schema.org/InStock",
        },
      },
    ],
  };
}

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
  const { acknowledge } = useContestGate();
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
    el.textContent = JSON.stringify(seasonJsonLd());
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
    acknowledge();
    const target =
      nextPath && nextPath.startsWith("/watch")
        ? nextPath
        : snapshot?.gameId
          ? watchPath(snapshot.gameId)
          : featuredWatchPath;
    navigate(target || "/watch");
  }, [acknowledge, featuredWatchPath, navigate, nextPath, snapshot?.gameId]);

  const goEnter = useCallback(() => {
    acknowledge();
    if (nextPath && nextPath.startsWith("/enroll")) {
      navigate(nextPath);
      return;
    }
    navigate("/enroll");
  }, [acknowledge, navigate, nextPath]);

  return (
    <div className="landing-page gate-page">
      <GateHero onEnter={goEnter} onWatch={goWatch} />
      <div className="gate-body">
        <GateSchedule snapshot={snapshot} />
        <GatePitch />
        <GatePhases />
        <GateDeathExample />
        <GateMoney />
        <GateHowToEnter onEnter={goEnter} />
        <GateLiveSnapshot snapshot={snapshot} onWatch={goWatch} />
        <GateClose onEnter={goEnter} onWatch={goWatch} />
      </div>
    </div>
  );
}
