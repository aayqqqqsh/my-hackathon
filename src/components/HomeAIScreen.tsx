/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Mic,
  Send,
  Sparkles,
  CloudRain,
  Sun,
  Snowflake,
  Moon,
  Sliders,
  Bot,
  Layers,
  HelpCircle,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  AlertCircle,
  Box,
  Compass,
} from 'lucide-react';
import { VoiceOrb } from './VoiceOrb';
import { ChatTranscript } from './ChatTranscript';
import { PreferencesPanel } from './PreferencesPanel';
import { LiveDeviceMonitor } from './LiveDeviceMonitor';
import { House3DViewer } from './HouseScene/House3DViewer';
import type {
  AllRoomsState,
  OrbState,
  WeatherCondition,
  TranscriptMessage,
  PreferenceRule,
} from '../types';

interface HomeAIScreenProps {
  onBack: () => void;
  roomsState: AllRoomsState;
  setRoomsState: Dispatch<SetStateAction<AllRoomsState>>;
  preferences: PreferenceRule[];
  setPreferences: Dispatch<SetStateAction<PreferenceRule[]>>;
  transcriptHistory: TranscriptMessage[];
  setTranscriptHistory: Dispatch<SetStateAction<TranscriptMessage[]>>;
  currentWeather: WeatherCondition;
  setCurrentWeather: Dispatch<SetStateAction<WeatherCondition>>;
}

// Global window extension for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export function HomeAIScreen({
  onBack,
  roomsState,
  setRoomsState,
  preferences,
  setPreferences,
  transcriptHistory,
  setTranscriptHistory,
  currentWeather,
  setCurrentWeather,
}: HomeAIScreenProps) {
  const [activeTab, setActiveTab] = useState<'spatial' | 'voice' | 'preferences'>('spatial');
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isPressed, setIsPressed] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [weatherTriggerNotice, setWeatherTriggerNotice] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const pressTimeoutRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef<string>('');

  // Check API health / key presence
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasApiKey));
      })
      .catch(() => {
        setHasApiKey(false);
      });
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setSpeechError(null);
        setOrbState('listening');
        accumulatedTranscriptRef.current = '';
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += transcriptPiece + ' ';
          } else {
            currentInterim += transcriptPiece;
          }
        }

        if (currentFinal) {
          accumulatedTranscriptRef.current += currentFinal;
        }

        setInterimTranscript(currentInterim || accumulatedTranscriptRef.current);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech Recognition notice:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone access denied. You can type commands below.');
        }
      };

      recognition.onend = () => {
        // Handled in stop
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Helper to speak AI responses if TTS is turned on
  const speakResponse = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS playback error:', e);
    }
  };

  // Process user transcript via server-side Gemini endpoint
  const processTranscript = async (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Append user message to transcript log
    const userMsg: TranscriptMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp,
    };

    setTranscriptHistory((prev) => [...prev, userMsg]);
    setOrbState('thinking');
    setInterimTranscript('');

    try {
      const response = await fetch('/api/home-ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          currentState: roomsState,
          preferences,
          currentWeather,
        }),
      });

      const data = await response.json();

      const aiMsgTimestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Handle Device Commands
      if (data.type === 'command' && data.deviceUpdates) {
        // Deep merge updates into roomsState
        setRoomsState((prev) => {
          const next = { ...prev };
          for (const [roomKey, roomUpdates] of Object.entries(data.deviceUpdates)) {
            if (next[roomKey as keyof AllRoomsState]) {
              next[roomKey as keyof AllRoomsState] = {
                ...next[roomKey as keyof AllRoomsState],
                ...(roomUpdates as object),
              } as any;
            }
          }
          return next;
        });

        const aiMsg: TranscriptMessage = {
          id: `msg-${Date.now()}-ai`,
          sender: 'ai',
          text: data.message || 'Command executed.',
          timestamp: aiMsgTimestamp,
          type: 'command',
          deviceUpdates: data.deviceUpdates,
        };

        setTranscriptHistory((prev) => [...prev, aiMsg]);
        speakResponse(aiMsg.text);
      }
      // Handle Stated Preferences / Automation Rules
      else if (data.type === 'preference' && data.preference) {
        const newPref: PreferenceRule = {
          id: data.preference.id || `pref-${Date.now()}`,
          ruleText: data.preference.ruleText || text,
          condition: data.preference.condition || 'rainy',
          conditionDescription: data.preference.conditionDescription || 'Automated condition',
          summary: data.preference.summary || `Execute custom automation for ${data.preference.condition}`,
          deviceUpdates: data.preference.deviceUpdates || {},
          createdAt: 'Just now',
        };

        setPreferences((prev) => [newPref, ...prev]);

        const aiMsg: TranscriptMessage = {
          id: `msg-${Date.now()}-ai`,
          sender: 'ai',
          text:
            data.message ||
            `I've remembered your preference: "${newPref.ruleText}". It has been added to your rules list.`,
          timestamp: aiMsgTimestamp,
          type: 'preference',
        };

        setTranscriptHistory((prev) => [...prev, aiMsg]);
        speakResponse(aiMsg.text);
      }
      // Handle General Chat
      else {
        const aiMsg: TranscriptMessage = {
          id: `msg-${Date.now()}-ai`,
          sender: 'ai',
          text: data.message || "I'm listening and monitoring your home systems.",
          timestamp: aiMsgTimestamp,
          type: 'chat',
        };

        setTranscriptHistory((prev) => [...prev, aiMsg]);
        speakResponse(aiMsg.text);
      }
    } catch (err: any) {
      console.error('Home AI processing failure:', err);
      const aiErrMsg: TranscriptMessage = {
        id: `msg-${Date.now()}-error`,
        sender: 'ai',
        text: 'Sorry, I had trouble processing that request. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'chat',
      };
      setTranscriptHistory((prev) => [...prev, aiErrMsg]);
    } finally {
      setOrbState('idle');
    }
  };

  // Push-to-Talk Event Handlers
  const handleStartListening = () => {
    setIsPressed(true);
    setSpeechError(null);
    setInterimTranscript('');
    accumulatedTranscriptRef.current = '';

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        // If already started, ignore
      }
    } else {
      setOrbState('listening');
    }
  };

  const handleStopListening = () => {
    if (!isPressed) return;
    setIsPressed(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Give a short delay to let final speech recognition tokens settle
    setTimeout(() => {
      const finalRecorded = accumulatedTranscriptRef.current.trim() || interimTranscript.trim();
      if (finalRecorded) {
        processTranscript(finalRecorded);
      } else {
        setOrbState('idle');
        setInterimTranscript('');
      }
    }, 350);
  };

  // Handle weather change simulation & apply matching stored preferences
  const handleWeatherChange = (newWeather: WeatherCondition) => {
    if (newWeather === currentWeather) return;

    setCurrentWeather(newWeather);

    // Find any preferences matching this new weather condition
    const matchingRules = preferences.filter((pref) => {
      const condition = pref.condition.toLowerCase();
      const desc = pref.conditionDescription.toLowerCase();
      const target = newWeather.toLowerCase();
      return condition === target || desc.includes(target) || (target === 'rainy' && (condition.includes('rain') || condition.includes('storm')));
    });

    if (matchingRules.length > 0) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Apply all matching device updates
      let mergedUpdates: Record<string, any> = {};

      matchingRules.forEach((rule) => {
        mergedUpdates = { ...mergedUpdates, ...rule.deviceUpdates };
      });

      setRoomsState((prev) => {
        const next = { ...prev };
        for (const [roomKey, roomUpdates] of Object.entries(mergedUpdates)) {
          if (next[roomKey as keyof AllRoomsState]) {
            next[roomKey as keyof AllRoomsState] = {
              ...next[roomKey as keyof AllRoomsState],
              ...(roomUpdates as object),
            } as any;
          }
        }
        return next;
      });

      // Craft proactive notification text as requested
      let notificationText = '';
      if (newWeather === 'rainy') {
        notificationText = "It's raining — I've closed the doors and windows. I remembered you wanted that.";
      } else if (newWeather === 'winter') {
        notificationText = "Winter conditions detected — I've turned off AC units and ceiling fans as you instructed.";
      } else if (newWeather === 'sunny') {
        notificationText = "It's sunny outside — I've optimized the climate controls according to your preference.";
      } else {
        notificationText = `Weather changed to ${newWeather} — I've applied your ${matchingRules.length} saved automation rule(s).`;
      }

      const systemMsg: TranscriptMessage = {
        id: `msg-${Date.now()}-system`,
        sender: 'system',
        text: notificationText,
        timestamp,
        type: 'weather_trigger',
        deviceUpdates: mergedUpdates,
      };

      setTranscriptHistory((prev) => [...prev, systemMsg]);
      speakResponse(notificationText);

      setWeatherTriggerNotice(notificationText);
      setTimeout(() => setWeatherTriggerNotice(null), 5000);
    }
  };

  // Trigger individual preference manually
  const handleTriggerPreference = (rule: PreferenceRule) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setRoomsState((prev) => {
      const next = { ...prev };
      for (const [roomKey, roomUpdates] of Object.entries(rule.deviceUpdates)) {
        if (next[roomKey as keyof AllRoomsState]) {
          next[roomKey as keyof AllRoomsState] = {
            ...next[roomKey as keyof AllRoomsState],
            ...(roomUpdates as object),
          } as any;
        }
      }
      return next;
    });

    const triggerMsg: TranscriptMessage = {
      id: `msg-${Date.now()}-pref-manual`,
      sender: 'system',
      text: `Manual Automation Trigger: Applied rule "${rule.ruleText}".`,
      timestamp,
      type: 'weather_trigger',
      deviceUpdates: rule.deviceUpdates,
    };

    setTranscriptHistory((prev) => [...prev, triggerMsg]);
    speakResponse(`Executed rule: ${rule.ruleText}`);
  };

  const handleRemovePreference = (id: string) => {
    setPreferences((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddSampleRule = (rule: Omit<PreferenceRule, 'id' | 'createdAt'>) => {
    const newPref: PreferenceRule = {
      ...rule,
      id: `pref-${Date.now()}`,
      createdAt: 'Just now',
    };
    setPreferences((prev) => [newPref, ...prev]);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const aiMsg: TranscriptMessage = {
      id: `msg-${Date.now()}-ai-sample`,
      sender: 'ai',
      text: `Added new automation recipe: "${newPref.ruleText}".`,
      timestamp,
      type: 'preference',
    };
    setTranscriptHistory((prev) => [...prev, aiMsg]);
  };

  // Quick sample command chip clicked
  const handleSamplePrompt = (prompt: string) => {
    processTranscript(prompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            id="home-ai-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sky-400 group-hover:-translate-x-1 transition-transform" />
            <span>Dashboard</span>
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-headline text-lg sm:text-xl text-white font-bold tracking-wide">
                Voice & Automation Hub
              </h2>
              <span className="text-xs font-mono text-emerald-400">
                • 9 Rooms Online
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live acoustic command reception and proactive weather protection rules
            </p>
          </div>
        </div>

        {/* Right side controls: Segmented Weather Switcher & TTS Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Segmented Weather Simulation Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 px-2.5">
              Weather:
            </span>

            <div className="flex items-center gap-1">
              <button
                id="weather-toggle-sunny"
                onClick={() => handleWeatherChange('sunny')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentWeather === 'sunny'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Simulate Sunny Climate"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Sunny</span>
              </button>

              <button
                id="weather-toggle-rainy"
                onClick={() => handleWeatherChange('rainy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentWeather === 'rainy'
                    ? 'bg-sky-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Simulate Rainy Weather (Triggers Rain Rules)"
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span>Rainy</span>
              </button>

              <button
                id="weather-toggle-winter"
                onClick={() => handleWeatherChange('winter')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentWeather === 'winter'
                    ? 'bg-indigo-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Simulate Winter Weather"
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>Winter</span>
              </button>
            </div>
          </div>

          {/* Spoken Output Toggle */}
          <button
            id="toggle-tts-audio"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 transition-colors ${
              ttsEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={ttsEnabled ? 'Spoken Voice Output: Enabled' : 'Spoken Voice Output: Muted'}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="font-mono text-xs">{ttsEnabled ? 'Voice Active' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Proactive Weather Trigger Notification Toast */}
      <AnimatePresence>
        {weatherTriggerNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-sky-950/50 border border-sky-500/40 flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <CloudRain className="w-5 h-5 text-sky-400 shrink-0" />
              <p className="text-xs sm:text-sm text-sky-100 font-medium">
                {weatherTriggerNotice}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Rule Applied
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Section Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          id="tab-spatial-3d"
          onClick={() => setActiveTab('spatial')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'spatial'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Box className="w-4 h-4 text-sky-400" />
          <span>3D House Scene</span>
        </button>

        <button
          id="tab-voice-ai"
          onClick={() => setActiveTab('voice')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'voice'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Mic className="w-4 h-4 text-sky-400" />
          <span>Voice Terminal</span>
        </button>

        <button
          id="tab-preferences"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'preferences'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Autonomous Protection Rules</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-amber-300 border border-slate-800">
            {preferences.length}
          </span>
        </button>
      </div>

      {/* TAB 1: 3D Spatial House Interactive Scene */}
      {activeTab === 'spatial' && (
        <div className="space-y-6">
          <House3DViewer
            roomsState={roomsState}
            setRoomsState={setRoomsState}
            onDeviceAction={(msg) => {
              // Add entry to transcript history
              setTranscriptHistory((prev) => [
                ...prev,
                {
                  id: `action-${Date.now()}`,
                  sender: 'system',
                  text: `[3D Spatial Interaction] ${msg}`,
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  type: 'command',
                },
              ]);
            }}
          />

          {/* Quick Telemetry & Voice Companion Strip underneath 3D Scene */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <LiveDeviceMonitor roomsState={roomsState} />
            </div>
            <div className="lg:col-span-5">
              <ChatTranscript
                messages={transcriptHistory}
                onClear={() => setTranscriptHistory([])}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Voice & Chat Terminal */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          {/* Integrated House Zone & Push-to-Talk Interactive Console */}
          <div
            id="voice-interaction-console"
            className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-5 sm:p-7 flex flex-col items-center justify-center relative shadow-xl"
          >
            {/* Real-time House Zone Acoustic Console */}
            <VoiceOrb
              state={orbState}
              interimTranscript={interimTranscript}
              isPressed={isPressed}
              roomsState={roomsState}
            />

            {/* Unified Command Toolstrip: Push-to-Talk Button + Integrated Typed Command Input */}
            <div className="w-full mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row items-center gap-3">
              {/* Push-to-Talk Microphone Button */}
              <button
                id="push-to-talk-btn"
                onMouseDown={handleStartListening}
                onMouseUp={handleStopListening}
                onTouchStart={handleStartListening}
                onTouchEnd={handleStopListening}
                onMouseLeave={() => {
                  if (isPressed) handleStopListening();
                }}
                disabled={orbState === 'thinking'}
                className={`w-full md:w-auto px-6 py-3.5 rounded-xl font-mono text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all select-none cursor-pointer shrink-0 ${
                  isPressed
                    ? 'bg-amber-400 text-slate-950 shadow-lg scale-[0.98]'
                    : orbState === 'thinking'
                    ? 'bg-slate-800 text-amber-300 border border-amber-500/30 cursor-wait'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md active:scale-95'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>
                  {isPressed
                    ? 'Release to Send'
                    : orbState === 'thinking'
                    ? 'Processing...'
                    : 'Hold to Speak'}
                </span>
              </button>

              {/* Integrated Text Input Field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (textInput.trim() && orbState !== 'thinking') {
                    processTranscript(textInput);
                    setTextInput('');
                  }
                }}
                className="w-full flex-1 flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-slate-600 transition-colors"
              >
                <input
                  id="voice-text-command-input"
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type any zone instruction or rule (e.g. Close windows when it rains)..."
                  disabled={orbState === 'thinking'}
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                />
                <button
                  id="voice-text-command-submit"
                  type="submit"
                  disabled={!textInput.trim() || orbState === 'thinking'}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                  title="Send Command"
                >
                  <span>Execute</span>
                  <Send className="w-3 h-3 text-sky-400" />
                </button>
              </form>
            </div>

            {speechError && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}

            {/* Quick Action Shortcuts */}
            <div className="w-full mt-4 flex flex-wrap items-center justify-start gap-2 pt-3 border-t border-slate-800/40 text-xs">
              <span className="text-slate-400 font-mono text-[11px] mr-1">Quick actions:</span>
              {[
                'Close doors and windows when it rains',
                'Lock all exterior doors',
                'Turn on dining chandelier',
                'Set living room AC to 68',
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSamplePrompt(sample)}
                  disabled={orbState === 'thinking'}
                  className="px-2.5 py-1 rounded-md text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Transcript Log and Live Synchronized Device States */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <ChatTranscript
                messages={transcriptHistory}
                onClear={() => setTranscriptHistory([])}
              />
            </div>
            <div className="lg:col-span-5">
              <LiveDeviceMonitor roomsState={roomsState} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Stored Rules & Preferences */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <PreferencesPanel
            preferences={preferences}
            currentWeather={currentWeather}
            onRemovePreference={handleRemovePreference}
            onTriggerPreference={handleTriggerPreference}
            onAddSampleRule={handleAddSampleRule}
          />
          <LiveDeviceMonitor roomsState={roomsState} />
        </div>
      )}
    </motion.div>
  );
}
