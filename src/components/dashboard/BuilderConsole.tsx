'use client';

import Link from 'next/link';
import { ArrowUp, BookOpen, ChevronRight, Globe, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';
import type { SolutionRecord, ReviewRecord } from './types';

interface BuilderConsoleProps {
  builderSolutions: SolutionRecord[];
  builderReviews: ReviewRecord[];
}

export default function BuilderConsole({ builderSolutions, builderReviews }: BuilderConsoleProps) {
  return (
    <motion.div
      key="builder-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Panel 1: My listed solutions */}
      <Panel accent="teal" className="p-6 space-y-5 shadow-xl">
        <div>
          <div className="border-b border-[color:var(--raw-border-subtle)] pb-3">
            <SectionBadge icon={BookOpen} index="05" label={`My Listed Solutions (${builderSolutions.length})`} accent="teal" />
          </div>
          <p className="text-[10px] text-ink-muted font-sans mt-2">
            Your verified products currently listed under crowdsourced demand niches. Click solutions to inspect ratings, reviews, and client logs.
          </p>
        </div>

        {builderSolutions.length > 0 ? (
          <div className="space-y-3.5 pr-1">
            {builderSolutions.map((sol) => (
              <div key={sol.id} className="p-5 bg-bg-void/60 border border-[color:var(--raw-border-subtle)] hover:border-white/10 relative group flex flex-col md:flex-row gap-5 items-stretch justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center px-4 py-2 bg-bg-panel border border-[color:var(--raw-border-subtle)] min-w-[70px] shrink-0 self-start text-center font-mono">
                    <ArrowUp className="h-4 w-4 text-signal-teal mb-0.5" />
                    <strong className="text-sm font-bold text-ink">+{sol.upvotes}</strong>
                    <span className="text-[8px] text-ink-muted uppercase tracking-widest font-bold mt-0.5">NET SCORE</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-ink">{sol.name}</h4>
                      <span className="text-[8px] font-mono text-signal-teal uppercase bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/10">verified</span>
                    </div>
                    <p className="text-[11px] text-ink-muted leading-relaxed font-sans max-w-lg">{sol.description}</p>

                    <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9px] text-ink-muted">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 text-ink-muted" /> {sol.reviewsCount} Reviews ({sol.averageRating} / 5.0 Rating)
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5 text-ink-muted" /> <a href={sol.url} target="_blank" rel="noopener noreferrer" className="text-signal-teal hover:text-teal-300 underline">{sol.url.replace(/^https?:\/\//, '')}</a>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-[color:var(--raw-border-subtle)] pt-4 md:pt-0 md:pl-5 flex items-center md:justify-end shrink-0">
                  <Link
                    href={`/cluster/${sol.clusterId}`}
                    className="w-full md:w-auto h-9 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Inspect Niche <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-[color:var(--raw-border-subtle)] text-ink-muted font-mono text-xs uppercase tracking-widest">
            You haven't listed any software or hardware product solutions yet.
          </div>
        )}
      </Panel>

      {/* Panel 2: Live Community Review Feed */}
      <Panel accent="teal" className="p-6 space-y-5 shadow-xl">
        <div>
          <div className="border-b border-[color:var(--raw-border-subtle)] pb-3">
            <SectionBadge icon={MessageSquare} index="06" label={`Live Community Review Feed (${builderReviews.length})`} accent="teal" />
          </div>
          <p className="text-[10px] text-ink-muted font-sans mt-2">
            Star ratings and written developer feedback submitted historically for any of your listed products.
          </p>
        </div>

        {builderReviews.length > 0 ? (
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {builderReviews.map((rev, idx) => (
              <div key={idx} className="p-4 bg-bg-void/60 border border-[color:var(--raw-border-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-[10px] font-mono text-ink-muted">
                      {rev.userName.substring(0, 1).toUpperCase()}
                    </div>
                    <strong className="text-xs text-ink-muted">{rev.userName}</strong>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-signal-amber font-mono text-[9px] rounded font-bold uppercase tracking-wider">
                    ★ {rev.rating}.0 Rating
                  </div>
                </div>

                <p className="text-[11px] text-ink-muted font-sans leading-relaxed italic pr-6 pl-8">
                  &quot;{rev.text}&quot;
                </p>

                <div className="text-right text-[8px] font-mono text-ink-muted pl-8 pt-1">
                  Submitted on {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-[color:var(--raw-border-subtle)] text-ink-muted font-mono text-xs uppercase tracking-widest">
            No customer reviews have been submitted for your solutions yet.
          </div>
        )}
      </Panel>
    </motion.div>
  );
}
