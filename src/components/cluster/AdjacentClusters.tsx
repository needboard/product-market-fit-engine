'use client';

import { APP_COPY } from '@/lib/config/copy';
import Panel from '@/components/ui/Panel';
import SignalMeter from '@/components/SignalMeter';
import type { Cluster } from './types';

export default function AdjacentClusters({ adjacent }: { adjacent: Cluster[] }) {
  if (adjacent.length === 0) return null;

  const maxSignal = Math.max(...adjacent.map((c) => c.memberCount), 10);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-serif font-semibold text-ink">
        {APP_COPY.clusterDetail.adjacentTitle}
      </h3>
      <p className="text-ink-muted text-sm mb-2">
        {APP_COPY.clusterDetail.adjacentSubtitle}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adjacent.map((adj) => (
          <Panel key={adj.id} href={`/cluster/${adj.id}`} accent="coral" className="p-5 status-stripe-matched">
            <div className="flex items-center justify-between text-xs text-ink-muted uppercase tracking-wide mb-2">
              <span>{adj.categoryLabel}</span>
              <SignalMeter value={adj.memberCount} max={maxSignal} size="sm" label={`${adj.memberCount}`} />
            </div>
            <p className="text-ink-muted text-sm font-medium line-clamp-2">
              &quot;{adj.canonicalText}&quot;
            </p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
