/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sofa,
  BedDouble,
  Bed,
  Utensils,
  ChefHat,
  Bath,
  Warehouse,
  Sun,
  Lightbulb,
  Fan,
  ThermometerSnowflake,
  DoorClosed,
  DoorOpen,
  Wind,
  Power,
  Sliders,
  Sparkles,
  SlidersHorizontal,
  Home,
  type LucideIcon,
} from 'lucide-react';
import type { AllRoomsState, TemperatureUnit } from '../types';
import {
  formatTemperature,
  toCelsius,
  toFahrenheit,
  checkAcPowerSaving,
} from '../utils/powerAndTemp';
import type { AcPowerSavingPromptData } from './AcPowerSavingModal';

interface ZoneManualControlsProps {
  roomsState: AllRoomsState;
  setRoomsState: React.Dispatch<React.SetStateAction<AllRoomsState>>;
  tempUnit: TemperatureUnit;
  onRequestAcOptimization?: (prompt: AcPowerSavingPromptData) => void;
  dismissedSuggestionsRef?: React.MutableRefObject<Set<string>>;
}

export function ZoneManualControls({
  roomsState,
  setRoomsState,
  tempUnit,
  onRequestAcOptimization,
  dismissedSuggestionsRef,
}: ZoneManualControlsProps) {
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');

  // Generic AC temperature change with power-saving verification
  const handleAcTempChange = (
    roomKey: keyof AllRoomsState,
    roomName: string,
    newTempF: number,
    currentTempF: number
  ) => {
    const clampedTempF = Math.min(85, Math.max(60, newTempF));
    const dismissedKey = `${roomKey}-${clampedTempF}`;

    const check = checkAcPowerSaving(clampedTempF, currentTempF);

    if (
      check.isAggressive &&
      onRequestAcOptimization &&
      !dismissedSuggestionsRef?.current.has(dismissedKey)
    ) {
      onRequestAcOptimization({
        roomName,
        targetTempF: clampedTempF,
        suggestedTempF: check.suggestedTempF,
        onConfirmOptimize: () => {
          setRoomsState((prev) => ({
            ...prev,
            [roomKey]: {
              ...(prev[roomKey] as any),
              acTemp: check.suggestedTempF,
            },
          }));
        },
        onKeepSetting: () => {
          dismissedSuggestionsRef?.current.add(dismissedKey);
          setRoomsState((prev) => ({
            ...prev,
            [roomKey]: {
              ...(prev[roomKey] as any),
              acTemp: clampedTempF,
            },
          }));
        },
      });
    } else {
      setRoomsState((prev) => ({
        ...prev,
        [roomKey]: {
          ...(prev[roomKey] as any),
          acTemp: clampedTempF,
        },
      }));
    }
  };

  // Quick helper updaters
  const updateLiving = (patch: Partial<AllRoomsState['livingRoom']>) => {
    setRoomsState((prev) => ({
      ...prev,
      livingRoom: { ...prev.livingRoom, ...patch },
    }));
  };

  const updateBedroomMain = (patch: Partial<AllRoomsState['bedroomMain']>) => {
    setRoomsState((prev) => ({
      ...prev,
      bedroomMain: { ...prev.bedroomMain, ...patch },
    }));
  };

  const updateBedroom2 = (patch: Partial<AllRoomsState['bedroom2']>) => {
    setRoomsState((prev) => ({
      ...prev,
      bedroom2: { ...prev.bedroom2, ...patch },
    }));
  };

  const updateBedroom3 = (patch: Partial<AllRoomsState['bedroom3']>) => {
    setRoomsState((prev) => ({
      ...prev,
      bedroom3: { ...prev.bedroom3, ...patch },
    }));
  };

  const updateDining = (patch: Partial<AllRoomsState['diningRoom']>) => {
    setRoomsState((prev) => ({
      ...prev,
      diningRoom: { ...prev.diningRoom, ...patch },
    }));
  };

  const updateKitchen = (patch: Partial<AllRoomsState['kitchen']>) => {
    setRoomsState((prev) => ({
      ...prev,
      kitchen: { ...prev.kitchen, ...patch },
    }));
  };

  const updateBathroomMain = (patch: Partial<AllRoomsState['bathroomMain']>) => {
    setRoomsState((prev) => ({
      ...prev,
      bathroomMain: { ...prev.bathroomMain, ...patch },
    }));
  };

  const updateBathroom2 = (patch: Partial<AllRoomsState['bathroom2']>) => {
    setRoomsState((prev) => ({
      ...prev,
      bathroom2: { ...prev.bathroom2, ...patch },
    }));
  };

  const updateGarage = (patch: Partial<AllRoomsState['garage']>) => {
    setRoomsState((prev) => ({
      ...prev,
      garage: { ...prev.garage, ...patch },
    }));
  };

  const zones = [
    { id: 'all', label: 'All 9 Zones' },
    { id: 'living', label: 'Living Room' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'bedroom-main', label: 'Master Bed' },
    { id: 'bedroom-2', label: 'Bedroom 2' },
    { id: 'bedroom-3', label: 'Bedroom 3 / Studio' },
    { id: 'dining', label: 'Dining Room' },
    { id: 'bathrooms', label: 'Bathrooms' },
    { id: 'garage', label: 'Garage' },
    { id: 'porch', label: 'Front Porch / Entry' },
  ];

  return (
    <div
      id="zone-manual-controls-container"
      className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md p-4 sm:p-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-headline">
              Interactive Zone Manual Controls
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Directly switch doors, adjust fans, dim lights, and tune climate across every zone.
          </p>
        </div>

        {/* Zone quick filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => setSelectedZoneFilter(z.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                selectedZoneFilter === z.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {/* ========================================================================= */}
        {/* 1. LIVING ROOM                                                            */}
        {/* ========================================================================= */}
        {(selectedZoneFilter === 'all' || selectedZoneFilter === 'living') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Sofa className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Living Room
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                3 Controls
              </span>
            </div>

            {/* Front Door Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                {roomsState.livingRoom.mainDoorOpen ? (
                  <DoorOpen className="w-4 h-4 text-amber-400" />
                ) : (
                  <DoorClosed className="w-4 h-4 text-emerald-400" />
                )}
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Main Front Door</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {roomsState.livingRoom.mainDoorOpen ? 'UNLOCKED / AJAR' : 'SECURELY LOCKED'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => updateLiving({ mainDoorOpen: !roomsState.livingRoom.mainDoorOpen })}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                  roomsState.livingRoom.mainDoorOpen
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {roomsState.livingRoom.mainDoorOpen ? 'Lock' : 'Open'}
              </button>
            </div>

            {/* Ceiling Fan with Slider */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fan className={`w-4 h-4 ${roomsState.livingRoom.fanPower ? 'text-sky-400 animate-spin' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold text-slate-200">Ceiling Fan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-sky-400 font-bold">
                    {roomsState.livingRoom.fanPower ? `${roomsState.livingRoom.fanSpeed}%` : 'OFF'}
                  </span>
                  <button
                    onClick={() => {
                      const next = !roomsState.livingRoom.fanPower;
                      updateLiving({
                        fanPower: next,
                        fanMode: next ? 'med' : 'off',
                        fanSpeed: next ? (roomsState.livingRoom.fanSpeed || 60) : 0,
                      });
                    }}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      roomsState.livingRoom.fanPower ? 'bg-sky-500' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      roomsState.livingRoom.fanPower ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                disabled={!roomsState.livingRoom.fanPower}
                value={roomsState.livingRoom.fanPower ? roomsState.livingRoom.fanSpeed : 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  let mode: 'off' | 'low' | 'med' | 'high' = 'off';
                  if (val > 70) mode = 'high';
                  else if (val > 30) mode = 'med';
                  else if (val > 0) mode = 'low';
                  updateLiving({ fanSpeed: val, fanMode: mode, fanPower: val > 0 });
                }}
                className="w-full accent-sky-400 h-1.5 bg-slate-950 rounded-full cursor-pointer disabled:opacity-30"
              />
            </div>

            {/* Living AC with Temp Stepper / Slider */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThermometerSnowflake className={`w-4 h-4 ${roomsState.livingRoom.acPower ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold text-slate-200">Living HVAC AC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {roomsState.livingRoom.acPower ? formatTemperature(roomsState.livingRoom.acTemp, tempUnit) : 'STANDBY'}
                  </span>
                  <button
                    onClick={() => updateLiving({ acPower: !roomsState.livingRoom.acPower })}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      roomsState.livingRoom.acPower ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      roomsState.livingRoom.acPower ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Temperature Adjuster */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  disabled={!roomsState.livingRoom.acPower}
                  onClick={() =>
                    handleAcTempChange(
                      'livingRoom',
                      'Living Room',
                      roomsState.livingRoom.acTemp - 1,
                      roomsState.livingRoom.acTemp
                    )
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs font-mono"
                >
                  -
                </button>
                <input
                  type="range"
                  min="60"
                  max="85"
                  disabled={!roomsState.livingRoom.acPower}
                  value={roomsState.livingRoom.acTemp}
                  onChange={(e) =>
                    handleAcTempChange(
                      'livingRoom',
                      'Living Room',
                      Number(e.target.value),
                      roomsState.livingRoom.acTemp
                    )
                  }
                  className="flex-1 accent-blue-500 h-1.5 bg-slate-950 rounded-full cursor-pointer disabled:opacity-30"
                />
                <button
                  disabled={!roomsState.livingRoom.acPower}
                  onClick={() =>
                    handleAcTempChange(
                      'livingRoom',
                      'Living Room',
                      roomsState.livingRoom.acTemp + 1,
                      roomsState.livingRoom.acTemp
                    )
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs font-mono"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. KITCHEN                                                                */}
        {/* ========================================================================= */}
        {(selectedZoneFilter === 'all' || selectedZoneFilter === 'kitchen') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Kitchen
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                2 Controls
              </span>
            </div>

            {/* Kitchen Window Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Wind className={`w-4 h-4 ${roomsState.kitchen.windowOpen ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Ventilation Window</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {roomsState.kitchen.windowOpen ? 'AJAR / VENTING' : 'WEATHER SHUT'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => updateKitchen({ windowOpen: !roomsState.kitchen.windowOpen })}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                  roomsState.kitchen.windowOpen
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {roomsState.kitchen.windowOpen ? 'Shut' : 'Open'}
              </button>
            </div>

            {/* Range Exhaust Chimney */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className={`w-4 h-4 ${roomsState.kitchen.chimneyPower ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold text-slate-200">Range Chimney Exhaust</span>
                </div>
                <button
                  onClick={() => updateKitchen({ chimneyPower: !roomsState.kitchen.chimneyPower })}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    roomsState.kitchen.chimneyPower ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    roomsState.kitchen.chimneyPower ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Speed Buttons */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {(['low', 'med', 'high', 'turbo'] as const).map((spd) => (
                  <button
                    key={spd}
                    disabled={!roomsState.kitchen.chimneyPower}
                    onClick={() => updateKitchen({ chimneySpeed: spd })}
                    className={`py-1 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                      roomsState.kitchen.chimneySpeed === spd && roomsState.kitchen.chimneyPower
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 disabled:opacity-30'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. MASTER BEDROOM                                                         */}
        {/* ========================================================================= */}
        {(selectedZoneFilter === 'all' || selectedZoneFilter === 'bedroom-main') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Master Bedroom
                </h4>
              </div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                4 Controls
              </span>
            </div>

            {/* Master Light Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Lightbulb className={`w-4 h-4 ${roomsState.bedroomMain.lightPower ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold text-slate-200">Overhead Fixture</span>
              </div>
              <button
                onClick={() => updateBedroomMain({ lightPower: !roomsState.bedroomMain.lightPower })}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  roomsState.bedroomMain.lightPower ? 'bg-amber-400' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  roomsState.bedroomMain.lightPower ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Bedside Lamp 1 Dimmer */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sun className={`w-3.5 h-3.5 ${roomsState.bedroomMain.lamp1Power ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span className="text-slate-200">Left Bedside Lamp</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-amber-300">
                    {roomsState.bedroomMain.lamp1Power ? `${roomsState.bedroomMain.lamp1Intensity}%` : 'OFF'}
                  </span>
                  <button
                    onClick={() => updateBedroomMain({ lamp1Power: !roomsState.bedroomMain.lamp1Power })}
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                      roomsState.bedroomMain.lamp1Power ? 'bg-amber-400' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      roomsState.bedroomMain.lamp1Power ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                disabled={!roomsState.bedroomMain.lamp1Power}
                value={roomsState.bedroomMain.lamp1Power ? roomsState.bedroomMain.lamp1Intensity : 10}
                onChange={(e) => updateBedroomMain({ lamp1Intensity: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1 bg-slate-950 rounded-full cursor-pointer disabled:opacity-30"
              />
            </div>

            {/* Bedside Lamp 2 Dimmer */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sun className={`w-3.5 h-3.5 ${roomsState.bedroomMain.lamp2Power ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span className="text-slate-200">Right Bedside Lamp</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-amber-300">
                    {roomsState.bedroomMain.lamp2Power ? `${roomsState.bedroomMain.lamp2Intensity}%` : 'OFF'}
                  </span>
                  <button
                    onClick={() => updateBedroomMain({ lamp2Power: !roomsState.bedroomMain.lamp2Power })}
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                      roomsState.bedroomMain.lamp2Power ? 'bg-amber-400' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      roomsState.bedroomMain.lamp2Power ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                disabled={!roomsState.bedroomMain.lamp2Power}
                value={roomsState.bedroomMain.lamp2Power ? roomsState.bedroomMain.lamp2Intensity : 10}
                onChange={(e) => updateBedroomMain({ lamp2Intensity: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1 bg-slate-950 rounded-full cursor-pointer disabled:opacity-30"
              />
            </div>

            {/* Master AC */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThermometerSnowflake className={`w-4 h-4 ${roomsState.bedroomMain.acPower ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold text-slate-200">Master AC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {roomsState.bedroomMain.acPower ? formatTemperature(roomsState.bedroomMain.acTemp, tempUnit) : 'OFF'}
                  </span>
                  <button
                    onClick={() => updateBedroomMain({ acPower: !roomsState.bedroomMain.acPower })}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      roomsState.bedroomMain.acPower ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      roomsState.bedroomMain.acPower ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  disabled={!roomsState.bedroomMain.acPower}
                  onClick={() =>
                    handleAcTempChange(
                      'bedroomMain',
                      'Master Bedroom',
                      roomsState.bedroomMain.acTemp - 1,
                      roomsState.bedroomMain.acTemp
                    )
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs font-mono"
                >
                  -
                </button>
                <input
                  type="range"
                  min="60"
                  max="85"
                  disabled={!roomsState.bedroomMain.acPower}
                  value={roomsState.bedroomMain.acTemp}
                  onChange={(e) =>
                    handleAcTempChange(
                      'bedroomMain',
                      'Master Bedroom',
                      Number(e.target.value),
                      roomsState.bedroomMain.acTemp
                    )
                  }
                  className="flex-1 accent-blue-500 h-1.5 bg-slate-950 rounded-full cursor-pointer disabled:opacity-30"
                />
                <button
                  disabled={!roomsState.bedroomMain.acPower}
                  onClick={() =>
                    handleAcTempChange(
                      'bedroomMain',
                      'Master Bedroom',
                      roomsState.bedroomMain.acTemp + 1,
                      roomsState.bedroomMain.acTemp
                    )
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs font-mono"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. BEDROOM 2 (GUEST SUITE / BALCONY WING)                                 */}
        {/* ========================================================================= */}
        {(selectedZoneFilter === 'all' || selectedZoneFilter === 'bedroom-2') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Bedroom 2 (Guest)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                4 Controls
              </span>
            </div>

            {/* Light Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Lightbulb className={`w-4 h-4 ${roomsState.bedroom2.lightPower ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold text-slate-200">Ceiling Light</span>
              </div>
              <button
                onClick={() => updateBedroom2({ lightPower: !roomsState.bedroom2.lightPower })}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  roomsState.bedroom2.lightPower ? 'bg-amber-400' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  roomsState.bedroom2.lightPower ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Lamp Dimmer */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sun className={`w-3.5 h-3.5 ${roomsState.bedroom2.lampPower ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span className="text-slate-200">Study Lamp</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-amber-300">
                    {roomsState.bedroom2.lampPower ? `${roomsState.bedroom2.lampIntensity}%` : 'OFF'}
                  </span>
                  <button
                    onClick={() => updateBedroom2({ lampPower: !roomsState.bedroom2.lampPower })}
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                      roomsState.bedroom2.lampPower ? 'bg-amber-400' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      roomsState.bedroom2.lampPower ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                disabled={!roomsState.bedroom2.lampPower}
                value={roomsState.bedroom2.lampPower ? roomsState.bedroom2.lampIntensity : 10}
                onChange={(e) => updateBedroom2({ lampIntensity: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1 bg-slate-950 rounded-full cursor-pointer disabled:opacity-30"
              />
            </div>

            {/* Fan */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Fan className={`w-3.5 h-3.5 ${roomsState.bedroom2.fanPower ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
                  <span className="text-slate-200">Bedroom 2 Fan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-400">
                    {roomsState.bedroom2.fanPower ? `${roomsState.bedroom2.fanSpeed}%` : 'OFF'}
                  </span>
                  <button
                    onClick={() => {
                      const next = !roomsState.bedroom2.fanPower;
                      updateBedroom2({
                        fanPower: next,
                        fanSpeed: next ? (roomsState.bedroom2.fanSpeed || 50) : 0,
                      });
                    }}
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                      roomsState.bedroom2.fanPower ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      roomsState.bedroom2.fanPower ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                disabled={!roomsState.bedroom2.fanPower}
                value={roomsState.bedroom2.fanPower ? roomsState.bedroom2.fanSpeed : 0}
                onChange={(e) => updateBedroom2({ fanSpeed: Number(e.target.value), fanPower: Number(e.target.value) > 0 })}
                className="w-full accent-cyan-400 h-1 bg-slate-950 rounded-full cursor-pointer disabled:opacity-30"
              />
            </div>

            {/* AC */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThermometerSnowflake className={`w-4 h-4 ${roomsState.bedroom2.acPower ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold text-slate-200">Bedroom 2 AC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {roomsState.bedroom2.acPower ? formatTemperature(roomsState.bedroom2.acTemp, tempUnit) : 'OFF'}
                  </span>
                  <button
                    onClick={() => updateBedroom2({ acPower: !roomsState.bedroom2.acPower })}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      roomsState.bedroom2.acPower ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      roomsState.bedroom2.acPower ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  disabled={!roomsState.bedroom2.acPower}
                  onClick={() =>
                    handleAcTempChange(
                      'bedroom2',
                      'Bedroom 2',
                      roomsState.bedroom2.acTemp - 1,
                      roomsState.bedroom2.acTemp
                    )
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs font-mono"
                >
                  -
                </button>
                <input
                  type="range"
                  min="60"
                  max="85"
                  disabled={!roomsState.bedroom2.acPower}
                  value={roomsState.bedroom2.acTemp}
                  onChange={(e) =>
                    handleAcTempChange(
                      'bedroom2',
                      'Bedroom 2',
                      Number(e.target.value),
                      roomsState.bedroom2.acTemp
                    )
                  }
                  className="flex-1 accent-blue-500 h-1.5 bg-slate-950 rounded-full cursor-pointer disabled:opacity-30"
                />
                <button
                  disabled={!roomsState.bedroom2.acPower}
                  onClick={() =>
                    handleAcTempChange(
                      'bedroom2',
                      'Bedroom 2',
                      roomsState.bedroom2.acTemp + 1,
                      roomsState.bedroom2.acTemp
                    )
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs font-mono"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. BEDROOM 3 / STUDIO                                                     */}
        {/* ========================================================================= */}
        {(selectedZoneFilter === 'all' || selectedZoneFilter === 'bedroom-3') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Bedroom 3 (Studio)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                3 Controls
              </span>
            </div>

            {/* Light Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Lightbulb className={`w-4 h-4 ${roomsState.bedroom3.lightPower ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold text-slate-200">Main Light</span>
              </div>
              <button
                onClick={() => updateBedroom3({ lightPower: !roomsState.bedroom3.lightPower })}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  roomsState.bedroom3.lightPower ? 'bg-amber-400' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  roomsState.bedroom3.lightPower ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Lamp Dimmer */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sun className={`w-3.5 h-3.5 ${roomsState.bedroom3.lampPower ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span className="text-slate-200">Floor Ambient Lamp</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-amber-300">
                    {roomsState.bedroom3.lampPower ? `${roomsState.bedroom3.lampIntensity}%` : 'OFF'}
                  </span>
                  <button
                    onClick={() => updateBedroom3({ lampPower: !roomsState.bedroom3.lampPower })}
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                      roomsState.bedroom3.lampPower ? 'bg-amber-400' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      roomsState.bedroom3.lampPower ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                disabled={!roomsState.bedroom3.lampPower}
                value={roomsState.bedroom3.lampPower ? roomsState.bedroom3.lampIntensity : 10}
                onChange={(e) => updateBedroom3({ lampIntensity: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1 bg-slate-950 rounded-full cursor-pointer disabled:opacity-30"
              />
            </div>

            {/* AC */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThermometerSnowflake className={`w-4 h-4 ${roomsState.bedroom3.acPower ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold text-slate-200">Studio AC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {roomsState.bedroom3.acPower ? formatTemperature(roomsState.bedroom3.acTemp, tempUnit) : 'OFF'}
                  </span>
                  <button
                    onClick={() => updateBedroom3({ acPower: !roomsState.bedroom3.acPower })}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      roomsState.bedroom3.acPower ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      roomsState.bedroom3.acPower ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  disabled={!roomsState.bedroom3.acPower}
                  onClick={() =>
                    handleAcTempChange(
                      'bedroom3',
                      'Bedroom 3',
                      roomsState.bedroom3.acTemp - 1,
                      roomsState.bedroom3.acTemp
                    )
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs font-mono"
                >
                  -
                </button>
                <input
                  type="range"
                  min="60"
                  max="85"
                  disabled={!roomsState.bedroom3.acPower}
                  value={roomsState.bedroom3.acTemp}
                  onChange={(e) =>
                    handleAcTempChange(
                      'bedroom3',
                      'Bedroom 3',
                      Number(e.target.value),
                      roomsState.bedroom3.acTemp
                    )
                  }
                  className="flex-1 accent-blue-500 h-1.5 bg-slate-950 rounded-full cursor-pointer disabled:opacity-30"
                />
                <button
                  disabled={!roomsState.bedroom3.acPower}
                  onClick={() =>
                    handleAcTempChange(
                      'bedroom3',
                      'Bedroom 3',
                      roomsState.bedroom3.acTemp + 1,
                      roomsState.bedroom3.acTemp
                    )
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs font-mono"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. DINING ROOM                                                            */}
        {/* ========================================================================= */}
        {(selectedZoneFilter === 'all' || selectedZoneFilter === 'dining') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Dining Room
                </h4>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                2 Controls
              </span>
            </div>

            {/* Chandelier Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Lightbulb className={`w-4 h-4 ${roomsState.diningRoom.lightPower ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Dining Chandelier</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {roomsState.diningRoom.lightPower ? 'ILLUMINATED' : 'POWERED OFF'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => updateDining({ lightPower: !roomsState.diningRoom.lightPower })}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  roomsState.diningRoom.lightPower ? 'bg-amber-400' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  roomsState.diningRoom.lightPower ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Dining AC */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThermometerSnowflake className={`w-4 h-4 ${roomsState.diningRoom.acPower ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold text-slate-200">Dining AC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {roomsState.diningRoom.acPower ? formatTemperature(roomsState.diningRoom.acTemp, tempUnit) : 'OFF'}
                  </span>
                  <button
                    onClick={() => updateDining({ acPower: !roomsState.diningRoom.acPower })}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      roomsState.diningRoom.acPower ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      roomsState.diningRoom.acPower ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  disabled={!roomsState.diningRoom.acPower}
                  onClick={() =>
                    handleAcTempChange(
                      'diningRoom',
                      'Dining Room',
                      roomsState.diningRoom.acTemp - 1,
                      roomsState.diningRoom.acTemp
                    )
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs font-mono"
                >
                  -
                </button>
                <input
                  type="range"
                  min="60"
                  max="85"
                  disabled={!roomsState.diningRoom.acPower}
                  value={roomsState.diningRoom.acTemp}
                  onChange={(e) =>
                    handleAcTempChange(
                      'diningRoom',
                      'Dining Room',
                      Number(e.target.value),
                      roomsState.diningRoom.acTemp
                    )
                  }
                  className="flex-1 accent-blue-500 h-1.5 bg-slate-950 rounded-full cursor-pointer disabled:opacity-30"
                />
                <button
                  disabled={!roomsState.diningRoom.acPower}
                  onClick={() =>
                    handleAcTempChange(
                      'diningRoom',
                      'Dining Room',
                      roomsState.diningRoom.acTemp + 1,
                      roomsState.diningRoom.acTemp
                    )
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs font-mono"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. BATHROOMS (MAIN BATH & BATHROOM 2)                                      */}
        {/* ========================================================================= */}
        {(selectedZoneFilter === 'all' || selectedZoneFilter === 'bathrooms') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-teal-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Bathrooms (Main & Guest)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                4 Controls
              </span>
            </div>

            {/* Bath 1 (Main) */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Main Bathroom 1</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateBathroomMain({ lightPower: !roomsState.bathroomMain.lightPower })}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    roomsState.bathroomMain.lightPower
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-xs">Vanity Light</span>
                  <span className="text-[10px] font-mono font-bold">{roomsState.bathroomMain.lightPower ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => updateBathroomMain({ exhaustFanPower: !roomsState.bathroomMain.exhaustFanPower })}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    roomsState.bathroomMain.exhaustFanPower
                      ? 'bg-teal-500/15 border-teal-500/40 text-teal-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-xs">Exhaust Fan</span>
                  <span className="text-[10px] font-mono font-bold">{roomsState.bathroomMain.exhaustFanPower ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>

            {/* Bath 2 (Guest) */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Guest Bathroom 2</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateBathroom2({ lightPower: !roomsState.bathroom2.lightPower })}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    roomsState.bathroom2.lightPower
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-xs">Shower Light</span>
                  <span className="text-[10px] font-mono font-bold">{roomsState.bathroom2.lightPower ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => updateBathroom2({ exhaustFanPower: !roomsState.bathroom2.exhaustFanPower })}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    roomsState.bathroom2.exhaustFanPower
                      ? 'bg-teal-500/15 border-teal-500/40 text-teal-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-xs">Exhaust Fan</span>
                  <span className="text-[10px] font-mono font-bold">{roomsState.bathroom2.exhaustFanPower ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 8. GARAGE                                                                 */}
        {/* ========================================================================= */}
        {(selectedZoneFilter === 'all' || selectedZoneFilter === 'garage') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Garage Workshop
                </h4>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                2 Controls
              </span>
            </div>

            {/* Garage Light */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Lightbulb className={`w-4 h-4 ${roomsState.garage.lightPower ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Bay Overhead Light</span>
                  <span className="text-[10px] font-mono text-slate-400">High-Lumen Workshop</span>
                </div>
              </div>
              <button
                onClick={() => updateGarage({ lightPower: !roomsState.garage.lightPower })}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  roomsState.garage.lightPower ? 'bg-amber-400' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  roomsState.garage.lightPower ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Motorized Garage Door */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Warehouse className={`w-4 h-4 ${roomsState.garage.garageDoorOpen ? 'text-amber-400' : 'text-emerald-400'}`} />
                  <span className="text-xs font-semibold text-slate-200">Motorized Barrier</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${
                  roomsState.garage.garageDoorOpen ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {roomsState.garage.garageDoorOpen ? 'RAISED (OPEN)' : 'LOCKED (CLOSED)'}
                </span>
              </div>

              <button
                onClick={() => updateGarage({ garageDoorOpen: !roomsState.garage.garageDoorOpen })}
                className={`w-full py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  roomsState.garage.garageDoorOpen
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {roomsState.garage.garageDoorOpen ? 'Close Garage Door' : 'Open Garage Door'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 9. FRONT PORCH / ENTRY / HALLWAY                                          */}
        {/* ========================================================================= */}
        {(selectedZoneFilter === 'all' || selectedZoneFilter === 'porch') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Front Porch & Entry
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Perimeter
              </span>
            </div>

            {/* Perimeter Access */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <DoorClosed className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Entrance Threshold</span>
                  <span className="text-[10px] font-mono text-slate-400">Exterior Smart Lock</span>
                </div>
              </div>
              <button
                onClick={() => updateLiving({ mainDoorOpen: !roomsState.livingRoom.mainDoorOpen })}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                  roomsState.livingRoom.mainDoorOpen
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {roomsState.livingRoom.mainDoorOpen ? 'Lock' : 'Unlock'}
              </button>
            </div>

            {/* Porch Welcome Illumination */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Porch Sconce</span>
                  <span className="text-[10px] font-mono text-slate-400">Exterior Illumination</span>
                </div>
              </div>
              <button
                onClick={() => updateLiving({ mainDoorOpen: !roomsState.livingRoom.mainDoorOpen })}
                className="w-10 h-5 rounded-full p-0.5 transition-colors bg-amber-400"
              >
                <div className="w-4 h-4 rounded-full bg-white translate-x-5 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
