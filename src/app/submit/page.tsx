'use client';

import { useState, useEffect, useCallback } from 'react';
import IntakeHero from '@/components/submit/IntakeHero';
import SubmissionFlow from '@/components/submit/SubmissionFlow';
import TrendingGrid from '@/components/submit/TrendingGrid';
import type { Cluster } from '@/components/submit/types';

export default function SubmitPage() {
  const [trending, setTrending] = useState<Cluster[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const loadTrending = useCallback(async () => {
    setTrendingLoading(true);
    try {
      const res = await fetch('/api/clusters');
      if (res.ok) {
        const clusters = await res.json();
        setTrending(clusters.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load trending clusters:', err);
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  return (
    <div className="flex-grow flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mt-6 mb-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <IntakeHero trending={trending} />
          <SubmissionFlow onPublished={loadTrending} />
        </div>
      </div>

      <TrendingGrid trending={trending} trendingLoading={trendingLoading} />
    </div>
  );
}
