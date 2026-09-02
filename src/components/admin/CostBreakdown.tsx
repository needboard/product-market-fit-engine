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
          <div className="flex items-center gap-2">
            <SectionBadge icon={BarChart3} index="01" label="AI API Transaction Frequency" accent="coral" />
          </div>
          <p className="text-ink-muted text-xs font-mono uppercase tracking-wider mt-2">
            DISTRIBUTION OF PIPELINE ACTIONS BY TRANSACTION VOLUME
          </p>
        </div>

        <div className="space-y-4">
          <div className="h-4 w-full bg-bg-void rounded-full overflow-hidden flex">
            <div style={{ width: `${subRatio}%` }} className="h-full bg-gradient-to-r from-amber-500 to-amber-600" title={`Submissions: ${stats.countsByType.submission} requests`} />
            <div style={{ width: `${searchRatio}%` }} className="h-full bg-gradient-to-r from-teal-400 to-teal-500" title={`Searches: ${stats.countsByType.search} requests`} />
            <div style={{ width: `${metooRatio}%` }} className="h-full bg-gradient-to-r from-red-400 to-red-500" title={`Co-signs: ${stats.countsByType['me-too']} requests`} />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono select-none">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                <span className="text-ink-muted uppercase text-[9px] font-bold">Submissions</span>
              </div>
              <p className="text-ink font-semibold text-xs">${stats.costsByType.submission.toFixed(4)}</p>
              <p className="text-[9px] text-ink-muted">{stats.countsByType.submission} reqs ({subRatio.toFixed(0)}%)</p>
            </div>

            <div className="space-y-1 text-center border-x border-[color:var(--raw-border-subtle)] px-2">
              <div className="flex items-center gap-1.5 justify-center">
                <span className="w-2.5 h-2.5 bg-teal-400 rounded-full" />
                <span className="text-ink-muted uppercase text-[9px] font-bold">Searches</span>
              </div>
              <p className="text-ink font-semibold text-xs">${stats.costsByType.search.toFixed(6)}</p>
              <p className="text-[9px] text-ink-muted">{stats.countsByType.search} reqs ({searchRatio.toFixed(0)}%)</p>
            </div>

            <div className="space-y-1 text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                <span className="text-ink-muted uppercase text-[9px] font-bold">Co-signs</span>
              </div>
              <p className="text-ink font-semibold text-xs">${stats.costsByType['me-too'].toFixed(6)}</p>
              <p className="text-[9px] text-ink-muted">{stats.countsByType['me-too']} reqs ({metooRatio.toFixed(0)}%)</p>
            </div>
          </div>
        </div>
      </Panel>

      {/* Section: Tokens & Problem Sizing */}
      <Panel accent="coral" className="p-6 space-y-6">
        <div>
          <SectionBadge icon={FileText} index="02" label="Input Payload & Token Statistics" accent="amber" />
          <p className="text-ink-muted text-xs font-mono uppercase tracking-wider mt-2">
            RAW USER DESCRIPTION SIZES TO ASSESS MAX CHARACTER BOUNDARIES
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono border-t border-[color:var(--raw-border-subtle)] pt-6 text-center">
          <div>
            <span className="text-ink-muted text-[9px] uppercase tracking-widest block font-bold">Avg Character Count</span>
            <span className="text-2xl font-bold text-ink block mt-1">{stats.avgProblemCharCount}</span>
            <span className="text-[8px] text-ink-muted lowercase mt-1 block">chars per problem</span>
          </div>

          <div className="border-y sm:border-y-0 sm:border-x border-[color:var(--raw-border-subtle)] py-4 sm:py-0">
            <span className="text-ink-muted text-[9px] uppercase tracking-widest block font-bold">Avg Word Count</span>
            <span className="text-2xl font-bold text-ink block mt-1">{stats.avgProblemWordCount}</span>
            <span className="text-[8px] text-ink-muted lowercase mt-1 block">words per problem</span>
          </div>

          <div>
            <span className="text-ink-muted text-[9px] uppercase tracking-widest block font-bold">Estimated Tokens</span>
            <span className="text-2xl font-bold text-ink block mt-1">{stats.avgProblemTokenCount}</span>
            <span className="text-[8px] text-ink-muted lowercase mt-1 block">tokens per input</span>
          </div>
        </div>

        <div className="p-4 bg-bg-void/40 border border-[color:var(--raw-border-subtle)] font-mono text-[9px] text-ink-muted leading-normal uppercase">
          💡 <strong className="text-ink">Strategic insight:</strong> Your character limit is set to <strong className="text-ink">500</strong>.
          With an average input size of <strong className="text-ink">{stats.avgProblemCharCount} characters</strong>, users are utilizing <strong className="text-ink">{((stats.avgProblemCharCount / 500) * 100).toFixed(0)}%</strong> of their space. Your limits are perfectly sized for semantic clarity without token waste.
        </div>
      </Panel>
    </div>
  );
}
