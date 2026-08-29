/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import type { AllRoomsState } from '../types';
import {
  DoorClosed,
  DoorOpen,
  Fan,
  Thermometer,
  Lightbulb,
  Wind,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface LiveDeviceMonitorProps {
  roomsState: AllRoomsState;
}

export function LiveDeviceMonitor({ roomsState }: LiveDeviceMonitorProps) {
  const monitors = [
    {
      label: 'Front Main Door',
      location: 'Living Room',
      icon: roomsState.livingRoom.mainDoorOpen ? DoorOpen : DoorClosed,
      value: roomsState.livingRoom.mainDoorOpen ? 'Unlocked / Open' : 'Secured / Closed',
      active: roomsState.livingRoom.mainDoorOpen,
      badgeColor: roomsState.livingRoom.mainDoorOpen ? 'text-amber-300 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10',
    },
    {
      label: 'Garage Door',
      location: 'Garage',
      icon: roomsState.garage.garageDoorOpen ? DoorOpen : DoorClosed,
      value: roomsState.garage.garageDoorOpen ? 'Open' : 'Closed',
      active: roomsState.garage.garageDoorOpen,
      badgeColor: roomsState.garage.garageDoorOpen ? 'text-amber-300 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10',
    },
    {
      label: 'Kitchen Window',
      location: 'Kitchen',
      icon: Wind,
      value: roomsState.kitchen.windowOpen ? 'Open' : 'Closed',
      active: roomsState.kitchen.windowOpen,
      badgeColor: roomsState.kitchen.windowOpen ? 'text-amber-300 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10',
    },
    {
      label: 'Living Climate (AC)',
      location: 'Living Room',
      icon: Thermometer,
      value: roomsState.livingRoom.acPower ? `${roomsState.livingRoom.acTemp}°F` : 'Off',
      active: roomsState.livingRoom.acPower,
      badgeColor: roomsState.livingRoom.acPower ? 'text-sky-300 bg-sky-500/10' : 'text-slate-400 bg-white/5',
    },
    {
      label: 'Master AC',
      location: 'Bedroom Main',
      icon: Thermometer,
      value: roomsState.bedroomMain.acPower ? `${roomsState.bedroomMain.acTemp}°F` : 'Off',
      active: roomsState.bedroomMain.acPower,
      badgeColor: roomsState.bedroomMain.acPower ? 'text-sky-300 bg-sky-500/10' : 'text-slate-400 bg-white/5',
    },
    {
      label: 'Living Ceiling Fan',
      location: 'Living Room',
      icon: Fan,
      value: roomsState.livingRoom.fanPower ? `${roomsState.livingRoom.fanSpeed}% (${roomsState.livingRoom.fanMode})` : 'Off',
      active: roomsState.livingRoom.fanPower,
      badgeColor: roomsState.livingRoom.fanPower ? 'text-cyan-300 bg-cyan-500/10' : 'text-slate-400 bg-white/5',
    },
    {
      label: 'Master Lights',
      location: 'Bedroom Main',
      icon: Lightbulb,
      value: roomsState.bedroomMain.lightPower ? 'On' : 'Off',
      active: roomsState.bedroomMain.lightPower,
      badgeColor: roomsState.bedroomMain.lightPower ? 'text-amber-300 bg-amber-500/10' : 'text-slate-400 bg-white/5',
    },
    {
      label: 'Dining Chandelier',
      location: 'Dining Room',
      icon: Lightbulb,
      value: roomsState.diningRoom.lightPower ? 'On' : 'Off',
      active: roomsState.diningRoom.lightPower,
      badgeColor: roomsState.diningRoom.lightPower ? 'text-amber-300 bg-amber-500/10' : 'text-slate-400 bg-white/5',
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Connected Endpoints
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          8 Monitored
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {monitors.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              layout
              className={`p-2.5 rounded-xl border transition-all duration-300 ${
                item.active
                  ? 'bg-slate-950 border-slate-700'
                  : 'bg-slate-950/40 border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[90px]">
                  {item.location}
                </span>
                <Icon className={`w-3.5 h-3.5 ${item.active ? 'text-sky-400' : 'text-slate-600'}`} />
              </div>
              <p className="text-xs font-medium text-slate-200 truncate">{item.label}</p>
              <div className="mt-1.5 flex items-center gap-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${item.badgeColor}`}>
                  {item.value}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
