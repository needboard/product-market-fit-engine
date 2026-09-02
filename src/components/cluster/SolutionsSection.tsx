'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { APP_COPY } from '@/lib/config/copy';
import { fetchWithRetry } from '@/lib/fetch-retry';
import { sanitizeError } from '@/lib/sanitize-error';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import SectionBadge from '@/components/ui/SectionBadge';
import SignalMeter from '@/components/SignalMeter';
import SolutionCard from './SolutionCard';
import AddSolutionModal from './AddSolutionModal';
import type { Cluster, Solution } from './types';

interface SolutionsSectionProps {
  cluster: Cluster;
  userId: string | null | undefined;
  onClusterUpdate: (cluster: Cluster) => void;
}

export default function SolutionsSection({ cluster, userId, onClusterUpdate }: SolutionsSectionProps) {
  const [showSolutionForm, setShowSolutionForm] = useState(false);
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'success' as 'success' | 'error' | 'info', title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, solutionId: '' });

  const solutions = cluster.solutions || [];

  const requireAuth = () => {
    if (userId) return true;
    setAlertModal({ isOpen: true, type: 'info', title: 'Authentication Required', message: 'You must be signed in to list your product solution!' });
    return false;
  };

  const openAddForm = () => {
    if (!requireAuth()) return;
    setEditingSolution(null);
    setShowSolutionForm(true);
  };

  const handleVote = async (solutionId: string, voteType: 'up' | 'down') => {
    if (!userId) {
      setAlertModal({ isOpen: true, type: 'info', title: 'Authentication Required', message: 'You must be signed in to rate listed product solutions!' });
      return;
    }
    if (upvotingIds.has(solutionId)) return;

    setUpvotingIds((prev) => new Set(prev).add(solutionId));
    try {
      const res = await fetchWithRetry(`/api/clusters/${cluster.id}/solutions/${solutionId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit vote.');
      onClusterUpdate(data.cluster);
    } catch (err: any) {
      console.error(err);
      setAlertModal({ isOpen: true, type: 'error', title: 'Vote Failed', message: sanitizeError(err, 'Failed to record your vote.') });
    } finally {
      setUpvotingIds((prev) => {
        const next = new Set(prev);
        next.delete(solutionId);
        return next;
      });
    }
  };

  const executeSolutionDelete = async () => {
    const solutionId = confirmModal.solutionId;
    if (!solutionId) return;

    setDeletingIds((prev) => new Set(prev).add(solutionId));
    try {
      const res = await fetchWithRetry(`/api/clusters/${cluster.id}/solutions/${solutionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete solution.');
      onClusterUpdate(data.cluster);
      setAlertModal({ isOpen: true, type: 'success', title: 'Solution Deleted', message: 'Your listed product solution has been successfully removed from this problem group.' });
    } catch (err: any) {
      console.error(err);
      setAlertModal({ isOpen: true, type: 'error', title: 'Deletion Failed', message: sanitizeError(err, 'Failed to delete the listed product.') });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(solutionId);
        return next;
      });
    }
  };

  const totalUpvotes = solutions.reduce((sum, s) => sum + (s.upvotes || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <SectionBadge icon={Check} index="01" label={APP_COPY.solutions.tabTitle} accent="teal" className="mb-2" />
          <p className="text-ink-muted text-sm">
            {APP_COPY.solutions.tabSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-4 self-start sm:self-center shrink-0">
          {solutions.length > 0 && (
            <SignalMeter
              value={totalUpvotes}
              max={Math.max(totalUpvotes, 10)}
              solved={solutions.length}
              size="sm"
              label={`${totalUpvotes} response signal`}
            />
          )}
          <button
            data-testid="add-solution-button"
            onClick={openAddForm}
            className="shrink-0 text-sm font-medium bg-accent hover:opacity-90 text-white px-4 py-2 rounded-lg transition-opacity cursor-pointer"
          >
            {APP_COPY.solutions.addSolutionButton}
          </button>
        </div>
      </div>

      {solutions.length > 0 ? (
        <div className="space-y-4">
          {[...solutions].sort((a, b) => b.upvotes - a.upvotes).map((sol) => (
            <SolutionCard
              key={sol.id}
              solution={sol}
              clusterId={cluster.id}
              userId={userId}
              isUpvoting={upvotingIds.has(sol.id)}
              isDeleting={deletingIds.has(sol.id)}
              onVote={handleVote}
              onEditStart={(solution) => {
                setEditingSolution(solution);
                setShowSolutionForm(true);
              }}
              onDeleteRequest={(solutionId) => setConfirmModal({ isOpen: true, solutionId })}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-xl border border-dashed border-border text-center flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-ink-muted max-w-md leading-relaxed">
            {APP_COPY.solutions.noSolutions}
          </p>
          <button
            onClick={openAddForm}
            className="text-sm font-medium bg-ink/5 hover:bg-ink/10 text-ink border border-border px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            List Your Product Now
          </button>
        </div>
      )}

      {showSolutionForm && (
        <AddSolutionModal
          clusterId={cluster.id}
          editingSolution={editingSolution}
          onClose={() => {
            setShowSolutionForm(false);
            setEditingSolution(null);
          }}
          onSuccess={onClusterUpdate}
        />
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        type="warning"
        title="Delete Listed Product?"
        message="Are you sure you want to permanently delete your listed solution? This action is irreversible and will remove all associated reviews."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={executeSolutionDelete}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
