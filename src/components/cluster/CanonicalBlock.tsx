'use client';

import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_COPY } from '@/lib/config/copy';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';
import SignalMeter from '@/components/SignalMeter';
import type { Cluster } from './types';

export default function CanonicalBlock({ cluster }: { cluster: Cluster }) {
  const hasSolutions = (cluster.solutions?.length || 0) > 0;

  return (
    <Panel
      accent="coral"
      className={`p-8 ${hasSolutions ? 'status-stripe-solved' : 'status-stripe-open'}`}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <span className="text-xs tracking-wider uppercase font-semibold text-accent">
          {cluster.categoryLabel}
        </span>
        <SectionBadge
          icon={Users}
          index="00"
          label={`${APP_COPY.clusterDetail.matchHeader} (${cluster.memberCount} Reports)`}
          accent="coral"
        />
      </div>

      <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-ink leading-snug pr-6">
        &quot;{cluster.canonicalText}&quot;
      </h1>

      <SignalMeter
        value={cluster.memberCount}
        solved={cluster.solutions?.length || 0}
        size="sm"
        label={`${cluster.memberCount} Reports · Signal Strength`}
        className="mt-4"
      />

      <div className="mt-8 pt-8 border-t border-border">
        <span className="text-xs text-ink-muted uppercase tracking-wider block mb-4 font-semibold">
          {APP_COPY.clusterDetail.evidenceSubtitle}
        </span>
        <ul className="space-y-4">
          {cluster.sampleVariants.map((variant, i) => (
            <motion.li
              key={i}
              className="p-4 rounded-lg bg-ink/[0.03] border border-border text-sm text-ink-muted leading-relaxed"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              &quot;{variant}&quot;
            </motion.li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
