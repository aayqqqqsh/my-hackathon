import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Home, ChevronRight } from 'lucide-react';

interface IntroOverlayProps {
  onComplete: () => void;
}

export function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleFinish = () => {
    setIsExiting(true);
    // Give animation 400ms to fade out, then call onComplete
    setTimeout(() => {
      onCompleteRef.current();
    }, 450);
  };

  useEffect(() => {
    // Hold splash for ~1.5s then auto-dismiss
    const timer = setTimeout(() => {
      handleFinish();
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.01 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[200] bg-[#0B0F17] flex flex-col items-center justify-center select-none overflow-hidden"
        >
          {/* Quick Skip Button */}
          <button
            id="skip-intro-btn"
            type="button"
            onClick={handleFinish}
            className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <span>Skip</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Dual Exterior Atmosphere (cool top) and Interior Warmth (warm bottom) */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

          {/* Precision Architectural Grid Line */}
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent top-1/2 -translate-y-1/2 pointer-events-none" />

          {/* Animated Center Brandmark */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xl">
            {/* System Status Pill */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-slate-300 uppercase">
                ENVIRONMENT BRIDGE • ONLINE
              </span>
            </motion.div>

            {/* Synergetic Icon: Outer Shield + Inner Hearth */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-sky-500/15 to-amber-500/15 border border-white/15 flex items-center justify-center mb-6 shadow-2xl"
            >
              <ShieldCheck className="w-8 h-8 text-sky-400" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-[#0B0F17] border border-amber-500/40 flex items-center justify-center">
                <Home className="w-3 h-3 text-amber-400" />
              </div>
            </motion.div>

            {/* Bold Headline Logo Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            >
              <h1 className="font-headline text-6xl sm:text-7xl md:text-8xl text-white tracking-tight leading-none mb-3">
                KEEPSAFE
              </h1>
            </motion.div>

            {/* Subtext Reveal: Clear product statement */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xs sm:text-sm font-mono tracking-widest text-slate-400 uppercase max-w-md"
            >
              <span className="text-sky-300">Exterior Intelligence</span>
              <span className="mx-2 text-slate-600">✕</span>
              <span className="text-amber-300">Interior Comfort</span>
            </motion.p>

            {/* Synchronizing Progress Indicator */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '180px', opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="h-[2px] bg-gradient-to-r from-sky-500 via-white to-amber-500 mt-8 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
