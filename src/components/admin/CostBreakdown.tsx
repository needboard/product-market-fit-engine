'use client';

import { BarChart3, FileText } from 'lucide-react';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';
import type { AdminStats } from './types';

export default function CostBreakdown({ stats }: { stats: AdminStats }) {
  const totalCount = stats.totalTransactions || 1;
  const subRatio = ((stats.countsByType.submission || 0) / totalCount) * 100;
  const searchRatio = ((stats.countsByType.search || 0) / totalCount) * 100;
  const metooRatio = ((stats.countsByType['me-too'] || 0) / totalCount) * 100;

  return (
    <div className="space-y-8">
      {/* Section: AI Cost Allocations */}
      <Panel accent="coral" className="p-6 space-y-6">
        <div>
          <SectionBadge icon={BarChart3} index="01" label="AI API Transaction Frequency" accent="amber" />
          <p className="text-ink-muted text-xs mt-2">
            Distribution of pipeline actions by transaction volume
          </p>
        </div>

        <div className="space-y-4">
          <div className="h-3 w-full bg-ink/10 rounded-full overflow-hidden flex">
            <div style={{ width: `${subRatio}%` }} className="h-full bg-accent" title={`Submissions: ${stats.countsByType.submission} requests`} />
            <div style={{ width: `${searchRatio}%` }} className="h-full bg-status-matched" title={`Searches: ${stats.countsByType.search} requests`} />
            <div style={{ width: `${metooRatio}%` }} className="h-full bg-danger" title={`Co-signs: ${stats.countsByType['me-too']} requests`} />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs select-none">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-accent rounded-full" />
                <span className="text-ink-muted uppercase text-[10px] font-semibold">Submissions</span>
              </div>
              <p className="text-ink font-semibold text-xs font-mono tabular-nums">${stats.costsByType.submission.toFixed(4)}</p>
              <p className="text-[10px] text-ink-muted">{stats.countsByType.submission} reqs ({subRatio.toFixed(0)}%)</p>
            </div>

            <div className="space-y-1 text-center border-x border-border px-2">
              <div className="flex items-center gap-1.5 justify-center">
                <span className="w-2.5 h-2.5 bg-status-matched rounded-full" />
                <span className="text-ink-muted uppercase text-[10px] font-semibold">Searches</span>
              </div>
              <p className="text-ink font-semibold text-xs font-mono tabular-nums">${stats.costsByType.search.toFixed(6)}</p>
              <p className="text-[10px] text-ink-muted">{stats.countsByType.search} reqs ({searchRatio.toFixed(0)}%)</p>
            </div>

            <div className="space-y-1 text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="w-2.5 h-2.5 bg-danger rounded-full" />
                <span className="text-ink-muted uppercase text-[10px] font-semibold">Co-signs</span>
              </div>
              <p className="text-ink font-semibold text-xs font-mono tabular-nums">${stats.costsByType['me-too'].toFixed(6)}</p>
              <p className="text-[10px] text-ink-muted">{stats.countsByType['me-too']} reqs ({metooRatio.toFixed(0)}%)</p>
            </div>
          </div>
        </div>
      </Panel>

      {/* Section: Tokens & Problem Sizing */}
      <Panel accent="coral" className="p-6 space-y-6">
        <div>
          <SectionBadge icon={FileText} index="02" label="Input Payload & Token Statistics" accent="amber" />
          <p className="text-ink-muted text-xs mt-2">
            Raw user description sizes to assess max character boundaries
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-border pt-6 text-center">
          <div>
            <span className="text-ink-muted text-[10px] uppercase tracking-wider block font-semibold">Avg Character Count</span>
            <span className="text-2xl font-bold text-ink block mt-1 tabular-nums">{stats.avgProblemCharCount}</span>
            <span className="text-xs text-ink-muted mt-1 block">chars per problem</span>
          </div>

          <div className="border-y sm:border-y-0 sm:border-x border-border py-4 sm:py-0">
            <span className="text-ink-muted text-[10px] uppercase tracking-wider block font-semibold">Avg Word Count</span>
            <span className="text-2xl font-bold text-ink block mt-1 tabular-nums">{stats.avgProblemWordCount}</span>
            <span className="text-xs text-ink-muted mt-1 block">words per problem</span>
          </div>

          <div>
            <span className="text-ink-muted text-[10px] uppercase tracking-wider block font-semibold">Estimated Tokens</span>
            <span className="text-2xl font-bold text-ink block mt-1 tabular-nums">{stats.avgProblemTokenCount}</span>
            <span className="text-xs text-ink-muted mt-1 block">tokens per input</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-ink/5 border border-border text-xs text-ink-muted leading-relaxed">
          <strong className="text-ink">Strategic insight:</strong> Your character limit is set to <strong className="text-ink">500</strong>.
          With an average input size of <strong className="text-ink">{stats.avgProblemCharCount} characters</strong>, users are utilizing <strong className="text-ink">{((stats.avgProblemCharCount / 500) * 100).toFixed(0)}%</strong> of their space. Your limits are perfectly sized for semantic clarity without token waste.
        </div>
      </Panel>
    </div>
  );
}
