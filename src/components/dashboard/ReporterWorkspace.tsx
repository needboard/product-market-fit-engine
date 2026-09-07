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
      <Panel accent="amber" className="p-6 space-y-5">
        <div>
          <div className="border-b border-border pb-3">
            <SectionBadge icon={FileText} index="03" label={`My Reported Complaints (${reporterProblems.length})`} accent="amber" />
          </div>
          <p className="text-xs text-ink-muted mt-2">
            The exact phrasings and developer complaints you have historically logged to the problem-market fit ledger.
          </p>
        </div>

        {reporterProblems.length > 0 ? (
          <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
            {reporterProblems.map((prob) => (
              <div key={prob.id} className="status-stripe-open p-4 bg-ink/5 rounded-lg border border-border relative group flex flex-col justify-between">
                <div className="absolute top-3 right-4 font-mono text-[10px] text-ink-muted">
                  {new Date(prob.createdAt).toLocaleDateString()}
                </div>
                <div className="text-[11px] text-accent font-semibold mb-1">
                  Niche Key: {prob.category}
                </div>
                <p className="text-sm text-ink italic pr-12 leading-relaxed">
                  &quot;{prob.rawText}&quot;
                </p>
                <div className="mt-3.5 pt-2 border-t border-border flex items-center justify-between">
                  <span className="font-mono text-[10px] text-ink-muted">Problem Key: {prob.id}</span>
                  <Link
                    href={`/cluster/${prob.clusterId}`}
                    className="text-xs font-medium text-accent hover:opacity-80 flex items-center gap-1 transition-colors group-hover:translate-x-0.5 duration-300"
                  >
                    View Problem <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg border border-dashed border-border text-ink-muted text-sm">
            You haven&apos;t reported any frustrations yet.
          </div>
        )}
      </Panel>

      {/* Panel 2: Niches supported ("Me too" list) */}
      <Panel accent="amber" className="p-6 space-y-5">
        <div>
          <div className="border-b border-border pb-3">
            <SectionBadge icon={Users} index="04" label={`Niches I Support (Me Too co-signs: ${supportedClusters.length})`} accent="amber" />
          </div>
          <p className="text-xs text-ink-muted mt-2">
            Active opportunities where you supported the demand. When builders list verified solutions to these groups, you will receive launch notifications.
          </p>
        </div>

        {supportedClusters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportedClusters.map((cluster) => (
              <Link
                key={cluster.id}
                href={`/cluster/${cluster.id}`}
                className="status-stripe-open p-5 bg-ink/5 rounded-lg border border-border hover:border-accent/30 group transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-accent font-semibold">{cluster.categoryLabel}</span>
                    <SignalMeter value={cluster.memberCount} max={Math.max(cluster.memberCount, 20)} size="sm" label={`${cluster.memberCount} signals`} />
                  </div>
                  <p className="text-ink font-medium text-sm leading-relaxed group-hover:opacity-90 transition-opacity line-clamp-2">
                    &quot;{cluster.canonicalText}&quot;
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-ink-muted">
                    {cluster.variantCount ?? 0} variations reported
                  </span>
                  <span className="text-xs font-medium text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Inspect <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg border border-dashed border-border text-ink-muted text-sm">
            You haven&apos;t co-signed any niches yet.
          </div>
        )}
      </Panel>
    </motion.div>
  );
}
