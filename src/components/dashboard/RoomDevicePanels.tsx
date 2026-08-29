/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sun,
  Lightbulb,
  Fan,
  ThermometerSnowflake,
  DoorClosed,
  DoorOpen,
  Layers,
  Wind,
  Power,
  Flame,
  Warehouse,
} from 'lucide-react';
import { SwitchToggle } from '../ui/SwitchToggle';
import type { AllRoomsState, RoomId, TemperatureUnit } from '../../types';
import { formatTemperature } from '../../utils/powerAndTemp';

interface RoomDevicePanelsProps {
  activeRoomId: RoomId;
  roomsState: AllRoomsState;
  tempUnit: TemperatureUnit;
  updateLiving: (patch: Partial<AllRoomsState['livingRoom']>) => void;
  updateBedroomMain: (patch: Partial<AllRoomsState['bedroomMain']>) => void;
  updateBedroom2: (patch: Partial<AllRoomsState['bedroom2']>) => void;
  updateBedroom3: (patch: Partial<AllRoomsState['bedroom3']>) => void;
  updateDining: (patch: Partial<AllRoomsState['diningRoom']>) => void;
  updateKitchen: (patch: Partial<AllRoomsState['kitchen']>) => void;
  updateBathroomMain: (patch: Partial<AllRoomsState['bathroomMain']>) => void;
  updateBathroom2: (patch: Partial<AllRoomsState['bathroom2']>) => void;
  updateGarage: (patch: Partial<AllRoomsState['garage']>) => void;
  handleAcTempChange: (
    roomKey: keyof AllRoomsState,
    roomName: string,
    newTempF: number,
    currentTempF: number
  ) => void;
  getFanSpeedAnimation: (power: boolean, mode: string) => string;
}

export function RoomDevicePanels({
  activeRoomId,
  roomsState,
  tempUnit,
  updateLiving,
  updateBedroomMain,
  updateBedroom2,
  updateBedroom3,
  updateDining,
  updateKitchen,
  updateBathroomMain,
  updateBathroom2,
  updateGarage,
  handleAcTempChange,
  getFanSpeedAnimation,
}: RoomDevicePanelsProps) {
  // Shared card container classes
  const baseCardClass =
    'p-5 sm:p-6 rounded-2xl border transition-all duration-200 bg-slate-950/60 border-slate-800/90 hover:border-slate-700/80 shadow-sm flex flex-col justify-between';

  return (
    <div>
      {/* 1. LIVING ROOM */}
      {activeRoomId === 'living-room' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main Door */}
          <div
            className={`${baseCardClass} ${
              roomsState.livingRoom.mainDoorOpen
                ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {roomsState.livingRoom.mainDoorOpen ? (
                    <DoorOpen className="w-5 h-5 text-amber-400" />
                  ) : (
                    <DoorClosed className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <SwitchToggle
                  id="living-door-toggle"
                  checked={roomsState.livingRoom.mainDoorOpen}
                  onChange={() =>
                    updateLiving({ mainDoorOpen: !roomsState.livingRoom.mainDoorOpen })
                  }
                  activeColor="amber"
                  label="Toggle Main Door"
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-0.5">Main Entrance Door</h4>
              <p className="text-xs text-slate-400">Front perimeter portal</p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span
                className={`font-medium ${
                  roomsState.livingRoom.mainDoorOpen ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {roomsState.livingRoom.mainDoorOpen ? 'Open / Ajar' : 'Secured'}
              </span>
            </div>
          </div>

          {/* Ceiling Fan */}
          <div
            className={`${baseCardClass} ${
              roomsState.livingRoom.fanPower
                ? 'bg-sky-950/20 border-sky-500/30 ring-1 ring-sky-500/20'
                : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Fan
                    className={`w-5 h-5 ${
                      roomsState.livingRoom.fanPower ? 'text-sky-400' : 'text-slate-500'
                    }`}
                    style={{
                      animation: getFanSpeedAnimation(
                        roomsState.livingRoom.fanPower,
                        roomsState.livingRoom.fanMode
                      ),
                    }}
                  />
                </div>
                <SwitchToggle
                  id="living-fan-power-toggle"
                  checked={roomsState.livingRoom.fanPower}
                  onChange={() => {
                    const nextPower = !roomsState.livingRoom.fanPower;
                    updateLiving({
                      fanPower: nextPower,
                      fanMode: nextPower
                        ? roomsState.livingRoom.fanMode === 'off'
                          ? 'med'
                          : roomsState.livingRoom.fanMode
                        : 'off',
                      fanSpeed: nextPower
                        ? roomsState.livingRoom.fanSpeed === 0
                          ? 60
                          : roomsState.livingRoom.fanSpeed
                        : 0,
                    });
                  }}
                  activeColor="sky"
                  label="Toggle Living Room Fan"
                />
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-semibold text-slate-100">Living Ceiling Fan</h4>
                <span className="text-xs font-mono font-medium text-sky-400">
                  {roomsState.livingRoom.fanPower ? `${roomsState.livingRoom.fanSpeed}%` : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Multi-speed circulation</p>

              <input
                id="living-fan-slider"
                type="range"
                min="0"
                max="100"
                disabled={!roomsState.livingRoom.fanPower}
                value={roomsState.livingRoom.fanPower ? roomsState.livingRoom.fanSpeed : 0}
                onChange={(e) => {
                  const speed = Number(e.target.value);
                  let mode: 'off' | 'low' | 'med' | 'high' = 'off';
                  if (speed > 75) mode = 'high';
                  else if (speed > 35) mode = 'med';
                  else if (speed > 0) mode = 'low';
                  updateLiving({ fanSpeed: speed, fanMode: mode, fanPower: speed > 0 });
                }}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-full cursor-pointer mb-3 disabled:opacity-40"
              />
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-800/80">
              {(['off', 'low', 'med', 'high'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    if (m === 'off') {
                      updateLiving({ fanPower: false, fanMode: 'off', fanSpeed: 0 });
                    } else {
                      const speed = m === 'low' ? 30 : m === 'med' ? 65 : 100;
                      updateLiving({ fanPower: true, fanMode: m, fanSpeed: speed });
                    }
                  }}
                  className={`py-1 rounded-lg text-[10px] font-medium uppercase transition-all ${
                    roomsState.livingRoom.fanMode === m && roomsState.livingRoom.fanPower
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* HVAC AC */}
          <div
            className={`${baseCardClass} ${
              roomsState.livingRoom.acPower
                ? 'bg-sky-950/20 border-sky-500/30 ring-1 ring-sky-500/20'
                : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <ThermometerSnowflake
                    className={`w-5 h-5 ${
                      roomsState.livingRoom.acPower ? 'text-sky-400' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  id="living-ac-power-toggle"
                  checked={roomsState.livingRoom.acPower}
                  onChange={() => updateLiving({ acPower: !roomsState.livingRoom.acPower })}
                  activeColor="sky"
                  label="Toggle Living Room AC"
                />
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-semibold text-slate-100">Living HVAC Climate</h4>
                <span className="text-lg font-bold text-sky-400">
                  {roomsState.livingRoom.acPower
                    ? formatTemperature(roomsState.livingRoom.acTemp, tempUnit)
                    : 'Eco'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                {roomsState.livingRoom.acPower ? 'Climate Cooling Active' : 'Standby / Low Power'}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
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
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-30 text-slate-200 font-semibold text-sm transition-all"
              >
                −
              </button>
              <span className="text-xs text-slate-400 font-medium">Target Temp</span>
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
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-30 text-slate-200 font-semibold text-sm transition-all"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BEDROOM (MAIN) */}
      {activeRoomId === 'bedroom-main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Main Light */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Sun
                    className={`w-5 h-5 ${
                      roomsState.bedroomMain.lightPower ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bedroomMain.lightPower}
                  onChange={() =>
                    updateBedroomMain({ lightPower: !roomsState.bedroomMain.lightPower })
                  }
                  activeColor="amber"
                  label="Toggle Master Light"
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-0.5">Master Ceiling Light</h4>
              <p className="text-xs text-slate-400">Primary overhead fixture</p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span
                className={
                  roomsState.bedroomMain.lightPower
                    ? 'text-amber-300 font-medium'
                    : 'text-slate-500'
                }
              >
                {roomsState.bedroomMain.lightPower ? 'Active' : 'Off'}
              </span>
            </div>
          </div>

          {/* Lamp 1 */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Lightbulb
                    className={`w-5 h-5 ${
                      roomsState.bedroomMain.lamp1Power ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bedroomMain.lamp1Power}
                  onChange={() =>
                    updateBedroomMain({ lamp1Power: !roomsState.bedroomMain.lamp1Power })
                  }
                  activeColor="amber"
                  label="Toggle Lamp 1"
                />
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-semibold text-slate-100">Bedside Lamp (Left)</h4>
                <span className="text-xs font-mono font-medium text-amber-300">
                  {roomsState.bedroomMain.lamp1Power
                    ? `${roomsState.bedroomMain.lamp1Intensity}%`
                    : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Dimmable warm glow</p>
              <input
                type="range"
                min="0"
                max="100"
                disabled={!roomsState.bedroomMain.lamp1Power}
                value={
                  roomsState.bedroomMain.lamp1Power ? roomsState.bedroomMain.lamp1Intensity : 0
                }
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateBedroomMain({ lamp1Intensity: val, lamp1Power: val > 0 });
                }}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-full cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>

          {/* Lamp 2 */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Lightbulb
                    className={`w-5 h-5 ${
                      roomsState.bedroomMain.lamp2Power ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bedroomMain.lamp2Power}
                  onChange={() =>
                    updateBedroomMain({ lamp2Power: !roomsState.bedroomMain.lamp2Power })
                  }
                  activeColor="amber"
                  label="Toggle Lamp 2"
                />
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-semibold text-slate-100">Bedside Lamp (Right)</h4>
                <span className="text-xs font-mono font-medium text-amber-300">
                  {roomsState.bedroomMain.lamp2Power
                    ? `${roomsState.bedroomMain.lamp2Intensity}%`
                    : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Dimmable warm glow</p>
              <input
                type="range"
                min="0"
                max="100"
                disabled={!roomsState.bedroomMain.lamp2Power}
                value={
                  roomsState.bedroomMain.lamp2Power ? roomsState.bedroomMain.lamp2Intensity : 0
                }
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateBedroomMain({ lamp2Intensity: val, lamp2Power: val > 0 });
                }}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-full cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>

          {/* Master AC */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <ThermometerSnowflake
                    className={`w-5 h-5 ${
                      roomsState.bedroomMain.acPower ? 'text-sky-400' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bedroomMain.acPower}
                  onChange={() => updateBedroomMain({ acPower: !roomsState.bedroomMain.acPower })}
                  activeColor="sky"
                  label="Toggle Master AC"
                />
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-semibold text-slate-100">Master AC Climate</h4>
                <span className="text-lg font-bold text-sky-400">
                  {roomsState.bedroomMain.acPower
                    ? formatTemperature(roomsState.bedroomMain.acTemp, tempUnit)
                    : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Personal climate zone</p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
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
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-30 text-slate-200 font-semibold text-sm transition-all"
              >
                −
              </button>
              <span className="text-xs text-slate-400 font-medium">Temp</span>
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
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-30 text-slate-200 font-semibold text-sm transition-all"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. BEDROOM 2 */}
      {activeRoomId === 'bedroom-2' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Light */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Sun
                    className={`w-5 h-5 ${
                      roomsState.bedroom2.lightPower ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bedroom2.lightPower}
                  onChange={() => updateBedroom2({ lightPower: !roomsState.bedroom2.lightPower })}
                  activeColor="amber"
                  label="Toggle Bedroom 2 Light"
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-0.5">Bedroom 2 Light</h4>
              <p className="text-xs text-slate-400">Ceiling fixture</p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span
                className={
                  roomsState.bedroom2.lightPower ? 'text-amber-300 font-medium' : 'text-slate-500'
                }
              >
                {roomsState.bedroom2.lightPower ? 'Active' : 'Off'}
              </span>
            </div>
          </div>

          {/* Lamp */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Lightbulb
                    className={`w-5 h-5 ${
                      roomsState.bedroom2.lampPower ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bedroom2.lampPower}
                  onChange={() => updateBedroom2({ lampPower: !roomsState.bedroom2.lampPower })}
                  activeColor="amber"
                  label="Toggle Bedroom 2 Lamp"
                />
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-semibold text-slate-100">Desk / Night Lamp</h4>
                <span className="text-xs font-mono font-medium text-amber-300">
                  {roomsState.bedroom2.lampPower ? `${roomsState.bedroom2.lampIntensity}%` : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Adjustable brightness</p>
              <input
                type="range"
                min="0"
                max="100"
                disabled={!roomsState.bedroom2.lampPower}
                value={roomsState.bedroom2.lampPower ? roomsState.bedroom2.lampIntensity : 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateBedroom2({ lampIntensity: val, lampPower: val > 0 });
                }}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-full cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>

          {/* AC */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <ThermometerSnowflake
                    className={`w-5 h-5 ${
                      roomsState.bedroom2.acPower ? 'text-sky-400' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bedroom2.acPower}
                  onChange={() => updateBedroom2({ acPower: !roomsState.bedroom2.acPower })}
                  activeColor="sky"
                  label="Toggle Bedroom 2 AC"
                />
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-semibold text-slate-100">Bedroom 2 AC</h4>
                <span className="text-lg font-bold text-sky-400">
                  {roomsState.bedroom2.acPower
                    ? formatTemperature(roomsState.bedroom2.acTemp, tempUnit)
                    : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Zone cooling</p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
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
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-30 text-slate-200 font-semibold text-sm transition-all"
              >
                −
              </button>
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
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-30 text-slate-200 font-semibold text-sm transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Fan */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Fan
                    className={`w-5 h-5 ${
                      roomsState.bedroom2.fanPower ? 'text-sky-400' : 'text-slate-500'
                    }`}
                    style={{
                      animation: getFanSpeedAnimation(
                        roomsState.bedroom2.fanPower,
                        roomsState.bedroom2.fanMode
                      ),
                    }}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bedroom2.fanPower}
                  onChange={() => {
                    const nextPower = !roomsState.bedroom2.fanPower;
                    updateBedroom2({
                      fanPower: nextPower,
                      fanMode: nextPower
                        ? roomsState.bedroom2.fanMode === 'off'
                          ? 'med'
                          : roomsState.bedroom2.fanMode
                        : 'off',
                      fanSpeed: nextPower
                        ? roomsState.bedroom2.fanSpeed === 0
                          ? 50
                          : roomsState.bedroom2.fanSpeed
                        : 0,
                    });
                  }}
                  activeColor="sky"
                  label="Toggle Bedroom 2 Fan"
                />
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-semibold text-slate-100">Ceiling Fan</h4>
                <span className="text-xs font-mono font-medium text-sky-400">
                  {roomsState.bedroom2.fanPower ? `${roomsState.bedroom2.fanSpeed}%` : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Quiet air flow</p>
              <input
                type="range"
                min="0"
                max="100"
                disabled={!roomsState.bedroom2.fanPower}
                value={roomsState.bedroom2.fanPower ? roomsState.bedroom2.fanSpeed : 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  let mode: 'off' | 'low' | 'med' | 'high' = 'off';
                  if (val > 75) mode = 'high';
                  else if (val > 35) mode = 'med';
                  else if (val > 0) mode = 'low';
                  updateBedroom2({ fanSpeed: val, fanMode: mode, fanPower: val > 0 });
                }}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-full cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. BEDROOM 3 */}
      {activeRoomId === 'bedroom-3' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Light */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Sun
                    className={`w-5 h-5 ${
                      roomsState.bedroom3.lightPower ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bedroom3.lightPower}
                  onChange={() => updateBedroom3({ lightPower: !roomsState.bedroom3.lightPower })}
                  activeColor="amber"
                  label="Toggle Bedroom 3 Light"
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-0.5">Bedroom 3 Light</h4>
              <p className="text-xs text-slate-400">Ceiling light fixture</p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span
                className={
                  roomsState.bedroom3.lightPower ? 'text-amber-300 font-medium' : 'text-slate-500'
                }
              >
                {roomsState.bedroom3.lightPower ? 'Active' : 'Off'}
              </span>
            </div>
          </div>

          {/* Lamp */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Lightbulb
                    className={`w-5 h-5 ${
                      roomsState.bedroom3.lampPower ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bedroom3.lampPower}
                  onChange={() => updateBedroom3({ lampPower: !roomsState.bedroom3.lampPower })}
                  activeColor="amber"
                  label="Toggle Bedroom 3 Lamp"
                />
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-semibold text-slate-100">Study Lamp</h4>
                <span className="text-xs font-mono font-medium text-amber-300">
                  {roomsState.bedroom3.lampPower ? `${roomsState.bedroom3.lampIntensity}%` : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Focused workspace lighting</p>
              <input
                type="range"
                min="0"
                max="100"
                disabled={!roomsState.bedroom3.lampPower}
                value={roomsState.bedroom3.lampPower ? roomsState.bedroom3.lampIntensity : 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateBedroom3({ lampIntensity: val, lampPower: val > 0 });
                }}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-full cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>

          {/* AC */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <ThermometerSnowflake
                    className={`w-5 h-5 ${
                      roomsState.bedroom3.acPower ? 'text-sky-400' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bedroom3.acPower}
                  onChange={() => updateBedroom3({ acPower: !roomsState.bedroom3.acPower })}
                  activeColor="sky"
                  label="Toggle Bedroom 3 AC"
                />
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-semibold text-slate-100">Climate AC</h4>
                <span className="text-lg font-bold text-sky-400">
                  {roomsState.bedroom3.acPower
                    ? formatTemperature(roomsState.bedroom3.acTemp, tempUnit)
                    : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Studio climate control</p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
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
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-30 text-slate-200 font-semibold text-sm transition-all"
              >
                −
              </button>
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
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-30 text-slate-200 font-semibold text-sm transition-all"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DINING ROOM */}
      {activeRoomId === 'dining-room' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Light */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Sun
                    className={`w-5 h-5 ${
                      roomsState.diningRoom.lightPower ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.diningRoom.lightPower}
                  onChange={() => updateDining({ lightPower: !roomsState.diningRoom.lightPower })}
                  activeColor="amber"
                  label="Toggle Dining Light"
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-0.5">Dining Chandelier</h4>
              <p className="text-xs text-slate-400">Center illumination fixture</p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span
                className={
                  roomsState.diningRoom.lightPower ? 'text-amber-300 font-medium' : 'text-slate-500'
                }
              >
                {roomsState.diningRoom.lightPower ? 'Active' : 'Off'}
              </span>
            </div>
          </div>

          {/* AC */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <ThermometerSnowflake
                    className={`w-5 h-5 ${
                      roomsState.diningRoom.acPower ? 'text-sky-400' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.diningRoom.acPower}
                  onChange={() => updateDining({ acPower: !roomsState.diningRoom.acPower })}
                  activeColor="sky"
                  label="Toggle Dining AC"
                />
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-semibold text-slate-100">Dining Area AC</h4>
                <span className="text-lg font-bold text-sky-400">
                  {roomsState.diningRoom.acPower
                    ? formatTemperature(roomsState.diningRoom.acTemp, tempUnit)
                    : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Dinner & gathering climate</p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
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
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-30 text-slate-200 font-semibold text-sm transition-all"
              >
                −
              </button>
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
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-30 text-slate-200 font-semibold text-sm transition-all"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. KITCHEN */}
      {activeRoomId === 'kitchen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Chimney */}
          <div
            className={`${baseCardClass} ${
              roomsState.kitchen.chimneyPower
                ? 'bg-sky-950/20 border-sky-500/30 ring-1 ring-sky-500/20'
                : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Flame
                    className={`w-5 h-5 ${
                      roomsState.kitchen.chimneyPower ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.kitchen.chimneyPower}
                  onChange={() =>
                    updateKitchen({ chimneyPower: !roomsState.kitchen.chimneyPower })
                  }
                  activeColor="sky"
                  label="Toggle Kitchen Chimney"
                />
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-semibold text-slate-100">Range Chimney</h4>
                <span className="text-xs font-mono font-medium text-sky-400 uppercase">
                  {roomsState.kitchen.chimneyPower ? roomsState.kitchen.chimneySpeed : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Exhaust & fume extraction</p>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-800/80">
              {(['low', 'med', 'high', 'turbo'] as const).map((speed) => (
                <button
                  key={speed}
                  disabled={!roomsState.kitchen.chimneyPower}
                  onClick={() => updateKitchen({ chimneySpeed: speed })}
                  className={`py-1.5 rounded-lg text-[10px] font-medium uppercase transition-all ${
                    roomsState.kitchen.chimneySpeed === speed && roomsState.kitchen.chimneyPower
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 disabled:opacity-30'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Window */}
          <div
            className={`${baseCardClass} ${
              roomsState.kitchen.windowOpen
                ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Layers
                    className={`w-5 h-5 ${
                      roomsState.kitchen.windowOpen ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.kitchen.windowOpen}
                  onChange={() => updateKitchen({ windowOpen: !roomsState.kitchen.windowOpen })}
                  activeColor="amber"
                  label="Toggle Kitchen Window"
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-0.5">Kitchen Window</h4>
              <p className="text-xs text-slate-400">Natural air ventilation</p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex justify-between text-xs">
              <span className="text-slate-400">State</span>
              <span
                className={`font-medium ${
                  roomsState.kitchen.windowOpen ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {roomsState.kitchen.windowOpen ? 'Open (Ventilating)' : 'Closed (Sealed)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. BATHROOM (MAIN) */}
      {activeRoomId === 'bathroom-main' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Light */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Sun
                    className={`w-5 h-5 ${
                      roomsState.bathroomMain.lightPower ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bathroomMain.lightPower}
                  onChange={() =>
                    updateBathroomMain({ lightPower: !roomsState.bathroomMain.lightPower })
                  }
                  activeColor="amber"
                  label="Toggle Master Bathroom Light"
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-0.5">Vanity & Overhead</h4>
              <p className="text-xs text-slate-400">Master bathroom illumination</p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span
                className={
                  roomsState.bathroomMain.lightPower
                    ? 'text-amber-300 font-medium'
                    : 'text-slate-500'
                }
              >
                {roomsState.bathroomMain.lightPower ? 'Active' : 'Off'}
              </span>
            </div>
          </div>

          {/* Exhaust Fan */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Wind
                    className={`w-5 h-5 ${
                      roomsState.bathroomMain.exhaustFanPower ? 'text-sky-400' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bathroomMain.exhaustFanPower}
                  onChange={() =>
                    updateBathroomMain({
                      exhaustFanPower: !roomsState.bathroomMain.exhaustFanPower,
                    })
                  }
                  activeColor="sky"
                  label="Toggle Exhaust Fan"
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-0.5">Moisture Exhaust Fan</h4>
              <p className="text-xs text-slate-400">Humidity & air circulation</p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span
                className={
                  roomsState.bathroomMain.exhaustFanPower
                    ? 'text-sky-400 font-medium'
                    : 'text-slate-500'
                }
              >
                {roomsState.bathroomMain.exhaustFanPower ? 'Running' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 8. BATHROOM 2 */}
      {activeRoomId === 'bathroom-2' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Light */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Sun
                    className={`w-5 h-5 ${
                      roomsState.bathroom2.lightPower ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bathroom2.lightPower}
                  onChange={() =>
                    updateBathroom2({ lightPower: !roomsState.bathroom2.lightPower })
                  }
                  activeColor="amber"
                  label="Toggle Bathroom 2 Light"
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-0.5">Guest Bathroom Light</h4>
              <p className="text-xs text-slate-400">Ceiling light fixture</p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span
                className={
                  roomsState.bathroom2.lightPower ? 'text-amber-300 font-medium' : 'text-slate-500'
                }
              >
                {roomsState.bathroom2.lightPower ? 'Active' : 'Off'}
              </span>
            </div>
          </div>

          {/* Exhaust Fan */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Wind
                    className={`w-5 h-5 ${
                      roomsState.bathroom2.exhaustFanPower ? 'text-sky-400' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  checked={roomsState.bathroom2.exhaustFanPower}
                  onChange={() =>
                    updateBathroom2({ exhaustFanPower: !roomsState.bathroom2.exhaustFanPower })
                  }
                  activeColor="sky"
                  label="Toggle Bathroom 2 Exhaust Fan"
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-0.5">Moisture Exhaust Fan</h4>
              <p className="text-xs text-slate-400">Humidity extractor</p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span
                className={
                  roomsState.bathroom2.exhaustFanPower
                    ? 'text-sky-400 font-medium'
                    : 'text-slate-500'
                }
              >
                {roomsState.bathroom2.exhaustFanPower ? 'Running' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 9. GARAGE */}
      {activeRoomId === 'garage' && (
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-5">
          {/* Light */}
          <div className={baseCardClass}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Sun
                    className={`w-5 h-5 ${
                      roomsState.garage.lightPower ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  />
                </div>
                <SwitchToggle
                  id="garage-light-toggle-btn"
                  checked={roomsState.garage.lightPower}
                  onChange={() => updateGarage({ lightPower: !roomsState.garage.lightPower })}
                  activeColor="amber"
                  label="Toggle Garage Light"
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-0.5">Overhead Bay Light</h4>
              <p className="text-xs text-slate-400">High-lumen workshop illumination</p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span
                className={
                  roomsState.garage.lightPower ? 'text-amber-300 font-medium' : 'text-slate-500'
                }
              >
                {roomsState.garage.lightPower ? 'Active' : 'Off'}
              </span>
            </div>
          </div>

          {/* Motorized Garage Door */}
          <div
            className={`${baseCardClass} text-center ${
              roomsState.garage.garageDoorOpen
                ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                : ''
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                <Warehouse
                  className={`w-6 h-6 ${
                    roomsState.garage.garageDoorOpen ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-0.5">
                Motorized Garage Door
              </h4>
              <p className="text-xs text-slate-400 mb-4 max-w-xs">
                Overhead vehicle access barrier
              </p>

              <button
                id="garage-door-toggle-btn"
                onClick={() =>
                  updateGarage({ garageDoorOpen: !roomsState.garage.garageDoorOpen })
                }
                className={`w-full max-w-xs py-2.5 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-2 ${
                  roomsState.garage.garageDoorOpen
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                    : 'bg-slate-100 text-slate-950 hover:bg-white'
                }`}
              >
                {roomsState.garage.garageDoorOpen ? 'Close Garage Door' : 'Open Garage Door'}
              </button>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs w-full">
              <span className="text-slate-400">Door Status</span>
              <span
                className={`font-medium ${
                  roomsState.garage.garageDoorOpen ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {roomsState.garage.garageDoorOpen ? 'Open / Ajar' : 'Secured'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
