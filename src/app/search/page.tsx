'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, AlertTriangle, ChevronRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_COPY } from '@/lib/config/copy';
import { PageScanner, ButtonSpinner } from '@/components/Loader';
import { useAuth, SignInButton } from '@/lib/clerk';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';
import SignalMeter from '@/components/SignalMeter';

const MAX_QUERY_CHARS = 500;

interface Cluster {
  id: string;
  category: string;
  categoryLabel: string;
  categoryDescription: string;
  canonicalText: string;
  memberCount: number;
  sampleVariants: string[];
  score?: number;
}

export default function SearchPage() {
  const { isSignedIn } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isQueryTooLong = query.length > MAX_QUERY_CHARS;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() === '') return;
    if (isQueryTooLong) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'An error occurred during semantic matching.');
      }
      const contentType = res.headers.get("content-type");

      if (contentType && !contentType.includes("application/json")) {
        console.log("error happend without sign in")
        throw new Error("You must be signed in to perform searches.");
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 selection:bg-teal-500/25 selection:text-teal-200">

      {/* Header */}
      <div className="mb-10 text-center">
        <SectionBadge icon={Search} index="00" label="Validation Search" accent="teal" className="flex-col items-center" />
        <h1 className="mt-2 text-3xl sm:text-5xl font-display font-bold tracking-tight text-ink">
          {APP_COPY.search.title}
        </h1>
        <p className="mt-3 mx-auto max-w-xl text-ink-muted text-sm">
          {APP_COPY.search.subtitle}
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto mb-16">
        <form
          onSubmit={handleSearch}
        >
          <Panel
            accent="teal"
            className="p-1.5 flex items-center transition-all duration-300 focus-within:shadow-[0_0_30px_rgba(20,184,166,0.15)] focus-within:bg-bg-panel/80"
          >
            <div className="flex-grow flex items-center pl-3">
              <span className="font-mono text-signal-teal font-bold shrink-0 select-none">$</span>
              <input
                data-testid="search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={APP_COPY.search.inputPlaceholder}
                className="w-full bg-transparent border-none text-ink placeholder-ink-muted focus:outline-none font-mono text-sm py-3 pl-2"
                disabled={loading}
              />
            </div>
          </Panel>

          <div className="mt-3 flex items-center justify-end gap-3">
            {isSignedIn ? (
              <button
                type="submit"
                disabled={loading || query.trim() === '' || isQueryTooLong}
                className="h-10 shrink-0 flex items-center justify-center gap-2 font-mono text-[10px] tracking-wider uppercase font-bold bg-gradient-to-r from-teal-500 to-amber-500 text-slate-950 px-5 rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-[0_0_25px_rgba(20,184,166,0.3)] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <ButtonSpinner size="xs" />
                    {APP_COPY.search.searchingText}
                  </span>
                ) : (
                  <><Search className="h-3.5 w-3.5" /> Search</>
                )}
              </button>
            ) : (
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="h-10 shrink-0 flex items-center justify-center gap-2 font-mono text-[10px] tracking-wider uppercase font-bold bg-gradient-to-r from-teal-500 to-amber-500 text-slate-950 px-5 rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-[0_0_25px_rgba(20,184,166,0.3)]"
                >
                  <Search className="h-3.5 w-3.5" /> Search
                </button>
              </SignInButton>
            )}
          </div>
        </form>

        {/* Character Counter */}
        <div className="mt-2 flex items-center justify-end font-mono text-[10px] text-ink-muted px-2 select-none">
          {isQueryTooLong && (
            <span className="text-red-500 flex items-center gap-1 font-bold mr-3">
              <AlertTriangle className="h-3 w-3" /> Search description exceeds max character limits. Shorten it!
            </span>
          )}
          <span className={isQueryTooLong ? 'text-red-500 font-bold' : ''}>
            {query.length}/{MAX_QUERY_CHARS}
          </span>
        </div>

        {/* Local Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-red-300 text-xs text-left">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Search Results list */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              className="py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PageScanner message={APP_COPY.search.searchingText} />
            </motion.div>
          ) : results.length > 0 ? (
            <div
              className="space-y-6"
            >
              <div className="border-b border-[color:var(--raw-border-subtle)] pb-3">
                <SectionBadge icon={Search} index="00" label={APP_COPY.search.resultsTitle} accent="teal" />
              </div>

              <div className="space-y-4">
                {results && results.map((cluster) => {
                  // Display match score percentage
                  const similarityPct = cluster.score ? Math.round(cluster.score * 100) : 0;

                  return (
                    <Panel
                      key={cluster.id}
                      href={`/cluster/${cluster.id}`}
                      accent="amber"
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[9px] text-signal-amber uppercase tracking-widest font-bold">
                            {cluster.categoryLabel}
                          </span>
                          <div className="flex items-center gap-2">
                            <SignalMeter
                              value={similarityPct}
                              max={100}
                              solved={similarityPct >= 70 ? 1 : 0}
                              size="sm"
                            />
                            <span className="font-mono text-[9px] text-ink-muted uppercase">
                              {similarityPct}% match
                            </span>
                          </div>
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-ink group-hover:text-ink transition-colors">
                          "{cluster.canonicalText}"
                        </h2>
                        <div className="flex items-center gap-2">
                          <SignalMeter value={cluster.memberCount} max={Math.max(cluster.memberCount, 20)} size="sm" />
                          <span className="font-mono text-[9px] text-ink-muted uppercase tracking-widest">
                            {cluster.memberCount} active reports
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center justify-end">
                        <span className="font-mono text-[10px] text-signal-amber group-hover:text-signal-amber flex items-center gap-1 group-hover:translate-x-1 transition-all">
                          Inspect <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Panel>
                  );
                })}
              </div>
            </div>
          ) : query !== '' && !loading ? (
            <div
              className="text-center py-16 border border-dashed border-[color:var(--raw-border-subtle)] font-mono text-xs uppercase text-ink-muted tracking-widest px-4"
            >
              {APP_COPY.search.noResults}
            </div>
          ) : (
            <motion.div
              className="text-center py-16 border border-dashed border-[color:var(--raw-border-subtle)] text-ink-muted font-mono text-[10px] tracking-[0.2em] uppercase select-none flex flex-col items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <HelpCircle className="h-6 w-6 text-ink-muted mb-1" />
              <span>Input a query above to validate your product idea</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
