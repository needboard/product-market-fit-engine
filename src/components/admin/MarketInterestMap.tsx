'use client';

import { TrendingUp } from 'lucide-react';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';
import SignalMeter from '@/components/SignalMeter';

export default function MarketInterestMap({ categoryPopularity }: { categoryPopularity: Record<string, number> }) {
  const entries = Object.entries(categoryPopularity).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...Object.values(categoryPopularity), 1);

  return (
    <Panel accent="coral" className="p-6 space-y-6">
      <div>
        <SectionBadge icon={TrendingUp} index="03" label="Market Vertical Interest Map" accent="teal" />
        <p className="text-ink-muted text-xs font-mono uppercase tracking-wider mt-2">
          NICHES RANKED BY NUMBER OF TOTAL CUSTOMER REPORTS AND COMPLAINTS
        </p>
      </div>

      <div className="space-y-4 pt-4 border-t border-[color:var(--raw-border-subtle)]">
        {entries.length > 0 ? (
          entries.map(([category, count]) => (
            <div key={category} className="flex items-center justify-between gap-4 text-xs">
              <span className="text-ink-muted font-mono text-[10px] tracking-wide font-semibold truncate">{category}</span>
              <SignalMeter value={count} max={maxCount} size="sm" label={`${count} reports`} />
            </div>
          ))
        ) : (
          <div className="text-center font-mono text-[10px] text-ink-muted py-6">
            No market data recorded yet.
          </div>
        )}
      </div>
    </Panel>
  );
}
