import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Home, ShieldCheck, Activity } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('Synchronizing spatial sensors...');

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1600; // 1.6s smooth transition

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(nextProgress);

      if (nextProgress < 35) {
        setPhase('Connecting to local telemetry node...');
      } else if (nextProgress < 70) {
        setPhase('Loading architectural zone mapping...');
      } else if (nextProgress < 95) {
        setPhase('Synchronizing environmental states...');
      } else {
        setPhase('Ready.');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(onComplete, 200);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto min-h-[420px] rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-md p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden"
    >
      {/* Background ambient radar sweep */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
        <div className="w-[380px] h-[380px] rounded-full border border-blue-500/20 animate-ping" />
        <div className="absolute w-[240px] h-[240px] rounded-full border border-blue-400/25" />
      </div>

      {/* Central Icon Ring */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.25)]">
          <Home className="w-9 h-9 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>

      {/* Title */}
      <h3 className="font-headline text-2xl sm:text-3xl text-white font-bold tracking-wide mb-2">
        INITIALIZING HOUSE LAYOUT
      </h3>

      {/* Phase status */}
      <p className="text-sm text-slate-400 font-mono flex items-center gap-2 mb-8 h-6">
        <Activity className="w-4 h-4 text-blue-400 animate-spin" />
        {phase}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-md bg-white/[0.06] rounded-full h-2 p-0.5 border border-white/10 overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Percentage */}
      <div className="flex justify-between w-full max-w-md text-xs font-mono text-slate-400">
        <span>SECURITY ENCLAVE ACTIVE</span>
        <span className="text-blue-400 font-semibold">{progress}%</span>
      </div>
    </motion.div>
  );
}
