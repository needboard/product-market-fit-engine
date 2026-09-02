'use client';

import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_COPY } from '@/lib/config/copy';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';
import SignalMeter from '@/components/SignalMeter';
import type { Cluster } from './types';

export default function CanonicalBlock({ cluster }: { cluster: Cluster }) {
  return (
    <Panel accent="coral" className="p-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between gap-4 mb-4">
        <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-signal-amber select-none">
          {cluster.categoryLabel}
        </span>
        <SectionBadge
          icon={Users}
          index="00"
          label={`${APP_COPY.clusterDetail.matchHeader} (${cluster.memberCount} Reports)`}
          accent="coral"
        />
      </div>

      <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink italic leading-relaxed pr-6">
        &quot;{cluster.canonicalText}&quot;
      </h1>

      <SignalMeter
        value={cluster.memberCount}
        solved={cluster.solutions?.length || 0}
        size="sm"
        label={`${cluster.memberCount} Reports · Signal Strength`}
        className="mt-4"
      />

      {/* Ticket-stub tear line: this is the "problem ticket" itself, evidence is what's attached */}
      <div className="mt-8 ticket-perforation" />
      <div className="pt-8">
        <span className="font-mono text-[10px] text-ink-muted uppercase tracking-widest block mb-4 font-bold">
          {APP_COPY.clusterDetail.evidenceSubtitle}
        </span>
        <ul className="space-y-4">
          {cluster.sampleVariants.map((variant, i) => (
            <motion.li
              key={i}
              className="p-4 bg-bg-void/40 border border-[color:var(--raw-border-subtle)] text-sm text-ink-muted italic leading-relaxed hover:border-white/10 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              • &quot;{variant}&quot;
            </motion.li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
