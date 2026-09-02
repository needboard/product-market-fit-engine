'use client';

import { useState } from 'react';
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
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 selection:bg-accent/20 selection:text-ink">

      {/* Header */}
      <div className="mb-10 text-center">
        <SectionBadge icon={Search} index="00" label="Validation Search" accent="teal" className="justify-center" />
        <h1 className="mt-3 text-3xl sm:text-5xl font-serif font-semibold tracking-tight text-ink">
          {APP_COPY.search.title}
        </h1>
        <p className="mt-3 mx-auto max-w-xl text-ink-muted text-sm">
          {APP_COPY.search.subtitle}
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto mb-16">
        <form onSubmit={handleSearch}>
          <Panel accent="teal" className="p-1.5 flex items-center transition-colors duration-200">
            <div className="flex-grow flex items-center pl-3">
              <Search className="h-4 w-4 text-ink-muted shrink-0" />
              <input
                data-testid="search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={APP_COPY.search.inputPlaceholder}
                className="w-full bg-transparent border-none text-ink placeholder-ink-muted focus:outline-none text-sm py-3 pl-3"
                disabled={loading}
              />
            </div>
          </Panel>

          <div className="mt-3 flex items-center justify-end gap-3">
            {isSignedIn ? (
              <button
                type="submit"
                disabled={loading || query.trim() === '' || isQueryTooLong}
                className="h-10 shrink-0 flex items-center justify-center gap-2 text-sm font-medium bg-accent text-white px-5 rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
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
                  className="h-10 shrink-0 flex items-center justify-center gap-2 text-sm font-medium bg-accent text-white px-5 rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" /> Search
                </button>
              </SignInButton>
            )}
          </div>
        </form>

        {/* Character Counter */}
        <div className="mt-2 flex items-center justify-end text-xs text-ink-muted px-2">
          {isQueryTooLong && (
            <span className="text-danger flex items-center gap-1 font-medium mr-3">
              <AlertTriangle className="h-3 w-3" /> Search description exceeds max character limits. Shorten it!
            </span>
          )}
          <span className={isQueryTooLong ? 'text-danger font-medium' : ''}>
            {query.length}/{MAX_QUERY_CHARS}
          </span>
        </div>

        {/* Local Error message */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-2 text-danger text-sm text-left">
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
            <div className="space-y-6">
              <div className="border-b border-border pb-3">
                <SectionBadge icon={Search} index="00" label={APP_COPY.search.resultsTitle} accent="teal" />
              </div>

              <div className="space-y-4">
                {results && results.map((cluster) => {
                  const similarityPct = cluster.score ? Math.round(cluster.score * 100) : 0;
                  const isStrongMatch = similarityPct >= 70;

                  return (
                    <Panel
                      key={cluster.id}
                      href={`/cluster/${cluster.id}`}
                      accent="amber"
                      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 ${isStrongMatch ? 'status-stripe-solved' : 'status-stripe-open'}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-accent uppercase tracking-wide font-semibold">
                            {cluster.categoryLabel}
                          </span>
                          <div className="flex items-center gap-2">
                            <SignalMeter
                              value={similarityPct}
                              max={100}
                              solved={isStrongMatch ? 1 : 0}
                              size="sm"
                            />
                            <span className="text-xs text-ink-muted">
                              {similarityPct}% match
                            </span>
                          </div>
                        </div>
                        <h2 className="text-base sm:text-lg font-semibold text-ink transition-colors">
                          &quot;{cluster.canonicalText}&quot;
                        </h2>
                        <div className="flex items-center gap-2">
                          <SignalMeter value={cluster.memberCount} max={Math.max(cluster.memberCount, 20)} size="sm" />
                          <span className="text-xs text-ink-muted">
                            {cluster.memberCount} active reports
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center justify-end">
                        <span className="text-sm text-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Inspect <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Panel>
                  );
                })}
              </div>
            </div>
          ) : query !== '' && !loading ? (
            <div className="text-center py-16 rounded-xl border border-dashed border-border text-sm text-ink-muted px-4">
              {APP_COPY.search.noResults}
            </div>
          ) : (
            <motion.div
              className="text-center py-16 rounded-xl border border-dashed border-border text-ink-muted text-sm flex flex-col items-center justify-center gap-2"
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
