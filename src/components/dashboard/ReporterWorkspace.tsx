'use client';

import Link from 'next/link';
import { ChevronRight, FileText, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';
import SignalMeter from '@/components/SignalMeter';
import type { ProblemRecord, ClusterRecord } from './types';

interface ReporterWorkspaceProps {
  reporterProblems: ProblemRecord[];
  supportedClusters: ClusterRecord[];
}

export default function ReporterWorkspace({ reporterProblems, supportedClusters }: ReporterWorkspaceProps) {
  return (
    <motion.div
      key="reporter-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Panel 1: Reported Complaints history */}
      <Panel accent="amber" className="p-6 space-y-5 shadow-xl">
        <div>
          <div className="border-b border-[color:var(--raw-border-subtle)] pb-3">
            <SectionBadge icon={FileText} index="03" label={`My Reported Complaints (${reporterProblems.length})`} accent="amber" />
          </div>
          <p className="text-[10px] text-ink-muted font-sans mt-2">
            The exact phrasings and developer complaints you have historically logged to the problem-market fit ledger.
          </p>
        </div>

        {reporterProblems.length > 0 ? (
          <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
            {reporterProblems.map((prob) => (
              <div key={prob.id} className="p-4 bg-bg-void/60 border border-[color:var(--raw-border-subtle)] hover:border-white/10 relative group flex flex-col justify-between">
                <div className="absolute top-3 right-4 font-mono text-[9px] text-ink-muted">
                  {new Date(prob.createdAt).toLocaleDateString()}
                </div>
                <div className="font-mono text-[8px] text-signal-amber tracking-wider font-bold mb-1 uppercase">
                  Niche Key: {prob.category}
                </div>
                <p className="text-xs text-ink italic font-sans pr-12 leading-relaxed">
                  &quot;{prob.rawText}&quot;
                </p>
                <div className="mt-3.5 pt-2 border-t border-[color:var(--raw-border-subtle)] flex items-center justify-between">
                  <span className="font-mono text-[8px] text-ink-muted uppercase font-bold">Problem Key: {prob.id}</span>
                  <Link
                    href={`/cluster/${prob.clusterId}`}
                    className="font-mono text-[9px] text-signal-amber hover:opacity-80 flex items-center gap-1 transition-colors group-hover:translate-x-0.5 duration-300"
                  >
                    Inspect Niche Centroid <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-[color:var(--raw-border-subtle)] text-ink-muted font-mono text-xs uppercase tracking-widest">
            You haven't reported any frustrations yet.
          </div>
        )}
      </Panel>

      {/* Panel 2: Niches supported ("Me too" list) */}
      <Panel accent="amber" className="p-6 space-y-5 shadow-xl">
        <div>
          <div className="border-b border-[color:var(--raw-border-subtle)] pb-3">
            <SectionBadge icon={Users} index="04" label={`Niches I Support (Me Too co-signs: ${supportedClusters.length})`} accent="amber" />
          </div>
          <p className="text-[10px] text-ink-muted font-sans mt-2">
            Active opportunities where you supported the demand. When builders list verified solutions to these groups, you will receive launch notifications.
          </p>
        </div>

        {supportedClusters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportedClusters.map((cluster) => (
              <Link
                key={cluster.id}
                href={`/cluster/${cluster.id}`}
                className="p-5 bg-bg-void/60 border border-[color:var(--raw-border-subtle)] hover:border-teal-400/25 group transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[9px] tracking-widest uppercase mb-3">
                    <span className="text-signal-amber font-bold">{cluster.categoryLabel}</span>
                    <SignalMeter value={cluster.memberCount} max={Math.max(cluster.memberCount, 20)} size="sm" label={`${cluster.memberCount} signals`} />
                  </div>
                  <p className="text-ink font-medium text-xs leading-relaxed group-hover:opacity-90 transition-opacity line-clamp-2">
                    &quot;{cluster.canonicalText}&quot;
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[color:var(--raw-border-subtle)] flex items-center justify-between">
                  <span className="font-mono text-[8px] text-ink-muted uppercase tracking-widest">
                    {cluster.variantCount} variations reported
                  </span>
                  <span className="text-[9px] font-mono text-signal-amber flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Inspect <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-[color:var(--raw-border-subtle)] text-ink-muted font-mono text-xs uppercase tracking-widest">
            You haven't co-signed any niches yet.
          </div>
        )}
      </Panel>
    </motion.div>
  );
}
