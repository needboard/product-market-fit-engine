'use client';

import Link from 'next/link';
import { ArrowRight, ChevronRight, TrendingUp } from 'lucide-react';
import { APP_COPY } from '@/lib/config/copy';
import { PageScanner } from '@/components/Loader';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';
import SignalMeter from '@/components/SignalMeter';
import type { Cluster } from './types';

export default function TrendingGrid({ trending, trendingLoading }: { trending: Cluster[]; trendingLoading: boolean }) {
  return (
    <div className="w-full max-w-6xl mt-12 border-t border-border pt-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <SectionBadge icon={TrendingUp} index="01" label="Trending signals" accent="amber" className="mb-2" />
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold">
            {APP_COPY.home.trendingTitle}
          </h2>
          <p className="text-ink-muted text-xs sm:text-sm mt-1">
            {APP_COPY.home.trendingSubtitle}
          </p>
        </div>
        <Link
          href="/browse"
          className="mt-4 sm:mt-0 text-xs tracking-wide uppercase font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5 cursor-pointer group"
        >
          {APP_COPY.home.browseAllLink} <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {trending.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trending.map((cluster) => (
            <Panel
              key={cluster.id}
              href={`/cluster/${cluster.id}`}
              accent="amber"
              className="group p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs tracking-wide uppercase text-accent font-semibold">{cluster.categoryLabel}</span>
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
                <span className="text-xs text-ink-muted uppercase tracking-wide">
                  {cluster.sampleVariants.length} {APP_COPY.home.distinctPhrasingsSuffix}
                </span>
                <span className="text-xs text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {APP_COPY.home.inspectLink} <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </Panel>
          ))}
        </div>
      ) : trendingLoading ? (
        <PageScanner message="Scanning database signals..." size="md" />
      ) : (
        <div className="text-center py-12 rounded-xl border border-dashed border-border text-ink-muted text-xs uppercase tracking-wide">
          No reports yet in this space. Be the first voice — every early report gets full visibility once builders start browsing.
        </div>
      )}
    </div>
  );
}
