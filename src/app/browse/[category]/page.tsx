'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers, ChevronRight, TrendingUp, Users, AlertTriangle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_COPY } from '@/lib/config/copy';
import { PageScanner } from '@/components/Loader';
import staticCategories from '@/lib/ai/static-categories';
import SignalMeter from '@/components/SignalMeter';

interface Cluster {
  id: string;
  category: string;
  categoryLabel: string;
  categoryDescription: string;
  canonicalText: string;
  memberCount: number;
  sampleVariants: string[];
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  let categoryDes;
  for (let i = 0 ; i < staticCategories.length ; i++) {
    if (staticCategories[i].id == category) {
      categoryDes = staticCategories[i].label
    }
  }
  const isComingSoon = staticCategories.some(c => c.id === category && c.status === 'coming-soon');
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (isComingSoon) {
      setLoading(false);
      return;
    }
    async function loadCategoryClusters() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/clusters?category=${category}`);
        if (!res.ok) {
          throw new Error('Failed to retrieve categories data.');
        }
        const data = await res.json();
        setClusters(data || []);
      } catch (err) {
        console.error('Failed to load category clusters:', err);
        setError('We are experiencing temporary database latency.');
      } finally {
        setLoading(false);
      }
    }
    loadCategoryClusters();
  }, [category, refreshTrigger, isComingSoon]);

  const activeCategory = clusters[0] || null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 font-mono text-xs text-ink-muted hover:text-ink transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {APP_COPY.browse.backLink}
        </Link>
      </div>

      {/* Header */}
      <div className="mb-12 border-b border-[color:var(--raw-border-subtle)] pb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-signal-amber/10 rounded-xl inline-flex"><Layers className="h-5 w-5 text-signal-amber" /></div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-signal-amber uppercase font-bold">
            00 // Market Segment
          </span>
        </div>
        <h1 className="mt-2 text-3xl sm:text-5xl font-display font-bold tracking-tight text-ink">
          {activeCategory?.categoryLabel || category.replace('-', ' ')}
        </h1>
        <p className="mt-3 max-w-3xl text-ink-muted text-sm sm:text-base leading-relaxed">
          {activeCategory?.categoryDescription || 'A collection of shared customer frustrations and product gaps.'}
        </p>
      </div>

      {/* Clusters List */}
      {isComingSoon ? (
        <div className="p-10 bg-bg-panel/40 shadow-xl glass-card hud-corners max-w-2xl select-none">
          <div className="p-2.5 bg-white/5 text-ink-muted inline-flex mb-4"><Lock className="h-5 w-5" /></div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink font-display">
            {categoryDes || category.replace('-', ' ')} — Coming Soon
          </h2>
          <p className="text-sm text-ink-muted mt-3 leading-relaxed">
            We're not collecting problems in this vertical yet. Right now NeedBoard is focused on
            Developer Tools &amp; DX and SaaS &amp; B2B Productivity — report the pain points you
            experience there, and this niche will light up when we expand.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 font-mono text-xs text-ink-muted hover:text-ink transition-colors group cursor-pointer mt-8"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {APP_COPY.browse.backLink}
          </Link>
        </div>
      ) : loading ? (
        <PageScanner message="Querying customer complaints..." />
      ) : error ? (
        <div className="text-center py-20 px-4 select-none animate-fade-in max-w-xl mx-auto">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4 animate-pulse" />
          <h2 className="text-xl font-bold font-sans text-ink">Error Loading Opportunities</h2>
          <p className="text-ink-muted text-xs mt-2 leading-relaxed">{error}</p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/browse"
              className="font-mono text-xs font-bold uppercase bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-[color:var(--raw-border-subtle)] text-ink cursor-pointer"
            >
              Return to Browse
            </Link>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                setRefreshTrigger(prev => prev + 1);
              }}
              className="font-mono text-xs font-bold uppercase bg-gradient-to-r from-brand-amber to-brand-coral text-slate-950 px-5 py-2.5 rounded-xl cursor-pointer"
            >
              Retry Load
            </button>
          </div>
        </div>
      ) : clusters.length > 0 ? (
        <div className="space-y-4">
          {(() => {
            const maxSignal = Math.max(...clusters.map((c) => c.memberCount), 10);
            return clusters.map((cluster, idx) => (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
              >
                <Link
                  href={`/cluster/${cluster.id}`}
                  className="group block p-6 bg-bg-panel/40 hover:bg-bg-panel/70 transition-all duration-300 shadow-xl glass-card hud-corners"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    {/* Signal amplitude */}
                    <div className="shrink-0">
                      <SignalMeter value={cluster.memberCount} max={maxSignal} size="md" />
                    </div>

                    {/* Content Section */}
                    <div className="flex-grow space-y-2 sm:border-l sm:border-[color:var(--raw-border-subtle)] sm:pl-5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[9px] text-ink-muted uppercase tracking-widest">
                          {cluster.memberCount} signals
                        </span>
                        <span className="font-mono text-[9px] text-signal-teal uppercase flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> Active
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-bold font-sans text-ink group-hover:opacity-90 transition-opacity">
                        "{cluster.canonicalText}"
                      </h2>

                      <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wide">
                        CO-SIGNERS PHRASED THIS IN {cluster.sampleVariants.length} DISTINCT WAYS
                      </p>
                    </div>

                    {/* Action Arrow */}
                    <div className="shrink-0 flex items-center justify-end">
                      <span className="font-mono text-[11px] text-signal-amber group-hover:opacity-80 flex items-center gap-1 group-hover:translate-x-1 transition-all cursor-pointer">
                        Details <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ));
          })()}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-[color:var(--raw-border-subtle)] max-w-xl mx-auto p-8">
          <p className="font-mono text-sm text-ink-muted">NeedBoard just opened here. Report the first "{categoryDes}" problem and put this vertical on the map.</p>
          <Link
            href="/submit"
            className="inline-block mt-6 font-mono text-xs font-bold uppercase bg-signal-amber text-slate-950 px-4 py-2 rounded-lg hover:opacity-90 transition-all"
          >
            Submit First Problem
          </Link>
        </div>
      )}

    </div>
  );
}
