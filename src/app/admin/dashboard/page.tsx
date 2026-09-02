'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/clerk';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { PageScanner } from '@/components/Loader';
import SectionBadge from '@/components/ui/SectionBadge';
import StatsOverview from '@/components/admin/StatsOverview';
import CostBreakdown from '@/components/admin/CostBreakdown';
import MarketInterestMap from '@/components/admin/MarketInterestMap';
import CurationPanel from '@/components/admin/CurationPanel';
import type { AdminStats } from '@/components/admin/types';

export default function AdminDashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = (user?.publicMetadata?.role as string) || 'user';
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !isAdmin) return;

    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to retrieve administrative data.');
        }
        setStats(data.stats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [isLoaded, isSignedIn, isAdmin]);

  // A reassignment triggers a small re-embedding cost (two embeddings) —
  // reflected locally so the cost dashboard doesn't need a full refetch.
  const handleCostIncurred = () => {
    setStats((prev) => prev ? {
      ...prev,
      costsByType: { ...prev.costsByType, 'me-too': prev.costsByType['me-too'] + 0.00000002 * 2 },
    } : prev);
  };

  if (!isLoaded) {
    return <PageScanner message="Resolving secure credentials..." />;
  }

  if (!isSignedIn || !isAdmin) {
    return (
      <div className="mx-auto max-w-xl text-center py-32 px-4 select-none">
        <div className="mx-auto w-14 h-12 bg-red-500/10 border border-red-500/35 rounded-full flex items-center justify-center text-red-500 mb-6 animate-pulse">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold font-sans text-ink">Access Denied</h1>
        <p className="text-ink-muted text-sm mt-3 leading-relaxed">
          You are not authorized to view this page. This dashboard is restricted strictly to verified Administrators.
          If you are the owner, please log in with your Admin account.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/"
            className="font-mono text-xs font-bold uppercase bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-xl border border-[color:var(--raw-border-subtle)] text-ink flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <PageScanner message="Calculating cost metrics & database counts..." />;
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-xl text-center py-32 px-4">
        <ShieldAlert className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold font-sans text-ink">Database Connection Failed</h1>
        <p className="text-ink-muted text-xs mt-2">{error || 'Unable to fetch admin statistics.'}</p>
        <Link href="/" className="inline-block mt-6 font-mono text-xs font-bold uppercase bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10 text-ink">
      <div className="flex items-center justify-between border-b border-[color:var(--raw-border-subtle)] pb-6">
        <div>
          <div className="mb-1">
            <SectionBadge icon={ShieldAlert} index="00" label="Executive Admin Console" accent="coral" />
          </div>
          <h1 className="mt-1 text-2xl sm:text-4xl font-display font-bold tracking-tight text-ink">
            System Operations Dashboard
          </h1>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-ink-muted hover:text-ink transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Home
        </Link>
      </div>

      <StatsOverview stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <CostBreakdown stats={stats} />
        <MarketInterestMap categoryPopularity={stats.categoryPopularity} />
      </div>

      <CurationPanel onCostIncurred={handleCostIncurred} />
    </div>
  );
}
