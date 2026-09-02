'use client';

import { Activity, Database, DollarSign, Users } from 'lucide-react';
import Panel from '@/components/ui/Panel';
import SignalMeter from '@/components/SignalMeter';
import type { AdminStats } from './types';

export default function StatsOverview({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Panel accent="amber" className="p-6">
        <span className="inline-flex p-2 rounded-lg bg-accent/10 text-accent">
          <Database className="h-5 w-5" />
        </span>
        <p className="mt-4 text-xs text-ink-muted uppercase tracking-wider font-semibold">Active Problem Groups</p>
        <h3 className="mt-2 text-3xl font-bold text-ink tabular-nums">{stats.totalClustersCount}</h3>
        <p className="text-xs text-ink-muted mt-2">Unique centroids in Pinecone</p>
      </Panel>

      <Panel accent="teal" className="p-6">
        <span className="inline-flex p-2 rounded-lg bg-status-matched/10 text-status-matched">
          <Activity className="h-5 w-5" />
        </span>
        <p className="mt-4 text-xs text-ink-muted uppercase tracking-wider font-semibold">Product Solutions Launched</p>
        <h3 className="mt-2 text-3xl font-bold text-ink tabular-nums">{stats.totalSolutionsCount}</h3>
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

      <Panel accent="coral" className="p-6">
        <span className="inline-flex p-2 rounded-lg bg-status-solved/10 text-status-solved">
          <Users className="h-5 w-5" />
        </span>
        <p className="mt-4 text-xs text-ink-muted uppercase tracking-wider font-semibold">Vetting Reviews Submitted</p>
        <h3 className="mt-2 text-3xl font-bold text-ink tabular-nums">{stats.totalReviewsCount}</h3>
        <p className="text-xs text-ink-muted mt-2">Relational feedback stored in MongoDB</p>
      </Panel>

      <Panel accent="coral" className="p-6">
        <span className="inline-flex p-2 rounded-lg bg-danger/10 text-danger">
          <DollarSign className="h-5 w-5" />
        </span>
        <p className="mt-4 text-xs text-ink-muted uppercase tracking-wider font-semibold">Estimated AI API Spend</p>
        <h3 className="mt-2 text-3xl font-bold text-danger tabular-nums">${stats.totalCostEstimated.toFixed(4)}</h3>
        <p className="text-xs text-ink-muted mt-2">{stats.totalTransactions} Total Vector / LLM requests</p>
      </Panel>
    </div>
  );
}
