'use client';

import { Activity, Database, DollarSign, Users } from 'lucide-react';
import Panel from '@/components/ui/Panel';
import SignalMeter from '@/components/SignalMeter';
import type { AdminStats } from './types';

export default function StatsOverview({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Panel accent="coral" className="p-6 overflow-hidden">
        <div className="absolute top-4 right-4 p-2 bg-signal-amber/10 rounded-xl text-signal-amber">
          <Database className="h-5 w-5" />
        </div>
        <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wider font-bold">Active Problem Groups</p>
        <h3 className="mt-2 text-3xl font-display font-bold text-ink">{stats.totalClustersCount}</h3>
        <p className="text-xs text-ink-muted mt-2">Unique centroids in Pinecone</p>
      </Panel>

      <Panel accent="coral" className="p-6 overflow-hidden">
        <div className="absolute top-4 right-4 p-2 bg-teal-500/10 rounded-xl text-signal-teal">
          <Activity className="h-5 w-5" />
        </div>
        <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wider font-bold">Product Solutions Launched</p>
        <h3 className="mt-2 text-3xl font-display font-bold text-ink">{stats.totalSolutionsCount}</h3>
        <p className="text-xs text-ink-muted mt-2">Active products validated by upvotes</p>
        <div className="mt-3">
          <SignalMeter
            value={stats.totalSolutionsCount}
            max={Math.max(stats.totalClustersCount, 1)}
            solved={1}
            size="sm"
            label="Demand answered"
          />
        </div>
      </Panel>

      <Panel accent="coral" className="p-6 overflow-hidden">
        <div className="absolute top-4 right-4 p-2 bg-blue-500/10 rounded-xl text-blue-400">
          <Users className="h-5 w-5" />
        </div>
        <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wider font-bold">Vetting Reviews Submitted</p>
        <h3 className="mt-2 text-3xl font-display font-bold text-ink">{stats.totalReviewsCount}</h3>
        <p className="text-xs text-ink-muted mt-2">Relational feedback stored in MongoDB</p>
      </Panel>

      <Panel accent="coral" className="p-6 overflow-hidden bg-gradient-to-r from-red-500/5 to-transparent">
        <div className="absolute top-4 right-4 p-2 bg-red-500/10 rounded-xl text-red-500">
          <DollarSign className="h-5 w-5" />
        </div>
        <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wider font-bold">Estimated AI API Spend</p>
        <h3 className="mt-2 text-3xl font-display font-bold text-red-400">${stats.totalCostEstimated.toFixed(4)}</h3>
        <p className="text-xs text-ink-muted mt-2">{stats.totalTransactions} Total Vector / LLM requests</p>
      </Panel>
    </div>
  );
}
