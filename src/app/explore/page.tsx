'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Compass } from 'lucide-react';
import { PageScanner } from '@/components/Loader';
import SectionBadge from '@/components/ui/SectionBadge';
import ExplorePostCard from '@/components/explore/ExplorePostCard';
import ExploreEmailGate from '@/components/explore/ExploreEmailGate';
import type { ExploreCluster } from '@/components/explore/types';

const PAGE_SIZE = 8;
const GATE_LIMIT = 3;
const UNLOCK_STORAGE_KEY = 'needboard-explore-unlocked';

/**
 * Pads the real, fetched list with synthetic entries purely in the browser —
 * never touches the database/Pinecone. Opt-in via ?test=N so it's a no-op
 * for every real visitor; exists so infinite-scroll behavior can be checked
 * against more posts than currently exist in this environment's seed data.
 */
function withTestPadding(posts: ExploreCluster[], targetCount: number): ExploreCluster[] {
  if (posts.length === 0 || posts.length >= targetCount) return posts;
  const padded = [...posts];
  let i = 0;
  while (padded.length < targetCount) {
    const source = posts[i % posts.length];
    padded.push({ ...source, id: `${source.id}__test-${padded.length}` });
    i++;
  }
  return padded;
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<PageScanner message="Loading..." size="md" />}>
      <ExplorePageContent />
    </Suspense>
  );
}

function ExplorePageContent() {
  const searchParams = useSearchParams();
  const testCount = Number(searchParams.get('test')) || 0;

  const [allPosts, setAllPosts] = useState<ExploreCluster[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // Lazy-initialized so a returning visitor never sees a flash of the gate
  // before this check runs.
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.localStorage.getItem(UNLOCK_STORAGE_KEY));
  });
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadExplore() {
      setLoading(true);
      try {
        const res = await fetch('/api/clusters');
        if (res.ok) {
          const clusters: ExploreCluster[] = await res.json();
          clusters.sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
          setAllPosts(clusters);
        }
      } catch (err) {
        console.error('Failed to load explore feed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExplore();
  }, []);

  const posts = useMemo(
    () => (testCount > 0 ? withTestPadding(allPosts, testCount) : allPosts),
    [allPosts, testCount]
  );

  // Infinite scroll: reveal more already-fetched posts as the sentinel enters view.
  // Rebuilding the observer whenever visibleCount changes (rather than just
  // posts.length) matters: IntersectionObserver only fires on a change in
  // intersection state, so if a loaded batch is short enough that the
  // sentinel never actually leaves the rootMargin zone, it silently stalls
  // after one batch. Recreating it re-checks the current state immediately
  // (observe() always reports once on attach), so short batches keep chaining.
  useEffect(() => {
    if (!unlocked) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setLoadingMore(true);
        // A brief, deliberate pause before revealing the next batch — all
        // posts are already in memory, so without this the next batch pops
        // in instantly and the loading indicator never has a chance to
        // register, reading as a jarring snap rather than a smooth load.
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, posts.length));
          setLoadingMore(false);
        }, 300);
      }
    }, { rootMargin: '400px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [unlocked, posts.length, visibleCount]);

  const displayLimit = unlocked ? visibleCount : Math.min(GATE_LIMIT, posts.length);
  const visiblePosts = posts.slice(0, displayLimit);
  const isGated = !unlocked && posts.length > GATE_LIMIT;

  const handleUnlock = (email: string) => {
    window.localStorage.setItem(UNLOCK_STORAGE_KEY, email);
    setUnlocked(true);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <SectionBadge icon={Compass} index="00" label="Live Problems & Solutions" accent="amber" />
        <h1 className="mt-3 text-2xl sm:text-3xl font-serif font-semibold text-ink">Explore</h1>
        <p className="text-ink-muted text-sm mt-1">Real problems reported by developers and teams, most recent first.</p>
      </div>

      {loading ? (
        <PageScanner message="Loading..." size="md" />
      ) : visiblePosts.length > 0 ? (
        <div className="space-y-4">
          {visiblePosts.map((cluster) => (
            <ExplorePostCard key={cluster.id} cluster={cluster} />
          ))}
          {isGated && <ExploreEmailGate onUnlock={handleUnlock} />}
          {unlocked && visibleCount < posts.length && (
            <div ref={sentinelRef} className="flex justify-center py-6 h-[68px]">
              {loadingMore && (
                <div className="h-5 w-5 rounded-full border-2 border-ink-muted/20 border-t-accent animate-spin" />
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border border-dashed border-border text-ink-muted text-sm">
          Nobody&apos;s reported a problem yet — yours could be the first thing builders see.
        </div>
      )}
    </div>
  );
}
