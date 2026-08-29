import { useState, type Dispatch, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sofa,
  Bed,
  BedDouble,
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
  Layers,
  Wind,
  Power,
  Flame,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { PowerMeterWidget } from './PowerMeterWidget';
import type { AllRoomsState, RoomId, TemperatureUnit } from '../types';
import { formatTemperature, checkAcPowerSaving } from '../utils/powerAndTemp';
import type { AcPowerSavingPromptData } from './AcPowerSavingModal';

interface QuickDashboardProps {
  roomsState: AllRoomsState;
  setRoomsState: Dispatch<SetStateAction<AllRoomsState>>;
  onAccessHome: () => void;
  tempUnit?: TemperatureUnit;
  setTempUnit?: Dispatch<SetStateAction<TemperatureUnit>>;
  onRequestAcOptimization?: (prompt: AcPowerSavingPromptData) => void;
  dismissedSuggestionsRef?: React.MutableRefObject<Set<string>>;
}

interface RoomDefinition {
  id: RoomId;
  name: string;
  shortName: string;
  icon: LucideIcon;
  badge: string;
}

const ROOMS: RoomDefinition[] = [
  { id: 'living-room', name: 'Living Room', shortName: 'Living', icon: Sofa, badge: '3 Devices' },
  { id: 'bedroom-main', name: 'Bedroom (Main)', shortName: 'Master Bed', icon: BedDouble, badge: '4 Devices' },
  { id: 'bedroom-2', name: 'Bedroom 2', shortName: 'Bed 2', icon: Bed, badge: '4 Devices' },
  { id: 'bedroom-3', name: 'Bedroom 3', shortName: 'Bed 3', icon: Bed, badge: '3 Devices' },
  { id: 'dining-room', name: 'Dining Room', shortName: 'Dining', icon: Utensils, badge: '2 Devices' },
  { id: 'kitchen', name: 'Kitchen', shortName: 'Kitchen', icon: ChefHat, badge: '2 Devices' },
  { id: 'bathroom-main', name: 'Bathroom (Main)', shortName: 'Bath 1', icon: Bath, badge: '2 Devices' },
  { id: 'bathroom-2', name: 'Bathroom 2', shortName: 'Bath 2', icon: Bath, badge: '2 Devices' },
  { id: 'garage', name: 'Garage', shortName: 'Garage', icon: Warehouse, badge: '1 Device' },
];

export function QuickDashboard({
  roomsState,
  setRoomsState,
  onAccessHome,
  tempUnit = 'F',
  setTempUnit,
  onRequestAcOptimization,
  dismissedSuggestionsRef,
}: QuickDashboardProps) {
  const [activeRoomId, setActiveRoomId] = useState<RoomId>('living-room');

  const activeRoom = ROOMS.find((r) => r.id === activeRoomId) || ROOMS[0];

  // Common AC temp change with power saving verification
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

  // Helper updater for Living Room
  const updateLiving = (patch: Partial<AllRoomsState['livingRoom']>) => {
    setRoomsState((prev) => ({
      ...prev,
      livingRoom: { ...prev.livingRoom, ...patch },
    }));
  };

  // Helper updater for Bedroom Main
  const updateBedroomMain = (patch: Partial<AllRoomsState['bedroomMain']>) => {
    setRoomsState((prev) => ({
      ...prev,
      bedroomMain: { ...prev.bedroomMain, ...patch },
    }));
  };

  // Helper updater for Bedroom 2
  const updateBedroom2 = (patch: Partial<AllRoomsState['bedroom2']>) => {
    setRoomsState((prev) => ({
      ...prev,
      bedroom2: { ...prev.bedroom2, ...patch },
    }));
  };

  // Helper updater for Bedroom 3
  const updateBedroom3 = (patch: Partial<AllRoomsState['bedroom3']>) => {
    setRoomsState((prev) => ({
      ...prev,
      bedroom3: { ...prev.bedroom3, ...patch },
    }));
  };

  // Helper updater for Dining Room
  const updateDining = (patch: Partial<AllRoomsState['diningRoom']>) => {
    setRoomsState((prev) => ({
      ...prev,
      diningRoom: { ...prev.diningRoom, ...patch },
    }));
  };

  // Helper updater for Kitchen
  const updateKitchen = (patch: Partial<AllRoomsState['kitchen']>) => {
    setRoomsState((prev) => ({
      ...prev,
      kitchen: { ...prev.kitchen, ...patch },
    }));
  };

  // Helper updater for Bathroom Main
  const updateBathroomMain = (patch: Partial<AllRoomsState['bathroomMain']>) => {
    setRoomsState((prev) => ({
      ...prev,
      bathroomMain: { ...prev.bathroomMain, ...patch },
    }));
  };

  // Helper updater for Bathroom 2
  const updateBathroom2 = (patch: Partial<AllRoomsState['bathroom2']>) => {
    setRoomsState((prev) => ({
      ...prev,
      bathroom2: { ...prev.bathroom2, ...patch },
    }));
  };

  // Helper updater for Garage
  const updateGarage = (patch: Partial<AllRoomsState['garage']>) => {
    setRoomsState((prev) => ({
      ...prev,
      garage: { ...prev.garage, ...patch },
    }));
  };

  const getFanSpeedAnimation = (power: boolean, mode: string) => {
    if (!power || mode === 'off') return 'none';
    if (mode === 'low') return 'spin 3.5s linear infinite';
    if (mode === 'med') return 'spin 1.8s linear infinite';
    return 'spin 0.9s linear infinite';
  };

  return (
    <section id="quick-dashboard-section" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
      {/* Main Dashboard Container */}
      <div
        id="main-dashboard"
        className="bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-3xl p-6 sm:p-10 flex flex-col gap-8 shadow-2xl"
      >
        {/* Section Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs font-mono text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
              <span>Room Telemetry & Endpoint Matrix</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-white">
              Zone Control Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Direct physical controls for doors, climate, and appliances across all 9 zones.
            </p>
          </div>

          {/* Header Controls: Unit Toggle & Voice Hub Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Global Temperature Unit Toggle */}
            {setTempUnit && (
              <div
                id="global-temp-unit-toggle"
                className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800"
              >
                <button
                  id="temp-unit-fahrenheit-btn"
                  onClick={() => setTempUnit('F')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    tempUnit === 'F'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Display temperature in Fahrenheit (°F)"
                >
                  °F
                </button>
                <button
                  id="temp-unit-celsius-btn"
                  onClick={() => setTempUnit('C')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    tempUnit === 'C'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Display temperature in Celsius (°C)"
                >
                  °C
                </button>
              </div>
            )}

            {/* Quick Access Home Button */}
            <button
              id="access-home-header-btn"
              onClick={onAccessHome}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer active:scale-95 shrink-0"
            >
              <span>Open Voice Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Persistent Power Telemetry Widget */}
        <PowerMeterWidget roomsState={roomsState} />

        {/* Room Selector Tab Bar (Scrollable on small screens, wrap/grid on larger) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase font-mono">
              SELECT ZONE ({ROOMS.length} ROOMS)
            </span>
            <span className="text-[11px] font-mono text-sky-400">
              Active: <strong className="text-white font-sans">{activeRoom.name}</strong>
            </span>
          </div>

          <div
            id="room-tabs-bar"
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x"
          >
            {ROOMS.map((room) => {
              const Icon = room.icon;
              const isActive = activeRoomId === room.id;
              return (
                <button
                  key={room.id}
                  id={`room-tab-${room.id}`}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer snap-start font-mono ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 border-amber-500/50 shadow-md'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-sky-400/80'}`} />
                  <span>{room.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Room Devices Stage with Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRoomId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full space-y-6"
          >
            {/* Room Hero Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400">
                  <activeRoom.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide font-headline">
                    {activeRoom.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dedicated connected endpoints in this zone
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
                  ONLINE
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
                  {activeRoom.badge}
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* ROOM 1: LIVING ROOM                                                       */}
            {/* Devices: Main Door (open/close), Fan (on/off + speed), AC (on/off + temp)  */}
            {/* ========================================================================= */}
            {activeRoomId === 'living-room' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Main Door (Open / Close toggle) */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.livingRoom.mainDoorOpen
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                      {roomsState.livingRoom.mainDoorOpen ? (
                        <DoorOpen className="w-5 h-5 text-amber-400" />
                      ) : (
                        <DoorClosed className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <button
                      id="living-door-toggle"
                      onClick={() => updateLiving({ mainDoorOpen: !roomsState.livingRoom.mainDoorOpen })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.livingRoom.mainDoorOpen ? 'bg-amber-500' : 'bg-white/20'
                      }`}
                      aria-label="Toggle Main Door"
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.livingRoom.mainDoorOpen ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Main Door
                  </h4>
                  <p className="text-xs text-white/50 mb-4">Perimeter Entry Portal</p>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-white/40">STATUS:</span>
                    <span className={roomsState.livingRoom.mainDoorOpen ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {roomsState.livingRoom.mainDoorOpen ? 'OPEN / AJAR' : 'SECURELY CLOSED'}
                    </span>
                  </div>
                </div>

                {/* 2. Fan (On/Off Toggle + Speed Control) */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.livingRoom.fanPower
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                    : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                      <Fan
                        className={`w-5 h-5 ${roomsState.livingRoom.fanPower ? 'text-blue-400' : 'text-white/40'}`}
                        style={{
                          animation: getFanSpeedAnimation(
                            roomsState.livingRoom.fanPower,
                            roomsState.livingRoom.fanMode
                          ),
                        }}
                      />
                    </div>
                    <button
                      id="living-fan-power-toggle"
                      onClick={() => {
                        const nextPower = !roomsState.livingRoom.fanPower;
                        updateLiving({
                          fanPower: nextPower,
                          fanMode: nextPower ? (roomsState.livingRoom.fanMode === 'off' ? 'med' : roomsState.livingRoom.fanMode) : 'off',
                          fanSpeed: nextPower ? (roomsState.livingRoom.fanSpeed === 0 ? 60 : roomsState.livingRoom.fanSpeed) : 0,
                        });
                      }}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        roomsState.livingRoom.fanPower
                          ? 'bg-blue-600 border-blue-400 text-white shadow-sm'
                          : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                      aria-label="Toggle Living Room Fan"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Ceiling Fan
                    </h4>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {roomsState.livingRoom.fanPower ? `${roomsState.livingRoom.fanSpeed}%` : 'OFF'}
                    </span>
                  </div>

                  {/* Fan Speed Slider */}
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
                    className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-full cursor-pointer mb-3"
                  />

                  {/* Fan Mode Step Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/10">
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
                        className={`py-1 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                          roomsState.livingRoom.fanMode === m && roomsState.livingRoom.fanPower
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-white/40 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. AC (On/Off Toggle + Temperature Control) */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.livingRoom.acPower
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                    : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                      <ThermometerSnowflake className={`w-5 h-5 ${roomsState.livingRoom.acPower ? 'text-blue-400' : 'text-white/40'}`} />
                    </div>
                    <button
                      id="living-ac-power-toggle"
                      onClick={() => updateLiving({ acPower: !roomsState.livingRoom.acPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.livingRoom.acPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                      aria-label="Toggle Living Room AC"
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.livingRoom.acPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Living HVAC AC
                    </h4>
                    <span className="text-lg font-mono font-black text-blue-400">
                      {roomsState.livingRoom.acPower ? `${roomsState.livingRoom.acTemp}°F` : 'ECO'}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mb-3">
                    {roomsState.livingRoom.acPower ? 'Cooling Active' : 'Standby / Low Power'}
                  </p>

                  {/* Temp Controls */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
                    <button
                      disabled={!roomsState.livingRoom.acPower}
                      onClick={() => updateLiving({ acTemp: Math.max(60, roomsState.livingRoom.acTemp - 1) })}
                      className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono text-white/60">TARGET TEMP</span>
                    <button
                      disabled={!roomsState.livingRoom.acPower}
                      onClick={() => updateLiving({ acTemp: Math.min(85, roomsState.livingRoom.acTemp + 1) })}
                      className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* ROOM 2: BEDROOM (MAIN)                                                    */}
            {/* Devices: Light (toggle), Lamp 1 (toggle + slider), Lamp 2 (toggle+slider), AC */}
            {/* ========================================================================= */}
            {activeRoomId === 'bedroom-main' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Main Ceiling Light */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bedroomMain.lightPower
                    ? 'bg-blue-600/10 border-blue-500/40'
                    : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                      <Sun className={`w-5 h-5 ${roomsState.bedroomMain.lightPower ? 'text-blue-400' : 'text-white/40'}`} />
                    </div>
                    <button
                      onClick={() => updateBedroomMain({ lightPower: !roomsState.bedroomMain.lightPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bedroomMain.lightPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bedroomMain.lightPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Main Light
                  </h4>
                  <p className="text-xs text-white/50 mb-4">Overhead illumination</p>
                  <div className="pt-3 border-t border-white/10 flex justify-between text-xs font-mono">
                    <span className="text-white/40">STATUS:</span>
                    <span className={roomsState.bedroomMain.lightPower ? 'text-blue-400 font-bold' : 'text-white/40'}>
                      {roomsState.bedroomMain.lightPower ? 'POWER ON' : 'POWER OFF'}
                    </span>
                  </div>
                </div>

                {/* 2. Lamp Light 1 (On/Off + Intensity Slider) */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bedroomMain.lamp1Power
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                    : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                      <Lightbulb className={`w-5 h-5 ${roomsState.bedroomMain.lamp1Power ? 'text-blue-400' : 'text-white/40'}`} />
                    </div>
                    <button
                      onClick={() => updateBedroomMain({ lamp1Power: !roomsState.bedroomMain.lamp1Power })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bedroomMain.lamp1Power ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bedroomMain.lamp1Power ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Lamp Light 1
                    </h4>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {roomsState.bedroomMain.lamp1Power ? `${roomsState.bedroomMain.lamp1Intensity}%` : 'OFF'}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mb-3">Left Bedside Lamp</p>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={!roomsState.bedroomMain.lamp1Power}
                    value={roomsState.bedroomMain.lamp1Power ? roomsState.bedroomMain.lamp1Intensity : 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateBedroomMain({ lamp1Intensity: val, lamp1Power: val > 0 });
                    }}
                    className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-full cursor-pointer"
                  />
                </div>

                {/* 3. Lamp Light 2 (Independent On/Off + Intensity Slider) */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bedroomMain.lamp2Power
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                    : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                      <Lightbulb className={`w-5 h-5 ${roomsState.bedroomMain.lamp2Power ? 'text-blue-400' : 'text-white/40'}`} />
                    </div>
                    <button
                      onClick={() => updateBedroomMain({ lamp2Power: !roomsState.bedroomMain.lamp2Power })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bedroomMain.lamp2Power ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bedroomMain.lamp2Power ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Lamp Light 2
                    </h4>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {roomsState.bedroomMain.lamp2Power ? `${roomsState.bedroomMain.lamp2Intensity}%` : 'OFF'}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mb-3">Right Bedside Lamp</p>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={!roomsState.bedroomMain.lamp2Power}
                    value={roomsState.bedroomMain.lamp2Power ? roomsState.bedroomMain.lamp2Intensity : 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateBedroomMain({ lamp2Intensity: val, lamp2Power: val > 0 });
                    }}
                    className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-full cursor-pointer"
                  />
                </div>

                {/* 4. Bedroom Main AC */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bedroomMain.acPower
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                    : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                      <ThermometerSnowflake className={`w-5 h-5 ${roomsState.bedroomMain.acPower ? 'text-blue-400' : 'text-white/40'}`} />
                    </div>
                    <button
                      onClick={() => updateBedroomMain({ acPower: !roomsState.bedroomMain.acPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bedroomMain.acPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bedroomMain.acPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Master AC
                    </h4>
                    <span className="text-lg font-mono font-black text-blue-400">
                      {roomsState.bedroomMain.acPower ? `${roomsState.bedroomMain.acTemp}°F` : 'OFF'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
                    <button
                      disabled={!roomsState.bedroomMain.acPower}
                      onClick={() => updateBedroomMain({ acTemp: Math.max(60, roomsState.bedroomMain.acTemp - 1) })}
                      className="flex-1 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold"
                    >
                      -
                    </button>
                    <span className="text-[10px] font-mono text-white/60">TEMP</span>
                    <button
                      disabled={!roomsState.bedroomMain.acPower}
                      onClick={() => updateBedroomMain({ acTemp: Math.min(85, roomsState.bedroomMain.acTemp + 1) })}
                      className="flex-1 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* ROOM 3: BEDROOM 2                                                         */}
            {/* Devices: Light (toggle), Lamp (toggle + slider), AC (toggle+temp), Fan (toggle) */}
            {/* ========================================================================= */}
            {activeRoomId === 'bedroom-2' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Light */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bedroom2.lightPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <Sun className={`w-5 h-5 ${roomsState.bedroom2.lightPower ? 'text-blue-400' : 'text-white/40'}`} />
                    <button
                      onClick={() => updateBedroom2({ lightPower: !roomsState.bedroom2.lightPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bedroom2.lightPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bedroom2.lightPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Ceiling Light
                  </h4>
                  <p className="text-xs text-white/50">Primary room light</p>
                </div>

                {/* 2. Lamp Light (Toggle + Slider) */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bedroom2.lampPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <Lightbulb className={`w-5 h-5 ${roomsState.bedroom2.lampPower ? 'text-blue-400' : 'text-white/40'}`} />
                    <button
                      onClick={() => updateBedroom2({ lampPower: !roomsState.bedroom2.lampPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bedroom2.lampPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bedroom2.lampPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Lamp Light
                    </h4>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {roomsState.bedroom2.lampPower ? `${roomsState.bedroom2.lampIntensity}%` : 'OFF'}
                    </span>
                  </div>
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
                    className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-full cursor-pointer mt-3"
                  />
                </div>

                {/* 3. AC */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bedroom2.acPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <ThermometerSnowflake className={`w-5 h-5 ${roomsState.bedroom2.acPower ? 'text-blue-400' : 'text-white/40'}`} />
                    <button
                      onClick={() => updateBedroom2({ acPower: !roomsState.bedroom2.acPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bedroom2.acPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bedroom2.acPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Bedroom 2 AC
                    </h4>
                    <span className="text-base font-mono font-bold text-blue-400">
                      {roomsState.bedroom2.acPower ? `${roomsState.bedroom2.acTemp}°F` : 'OFF'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <button
                      disabled={!roomsState.bedroom2.acPower}
                      onClick={() => updateBedroom2({ acTemp: Math.max(60, roomsState.bedroom2.acTemp - 1) })}
                      className="flex-1 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold"
                    >
                      -
                    </button>
                    <button
                      disabled={!roomsState.bedroom2.acPower}
                      onClick={() => updateBedroom2({ acTemp: Math.min(85, roomsState.bedroom2.acTemp + 1) })}
                      className="flex-1 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 4. Fan (This bedroom has a fan in addition to AC) */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bedroom2.fanPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <Fan
                      className={`w-5 h-5 ${roomsState.bedroom2.fanPower ? 'text-blue-400' : 'text-white/40'}`}
                      style={{
                        animation: getFanSpeedAnimation(roomsState.bedroom2.fanPower, roomsState.bedroom2.fanMode),
                      }}
                    />
                    <button
                      onClick={() => {
                        const nextPower = !roomsState.bedroom2.fanPower;
                        updateBedroom2({
                          fanPower: nextPower,
                          fanMode: nextPower ? (roomsState.bedroom2.fanMode === 'off' ? 'med' : roomsState.bedroom2.fanMode) : 'off',
                          fanSpeed: nextPower ? (roomsState.bedroom2.fanSpeed === 0 ? 50 : roomsState.bedroom2.fanSpeed) : 0,
                        });
                      }}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bedroom2.fanPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bedroom2.fanPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Ceiling Fan
                    </h4>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {roomsState.bedroom2.fanPower ? `${roomsState.bedroom2.fanSpeed}%` : 'OFF'}
                    </span>
                  </div>
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
                    className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-full cursor-pointer mt-3"
                  />
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* ROOM 4: BEDROOM 3                                                         */}
            {/* Devices: Light (toggle), Lamp (toggle + slider), AC (toggle + temp)        */}
            {/* ========================================================================= */}
            {activeRoomId === 'bedroom-3' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Light */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bedroom3.lightPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <Sun className={`w-5 h-5 ${roomsState.bedroom3.lightPower ? 'text-blue-400' : 'text-white/40'}`} />
                    <button
                      onClick={() => updateBedroom3({ lightPower: !roomsState.bedroom3.lightPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bedroom3.lightPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bedroom3.lightPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Bedroom 3 Light
                  </h4>
                  <p className="text-xs text-white/50">Ceiling light fixture</p>
                </div>

                {/* 2. Lamp Light */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bedroom3.lampPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <Lightbulb className={`w-5 h-5 ${roomsState.bedroom3.lampPower ? 'text-blue-400' : 'text-white/40'}`} />
                    <button
                      onClick={() => updateBedroom3({ lampPower: !roomsState.bedroom3.lampPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bedroom3.lampPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bedroom3.lampPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Lamp Light
                    </h4>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {roomsState.bedroom3.lampPower ? `${roomsState.bedroom3.lampIntensity}%` : 'OFF'}
                    </span>
                  </div>
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
                    className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-full cursor-pointer mt-3"
                  />
                </div>

                {/* 3. AC */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bedroom3.acPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <ThermometerSnowflake className={`w-5 h-5 ${roomsState.bedroom3.acPower ? 'text-blue-400' : 'text-white/40'}`} />
                    <button
                      onClick={() => updateBedroom3({ acPower: !roomsState.bedroom3.acPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bedroom3.acPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bedroom3.acPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Climate AC
                    </h4>
                    <span className="text-base font-mono font-bold text-blue-400">
                      {roomsState.bedroom3.acPower ? `${roomsState.bedroom3.acTemp}°F` : 'OFF'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <button
                      disabled={!roomsState.bedroom3.acPower}
                      onClick={() => updateBedroom3({ acTemp: Math.max(60, roomsState.bedroom3.acTemp - 1) })}
                      className="flex-1 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold"
                    >
                      -
                    </button>
                    <button
                      disabled={!roomsState.bedroom3.acPower}
                      onClick={() => updateBedroom3({ acTemp: Math.min(85, roomsState.bedroom3.acTemp + 1) })}
                      className="flex-1 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* ROOM 5: DINING ROOM                                                       */}
            {/* Devices: Light (on/off), AC (on/off + temp)                                */}
            {/* ========================================================================= */}
            {activeRoomId === 'dining-room' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Dining Light */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.diningRoom.lightPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <Sun className={`w-5 h-5 ${roomsState.diningRoom.lightPower ? 'text-blue-400' : 'text-white/40'}`} />
                    <button
                      onClick={() => updateDining({ lightPower: !roomsState.diningRoom.lightPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.diningRoom.lightPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.diningRoom.lightPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Dining Chandelier Light
                  </h4>
                  <p className="text-xs text-white/50">Center illumination</p>
                </div>

                {/* 2. Dining AC */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.diningRoom.acPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <ThermometerSnowflake className={`w-5 h-5 ${roomsState.diningRoom.acPower ? 'text-blue-400' : 'text-white/40'}`} />
                    <button
                      onClick={() => updateDining({ acPower: !roomsState.diningRoom.acPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.diningRoom.acPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.diningRoom.acPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Dining Area AC
                    </h4>
                    <span className="text-lg font-mono font-black text-blue-400">
                      {roomsState.diningRoom.acPower ? `${roomsState.diningRoom.acTemp}°F` : 'OFF'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <button
                      disabled={!roomsState.diningRoom.acPower}
                      onClick={() => updateDining({ acTemp: Math.max(60, roomsState.diningRoom.acTemp - 1) })}
                      className="flex-1 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono text-white/50">TARGET</span>
                    <button
                      disabled={!roomsState.diningRoom.acPower}
                      onClick={() => updateDining({ acTemp: Math.min(85, roomsState.diningRoom.acTemp + 1) })}
                      className="flex-1 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* ROOM 6: KITCHEN                                                           */}
            {/* Devices: Chimney (on/off + speed levels), Window (open/close toggle)      */}
            {/* ========================================================================= */}
            {activeRoomId === 'kitchen' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Chimney (On/Off + Speed Level) */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.kitchen.chimneyPower
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                    : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                      <Flame className={`w-5 h-5 ${roomsState.kitchen.chimneyPower ? 'text-blue-400' : 'text-white/40'}`} />
                    </div>
                    <button
                      onClick={() => updateKitchen({ chimneyPower: !roomsState.kitchen.chimneyPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.kitchen.chimneyPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.kitchen.chimneyPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Kitchen Chimney
                    </h4>
                    <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                      {roomsState.kitchen.chimneyPower ? roomsState.kitchen.chimneySpeed : 'OFF'}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mb-3">Exhaust & Fume Extraction</p>

                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/10">
                    {(['low', 'med', 'high', 'turbo'] as const).map((speed) => (
                      <button
                        key={speed}
                        disabled={!roomsState.kitchen.chimneyPower}
                        onClick={() => updateKitchen({ chimneySpeed: speed })}
                        className={`py-1.5 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                          roomsState.kitchen.chimneySpeed === speed && roomsState.kitchen.chimneyPower
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-white/40 hover:text-white disabled:opacity-30'
                        }`}
                      >
                        {speed}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Window (Open / Close toggle) */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.kitchen.windowOpen
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                      <Layers className={`w-5 h-5 ${roomsState.kitchen.windowOpen ? 'text-amber-400' : 'text-emerald-400'}`} />
                    </div>
                    <button
                      onClick={() => updateKitchen({ windowOpen: !roomsState.kitchen.windowOpen })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.kitchen.windowOpen ? 'bg-amber-500' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.kitchen.windowOpen ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Kitchen Window
                  </h4>
                  <p className="text-xs text-white/50 mb-4">Ventilation & Weather Shield</p>
                  <div className="pt-3 border-t border-white/10 flex justify-between text-xs font-mono">
                    <span className="text-white/40">STATE:</span>
                    <span className={roomsState.kitchen.windowOpen ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {roomsState.kitchen.windowOpen ? 'OPEN (VENTILATING)' : 'CLOSED (SEALED)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* ROOM 7: BATHROOM (MAIN)                                                   */}
            {/* Devices: Light (toggle), Exhaust Fan (toggle)                             */}
            {/* ========================================================================= */}
            {activeRoomId === 'bathroom-main' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Light */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bathroomMain.lightPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <Sun className={`w-5 h-5 ${roomsState.bathroomMain.lightPower ? 'text-blue-400' : 'text-white/40'}`} />
                    <button
                      onClick={() => updateBathroomMain({ lightPower: !roomsState.bathroomMain.lightPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bathroomMain.lightPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bathroomMain.lightPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Vanity & Overhead Light
                  </h4>
                  <p className="text-xs text-white/50">Primary illumination</p>
                </div>

                {/* 2. Exhaust Fan */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bathroomMain.exhaustFanPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <Wind className={`w-5 h-5 ${roomsState.bathroomMain.exhaustFanPower ? 'text-blue-400' : 'text-white/40'}`} />
                    <button
                      onClick={() => updateBathroomMain({ exhaustFanPower: !roomsState.bathroomMain.exhaustFanPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bathroomMain.exhaustFanPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bathroomMain.exhaustFanPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Moisture Exhaust Fan
                  </h4>
                  <p className="text-xs text-white/50">Humidity & air circulation</p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* ROOM 8: BATHROOM 2                                                        */}
            {/* Devices: Light (toggle), Exhaust Fan (toggle)                             */}
            {/* ========================================================================= */}
            {activeRoomId === 'bathroom-2' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Light */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bathroom2.lightPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <Sun className={`w-5 h-5 ${roomsState.bathroom2.lightPower ? 'text-blue-400' : 'text-white/40'}`} />
                    <button
                      onClick={() => updateBathroom2({ lightPower: !roomsState.bathroom2.lightPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bathroom2.lightPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bathroom2.lightPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Bathroom 2 Light
                  </h4>
                  <p className="text-xs text-white/50">Guest bathroom light</p>
                </div>

                {/* 2. Exhaust Fan */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.bathroom2.exhaustFanPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <Wind className={`w-5 h-5 ${roomsState.bathroom2.exhaustFanPower ? 'text-blue-400' : 'text-white/40'}`} />
                    <button
                      onClick={() => updateBathroom2({ exhaustFanPower: !roomsState.bathroom2.exhaustFanPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.bathroom2.exhaustFanPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.bathroom2.exhaustFanPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Bathroom 2 Exhaust Fan
                  </h4>
                  <p className="text-xs text-white/50">Humidity extractor</p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* ROOM 9: GARAGE                                                            */}
            {/* Devices: Garage Door (open/close toggle), Garage Overhead Light           */}
            {/* ========================================================================= */}
            {activeRoomId === 'garage' && (
              <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-6">
                {/* 1. Garage Light */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  roomsState.garage.lightPower ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <Sun className={`w-5 h-5 ${roomsState.garage.lightPower ? 'text-blue-400' : 'text-white/40'}`} />
                    <button
                      id="garage-light-toggle-btn"
                      onClick={() => updateGarage({ lightPower: !roomsState.garage.lightPower })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        roomsState.garage.lightPower ? 'bg-blue-600' : 'bg-white/20'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        roomsState.garage.lightPower ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Garage Overhead Bay Light
                  </h4>
                  <p className="text-xs text-white/50">High-lumen workshop illumination</p>
                </div>

                {/* 2. Motorized Garage Door */}
                <div className={`p-6 rounded-2xl border text-center transition-all ${
                  roomsState.garage.garageDoorOpen
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                    : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-white/80 mb-3">
                    <Warehouse className={`w-6 h-6 ${roomsState.garage.garageDoorOpen ? 'text-amber-400' : 'text-emerald-400'}`} />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Motorized Garage Door
                  </h4>
                  <p className="text-xs text-white/50 mb-4 max-w-xs mx-auto">
                    Overhead vehicle access barrier
                  </p>

                  <div className="flex flex-col items-center gap-3">
                    <button
                      id="garage-door-toggle-btn"
                      onClick={() => updateGarage({ garageDoorOpen: !roomsState.garage.garageDoorOpen })}
                      className={`px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all cursor-pointer shadow-lg active:scale-95 ${
                        roomsState.garage.garageDoorOpen
                          ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'
                          : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30'
                      }`}
                    >
                      {roomsState.garage.garageDoorOpen ? 'CLOSE DOOR' : 'OPEN DOOR'}
                    </button>

                    <span className="text-[11px] font-mono text-white/40">
                      STATUS: <strong className={roomsState.garage.garageDoorOpen ? 'text-amber-400' : 'text-emerald-400'}>
                        {roomsState.garage.garageDoorOpen ? 'OPEN' : 'CLOSED'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Access Home Bottom Section */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Full 2D/3D floorplan topology available in Home View</span>
          </div>

          <button
            id="access-home-bottom-btn"
            onClick={onAccessHome}
            className="w-full sm:w-auto py-4 px-8 bg-white text-black font-bold uppercase tracking-[0.15em] text-xs rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>ACCESS FULL HOME</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
