'use client';

import { useState, useEffect } from 'react';
import { Layers, RefreshCw } from 'lucide-react';
import { ButtonSpinner } from '@/components/Loader';
import AlertModal from '@/components/AlertModal';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';
import type { ClusterRecord, ProblemRecord } from './types';

export default function CurationPanel({ onCostIncurred }: { onCostIncurred: () => void }) {
  const [allClusters, setAllClusters] = useState<ClusterRecord[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string>('');
  const [problemsCache, setProblemsCache] = useState<Record<string, ProblemRecord[]>>({});
  const [rawProblems, setRawProblems] = useState<ProblemRecord[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [reassigningId, setReassigningId] = useState<string | null>(null);
  const [reassignTargets, setReassignTargets] = useState<Record<string, string>>({});
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'success' as 'success' | 'error' | 'info', title: '', message: '' });

  useEffect(() => {
    async function loadAllClusters() {
      try {
        const res = await fetch('/api/clusters');
        if (res.ok) {
          const data = await res.json();
          setAllClusters(data || []);
        }
      } catch (err) {
        console.error('Failed to load clusters list:', err);
      }
    }
    loadAllClusters();
  }, []);

  useEffect(() => {
    if (!selectedClusterId) {
      setRawProblems([]);
      return;
    }

    if (problemsCache[selectedClusterId]) {
      setRawProblems(problemsCache[selectedClusterId]);
      return;
    }

    async function loadProblems() {
      setLoadingProblems(true);
      try {
        const res = await fetch(`/api/admin/problems?clusterId=${selectedClusterId}`);
        if (res.ok) {
          const data = await res.json();
          const problemsList = data.problems || [];
          setProblemsCache((prev) => ({ ...prev, [selectedClusterId]: problemsList }));
          setRawProblems(problemsList);
        }
      } catch (err) {
        console.error('Failed to load raw problems:', err);
      } finally {
        setLoadingProblems(false);
      }
    }
    loadProblems();
  }, [selectedClusterId, problemsCache]);

  const forceRefreshProblems = async () => {
    if (!selectedClusterId) return;
    setLoadingProblems(true);
    try {
      const res = await fetch(`/api/admin/problems?clusterId=${selectedClusterId}`);
      if (res.ok) {
        const data = await res.json();
        const problemsList = data.problems || [];
        setProblemsCache((prev) => ({ ...prev, [selectedClusterId]: problemsList }));
        setRawProblems(problemsList);
        setAlertModal({ isOpen: true, type: 'success', title: 'Sync Completed!', message: 'The curation list has been successfully synchronized with live database records.' });
      }
    } catch (err) {
      console.error('Failed to refresh problems:', err);
      setAlertModal({ isOpen: true, type: 'error', title: 'Sync Failed', message: 'Could not synchronize complaints with active database records.' });
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleReassignSubmit = async (problemId: string) => {
    const targetClusterId = reassignTargets[problemId];
    if (!targetClusterId) {
      setAlertModal({ isOpen: true, type: 'info', title: 'Target Group Missing', message: 'Please select a target group from the dropdown list before executing the reassignment.' });
      return;
    }

    setReassigningId(problemId);
    try {
      const res = await fetch('/api/admin/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, sourceClusterId: selectedClusterId, targetClusterId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reassign problem.');
      }

      const updatedList = rawProblems.filter((p) => p.id !== problemId);
      setRawProblems(updatedList);
      setProblemsCache((prev) => ({ ...prev, [selectedClusterId]: updatedList }));
      setReassignTargets((prev) => {
        const next = { ...prev };
        delete next[problemId];
        return next;
      });

      onCostIncurred();

      setAlertModal({ isOpen: true, type: 'success', title: 'Reassignment Completed!', message: 'The individual complaint has been successfully reassigned. Parent counts and variants are synchronized.' });
    } catch (err: any) {
      console.error(err);
      setAlertModal({ isOpen: true, type: 'error', title: 'Reassignment Failed', message: err.message || 'Could not complete reassignment.' });
    } finally {
      setReassigningId(null);
    }
  };

  // Deduplicate by unique ID to prevent React children duplicate key warnings
  const uniqueClusters = Array.from(new Map(allClusters.map((c) => [c.id, c])).values());

  return (
    <Panel accent="amber" className="p-6 space-y-6 text-left">
      <div>
        <SectionBadge icon={Layers} index="04" label="Manual Problem Curation & Overrides" accent="amber" />
        <p className="text-ink-muted text-xs mt-2">
          Reassign misclassified user frustrations to optimize cluster coefficients
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="space-y-2">
          <label className="text-xs text-ink-muted tracking-wide block uppercase font-semibold">
            1. Select Problem Group (Cluster)
          </label>
          <select
            value={selectedClusterId}
            onChange={(e) => setSelectedClusterId(e.target.value)}
            className="input-field w-full px-2 py-2.5 text-xs cursor-pointer"
          >
            <option value=""> Choose a group to inspect </option>
            {uniqueClusters.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.categoryLabel}] {(c.canonicalText || '').substring(0, 50)}...
              </option>
            ))}
          </select>
          <p className="text-xs text-ink-muted leading-relaxed pt-1.5">
            Choose an active group above. The dashboard will query all individual developer complaints currently mapped to this centroid coordinates.
          </p>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center h-5">
            <label className="text-xs text-ink-muted tracking-wide block uppercase font-semibold">
              2. Mapped Complaints & Reassignment
            </label>
            {selectedClusterId && !loadingProblems && (
              <button
                onClick={forceRefreshProblems}
                className="text-xs font-semibold text-ink-muted hover:text-accent transition-colors cursor-pointer flex items-center gap-1.5 bg-ink/5 hover:bg-ink/10 rounded-lg px-2.5 py-1"
                title="Force Sync with Live Database"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Sync DB</span>
              </button>
            )}
          </div>

          {loadingProblems ? (
            <div className="text-center py-10 text-xs text-ink-muted">
              Fetching individual complaints...
            </div>
          ) : selectedClusterId === '' ? (
            <div className="text-center py-12 rounded-lg border border-dashed border-border text-ink-muted text-xs">
              Select a problem group on the left to show user complaints
            </div>
          ) : rawProblems.length === 0 ? (
            <p className="text-xs text-ink-muted py-4">
              No individual complaints are mapped to this group anymore (perhaps they were all reassigned!).
            </p>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {rawProblems.map((prob) => {
                const targetId = reassignTargets[prob.id] || '';
                const isReassigning = reassigningId === prob.id;

                return (
                  <div key={prob.id} className="p-4 rounded-lg bg-ink/5 border border-border space-y-3 text-left hover:border-accent/30 transition-colors">
                    <div>
                      <div className="flex justify-between items-center gap-3 text-xs text-ink-muted pb-1.5">
                        <span className="truncate min-w-0">Complaint ID: {prob.id}</span>
                        <span className="shrink-0">{new Date(prob.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-ink text-sm leading-relaxed">&ldquo;{prob.rawText}&rdquo;</p>
                    </div>

                    <div className="flex items-center gap-3 pt-2.5 border-t border-border flex-wrap">
                      <span className="text-xs text-ink-muted font-semibold">Move to:</span>
                      <select
                        value={targetId}
                        onChange={(e) => setReassignTargets((prev) => ({ ...prev, [prob.id]: e.target.value }))}
                        className="input-field px-2.5 py-1 text-xs cursor-pointer max-w-[220px]"
                      >
                        <option value=""> Choose target group </option>
                        {uniqueClusters
                          .filter((c) => c.id !== selectedClusterId)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              [{c.categoryLabel}] {(c.canonicalText || '').substring(0, 35)}...
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => handleReassignSubmit(prob.id)}
                        disabled={!targetId || isReassigning}
                        className="h-7 px-3.5 bg-accent text-white text-xs font-semibold rounded-lg active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 ml-auto"
                      >
                        {isReassigning ? (
                          <>
                            <ButtonSpinner size="xs" />
                            <span>Moving...</span>
                          </>
                        ) : (
                          'Execute Move'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </Panel>
  );
}
