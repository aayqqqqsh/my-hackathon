/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { CloudRain, Snowflake, Sun, Moon, ShieldCheck, Check, X, Sparkles } from 'lucide-react';
import type { PreferenceRule, WeatherCondition } from '../types';

export interface WeatherPromptData {
  weather: WeatherCondition;
  matchingRules: PreferenceRule[];
  onConfirm: () => void;
  onDecline: () => void;
}

interface WeatherConfirmationModalProps {
  data: WeatherPromptData | null;
  onClose: () => void;
}

export function WeatherConfirmationModal({
  data,
  onClose,
}: WeatherConfirmationModalProps) {
  if (!data) return null;

  const getWeatherIcon = (weather: WeatherCondition) => {
    switch (weather) {
      case 'rainy':
        return <CloudRain className="w-6 h-6 text-sky-400" />;
      case 'winter':
        return <Snowflake className="w-6 h-6 text-indigo-300" />;
      case 'sunny':
        return <Sun className="w-6 h-6 text-amber-400" />;
      default:
        return <Moon className="w-6 h-6 text-indigo-300" />;
    }
  };

  // Generate dynamic message based on weather condition and matching rule
  let heading = `Weather Transition: ${data.weather.toUpperCase()}`;
  let promptText = `It's now ${data.weather} — you asked me to apply your automation rules when this happens. Apply this now?`;

  if (data.weather === 'rainy') {
    promptText = "It's now raining — you asked me to close doors and windows when this happens. Apply this now?";
  } else if (data.weather === 'winter') {
    promptText = "It's now winter conditions — you asked me to turn off fans and conserve heating when this happens. Apply this now?";
  } else if (data.weather === 'sunny') {
    promptText = "It's now sunny and warm — you asked me to adjust room climate and ventilation. Apply this now?";
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md bg-slate-900 border border-sky-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(56,189,248,0.2)] text-left relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
                {getWeatherIcon(data.weather)}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-sky-400 uppercase">
                  Atmospheric Automation Prompt
                </span>
                <h3 className="text-lg font-bold text-white font-headline">
                  {heading}
                </h3>
              </div>
            </div>

            <button
              onClick={() => {
                data.onDecline();
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Dismiss modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Prompt Statement */}
          <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed mb-4">
            {promptText}
          </p>

          {/* Matching Rule Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">
                Matched Saved Rule:
              </span>
            </div>
            {data.matchingRules.map((rule) => (
              <div key={rule.id} className="text-xs text-slate-300 pl-6 border-l-2 border-amber-500/50">
                <p className="font-semibold text-amber-200">&ldquo;{rule.ruleText}&rdquo;</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{rule.summary}</p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              id="weather-prompt-confirm-btn"
              type="button"
              onClick={() => {
                data.onConfirm();
                onClose();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-sky-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Yes, do it</span>
            </button>

            <button
              id="weather-prompt-decline-btn"
              type="button"
              onClick={() => {
                data.onDecline();
                onClose();
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer border border-slate-700"
            >
              <span>Not this time</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
