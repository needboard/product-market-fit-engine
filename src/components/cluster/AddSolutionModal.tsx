'use client';

import { useState } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_COPY } from '@/lib/config/copy';
import { ButtonSpinner } from '@/components/Loader';
import { fetchWithRetry } from '@/lib/fetch-retry';
import { sanitizeError } from '@/lib/sanitize-error';
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
    } catch (err: any) {
      console.error(err);
      setError(sanitizeError(err, 'We could not publish your product solution listing.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2147483646] flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-bg-void/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="relative bg-bg-panel max-w-lg w-full p-6 sm:p-8 shadow-2xl overflow-hidden text-left hud-corners-coral"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
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
                <div className="mx-auto w-12 h-12 bg-teal-500/25 border border-teal-500/50 rounded-full flex items-center justify-center text-signal-teal mb-4 animate-bounce">
                  <Check className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold font-sans text-ink">
                  {isEditing ? "Solution Updated Successfully!" : APP_COPY.solutions.successHeader}
                </h2>
                <p className="text-xs text-ink-muted leading-relaxed font-sans max-w-sm mx-auto">
                  {isEditing
                    ? "Your product listing updates have been published and are active immediately."
                    : APP_COPY.solutions.successDesc}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 font-mono text-xs uppercase font-bold bg-white/10 hover:bg-white/15 text-ink border border-[color:var(--raw-border-subtle)] px-6 py-2.5 rounded-xl transition-all cursor-pointer"
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
                  <h3 className="text-lg font-bold text-ink font-sans">
                    {isEditing ? "Update Your Solution Listing" : APP_COPY.solutions.formTitle}
                  </h3>
                  <p className="text-xs text-ink-muted mt-1 font-sans leading-relaxed">
                    {isEditing
                      ? "Modify your listed link, icon, and problem-solving description to match your product's latest features."
                      : APP_COPY.solutions.formSubtitle}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-ink-muted tracking-wider block uppercase font-bold">
                    {APP_COPY.solutions.productNameLabel}
                  </label>
                  <input
                    type="text"
                    value={solName}
                    onChange={(e) => setSolName(e.target.value)}
                    placeholder={APP_COPY.solutions.productNamePlaceholder}
                    className="input-terminal w-full px-4 py-2.5 text-xs select-text"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-ink-muted tracking-wider block uppercase font-bold">
                    {APP_COPY.solutions.productUrlLabel}
                  </label>
                  <input
                    type="url"
                    value={solUrl}
                    onChange={(e) => setSolUrl(e.target.value)}
                    placeholder={APP_COPY.solutions.productUrlPlaceholder}
                    className="input-terminal w-full px-4 py-2.5 text-xs select-text"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-ink-muted tracking-wider block uppercase font-bold flex justify-between">
                    <span>Product Icon Logo URL</span>
                    <span className="text-[9px] text-ink-muted font-normal lowercase normal-case">Optional</span>
                  </label>
                  <input
                    type="url"
                    value={solIconUrl}
                    onChange={(e) => setSolIconUrl(e.target.value)}
                    placeholder="e.g., https://my-app.com/logo.png"
                    className="input-terminal w-full px-4 py-2.5 text-xs select-text"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-ink-muted tracking-wider block uppercase font-bold">
                    {APP_COPY.solutions.descriptionLabel}
                  </label>
                  <textarea
                    value={solDesc}
                    onChange={(e) => setSolDesc(e.target.value)}
                    placeholder={APP_COPY.solutions.descriptionPlaceholder}
                    className="input-terminal w-full p-3 text-xs select-text resize-none h-20"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-ink-muted tracking-wider block uppercase font-bold flex justify-between">
                    <span>{APP_COPY.solutions.founderNameLabel}</span>
                    <span className="text-[9px] text-ink-muted font-normal lowercase normal-case">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={solBuilderName}
                    onChange={(e) => setSolBuilderName(e.target.value)}
                    placeholder={APP_COPY.solutions.founderNamePlaceholder}
                    className="input-terminal w-full px-4 py-2.5 text-xs select-text"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-red-300 text-xs">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-mono text-xs uppercase text-ink-muted px-5 py-2.5 rounded-xl hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 flex items-center justify-center gap-2 font-mono text-xs tracking-wider uppercase font-bold bg-gradient-to-r from-teal-500 to-amber-500 text-slate-950 px-6 rounded-xl hover:opacity-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
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
    </AnimatePresence>
  );
}
