'use client';

import { useId, useRef, useState } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_COPY } from '@/lib/config/copy';
import { ButtonSpinner } from '@/components/Loader';
import { fetchWithRetry } from '@/lib/fetch-retry';
import { sanitizeError } from '@/lib/sanitize-error';
import { useModalFocus } from '@/lib/useModalFocus';
import type { Cluster, Solution } from './types';

interface AddSolutionModalProps {
  clusterId: string;
  editingSolution: Solution | null;
  onClose: () => void;
  onSuccess: (cluster: Cluster) => void;
}

export default function AddSolutionModal({ clusterId, editingSolution, onClose, onSuccess }: AddSolutionModalProps) {
  const isEditing = !!editingSolution;
  const [solName, setSolName] = useState(editingSolution?.name || '');
  const [solUrl, setSolUrl] = useState(editingSolution?.url || '');
  const [solDesc, setSolDesc] = useState(editingSolution?.description || '');
  const [solBuilderName, setSolBuilderName] = useState(editingSolution?.builderName || '');
  const [solIconUrl, setSolIconUrl] = useState(editingSolution?.iconUrl || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModalFocus(onClose, dialogRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const endpoint = isEditing
      ? `/api/clusters/${clusterId}/solutions/${editingSolution!.id}`
      : `/api/clusters/${clusterId}/solutions`;

    // Client-side idempotency key so network retries on a brand-new listing
    // dedupe server-side instead of creating duplicates.
    const clientSolutionId = isEditing ? undefined : `sol_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      const res = await fetchWithRetry(endpoint, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: solName,
          url: solUrl,
          description: solDesc,
          builderName: solBuilderName,
          iconUrl: solIconUrl,
          solutionId: clientSolutionId,
        }),
        timeoutMs: 15000,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit solution.');
      }

      onSuccess(data.cluster);
      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      setError(sanitizeError(err, 'We could not publish your product solution listing.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2147483646]">
        <motion.div
          className="absolute inset-0 bg-ink/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Centering region starts below the sticky header (h-16) so the
            modal always keeps a fixed, predictable gap from the topbar,
            instead of an emergent margin from centering in the full
            viewport (which shrinks toward zero at high zoom / short
            viewports and reads as "touching the header"). */}
        <div className="absolute inset-x-0 top-16 bottom-0 flex items-center justify-center p-4">
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="relative panel-surface rounded-2xl max-w-lg w-full max-h-full overflow-y-auto p-6 sm:p-8 shadow-xl text-left outline-none"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          >
            <button
              onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-ink/5 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="solution-success"
                className="text-center space-y-4 py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="mx-auto w-12 h-12 bg-status-solved/10 border border-status-solved/30 rounded-full flex items-center justify-center text-status-solved mb-4">
                  <Check className="h-6 w-6" />
                </div>
                <h2 id={titleId} className="text-xl font-semibold font-serif text-ink">
                  {isEditing ? "Solution Updated Successfully!" : APP_COPY.solutions.successHeader}
                </h2>
                <p className="text-sm text-ink-muted leading-relaxed max-w-sm mx-auto">
                  {isEditing
                    ? "Your product listing updates have been published and are active immediately."
                    : APP_COPY.solutions.successDesc}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 text-sm font-medium bg-ink/5 hover:bg-ink/10 text-ink border border-border px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="solution-form"
                onSubmit={handleSubmit}
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div>
                  <h3 id={titleId} className="text-lg font-semibold text-ink font-serif">
                    {isEditing ? "Update Your Solution Listing" : APP_COPY.solutions.formTitle}
                  </h3>
                  <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                    {isEditing
                      ? "Modify your listed link, icon, and problem-solving description to match your product's latest features."
                      : APP_COPY.solutions.formSubtitle}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-ink-muted tracking-wide block font-medium">
                    {APP_COPY.solutions.productNameLabel}
                  </label>
                  <input
                    type="text"
                    value={solName}
                    onChange={(e) => setSolName(e.target.value)}
                    placeholder={APP_COPY.solutions.productNamePlaceholder}
                    className="input-field w-full px-4 py-2.5 text-sm select-text"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-ink-muted tracking-wide block font-medium">
                    {APP_COPY.solutions.productUrlLabel}
                  </label>
                  <input
                    type="url"
                    value={solUrl}
                    onChange={(e) => setSolUrl(e.target.value)}
                    placeholder={APP_COPY.solutions.productUrlPlaceholder}
                    className="input-field w-full px-4 py-2.5 text-sm select-text"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-ink-muted tracking-wide block font-medium flex justify-between">
                    <span>Product Icon Logo URL</span>
                    <span className="text-ink-muted font-normal">Optional</span>
                  </label>
                  <input
                    type="url"
                    value={solIconUrl}
                    onChange={(e) => setSolIconUrl(e.target.value)}
                    placeholder="e.g., https://my-app.com/logo.png"
                    className="input-field w-full px-4 py-2.5 text-sm select-text"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-ink-muted tracking-wide block font-medium">
                    {APP_COPY.solutions.descriptionLabel}
                  </label>
                  <textarea
                    value={solDesc}
                    onChange={(e) => setSolDesc(e.target.value)}
                    placeholder={APP_COPY.solutions.descriptionPlaceholder}
                    className="input-field w-full p-3 text-sm select-text resize-none h-20"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-ink-muted tracking-wide block font-medium flex justify-between">
                    <span>{APP_COPY.solutions.founderNameLabel}</span>
                    <span className="text-ink-muted font-normal">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={solBuilderName}
                    onChange={(e) => setSolBuilderName(e.target.value)}
                    placeholder={APP_COPY.solutions.founderNamePlaceholder}
                    className="input-field w-full px-4 py-2.5 text-sm select-text"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 flex items-center gap-2 text-danger text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-sm text-ink-muted px-5 py-2.5 rounded-lg hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 flex items-center justify-center gap-2 text-sm font-medium bg-accent text-white px-6 rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <ButtonSpinner size="sm" />
                        {APP_COPY.solutions.submitButtonLoading}
                      </span>
                    ) : (
                      isEditing ? "Update Solution" : APP_COPY.solutions.submitButtonText
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
