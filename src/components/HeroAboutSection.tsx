import React, { Suspense, lazy } from 'react';
import { motion } from 'motion/react';
import { CloudRain, Zap, Mic } from 'lucide-react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export function HeroAboutSection() {
  return (
    <section id="hero-about-section" className="w-full pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative z-10">
      {/* Ambient Spline 3D Scene Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <Suspense fallback={<div className="w-full h-full bg-[#050505]" />}>
          <Spline
            scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
            className="w-full h-full pointer-events-none"
          />
        </Suspense>
        {/* Semi-transparent dark overlay to preserve text legibility */}
        <div className="absolute inset-0 bg-[#050505]/35 pointer-events-none" />
      </div>

      {/* Refined clean label treatment (no pill container, no colored dot) */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-block mb-7 pb-1 border-b border-slate-700/60"
      >
        <span className="text-xs font-semibold text-slate-300 tracking-normal uppercase">
          KeepSafe Contextual Engine
        </span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-headline text-5xl sm:text-6xl md:text-7xl text-white tracking-tight leading-[1.05] mb-6"
      >
        Outside intelligence.<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300 font-normal">
          Inside sanctuary.
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-12 text-balance"
      >
        An autonomous home operating layer that unifies voice commands with live atmospheric conditions — protecting doors, conserving power, and tailoring room climate.
      </motion.p>

      {/* Bento Showcase with broken card uniformity: varied padding, radius, background tone, and icon shapes */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left w-full max-w-5xl mx-auto items-stretch">
        {/* Primary Featured Anchor Card: Distinct deeper tone, generous padding, squircle icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="md:col-span-7 p-8 sm:p-9 rounded-2xl bg-[#0B111C]/90 border border-slate-700/70 hover:border-slate-600 transition-colors shadow-2xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/25 flex items-center justify-center text-sky-300 shadow-inner">
                <CloudRain className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-sky-300/90 bg-sky-950/60 border border-sky-800/50 px-2.5 py-1 rounded-md">
                Autonomous Defense
              </span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2.5">
              Environmental Sensing & Instant Protection
            </h3>
            <p className="text-sm text-slate-300/90 leading-relaxed">
              KeepSafe continuously parses atmospheric conditions. When rain, high wind, or freezing cold is detected, it automatically locks exterior doors, closes roof skylights, and adjusts HVAC zones before drafts enter.
            </p>
          </div>

          {/* Concrete Micro Telemetry Preview inside Card */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Rainfall Sensor</span>
              <span className="text-xs font-semibold text-slate-200 mt-1 block">Auto-Seal Ready</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Monitored Zones</span>
              <span className="text-xs font-semibold text-slate-200 mt-1 block">9 Active Rooms</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Response Latency</span>
              <span className="text-xs font-semibold text-sky-400 mt-1 block">&lt; 200 ms</span>
            </div>
          </div>
        </motion.div>

        {/* Stacked Complementary Column with varied styles */}
        <div className="md:col-span-5 flex flex-col gap-5 justify-between">
          {/* Energy Conservation: Subtle lighter tone, rounded-xl, circular icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-5 sm:p-6 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 transition-colors flex-1 flex flex-col justify-center"
          >
            <div className="flex items-center gap-3.5 mb-2.5">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-300 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-slate-100">
                Energy Conservation
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-0.5">
              Provides proactive power-saving guidance before running high-draw thermal systems, balancing comfort with conservation.
            </p>
          </motion.div>

          {/* Voice & Persistent Automation Rules: Recessed dark tone, rounded-3xl, square icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="p-6 sm:p-7 rounded-3xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors flex-1 flex flex-col justify-center"
          >
            <div className="flex items-center gap-3.5 mb-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-300 shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-slate-100">
                Voice & Saved Rules
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-0.5">
              Issue natural spoken instructions or set persistent rules like <span className="text-slate-200 font-medium">&ldquo;Close windows when it rains&rdquo;</span> that persist and run automatically.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

