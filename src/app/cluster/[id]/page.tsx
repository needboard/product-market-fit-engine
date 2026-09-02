'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/clerk';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { APP_COPY } from '@/lib/config/copy';
import { PageScanner } from '@/components/Loader';
import { fetchWithRetry } from '@/lib/fetch-retry';
import { sanitizeError } from '@/lib/sanitize-error';
import CanonicalBlock from '@/components/cluster/CanonicalBlock';
import SolutionsSection from '@/components/cluster/SolutionsSection';
import AdjacentClusters from '@/components/cluster/AdjacentClusters';
import MeTooCard from '@/components/cluster/MeTooCard';
import type { Cluster } from '@/components/cluster/types';

export default function ClusterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { userId } = useAuth();
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [adjacent, setAdjacent] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const voted = !!(userId && cluster?.userIds?.includes(userId));
  const isCreator = !!(userId && cluster?.creatorId === userId);

  useEffect(() => {
    async function loadDetails() {
      try {
        const res = await fetchWithRetry(`/api/clusters/${id}`);
        if (!res.ok) {
          throw new Error('Failed to retrieve cluster metrics.');
        }
        const data = await res.json();
        setCluster(data.cluster);
        setAdjacent(data.adjacent || []);
      } catch (err: any) {
        console.error(err);
        setError(sanitizeError(err, 'We could not retrieve details for this problem group.'));
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [id, refreshTrigger]);

  if (loading) {
    return <PageScanner message="Loading problem details..." />;
  }

  if (error || !cluster) {
    return (
      <div className="mx-auto max-w-xl text-center py-32 px-4 select-none animate-fade-in">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4 animate-pulse" />
        <h1 className="text-xl font-bold font-sans text-ink">Error Loading Pain Point</h1>
        <p className="text-ink-muted text-xs mt-2 leading-relaxed">{error || 'Problem group not found in index.'}</p>
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
              setRefreshTrigger((prev) => prev + 1);
            }}
            className="font-mono text-xs font-bold uppercase bg-gradient-to-r from-brand-amber to-brand-coral text-slate-950 px-5 py-2.5 rounded-xl cursor-pointer"
          >
            Retry Load
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={`/browse/${cluster.category}`}
          className="inline-flex items-center gap-2 font-mono text-xs text-ink-muted hover:text-ink transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {APP_COPY.clusterDetail.backToNiche} ({cluster.categoryLabel})
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <CanonicalBlock cluster={cluster} />
          <SolutionsSection cluster={cluster} userId={userId} onClusterUpdate={setCluster} />
          <AdjacentClusters adjacent={adjacent} />
        </div>

        <div className="space-y-6">
          <MeTooCard clusterId={cluster.id} voted={voted} isCreator={isCreator} onSuccess={setCluster} />

          <div className="p-4 bg-bg-panel/30 border border-[color:var(--raw-border-subtle)] font-mono text-[9px] tracking-wide text-ink-muted space-y-2 select-none uppercase">
            <div>CLUSTER REFERENCE ID: {cluster.id}</div>
            <div>CREATED COORDINATES: {new Date(cluster.createdAt).toLocaleDateString()}</div>
            <div>LAST SIGNAL FORTIFY: {new Date(cluster.lastUpdatedAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
