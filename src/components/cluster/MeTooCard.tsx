'use client';

import { useState, type FormEvent } from 'react';
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

  const handleMeTooSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
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
    } catch (err: unknown) {
      console.error(err);
      setMeTooError(sanitizeError(err, 'Could not register your co-sign feedback.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (isCreator) {
    return (
      <Panel accent="coral" className="p-6">
        <div className="absolute top-0 right-0 p-4">
          <Flame className="h-5 w-5 text-status-matched" />
        </div>
        <h3 className="text-lg font-semibold text-ink font-serif">Your Problem Group</h3>
        <p className="text-sm text-ink-muted mt-1">
          You are the original reporter of this problem cluster.
        </p>
        <div className="mt-6">
          <div className="p-4 rounded-lg bg-status-solved/10 border border-status-solved/25 text-center text-status-solved">
            <Check className="mx-auto h-6 w-6 mb-1" />
            <span className="text-sm font-semibold block">Ownership Verified</span>
            <span className="text-xs text-ink-muted leading-normal block mt-1">
              You seeded this group. Your original phrasing has already been logged.
            </span>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel accent="coral" className="p-6">
      <div className="absolute top-0 right-0 p-4">
        <Flame className="h-5 w-5 text-accent" />
      </div>

      <h3 className="text-lg font-semibold text-ink font-serif">{APP_COPY.clusterDetail.meTooTitle}</h3>
      <p className="text-sm text-ink-muted mt-1">{APP_COPY.clusterDetail.meTooDesc}</p>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {!voted ? (
            <motion.div key="vote-actions" className="space-y-4">
              {!showPhrasingInput ? (
                <div className="space-y-2">
                  <button
                    data-testid="me-too-button"
                    onClick={() => handleMeTooSubmit()}
                    disabled={submitting}
                    className="w-full h-11 bg-accent text-white text-sm font-medium rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
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
                    className="w-full text-center text-xs text-ink-muted hover:text-ink cursor-pointer py-1"
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
                    className="input-field w-full p-3 text-sm resize-none"
                    rows={3}
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPhrasingInput(false)}
                      className="w-1/2 text-xs text-ink-muted py-2 border border-border rounded-lg hover:text-ink cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      data-testid="me-too-submit-button"
                      type="submit"
                      disabled={submitting || customPhrasing.trim() === ''}
                      className="w-1/2 h-9 bg-accent text-white text-xs font-medium rounded-lg active:scale-95 transition-all flex items-center justify-center cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
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
              className="p-4 rounded-lg bg-status-solved/10 border border-status-solved/25 text-center text-status-solved"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <Check className="mx-auto h-6 w-6 mb-1" />
              <span className="text-sm font-semibold block">Voice Logged</span>
              <span className="text-xs text-ink-muted leading-normal block mt-1">
                {APP_COPY.clusterDetail.meTooSuccess}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {meTooError && (
          <motion.div
            className="mt-4 p-3.5 rounded-lg bg-danger/10 border border-danger/30 flex items-center gap-2 text-danger text-xs text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{meTooError}</span>
          </motion.div>
        )}
      </div>
    </Panel>
  );
}
