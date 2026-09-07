'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers, ChevronRight, TrendingUp, AlertTriangle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_COPY } from '@/lib/config/copy';
import { PageScanner } from '@/components/Loader';
import staticCategories from '@/lib/ai/static-categories';
import SignalMeter from '@/components/SignalMeter';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';

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
          className="inline-flex items-center gap-2 text-xs text-ink-muted hover:text-ink transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {APP_COPY.browse.backLink}
        </Link>
      </div>

      {/* Header */}
      <div className="mb-12 border-b border-border pb-8">
        <SectionBadge icon={Layers} index="00" label="Market Segment" accent="amber" />
        <h1 className="mt-4 text-3xl sm:text-5xl font-serif font-semibold tracking-tight text-ink">
          {activeCategory?.categoryLabel || category.replace('-', ' ')}
        </h1>
        <p className="mt-3 max-w-3xl text-ink-muted text-sm sm:text-base leading-relaxed">
          {activeCategory?.categoryDescription || 'A collection of shared customer frustrations and product gaps.'}
        </p>
      </div>

      {/* Clusters List */}
      {isComingSoon ? (
        <Panel className="p-10 max-w-2xl select-none">
          <div className="p-2.5 rounded-lg bg-ink/5 text-ink-muted inline-flex mb-4"><Lock className="h-5 w-5" /></div>
          <h2 className="text-xl sm:text-2xl font-semibold text-ink font-serif">
            {categoryDes || category.replace('-', ' ')} — Coming Soon
          </h2>
          <p className="text-sm text-ink-muted mt-3 leading-relaxed">
            We're not collecting problems in this vertical yet. Right now NeedBoard is focused on
            Developer Tools &amp; DX and SaaS &amp; B2B Productivity — report the pain points you
            experience there, and this niche will light up when we expand.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 text-xs text-ink-muted hover:text-ink transition-colors group cursor-pointer mt-8"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {APP_COPY.browse.backLink}
          </Link>
        </Panel>
      ) : loading ? (
        <PageScanner message="Querying customer complaints..." />
      ) : error ? (
        <div className="text-center py-20 px-4 select-none max-w-xl mx-auto">
          <AlertTriangle className="mx-auto h-12 w-12 text-danger mb-4" />
          <h2 className="text-xl font-semibold text-ink">Error Loading Opportunities</h2>
          <p className="text-ink-muted text-xs mt-2 leading-relaxed">{error}</p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/browse"
              className="text-xs font-semibold uppercase bg-ink/5 hover:bg-ink/10 px-5 py-2.5 rounded-lg border border-border text-ink cursor-pointer transition-colors"
            >
              Return to Browse
            </Link>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                setRefreshTrigger(prev => prev + 1);
              }}
              className="text-xs font-semibold uppercase bg-accent hover:opacity-90 text-white px-5 py-2.5 rounded-lg cursor-pointer transition-opacity"
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
                <Panel
                  href={`/cluster/${cluster.id}`}
                  accent="amber"
                  className="status-stripe-open block p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    {/* Signal amplitude */}
                    <div className="shrink-0">
                      <SignalMeter value={cluster.memberCount} max={maxSignal} size="md" />
                    </div>

                    {/* Content Section */}
                    <div className="flex-grow space-y-2 sm:border-l sm:border-border sm:pl-5">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-ink-muted uppercase tracking-wide">
                          <span className="font-mono">{cluster.memberCount}</span> signals
                        </span>
                        <span className="text-[11px] text-status-matched uppercase flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> Active
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-semibold text-ink group-hover:opacity-90 transition-opacity">
                        "{cluster.canonicalText}"
                      </h2>

                      <p className="text-[11px] text-ink-muted uppercase tracking-wide">
                        Co-signers phrased this in <span className="font-mono">{cluster.sampleVariants.length}</span> distinct ways
                      </p>
                    </div>

                    {/* Action Arrow */}
                    <div className="shrink-0 flex items-center justify-end">
                      <span className="text-[13px] text-accent group-hover:opacity-80 flex items-center gap-1 group-hover:translate-x-1 transition-all cursor-pointer">
                        Details <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>

                  </div>
                </Panel>
              </motion.div>
            ));
          })()}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-border rounded-xl max-w-xl mx-auto p-8">
          <p className="text-sm text-ink-muted">NeedBoard just opened here. Report the first "{categoryDes}" problem and put this vertical on the map.</p>
          <Link
            href="/submit"
            className="inline-block mt-6 text-xs font-semibold uppercase bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Submit First Problem
          </Link>
        </div>
      )}

    </div>
  );
}
