'use client';

import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { HOMEPAGE_COPY } from '@/lib/config/homepage_copy';
import { PageScanner } from '@/components/Loader';
import Panel from '@/components/ui/Panel';
import SignalMeter from '@/components/SignalMeter';
import type { Cluster } from './types';

export default function ActiveSignalsSection({ trending, loadingNiches }: { trending: Cluster[]; loadingNiches: boolean }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-6xl space-y-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold">
            {HOMEPAGE_COPY.activeSignals.title}
          </h2>
          <p className="text-ink-muted text-sm font-sans mt-1">
            {HOMEPAGE_COPY.activeSignals.subtitle}
          </p>
        </div>
        <Link
          href="/browse"
          className="text-xs font-medium text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors group cursor-pointer"
        >
          {HOMEPAGE_COPY.activeSignals.ctaText} <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {trending.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trending.map((cluster) => (
            <Panel
              key={cluster.id}
              href={`/cluster/${cluster.id}`}
              accent="amber"
              className="p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-accent font-medium">{cluster.categoryLabel}</span>
                  <SignalMeter
                    value={cluster.memberCount}
                    max={Math.max(...trending.map((c) => c.memberCount), 10)}
                    size="sm"
                    label={`${cluster.memberCount} signals`}
                  />
                </div>
                <p className="text-ink font-medium text-base leading-relaxed">
                  &quot;{cluster.canonicalText}&quot;
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-ink-muted">
                  {cluster.sampleVariants.length} variations reported
                </span>
                <span className="text-xs text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Inspect <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </Panel>
          ))}
        </div>
      ) : loadingNiches ? (
        <PageScanner message="Scanning database signals..." size="md" />
      ) : (
        <div className="text-center py-16 rounded-xl border border-dashed border-border text-ink-muted text-sm">
          Nobody's reported a problem yet — yours could be the first thing builders see.
        </div>
      )}
    </motion.section>
  );
}
