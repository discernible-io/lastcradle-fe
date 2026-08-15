import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { WatchLobbyPage } from "./pages/WatchLobbyPage.jsx";
import { ArenaPage } from "./pages/ArenaPage.jsx";
import { TurnRecapPage } from "./pages/TurnRecapPage.jsx";
import { RecollectionsPage } from "./pages/RecollectionsPage.jsx";
import { ContestsPage } from "./pages/ContestsPage.jsx";
import { QualifyingHonorsPage } from "./pages/QualifyingHonorsPage.jsx";
import { PrizesPage } from "./pages/PrizesPage.jsx";
import { EnrollPage } from "./pages/EnrollPage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { GamePage } from "./pages/GamePage.jsx";
import { usePageMeta } from "./hooks/usePageMeta.js";
import { captureUtm } from "./utils/utm.js";
import { useEffect } from "react";

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
        <Route
          path="/contests"
          element={
            <AppShell>
              <ContestsPage />
            </AppShell>
          }
        />
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
          path="/qualifying-honors"
          element={
            <AppShell>
              <QualifyingHonorsPage />
            </AppShell>
          }
        />
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
          path="/game"
          element={
            <AppShell>
              <GamePage />
            </AppShell>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
