/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import type { PreferenceRule, WeatherCondition } from '../types';
import {
  Sparkles,
  Trash2,
  Play,
  CloudRain,
  Sun,
  Snowflake,
  Moon,
  Plus,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface PreferencesPanelProps {
  preferences: PreferenceRule[];
  currentWeather: WeatherCondition;
  onRemovePreference: (id: string) => void;
  onTriggerPreference: (preference: PreferenceRule) => void;
  onAddSampleRule: (rule: Omit<PreferenceRule, 'id' | 'createdAt'>) => void;
}

export function PreferencesPanel({
  preferences,
  currentWeather,
  onRemovePreference,
  onTriggerPreference,
  onAddSampleRule,
}: PreferencesPanelProps) {
  const getConditionIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('storm')) return <CloudRain className="w-4 h-4 text-cyan-400" />;
    if (c.includes('winter') || c.includes('cold') || c.includes('snow')) return <Snowflake className="w-4 h-4 text-blue-300" />;
    if (c.includes('sun') || c.includes('hot') || c.includes('summer')) return <Sun className="w-4 h-4 text-amber-400" />;
    if (c.includes('night') || c.includes('dark')) return <Moon className="w-4 h-4 text-indigo-300" />;
    return <Sparkles className="w-4 h-4 text-purple-400" />;
  };

  const sampleRules = [
    {
      ruleText: 'Close all doors and windows whenever it rains',
      condition: 'rainy',
      conditionDescription: 'Rain / Severe Precipitation',
      summary: 'Automatically lock & close front door, garage door, and kitchen window',
      deviceUpdates: {
        livingRoom: { mainDoorOpen: false },
        kitchen: { windowOpen: false },
        garage: { garageDoorOpen: false },
      },
    },
    {
      ruleText: 'Turn off all AC units and ceiling fans in winter',
      condition: 'winter',
      conditionDescription: 'Winter / Freezing Climate',
      summary: 'Power down all room ACs and ceiling fans for energy conservation',
      deviceUpdates: {
        livingRoom: { acPower: false, fanPower: false },
        bedroomMain: { acPower: false },
        bedroom2: { acPower: false, fanPower: false },
        bedroom3: { acPower: false },
        diningRoom: { acPower: false },
      },
    },
    {
      ruleText: 'Cool down living room and master bedroom on sunny days',
      condition: 'sunny',
      conditionDescription: 'Sunny / Warm Weather',
      summary: 'Turn on AC to 68°F and engage living room fan',
      deviceUpdates: {
        livingRoom: { acPower: true, acTemp: 68, fanPower: true, fanSpeed: 70 },
        bedroomMain: { acPower: true, acTemp: 68 },
      },
    },
  ];

  return (
    <div
      id="home-ai-preferences-panel"
      className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md p-5 sm:p-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white tracking-wide font-headline">
              Autonomous Environmental Rules
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rules captured naturally from your voice statements. Trigger automatically based on simulated weather or manually on demand.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Current Weather:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 capitalize">
            {getConditionIcon(currentWeather)}
            <span>{currentWeather}</span>
          </span>
        </div>
      </div>

      {/* Preferences List */}
      <div className="mt-5 space-y-3">
        <AnimatePresence mode="popLayout">
          {preferences.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-6"
            >
              <Zap className="w-8 h-8 text-amber-400/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">No Custom Rules Stored Yet</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                Say something like <span className="text-slate-300 italic">&ldquo;Close my doors and windows when it rains&rdquo;</span> via voice or add one of the preset automation recipes below.
              </p>

              {/* Sample Rule Quick Add Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {sampleRules.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAddSampleRule(sample)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all hover:border-amber-500/30"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>{sample.ruleText}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            preferences.map((pref) => {
              const isMatch =
                currentWeather.toLowerCase() === pref.condition.toLowerCase() ||
                pref.conditionDescription.toLowerCase().includes(currentWeather.toLowerCase());

              return (
                <motion.div
                  key={pref.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative rounded-xl border p-4 transition-all duration-300 ${
                    isMatch
                      ? 'bg-slate-800/90 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                          {getConditionIcon(pref.condition)}
                          <span className="capitalize">{pref.condition}</span>
                        </span>

                        {isMatch && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Condition Currently Active
                          </span>
                        )}

                        <span className="text-[11px] text-slate-500 font-mono">
                          Stored {pref.createdAt}
                        </span>
                      </div>

                      {/* Plain Language Rule Statement */}
                      <p className="text-sm font-semibold text-slate-100 group-hover:text-amber-200 transition-colors font-sans">
                        &ldquo;{pref.ruleText}&rdquo;
                      </p>

                      <p className="text-xs text-slate-400 font-normal">
                        {pref.summary}
                      </p>

                      {/* Target device states badge */}
                      {pref.deviceUpdates && Object.keys(pref.deviceUpdates).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.entries(pref.deviceUpdates).map(([room, updates]) => (
                            <span
                              key={room}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                            >
                              {room}: {JSON.stringify(updates).replace(/[{}]/g, '')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions: Run / Delete */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <button
                        onClick={() => onTriggerPreference(pref)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all"
                        title="Simulate / Trigger this automation now"
                      >
                        <Play className="w-3.5 h-3.5 text-sky-400" />
                        <span>Run Now</span>
                      </button>

                      <button
                        onClick={() => onRemovePreference(pref.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                        title="Remove preference"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer Add Preset Options */}
      {preferences.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <span>Add more automation recipes:</span>
          <div className="flex flex-wrap gap-2">
            {sampleRules.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => onAddSampleRule(sample)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3 text-amber-400" />
                <span>{sample.condition.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
