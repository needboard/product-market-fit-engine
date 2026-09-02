'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser, SignInButton } from '@/lib/clerk';
import { Lock } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { PageScanner } from '@/components/Loader';
import ProfileHeaderCard from '@/components/dashboard/ProfileHeaderCard';
import PerksAndPortfolio from '@/components/dashboard/PerksAndPortfolio';
import ReporterWorkspace from '@/components/dashboard/ReporterWorkspace';
import BuilderConsole from '@/components/dashboard/BuilderConsole';
import type { ProblemRecord, ClusterRecord, SolutionRecord, ReviewRecord, UserProfile, RolePerks } from '@/components/dashboard/types';

export default function UserDashboard() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [perks, setPerks] = useState<RolePerks | null>(null);
  const [reporterProblems, setReporterProblems] = useState<ProblemRecord[]>([]);
  const [supportedClusters, setSupportedClusters] = useState<ClusterRecord[]>([]);
  const [builderSolutions, setBuilderSolutions] = useState<SolutionRecord[]>([]);
  const [builderReviews, setReviewFeed] = useState<ReviewRecord[]>([]);
  const [totalUpvotes, setTotalUpvotes] = useState(0);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reporter' | 'builder'>('reporter');

  useEffect(() => {
    if (!isAuthLoaded || !isSignedIn) return;

    async function loadDashboard() {
      setLoading(true);
      try {
        const res = await fetch('/api/user/dashboard');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          setPerks(data.perks);
          setReporterProblems(data.reporter.problems || []);
          setSupportedClusters(data.reporter.supportedClusters || []);
          setBuilderSolutions(data.builder.solutions || []);
          setReviewFeed(data.builder.reviews || []);
          setTotalUpvotes(data.builder.totalUpvotesScore || 0);

          if (data.profile.role === 'builder' || data.profile.role === 'admin') {
            setActiveTab('builder');
          }
        } else {
          const errorData = await res.json();
          console.error('Failed to load dashboard:', errorData);
        }
      } catch (err) {
        console.error('Error fetching dashboard payload:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [isAuthLoaded, isSignedIn]);

  if (!isAuthLoaded) {
    return <PageScanner message="Resolving secure credentials..." />;
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-xl text-center py-32 px-4 select-none flex flex-col items-center justify-center space-y-6">
        <div className="mx-auto w-14 h-12 bg-signal-amber/10 border border-signal-amber/35 rounded-full flex items-center justify-center text-signal-amber animate-pulse">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-sans text-ink">Secure Console Access</h1>
          <p className="text-ink-muted text-xs mt-2 leading-relaxed">
            Please log in with your account to access your personalized reported history, supported waiting lists, and builder consoles.
          </p>
        </div>
        <SignInButton mode="modal">
          <button className="h-11 px-8 font-mono text-xs uppercase tracking-wider font-bold bg-gradient-to-r from-brand-amber to-brand-coral text-slate-950 rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer">
            Sign In to System Console
          </button>
        </SignInButton>
      </div>
    );
  }

  if (loading || !profile || !perks) {
    return <PageScanner message="Assembling your dynamic workspaces & logs..." />;
  }

  const isElevatedTier = profile.role === 'builder' || profile.role === 'admin';

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10 text-ink min-h-screen relative selection:bg-teal-500/25 selection:text-teal-200">
      <div className={`absolute top-10 right-1/4 w-[300px] h-[300px] rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
        profile.role === 'builder' ? 'bg-teal-500/5' : 'bg-amber-500/5'
      }`} />

      <ProfileHeaderCard
        profile={profile}
        perks={perks}
        avatarUrl={clerkUser?.imageUrl}
        builderSolutionsCount={builderSolutions.length}
        totalUpvotes={totalUpvotes}
      />

      {isElevatedTier && (
        <div className="flex gap-2 border-b border-[color:var(--raw-border-subtle)] pb-2">
          <button
            onClick={() => setActiveTab('reporter')}
            className={`px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'reporter'
                ? 'bg-amber-500/10 text-brand-amber border border-brand-amber/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                : 'text-ink-muted hover:text-ink hover:bg-white/5'
            }`}
          >
            Community Reporter Workspace
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-teal-500/10 text-signal-teal border border-teal-400/20 shadow-[0_0_15px_rgba(20,184,166,0.05)]'
                : 'text-ink-muted hover:text-ink hover:bg-white/5'
            }`}
          >
            Verified Builder Console
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <PerksAndPortfolio
          profile={profile}
          perks={perks}
          onProfileUpdate={(updates) => setProfile((prev) => prev ? { ...prev, ...updates } : prev)}
        />

        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'reporter' && (
              <ReporterWorkspace reporterProblems={reporterProblems} supportedClusters={supportedClusters} />
            )}
            {activeTab === 'builder' && isElevatedTier && (
              <BuilderConsole builderSolutions={builderSolutions} builderReviews={builderReviews} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
