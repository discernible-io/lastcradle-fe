import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { WatchLobbyPage } from "./pages/WatchLobbyPage.jsx";
import { PrizesPage } from "./pages/PrizesPage.jsx";
import { EnrollPage } from "./pages/EnrollPage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { IdentyClawPage } from "./pages/IdentyClawPage.jsx";
import { GamePage } from "./pages/GamePage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { usePageMeta } from "./hooks/usePageMeta.js";
import { captureUtm } from "./utils/utm.js";

const ArenaPage = lazy(() =>
  import("./pages/ArenaPage.jsx").then((m) => ({ default: m.ArenaPage })),
);
const TurnRecapPage = lazy(() =>
  import("./pages/TurnRecapPage.jsx").then((m) => ({ default: m.TurnRecapPage })),
);
const RecollectionsPage = lazy(() =>
  import("./pages/RecollectionsPage.jsx").then((m) => ({ default: m.RecollectionsPage })),
);

function RouteFallback() {
  return (
    <p className="muted" style={{ margin: "2rem auto", maxWidth: "var(--max)", padding: "0 1rem" }}>
      Loading…
    </p>
  );
}

function CampaignBoot() {
  const loc = useLocation();
  useEffect(() => {
    captureUtm(loc.search);
  }, [loc.search]);
  usePageMeta(loc.pathname);
  return null;
}

export default function App() {
  return (
    <>
      <CampaignBoot />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route
            path="/"
            element={
              <AppShell bleed>
                <LandingPage />
              </AppShell>
            }
          />
          <Route
            path="/watch"
            element={
              <AppShell>
                <WatchLobbyPage />
              </AppShell>
            }
          />
          <Route
            path="/watch/:gameId"
            element={
              <AppShell bleed>
                <ArenaPage />
              </AppShell>
            }
          />
          <Route
            path="/watch/:gameId/turn/:turn"
            element={
              <AppShell>
                <TurnRecapPage />
              </AppShell>
            }
          />
          <Route
            path="/watch/:gameId/recollections"
            element={
              <AppShell>
                <RecollectionsPage />
              </AppShell>
            }
          />
          <Route path="/contests" element={<Navigate to="/watch#contests" replace />} />
          <Route
            path="/prizes"
            element={
              <AppShell>
                <PrizesPage />
              </AppShell>
            }
          />
          <Route path="/hall-of-fame" element={<Navigate to="/prizes#hall-of-fame" replace />} />
          <Route
            path="/enroll"
            element={
              <AppShell>
                <EnrollPage />
              </AppShell>
            }
          />
          <Route
            path="/about"
            element={
              <AppShell>
                <AboutPage />
              </AppShell>
            }
          />
          <Route
            path="/identyclaw"
            element={
              <AppShell>
                <IdentyClawPage />
              </AppShell>
            }
          />
          <Route
            path="/game"
            element={
              <AppShell>
                <GamePage />
              </AppShell>
            }
          />
          <Route
            path="*"
            element={
              <AppShell>
                <NotFoundPage />
              </AppShell>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}
