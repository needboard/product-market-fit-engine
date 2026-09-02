'use client';

import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_COPY } from '@/lib/config/copy';
import SignalMeter from '@/components/SignalMeter';
import type { Cluster } from './types';

export default function IntakeHero({ trending }: { trending: Cluster[] }) {
  return (
    <motion.div
      className="lg:col-span-5 lg:sticky lg:top-28 text-center lg:text-left space-y-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="flex flex-col items-center lg:items-start gap-3">
        <div className="p-2 bg-accent/10 rounded-xl inline-flex"><Plus className="h-5 w-5 text-accent" /></div>
        <span className="text-xs tracking-[0.15em] uppercase font-semibold text-accent">
          {APP_COPY.home.badge}
        </span>
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold tracking-tight leading-tight py-1 text-ink select-none">
        {APP_COPY.home.heroTitle}
      </h1>
      <p className="mx-auto lg:mx-0 max-w-md text-ink-muted text-sm sm:text-base leading-relaxed">
        {APP_COPY.home.heroSubtitle}
      </p>

      {/* Live proof-of-life: the current highest-signal problem, not decoration */}
      {trending.length > 0 && (
        <div className="hidden lg:block pt-5 border-t border-border max-w-md">
          <span className="text-xs uppercase tracking-wider text-ink-muted font-medium">
            Live signal right now
          </span>
          <div className="mt-3 flex items-center gap-3">
            <SignalMeter
              value={trending[0].memberCount}
              max={Math.max(...trending.map((c) => c.memberCount), 10)}
              size="sm"
              label={`${trending[0].memberCount}`}
            />
            <span className="text-xs text-ink-muted italic truncate">
              &quot;{trending[0].canonicalText}&quot;
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
