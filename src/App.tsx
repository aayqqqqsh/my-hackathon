/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CursorGlow } from './components/CursorGlow';
import { BackgroundAmbient } from './components/BackgroundAmbient';
import { IntroOverlay } from './components/IntroOverlay';
import { HeroAboutSection } from './components/HeroAboutSection';
import { QuickDashboard } from './components/QuickDashboard';
import { LoadingScreen } from './components/LoadingScreen';
import { HomeAIScreen } from './components/HomeAIScreen';
import type {
  AllRoomsState,
  ViewMode,
  PreferenceRule,
  TranscriptMessage,
  WeatherCondition,
} from './types';

export default function App() {
  const [introFinished, setIntroFinished] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [currentWeather, setCurrentWeather] = useState<WeatherCondition>('sunny');

  // Shared Multi-Room Home State
  const [roomsState, setRoomsState] = useState<AllRoomsState>({
    livingRoom: {
      mainDoorOpen: false,
      fanPower: true,
      fanSpeed: 60,
      fanMode: 'med',
      acPower: true,
      acTemp: 72,
    },
    bedroomMain: {
      lightPower: true,
      lamp1Power: true,
      lamp1Intensity: 70,
      lamp2Power: true,
      lamp2Intensity: 45,
      acPower: true,
      acTemp: 68,
    },
    bedroom2: {
      lightPower: false,
      lampPower: false,
      lampIntensity: 80,
      acPower: false,
      acTemp: 72,
      fanPower: false,
      fanSpeed: 50,
      fanMode: 'low',
    },
    bedroom3: {
      lightPower: false,
      lampPower: false,
      lampIntensity: 50,
      acPower: false,
      acTemp: 74,
    },
    diningRoom: {
      lightPower: true,
      acPower: true,
      acTemp: 71,
    },
    kitchen: {
      chimneyPower: false,
      chimneySpeed: 'med',
      windowOpen: false,
    },
    bathroomMain: {
      lightPower: true,
      exhaustFanPower: true,
    },
    bathroom2: {
      lightPower: false,
      exhaustFanPower: false,
    },
    garage: {
      garageDoorOpen: false,
      lightPower: false,
    },
  });

  // Shared Stored Rules & Preferences
  const [preferences, setPreferences] = useState<PreferenceRule[]>([
    {
      id: 'pref-default-1',
      ruleText: 'Close doors and windows when it rains',
      condition: 'rainy',
      conditionDescription: 'Rain / Severe precipitation',
      summary: 'Lock front main door, garage door, and shut kitchen window',
      deviceUpdates: {
        livingRoom: { mainDoorOpen: false },
        kitchen: { windowOpen: false },
        garage: { garageDoorOpen: false },
      },
      createdAt: 'Default Protection Rule',
    },
  ]);

  // Shared Voice & Chat Interaction Transcript
  const [transcriptHistory, setTranscriptHistory] = useState<TranscriptMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: "Welcome to KeepSafe Home AI. I'm connected to all 9 zones in your house. Hold the push-to-talk button to give voice commands or teach me automation rules.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'chat',
    },
  ]);

  const handleAccessHome = () => {
    setViewMode('loading');
  };

  const handleLoadingComplete = () => {
    setViewMode('layout');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
  };

  return (
    <main className="relative min-h-screen bg-[#050505] text-[#e5e5e5] selection:bg-blue-600/30 selection:text-blue-200">
      {/* Intro Animation Gating Access */}
      {!introFinished && (
        <IntroOverlay onComplete={() => setIntroFinished(true)} />
      )}

      {/* GLOBAL EFFECT 1: Ambient Background Animation */}
      <BackgroundAmbient />

      {/* GLOBAL EFFECT 2: High-Performance Cursor Glow */}
      <CursorGlow />

      {/* Main Content Area (Revealed after intro) */}
      <div
        className={`relative z-10 w-full transition-opacity duration-700 ease-out ${
          introFinished ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {viewMode === 'dashboard' && (
          <>
            {/* SECTION 1 — Hero / About */}
            <HeroAboutSection />

            {/* SECTION 2 — Multi-Room Quick Dashboard */}
            <QuickDashboard
              roomsState={roomsState}
              setRoomsState={setRoomsState}
              onAccessHome={handleAccessHome}
            />
          </>
        )}

        {viewMode === 'loading' && (
          <div className="min-h-screen flex items-center justify-center p-4">
            <LoadingScreen onComplete={handleLoadingComplete} />
          </div>
        )}

        {viewMode === 'layout' && (
          <div className="min-h-screen pt-8 pb-20 px-4 sm:px-6 lg:px-8">
            <HomeAIScreen
              onBack={handleBackToDashboard}
              roomsState={roomsState}
              setRoomsState={setRoomsState}
              preferences={preferences}
              setPreferences={setPreferences}
              transcriptHistory={transcriptHistory}
              setTranscriptHistory={setTranscriptHistory}
              currentWeather={currentWeather}
              setCurrentWeather={setCurrentWeather}
            />
          </div>
        )}
      </div>
    </main>
  );
}
