'use client';

import { useState } from 'react';
import { Flame, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_COPY } from '@/lib/config/copy';
import { ButtonSpinner } from '@/components/Loader';
import { fetchWithRetry } from '@/lib/fetch-retry';
import { sanitizeError } from '@/lib/sanitize-error';
import Panel from '@/components/ui/Panel';
import type { Cluster } from './types';

interface MeTooCardProps {
  clusterId: string;
  voted: boolean;
  isCreator: boolean;
  onSuccess: (cluster: Cluster) => void;
}

export default function MeTooCard({ clusterId, voted, isCreator, onSuccess }: MeTooCardProps) {
  const [submitting, setSubmitting] = useState(false);
  const [customPhrasing, setCustomPhrasing] = useState('');
  const [showPhrasingInput, setShowPhrasingInput] = useState(false);
  const [meTooError, setMeTooError] = useState<string | null>(null);

  const handleMeTooSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMeTooError(null);

    try {
      const res = await fetchWithRetry(`/api/clusters/${clusterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrasing: customPhrasing }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit me too.');
      }

      onSuccess(data.cluster);
      setCustomPhrasing('');
      setShowPhrasingInput(false);
    } catch (err: any) {
      console.error(err);
      setMeTooError(sanitizeError(err, 'Could not register your co-sign feedback.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (isCreator) {
    return (
      <Panel accent="coral" glass={false} className="p-6 border-glow backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-2.5">
          <Flame className="h-5 w-5 text-signal-teal" />
        </div>
        <h3 className="text-lg font-bold text-ink font-sans">Your Problem Group</h3>
        <p className="text-xs text-ink-muted mt-1">
          You are the original reporter of this problem cluster.
        </p>
        <div className="mt-6">
          <div className="p-4 bg-teal-500/10 border border-teal-500/25 text-center text-signal-teal">
            <Check className="mx-auto h-6 w-6 text-signal-teal mb-1" />
            <span className="font-mono text-xs uppercase font-bold block">Ownership Verified</span>
            <span className="text-[10px] text-ink-muted leading-normal block mt-1">
              You seeded this group. Your original phrasing has already been logged.
            </span>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel accent="coral" glass={false} className="p-6 border-glow backdrop-blur-xl">
      <div className="absolute top-0 right-0 p-2.5">
        <Flame className="h-5 w-5 text-signal-amber animate-pulse" />
      </div>

      <h3 className="text-lg font-bold text-ink font-sans">{APP_COPY.clusterDetail.meTooTitle}</h3>
      <p className="text-xs text-ink-muted mt-1">{APP_COPY.clusterDetail.meTooDesc}</p>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {!voted ? (
            <motion.div key="vote-actions" className="space-y-4">
              {!showPhrasingInput ? (
                <div className="space-y-2">
                  <button
                    data-testid="me-too-button"
                    onClick={() => handleMeTooSubmit({ preventDefault: () => {} } as any)}
                    disabled={submitting}
                    className="w-full h-11 bg-gradient-to-r from-brand-amber to-brand-coral text-slate-950 font-mono text-xs uppercase tracking-wider font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.3)] disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <ButtonSpinner size="sm" />
                        {APP_COPY.clusterDetail.meTooButtonLoading}
                      </span>
                    ) : (
                      APP_COPY.clusterDetail.meTooButtonText
                    )}
                  </button>
                  <button
                    data-testid="custom-phrasing-toggle"
                    onClick={() => setShowPhrasingInput(true)}
                    className="w-full text-center font-mono text-[10px] text-ink-muted hover:text-ink uppercase tracking-widest cursor-pointer py-1"
                  >
                    + Add custom phrasing variant
                  </button>
                </div>
              ) : (
                <motion.form
                  onSubmit={handleMeTooSubmit}
                  className="space-y-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <textarea
                    data-testid="custom-phrasing-textarea"
                    value={customPhrasing}
                    onChange={(e) => setCustomPhrasing(e.target.value)}
                    placeholder={APP_COPY.clusterDetail.meTooInputPlaceholder}
                    className="input-terminal w-full p-3 text-xs resize-none"
                    rows={3}
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPhrasingInput(false)}
                      className="w-1/2 font-mono text-[10px] uppercase text-ink-muted py-2 border border-[color:var(--raw-border-subtle)] rounded-lg hover:text-ink cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      data-testid="me-too-submit-button"
                      type="submit"
                      disabled={submitting || customPhrasing.trim() === ''}
                      className="w-1/2 h-9 bg-gradient-to-r from-brand-amber to-brand-coral text-slate-950 font-mono text-[10px] uppercase tracking-wider font-bold rounded-lg active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <ButtonSpinner size="xs" />
                          Submitting...
                        </span>
                      ) : (
                        'Add & Publish'
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="voted-success"
              className="p-4 bg-teal-500/10 border border-teal-500/25 text-center text-signal-teal"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <Check className="mx-auto h-6 w-6 text-signal-teal mb-1" />
              <span className="font-mono text-xs uppercase font-bold block">Voice Logged</span>
              <span className="text-[10px] text-ink-muted leading-normal block mt-1">
                {APP_COPY.clusterDetail.meTooSuccess}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {meTooError && (
          <motion.div
            className="mt-4 p-3.5 bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-red-300 text-[10px] text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{meTooError}</span>
          </motion.div>
        )}
      </div>
    </Panel>
  );
}
