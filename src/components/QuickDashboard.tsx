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
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { PowerMeterWidget } from './PowerMeterWidget';
import { RoomDevicePanels } from './dashboard/RoomDevicePanels';
import type { AllRoomsState, RoomId, TemperatureUnit } from '../types';
import { checkAcPowerSaving } from '../utils/powerAndTemp';
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs font-medium text-slate-400">
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
              className="inline-flex items-center justify-center gap-2.5 px-4.5 py-2.5 rounded-xl bg-slate-100 hover:bg-white text-slate-950 font-semibold text-xs tracking-normal transition-all shadow-sm cursor-pointer active:scale-95 shrink-0"
            >
              <span>Open Voice Hub</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>

        {/* Live Persistent Power Telemetry Widget */}
        <PowerMeterWidget roomsState={roomsState} />

        {/* Room Selector Tab Bar (Scrollable on small screens, wrap/grid on larger) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Zone Selection ({ROOMS.length} rooms)
            </span>
            <span className="text-xs text-slate-400">
              Active: <strong className="text-slate-200 font-semibold">{activeRoom.name}</strong>
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all cursor-pointer snap-start ${
                    isActive
                      ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
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
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-300">
                  <activeRoom.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-headline">
                    {activeRoom.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dedicated connected endpoints in this zone
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Online
                </span>
                <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
                  {activeRoom.badge}
                </span>
              </div>
            </div>

            {/* Modular Device Panels */}
            <RoomDevicePanels
              activeRoomId={activeRoomId}
              roomsState={roomsState}
              tempUnit={tempUnit}
              updateLiving={updateLiving}
              updateBedroomMain={updateBedroomMain}
              updateBedroom2={updateBedroom2}
              updateBedroom3={updateBedroom3}
              updateDining={updateDining}
              updateKitchen={updateKitchen}
              updateBathroomMain={updateBathroomMain}
              updateBathroom2={updateBathroom2}
              updateGarage={updateGarage}
              handleAcTempChange={handleAcTempChange}
              getFanSpeedAnimation={getFanSpeedAnimation}
            />
          </motion.div>
        </AnimatePresence>

        {/* Access Home Bottom Section */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Interactive 2D/3D floorplan topology and voice assistant in Home View</span>
          </div>

          <button
            id="access-home-bottom-btn"
            onClick={onAccessHome}
            className="w-full sm:w-auto py-3 px-6 bg-slate-100 text-slate-950 font-semibold text-xs rounded-xl hover:bg-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Open Voice Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
