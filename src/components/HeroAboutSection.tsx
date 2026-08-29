import { motion } from 'motion/react';
import { CloudRain, Zap, Mic, ShieldAlert, Cpu } from 'lucide-react';

export function HeroAboutSection() {
  return (
    <section id="hero-about-section" className="w-full pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative z-10">
      {/* Primary single system badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 mb-8"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span className="text-[11px] font-mono tracking-wider text-slate-300 uppercase">
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
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 font-normal">
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

      {/* Asymmetric Bento Showcase: 1 Primary Featured Anchor Card + 2 Stacked Lateral Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left w-full max-w-5xl mx-auto">
        {/* Primary Large Anchor Card: Environmental Sensing & Weather Bridge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="md:col-span-7 p-7 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <CloudRain className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-sky-400/90">Autonomous Defense</span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              Environmental Sensing & Instant Protection
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              KeepSafe continuously parses atmospheric conditions. When rain, high wind, or freezing cold is detected, it automatically locks exterior doors, closes roof skylights, and adjusts HVAC zones before drafts enter.
            </p>
          </div>

          {/* Concrete Micro Telemetry Preview inside Card */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-3 gap-3">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <span className="text-[10px] font-mono text-slate-400 block">Rainfall Sensor</span>
              <span className="text-xs font-mono font-bold text-slate-200 mt-0.5 block">Auto-Seal Ready</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <span className="text-[10px] font-mono text-slate-400 block">Monitored Zones</span>
              <span className="text-xs font-mono font-bold text-slate-200 mt-0.5 block">9 Active Rooms</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <span className="text-[10px] font-mono text-slate-400 block">Response Latency</span>
              <span className="text-xs font-mono font-bold text-amber-400 mt-0.5 block">&lt; 200 ms</span>
            </div>
          </div>
        </motion.div>

        {/* Stacked Complementary Column (5 cols on md) */}
        <div className="md:col-span-5 flex flex-col gap-5">
          {/* Energy Conservation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex-1 flex flex-col justify-center"
          >
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-slate-100">
                Energy Conservation
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Provides proactive power-saving guidance before running high-draw thermal systems, balancing comfort with conservation.
            </p>
          </motion.div>

          {/* Voice & Persistent Automation Rules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex-1 flex flex-col justify-center"
          >
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-slate-100">
                Voice & Saved Rules
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Issue natural spoken instructions or set persistent rules like <span className="text-slate-200">&ldquo;Close windows when it rains&rdquo;</span> that persist and run automatically.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

