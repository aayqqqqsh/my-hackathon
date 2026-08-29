import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { House3DViewer } from './HouseScene/House3DViewer';
import type { AllRoomsState } from '../types';

interface HomeLayoutPlaceholderProps {
  onBack: () => void;
  roomsState?: AllRoomsState;
  setRoomsState?: React.Dispatch<React.SetStateAction<AllRoomsState>>;
}

export function HomeLayoutPlaceholder({
  onBack,
  roomsState,
  setRoomsState,
}: HomeLayoutPlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Header bar with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            id="back-to-dashboard-btn"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-medium text-slate-200 hover:text-white transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            SPATIAL 3D ENGINE
          </span>
        </div>
      </div>

      {/* 3D House Spatial Scene */}
      {roomsState && setRoomsState ? (
        <House3DViewer roomsState={roomsState} setRoomsState={setRoomsState} />
      ) : (
        <div className="p-8 text-center text-slate-400 font-mono text-sm">
          Loading 3D Spatial Environment...
        </div>
      )}
    </motion.div>
  );
}

