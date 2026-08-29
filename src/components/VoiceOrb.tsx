/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import type { OrbState, AllRoomsState } from '../types';
import {
  Mic,
  Volume2,
  Sliders,
  DoorClosed,
  Wind,
  Thermometer,
  Lightbulb,
  Fan,
  Shield,
  Home,
  CheckCircle2,
  Activity,
  Radio,
} from 'lucide-react';

interface VoiceOrbProps {
  state: OrbState;
  interimTranscript?: string;
  isPressed?: boolean;
  roomsState?: AllRoomsState;
}

const HOUSE_ZONES = [
  { id: 'living', name: 'Living Room', icon: Home, endpoint: 'Front Door & Climate' },
  { id: 'kitchen', name: 'Kitchen', icon: Wind, endpoint: 'Window & Exhaust' },
  { id: 'bedroomMain', name: 'Master Bed', icon: Thermometer, endpoint: 'AC & Ambient Lights' },
  { id: 'balcony', name: 'Balcony', icon: Wind, endpoint: 'Weather Shield & Vent' },
  { id: 'garage', name: 'Garage', icon: DoorClosed, endpoint: 'Roll-up Door & Sensor' },
  { id: 'diningRoom', name: 'Dining Room', icon: Lightbulb, endpoint: 'Chandelier & Heat' },
  { id: 'bathroom', name: 'Bathroom', icon: Fan, endpoint: 'Ventilation Fan' },
  { id: 'porch', name: 'Porch', icon: Shield, endpoint: 'Exterior Lights & Motion' },
  { id: 'hallway', name: 'Hallway', icon: Radio, endpoint: 'Central HVAC Duct' },
];

export function VoiceOrb({ state, interimTranscript, isPressed, roomsState }: VoiceOrbProps) {
  const isListening = isPressed || state === 'listening';
  const isThinking = state === 'thinking';

  // Dynamic waveform bars for listening state
  const waveformHeights = [14, 28, 42, 20, 36, 48, 24, 40, 18, 32, 46, 22, 38, 16];

  return (
    <div id="home-voice-zone-console" className="w-full flex flex-col items-center">
      {/* Top Acoustic & Sensor Activity Header Bar */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isListening
                ? 'bg-sky-400 animate-ping'
                : isThinking
                ? 'bg-amber-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-xs font-mono font-medium text-slate-300">
            {isListening
              ? 'Microphone Active • Receiving Voice Command'
              : isThinking
              ? 'Context Engine • Processing Zone Instructions'
              : 'Voice Sensor Ready • 9 Zones Connected'}
          </span>
        </div>

        {/* Live Acoustic Frequency Waveform (Active during listening/thinking) */}
        <div className="flex items-center gap-1 h-6">
          {waveformHeights.map((height, i) => (
            <motion.div
              key={i}
              className={`w-1 rounded-full transition-colors ${
                isListening
                  ? 'bg-sky-400'
                  : isThinking
                  ? 'bg-amber-400'
                  : 'bg-slate-700'
              }`}
              animate={{
                height: isListening
                  ? [height * 0.4, height, height * 0.3]
                  : isThinking
                  ? [height * 0.3, height * 0.7, height * 0.4]
                  : 4,
                opacity: isListening ? [0.6, 1, 0.6] : isThinking ? 0.8 : 0.3,
              }}
              transition={{
                repeat: Infinity,
                duration: isListening ? 0.6 + (i % 5) * 0.1 : 1.2,
                ease: 'easeInOut',
                delay: i * 0.04,
              }}
            />
          ))}
        </div>
      </div>

      {/* Spoken Transcript Terminal HUD (Displays live voice or active state) */}
      <div className="w-full min-h-[58px] px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4 mb-5 transition-all">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : isThinking
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isListening ? (
              <Mic className="w-4 h-4" />
            ) : isThinking ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </div>

          <div className="truncate">
            <div className="text-[10px] font-mono uppercase text-slate-400">
              {isListening
                ? 'Transcribing Input'
                : isThinking
                ? 'Evaluating Safety Rules'
                : 'Voice Instruction Readout'}
            </div>
            <div className="text-sm font-medium text-slate-200 truncate mt-0.5">
              {interimTranscript ? (
                <span className="text-sky-300 font-mono">&ldquo;{interimTranscript}&rdquo;</span>
              ) : isListening ? (
                <span className="text-slate-400 italic">Listening for spoken command...</span>
              ) : isThinking ? (
                <span className="text-amber-300 font-mono">Parsing command and validating environmental rules...</span>
              ) : (
                <span className="text-slate-400">Hold microphone button below or type a command to control any zone.</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick status label */}
        <span className="hidden sm:inline text-xs font-mono text-slate-400 shrink-0">
          {isListening ? 'Streaming' : isThinking ? 'Applying' : 'Standby'}
        </span>
      </div>

      {/* House Zone Responsive Grid: Shows real rooms reacting to voice */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
        {HOUSE_ZONES.map((zone) => {
          const Icon = zone.icon;
          const isTargeted =
            isThinking &&
            interimTranscript &&
            interimTranscript.toLowerCase().includes(zone.name.toLowerCase().split(' ')[0]);

          return (
            <motion.div
              key={zone.id}
              animate={{
                scale: isTargeted ? 1.02 : 1,
              }}
              className={`p-3.5 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                isTargeted
                  ? 'bg-amber-950/30 border-amber-500/60 shadow-lg'
                  : isListening
                  ? 'bg-slate-900/80 border-sky-500/30'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Target pulse indicator */}
              {isTargeted && (
                <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl bg-amber-500/20 text-amber-300 border-b border-l border-amber-500/40 text-[9px] font-mono">
                  TARGET
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isTargeted
                        ? 'bg-amber-500/20 text-amber-300'
                        : isListening
                        ? 'bg-sky-500/10 text-sky-400'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{zone.name}</span>
                </div>

                <span className="text-[10px] font-mono text-emerald-400/90">Online</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                <span className="truncate max-w-[140px]">{zone.endpoint}</span>
                <span className="text-[10px] text-slate-400">
                  {isListening ? 'Sensing' : 'Ready'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
