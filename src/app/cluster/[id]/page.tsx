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
      <div className="mx-auto max-w-xl text-center py-32 px-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-danger mb-4" />
        <h1 className="text-xl font-semibold font-serif text-ink">Error Loading Pain Point</h1>
        <p className="text-ink-muted text-sm mt-2 leading-relaxed">{error || 'Problem group not found in index.'}</p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/browse"
            className="text-sm font-medium bg-ink/5 hover:bg-ink/10 px-5 py-2.5 rounded-lg border border-border text-ink cursor-pointer"
          >
            Return to Browse
          </Link>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              setRefreshTrigger((prev) => prev + 1);
            }}
            className="text-sm font-medium bg-accent text-white hover:opacity-90 px-5 py-2.5 rounded-lg cursor-pointer"
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
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors group cursor-pointer"
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

          <div className="p-4 rounded-xl panel-surface text-xs text-ink-muted space-y-1.5">
            <div className="flex justify-between gap-4"><span className="shrink-0">Reference ID</span><span className="font-mono text-ink truncate min-w-0">{cluster.id}</span></div>
            <div className="flex justify-between gap-4"><span className="shrink-0">Created</span><span className="font-mono text-ink truncate min-w-0">{new Date(cluster.createdAt).toLocaleDateString()}</span></div>
            <div className="flex justify-between gap-4"><span className="shrink-0">Last updated</span><span className="font-mono text-ink truncate min-w-0">{new Date(cluster.lastUpdatedAt).toLocaleDateString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
