'use client';

import Link from 'next/link';
import { ArrowRight, Layers, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { HOMEPAGE_COPY } from '@/lib/config/homepage_copy';
import SignalMeter from '@/components/SignalMeter';
import type { Cluster } from './types';

export default function Hero({ trending }: { trending: Cluster[] }) {
  return (
    <section className="w-full max-w-6xl text-center pt-12 md:pt-16 flex flex-col items-center justify-center relative">
      <motion.div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-signal-amber/30 bg-signal-amber/5 font-mono text-[9px] text-signal-amber font-bold uppercase tracking-[0.2em] mb-6 select-none shadow-[0_0_25px_rgba(245,166,35,0.25)]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} /> {HOMEPAGE_COPY.hero.badge}
      </motion.div>

      <motion.h1
        className="text-3xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight leading-tight py-2 bg-gradient-to-r from-ink via-ink/85 to-ink/55 bg-clip-text text-transparent max-w-4xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        {HOMEPAGE_COPY.hero.title}
      </motion.h1>

      <motion.p
        className="mt-6 text-sm sm:text-base md:text-lg text-ink-muted max-w-2xl font-sans leading-relaxed"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {HOMEPAGE_COPY.hero.subtitle}
      </motion.p>

      <motion.div
        className="mt-10 flex flex-row items-center justify-center gap-4 w-full flex-wrap"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Link
          href="/submit"
          className="h-12 px-6 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider font-bold bg-gradient-to-r from-signal-amber to-signal-coral text-slate-950 rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-[0_0_30px_rgba(245,166,35,0.35)] cursor-pointer"
        >
          <Layers className="h-4 w-4" /> {HOMEPAGE_COPY.hero.ctaValidate}
        </Link>
        <Link
          href="/browse"
          className="h-12 px-6 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider font-bold bg-white/5 border border-white/10 text-ink rounded-xl hover:bg-white/10 hover:border-white/15 active:scale-95 transition-all cursor-pointer"
        >
          {HOMEPAGE_COPY.hero.ctaExplore} <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {/* Live Signal Ticker — real cluster data, not decoration */}
      {trending.length > 0 && (
        <motion.div
          className="mt-14 w-full max-w-3xl border border-[color:var(--raw-border-subtle)] bg-bg-panel/50 backdrop-blur-2xl px-5 py-4 hud-corners"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink-muted font-bold">
              Live Signal — active clusters right now
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-signal-teal font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-teal animate-pulse" /> Streaming
            </span>
          </div>
          <div className="flex flex-col divide-y divide-white/5">
            {trending.slice(0, 3).map((cluster) => (
              <Link
                key={cluster.id}
                href={`/cluster/${cluster.id}`}
                className="flex items-center justify-between gap-4 py-2.5 group text-left"
              >
                <SignalMeter
                  value={cluster.memberCount}
                  max={Math.max(...trending.map((c) => c.memberCount), 10)}
                  size="sm"
                />
                <span className="flex-1 truncate text-xs text-ink-muted group-hover:text-ink transition-colors text-left">
                  &quot;{cluster.canonicalText}&quot;
                </span>
                <span className="shrink-0 font-mono text-[10px] text-ink-muted">{cluster.memberCount} sigs</span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
