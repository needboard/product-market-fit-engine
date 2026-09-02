'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, ChevronRight, Activity, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_COPY } from '@/lib/config/copy';
import { PageScanner } from '@/components/Loader';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';

interface Category {
  id: string;
  label: string;
  description: string;
  clusterCount: number;
  problemCount: number;
  status?: 'active' | 'coming-soon';
}

export default function BrowsePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-12">
        <SectionBadge icon={Layers} index="00" label="Market Verticals" accent="amber" />
        <h1 className="mt-4 text-3xl sm:text-5xl font-serif font-semibold tracking-tight text-ink">
          {APP_COPY.browse.title}
        </h1>
        <p className="mt-3 max-w-2xl text-ink-muted text-sm">
          {APP_COPY.browse.subtitle}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <PageScanner message="Compiling niche market counts..." />
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...categories]
            .sort((a, b) => Number(b.status === 'active') - Number(a.status === 'active'))
            .map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
            >
              {cat.status === 'coming-soon' ? (
                <Panel className="flex flex-col justify-between h-56 p-6 opacity-60 select-none">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-lg bg-ink/5 text-ink-muted">
                        <Lock className="h-5 w-5" />
                      </div>

                      {/* Coming Soon Pill */}
                      <span className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase bg-ink/5 px-2 py-0.5 rounded">
                        Coming Soon
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold text-ink-muted">
                      {cat.label}
                    </h2>
                    <p className="mt-2 text-xs text-ink-muted leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[11px] uppercase tracking-wide text-ink-muted">
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Not accepting reports yet
                    </span>
                    <span>Locked</span>
                  </div>
                </Panel>
              ) : (
              <Panel href={`/browse/${cat.id}`} accent="amber" className="flex flex-col justify-between h-56 p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-lg bg-accent/10 text-accent">
                      <Layers className="h-5 w-5" />
                    </div>

                    {/* Stats Pill */}
                    <span className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase bg-ink/5 px-2 py-0.5 rounded font-mono">
                      {cat.clusterCount} {cat.clusterCount === 1 ? 'cluster' : 'clusters'}
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold text-ink">
                    {cat.label}
                  </h2>
                  <p className="mt-2 text-xs text-ink-muted leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[11px] uppercase tracking-wide text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-status-matched" />
                    <span className="font-mono">{cat.problemCount}</span> combined voices
                  </span>
                  <span className="text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 normal-case tracking-normal">
                    Open <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Panel>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-border rounded-xl p-8 max-w-xl mx-auto">
          <p className="text-sm text-ink-muted">No active categories found.</p>
          <p className="text-xs text-ink-muted mt-2">Submit a problem on the home page or click "Seed Data" to populate sample clusters.</p>
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
