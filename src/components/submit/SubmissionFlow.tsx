'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertTriangle, Check, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import { APP_COPY } from '@/lib/config/copy';
import { ButtonSpinner } from '@/components/Loader';
import { fetchWithRetry } from '@/lib/fetch-retry';
import { sanitizeError } from '@/lib/sanitize-error';
import { RetryToast, type RetryToastItem } from '@/components/RetryToast';
import { useAuth, SignInButton, Show } from '@/lib/clerk';
import Panel from '@/components/ui/Panel';
import SignalMeter from '@/components/SignalMeter';
import type { Cluster, DraftResult } from './types';

const MAX_QUERY_CHARS = 500;

const DEFAULT_TAXONOMY = [
  { id: 'software-devtools', label: 'Developer Tools & DX', description: 'Friction in local developer workflows, compilation bottlenecks, flaky testing environments, and monorepo configurations.' },
  { id: 'software-saas', label: 'SaaS & B2B Productivity', description: 'Administrative bottlenecks, calendar coordination headaches, and collaborative document syncing issues.' },
];

export default function SubmissionFlow({ onPublished }: { onPublished: () => void }) {
  const { isSignedIn } = useAuth();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittingMessage, setSubmittingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [retryToasts, setRetryToasts] = useState<RetryToastItem[]>([]);
  const showRetryToast = (attempt: number, context: string) => {
    setRetryToasts((prev) => [...prev, { id: Date.now() + Math.random(), attempt, maxRetries: 3, context }]);
  };
  const hideRetryToast = () => setRetryToasts([]);

  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCanonical, setCustomCanonical] = useState('');
  const [successResult, setSuccessResult] = useState<{ joinedCluster: boolean; cluster: Cluster } | null>(null);

  const isQueryTooLong = inputText.length > MAX_QUERY_CHARS;

  // Step 1: Submit Draft (Embed -> Similarity check -> Classify if no match)
  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) return;
    if (inputText.trim() === '') return;
    if (isQueryTooLong) return;

    setLoading(true);
    setLoadingMessage(APP_COPY.home.submitButtonLoading);
    setError(null);
    setDraft(null);
    setSuccessResult(null);

    // One UUID per logical draft attempt — retries reuse the same key so the server can dedupe
    const draftIdemKey = (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

    try {
      const response = await fetchWithRetry('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, draft: true }),
        idempotencyKey: draftIdemKey,
        onRetry: (attempt) => showRetryToast(attempt, 'signal lost, re-analyzing your problem'),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred during draft creation.');
      }

      setDraft(data);
      setSelectedCategory(data.proposedCategory);
      setCustomCanonical(data.proposedCanonicalText);
    } catch (err: any) {
      console.error(err);
      setError(sanitizeError(err, 'We are experiencing temporary database latency.'));
    } finally {
      setLoading(false);
      setLoadingMessage('');
      hideRetryToast();
    }
  };

  // Step 2: Confirm & Finalize (Write to DB)
  const handleConfirmSubmission = async () => {
    if (!isSignedIn || !draft) return;

    setSubmitting(true);
    setSubmittingMessage(APP_COPY.draftResult.publishButtonLoading);
    setError(null);

    const matchingCategoryObj = DEFAULT_TAXONOMY.find(c => c.id === selectedCategory) || {
      id: selectedCategory,
      label: draft.proposedCategoryLabel,
      description: draft.proposedCategoryDescription
    };

    // One UUID per logical finalize attempt — retries reuse the same key
    const finalizeIdemKey = (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

    try {
      const response = await fetchWithRetry('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          draft: false,
          confirmedCategory: selectedCategory,
          confirmedCategoryLabel: matchingCategoryObj.label,
          confirmedCategoryDescription: matchingCategoryObj.description,
          confirmedCanonicalText: customCanonical,
        }),
        idempotencyKey: finalizeIdemKey,
        onRetry: (attempt) => showRetryToast(attempt, 'signal lost, re-publishing your report'),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred while publishing.');
      }

      setSuccessResult({ joinedCluster: data.joinedCluster, cluster: data.cluster });
      onPublished();
      setInputText('');
      setDraft(null);
    } catch (err: any) {
      setError(sanitizeError(err, 'We could not complete publishing.'));
    } finally {
      setSubmitting(false);
      setSubmittingMessage('');
      hideRetryToast();
    }
  };

  return (
    <motion.div
      className="lg:col-span-7 w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      <RetryToast
        toasts={retryToasts}
        onDismiss={(id) => setRetryToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      <AnimatePresence mode="wait">
        {!draft && !successResult ? (
          <motion.form onSubmit={handleSubmitDraft} exit={{ opacity: 0, scale: 0.95 }}>
            <Panel accent="amber">
              <div className="w-full px-4 pt-4 pb-3">
                <textarea
                  data-testid="problem-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={APP_COPY.home.inputPlaceholder}
                  className="w-full bg-transparent text-ink placeholder-ink-muted focus:outline-none resize-none h-24 text-sm py-1 leading-relaxed"
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 pb-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-ink-muted select-none sm:gap-6 min-w-0 flex-1">
                  <span className="truncate">
                    {isQueryTooLong ? (
                      <span className="text-danger flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 inline" /> {APP_COPY.home.characterWarning}
                      </span>
                    ) : (
                      <span className="truncate">{APP_COPY.home.inputContextHelp}</span>
                    )}
                  </span>
                  <div className="shrink-0 flex items-center gap-2 font-mono">
                    <SignalMeter value={inputText.length} max={MAX_QUERY_CHARS} tone="capacity" size="sm" />
                    <span className={isQueryTooLong ? 'text-danger font-semibold' : ''}>
                      {inputText.length}/{MAX_QUERY_CHARS}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSignedIn ? (
                    <button
                      type="submit"
                      disabled={loading || inputText.trim() === '' || isQueryTooLong}
                      className="w-full sm:w-auto h-11 flex items-center justify-center gap-2 text-sm font-semibold bg-accent text-white px-8 rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <ButtonSpinner size="sm" />
                          {loadingMessage || APP_COPY.home.submitButtonLoading}
                        </span>
                      ) : (
                        <>{APP_COPY.home.submitButtonText} <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  ) : (
                    <Show when={'signed-out'}>
                      <SignInButton mode="modal">
                        <button
                          type="button"
                          className="w-full sm:w-auto h-11 flex items-center justify-center gap-2 text-sm font-semibold bg-ink/5 hover:bg-ink/10 text-ink-muted px-8 rounded-lg active:scale-95 transition-all cursor-pointer"
                        >
                          {APP_COPY.home.submitButtonText}
                        </button>
                      </SignInButton>
                    </Show>
                  )}
                </div>
              </div>
            </Panel>
          </motion.form>
        ) : draft && !successResult ? (
          // STEP 2: DRAFT RESOLUTION SCREEN (MEET MATCH OR CREATE NEW)
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Panel accent="amber" className="text-left p-6 sm:p-8">
              {draft.mode === 'match' ? (
                <div>
                  <div className="flex items-center gap-2 text-accent text-xs uppercase tracking-wide font-semibold mb-4">
                    <TrendingUp className="h-4 w-4" /> {APP_COPY.draftResult.matchHeader}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold text-ink leading-tight">
                    {APP_COPY.draftResult.matchTitle}
                  </h2>
                  <p className="text-ink-muted text-sm mt-2">
                    {APP_COPY.draftResult.matchDesc}
                  </p>
                  {draft.cluster && (
                    <div className="mt-3 flex items-center gap-3">
                      <SignalMeter value={draft.cluster.memberCount} max={Math.max(draft.cluster.memberCount, 20)} size="sm" />
                      <span className="text-xs font-semibold text-accent">
                        {draft.cluster.memberCount} {APP_COPY.draftResult.peopleAffected}
                      </span>
                    </div>
                  )}

                  <div className="mt-6 p-5 rounded-xl border border-border bg-ink/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-2 py-1 text-[10px] tracking-wide text-ink-muted bg-bg-panel uppercase rounded-bl-lg border-l border-b border-border">
                      {APP_COPY.draftResult.clusterLabel}
                    </div>
                    <div className="text-[10px] text-accent tracking-wide font-semibold mb-1 uppercase">
                      {draft.cluster?.categoryLabel}
                    </div>
                    <p className="text-ink text-base font-medium leading-relaxed pr-12">
                      &quot;{draft.cluster?.canonicalText}&quot;
                    </p>

                    <div className="mt-4 border-t border-border pt-4">
                      <span className="text-[11px] text-ink-muted uppercase tracking-wide block mb-2">How others expressed it</span>
                      <ul className="space-y-1 text-xs text-ink-muted italic">
                        {draft.cluster?.sampleVariants.slice(0, 3).map((variant, i) => (
                          <li key={i} className="line-clamp-1">• &quot;{variant}&quot;</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-end">
                    <button
                      onClick={() => { setDraft(null); setError(null); }}
                      className="w-full sm:w-auto px-5 py-2.5 text-sm text-ink-muted hover:text-ink transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      data-testid="confirm-merge-button"
                      onClick={handleConfirmSubmission}
                      disabled={submitting}
                      className="w-full sm:w-auto h-11 flex items-center justify-center gap-2 text-sm font-semibold bg-accent text-white px-6 rounded-lg hover:opacity-90 transition-all cursor-pointer"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <ButtonSpinner size="sm" />
                          {submittingMessage || APP_COPY.draftResult.publishButtonLoading}
                        </span>
                      ) : (
                        APP_COPY.draftResult.publishButtonText
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-status-matched text-xs uppercase tracking-wide font-semibold mb-4">
                    <Sparkles className="h-4 w-4" /> {APP_COPY.draftResult.newHeader}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold text-ink leading-tight">
                    {APP_COPY.draftResult.newTitle}
                  </h2>
                  <p className="text-ink-muted text-sm mt-2">
                    {APP_COPY.draftResult.newDesc}
                  </p>

                  <div className="mt-6 space-y-6">
                    <div>
                      <label className="text-xs text-ink-muted tracking-wide block uppercase mb-1.5 font-medium">
                        {APP_COPY.draftResult.proposedCanonicalLabel}
                      </label>
                      <input
                        type="text"
                        value={customCanonical}
                        onChange={(e) => setCustomCanonical(e.target.value)}
                        className="input-field w-full px-4 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-ink-muted tracking-wide block uppercase mb-1.5 font-medium flex justify-between">
                        <span>{APP_COPY.draftResult.proposedCategoryLabel}</span>
                        <span className="text-[11px] text-ink-muted font-normal normal-case">Correct if wrong</span>
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input-field w-full px-3 py-2.5 text-sm cursor-pointer"
                      >
                        {DEFAULT_TAXONOMY.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                        {selectedCategory !== '' && !DEFAULT_TAXONOMY.some(c => c.id === selectedCategory) && (
                          <option value={selectedCategory}>
                            {draft.proposedCategoryLabel} (Auto-Generated)
                          </option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-end">
                    <button
                      onClick={() => { setDraft(null); setError(null); }}
                      className="w-full sm:w-auto px-5 py-2.5 text-sm text-ink-muted hover:text-ink transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      data-testid="confirm-new-button"
                      onClick={handleConfirmSubmission}
                      disabled={submitting}
                      className="w-full sm:w-auto h-11 flex items-center justify-center gap-2 text-sm font-semibold bg-accent text-white px-6 rounded-lg hover:opacity-90 transition-all cursor-pointer"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <ButtonSpinner size="sm" />
                          {submittingMessage || APP_COPY.draftResult.publishButtonLoading}
                        </span>
                      ) : (
                        APP_COPY.draftResult.publishButtonText
                      )}
                    </button>
                  </div>
                </div>
              )}
            </Panel>
          </motion.div>
        ) : (
          // STEP 3: SUCCESS CONFIRMATION
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Panel accent="coral" className="text-center p-8">
              <div className="mx-auto w-12 h-12 bg-status-solved/15 border border-status-solved/30 rounded-full flex items-center justify-center text-status-solved mb-4">
                <Check className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-serif font-semibold text-ink">
                {APP_COPY.draftResult.successHeader}
              </h2>

              {successResult?.joinedCluster ? (
                <p className="text-ink-muted text-sm mt-3 leading-relaxed">
                  {APP_COPY.draftResult.successMatchedDesc} <span className="text-ink block font-medium mt-1 italic">&quot;{successResult.cluster.canonicalText}&quot;</span>
                </p>
              ) : (
                <p className="text-ink-muted text-sm mt-3 leading-relaxed">
                  {APP_COPY.draftResult.successSeededDesc} <span className="text-ink block font-medium mt-1 italic">&quot;{successResult?.cluster.canonicalText}&quot;</span>
                </p>
              )}

              {successResult?.cluster && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <SignalMeter value={successResult.cluster.memberCount} max={Math.max(successResult.cluster.memberCount, 20)} size="sm" />
                  <span className="text-xs text-ink-muted">
                    Signal now at <strong className="text-status-solved">{successResult.cluster.memberCount}</strong>
                  </span>
                </div>
              )}

              <div className="mt-8 flex items-center gap-4 justify-center">
                <Link
                  href={`/cluster/${successResult?.cluster.id}`}
                  className="text-sm font-semibold bg-ink/5 hover:bg-ink/10 px-5 py-2.5 rounded-lg border border-border text-ink flex items-center gap-2 cursor-pointer"
                >
                  {APP_COPY.draftResult.viewDetailsButton} <ChevronRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => { setSuccessResult(null); setDraft(null); setInputText(''); setError(null); }}
                  className="text-sm font-semibold bg-accent hover:opacity-90 text-white px-5 py-2.5 rounded-lg cursor-pointer"
                >
                  {APP_COPY.draftResult.submitAnotherButton}
                </button>
              </div>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          className="mt-4 p-4 rounded-lg bg-danger/10 border border-danger/30 flex items-center gap-2 text-danger text-xs text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className='submit-error'>{error}</span>
        </motion.div>
      )}
    </motion.div>
  );
}
