'use client';

import { useState } from 'react';
import { ArrowUp, ExternalLink, Pencil, Trash2, Globe, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_COPY } from '@/lib/config/copy';
import { ButtonSpinner } from '@/components/Loader';
import { fetchWithRetry } from '@/lib/fetch-retry';
import { sanitizeError } from '@/lib/sanitize-error';
import GithubIcon from '@/components/icons/GithubIcon';
import type { Solution, Review } from './types';

interface SolutionCardProps {
  solution: Solution;
  clusterId: string;
  userId: string | null | undefined;
  isUpvoting: boolean;
  isDeleting: boolean;
  onVote: (solutionId: string, voteType: 'up' | 'down') => void;
  onEditStart: (solution: Solution) => void;
  onDeleteRequest: (solutionId: string) => void;
}

export default function SolutionCard({
  solution: sol,
  clusterId,
  userId,
  isUpvoting,
  isDeleting,
  onVote,
  onEditStart,
  onDeleteRequest,
}: SolutionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [revRating, setRevRating] = useState(5);
  const [revText, setRevText] = useState('');
  const [revName, setRevName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const hasUpvoted = !!(userId && sol.votesUserIds?.includes(userId));
  const hasDownvoted = !!(userId && sol.downvotedUserIds?.includes(userId));

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetchWithRetry(`/api/clusters/${clusterId}/solutions/${sol.id}/reviews`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const toggleExpansion = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next && reviews === null) {
      fetchReviews();
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await fetchWithRetry(`/api/clusters/${clusterId}/solutions/${sol.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: revRating, text: revText, userName: revName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit review.');
      }

      setReviews((prev) => [data.review, ...(prev || [])]);
      setRevRating(5);
      setRevText('');
      setRevName('');
      setShowReviewForm(false);
    } catch (err: any) {
      console.error(err);
      setReviewError(sanitizeError(err, 'Could not post your product review.'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : null;

  return (
    <motion.div
      className="p-6 bg-bg-panel/40 flex flex-col gap-4 transition-all duration-300 shadow-xl glass-card animate-fade-in hud-corners-coral"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Top Solution Info Row */}
      <div className="flex flex-row items-start gap-6">
        {/* Vote Stack Column */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 select-none">
          <button
            onClick={() => onVote(sol.id, 'up')}
            disabled={isUpvoting}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all cursor-pointer ${
              hasUpvoted
                ? 'bg-amber-500/20 text-brand-amber border-brand-amber/35'
                : 'bg-bg-void/40 text-ink-muted border-[color:var(--raw-border-subtle)] hover:bg-bg-void/80 hover:text-ink animate-pulse-subtle'
            }`}
            title={hasUpvoted ? "Remove Upvote" : "Upvote"}
          >
            <ArrowUp className="h-4 w-4" />
          </button>

          <span className={`font-mono text-[11px] font-bold w-8 text-center transition-colors ${
            hasUpvoted ? 'text-brand-amber' : hasDownvoted ? 'text-rose-500' : 'text-ink-muted'
          }`}>
            {isUpvoting ? (
              <div className="flex justify-center"><ButtonSpinner size="xs" /></div>
            ) : (
              (sol.upvotes || 0) > 0 ? `+${sol.upvotes}` : sol.upvotes
            )}
          </span>

          <button
            onClick={() => onVote(sol.id, 'down')}
            disabled={isUpvoting}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all cursor-pointer ${
              hasDownvoted
                ? 'bg-rose-500/20 text-rose-500 border-rose-500/35'
                : 'bg-bg-void/40 text-ink-muted border-[color:var(--raw-border-subtle)] hover:bg-bg-void/80 hover:text-ink animate-pulse-subtle'
            }`}
            title={hasDownvoted ? "Remove Downvote" : "Downvote"}
          >
            <ArrowUp className="h-4 w-4 rotate-180" />
          </button>
        </div>

        {/* Product Content Column */}
        <div className="flex-grow space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <img
              src={sol.iconUrl || "/placeholder-solution-icon.png"}
              alt={`${sol.name} icon`}
              className="w-10 h-10 rounded-xl bg-bg-void border border-white/10 shrink-0 object-contain select-none"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-ink">{sol.name}</h4>
                <a
                  href={sol.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-muted hover:text-signal-amber p-1 rounded hover:bg-white/5 transition-all"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {sol.builderId === userId && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => onEditStart(sol)}
                      className="p-1.5 rounded-lg bg-white/5 border border-[color:var(--raw-border-subtle)] hover:border-amber-500/35 hover:bg-amber-500/10 text-ink-muted hover:text-amber-400 cursor-pointer transition-all"
                      title="Edit Listing"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteRequest(sol.id)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg bg-white/5 border border-[color:var(--raw-border-subtle)] hover:border-red-500/35 hover:bg-red-500/10 text-ink-muted hover:text-red-400 cursor-pointer transition-all"
                      title="Delete Listing"
                    >
                      {isDeleting ? <ButtonSpinner size="xs" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[9px] font-mono text-ink-muted uppercase tracking-widest block flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Listed by {sol.builderName}</span>
                {sol.builderBio && (
                  <span className="text-ink-muted italic normal-case font-sans">({sol.builderBio})</span>
                )}
                {sol.builderGithub && (
                  <a href={sol.builderGithub} target="_blank" rel="noopener noreferrer" className="text-ink-muted hover:text-ink-muted p-0.5 transition-colors" title="Builder GitHub Profile">
                    <GithubIcon className="h-3 w-3 inline -mt-0.5" />
                  </a>
                )}
                {sol.builderWebsite && (
                  <a href={sol.builderWebsite} target="_blank" rel="noopener noreferrer" className="text-ink-muted hover:text-ink-muted p-0.5 transition-colors" title="Builder Personal Website">
                    <Globe className="h-3 w-3 inline -mt-0.5" />
                  </a>
                )}
              </span>
            </div>
          </div>
          <p className="text-ink-muted text-sm leading-relaxed font-sans pt-2">{sol.description}</p>
        </div>
      </div>

      {/* Card Footer: Reviews toggle and dynamic stars rating */}
      <div className="flex items-center gap-4 pt-3 border-t border-[color:var(--raw-border-subtle)] flex-wrap">
        <button
          onClick={toggleExpansion}
          className={`font-mono text-[9px] uppercase tracking-widest font-bold cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
            isExpanded
              ? 'bg-amber-500/10 text-signal-amber border border-amber-500/20'
              : 'bg-white/5 text-ink-muted hover:bg-white/10 hover:text-ink border border-transparent'
          }`}
        >
          💬 Reviews ({reviews ? reviews.length : 'View'})
        </button>

        {reviews && reviews.length > 0 && (
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-signal-amber uppercase tracking-widest">
            <span>
              {Array.from({ length: 5 }).map((_, starIdx) => (starIdx < Math.round(avgRating || 0) ? '★' : '☆')).join('')}
            </span>
            <span className="text-ink-muted">({(avgRating || 0).toFixed(1)} / 5.0)</span>
          </div>
        )}
      </div>

      {/* Collapsible Reviews Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="space-y-4 pt-4 border-t border-[color:var(--raw-border-subtle)] text-left overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between gap-4">
              <h5 className="font-mono text-[10px] text-ink-muted uppercase tracking-widest font-bold">
                {APP_COPY.reviews.title}
              </h5>
              {userId && !showReviewForm && !(reviews || []).some(r => r.userId === userId) && (
                <button
                  onClick={() => {
                    setRevRating(5);
                    setRevText('');
                    setRevName('');
                    setReviewError(null);
                    setShowReviewForm(true);
                  }}
                  className="font-mono text-[8px] uppercase tracking-wider font-bold bg-white/5 hover:bg-white/10 text-ink-muted border border-[color:var(--raw-border-subtle)] px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                >
                  {APP_COPY.reviews.addReviewButton}
                </button>
              )}
            </div>

            {showReviewForm && (
              <motion.form
                onSubmit={handleReviewSubmit}
                className="p-4 bg-bg-void/40 border border-[color:var(--raw-border-subtle)] space-y-4"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] text-ink-muted uppercase tracking-widest font-bold">
                    {APP_COPY.reviews.ratingLabel}:
                  </span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRevRating(star)}
                        className={`text-base transition-colors cursor-pointer ${star <= revRating ? 'text-signal-amber' : 'text-ink-muted hover:text-ink-muted'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-ink-muted uppercase tracking-widest font-bold block">
                    {APP_COPY.reviews.reviewTextLabel}
                  </label>
                  <textarea
                    value={revText}
                    onChange={(e) => setRevText(e.target.value)}
                    placeholder={APP_COPY.reviews.reviewTextPlaceholder}
                    className="input-terminal w-full p-3 text-xs h-16 resize-none"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end justify-between">
                  <div className="w-full sm:w-1/2 space-y-1">
                    <label className="font-mono text-[9px] text-ink-muted uppercase tracking-widest font-bold block flex justify-between">
                      <span>{APP_COPY.reviews.reviewerNameLabel}</span>
                      <span className="text-[8px] text-ink-muted font-normal lowercase normal-case">Optional</span>
                    </label>
                    <input
                      type="text"
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      placeholder={APP_COPY.reviews.reviewerNamePlaceholder}
                      className="input-terminal w-full px-3 py-1.5 text-xs"
                    />
                  </div>

                  {reviewError && (
                    <div className="p-2 bg-red-950/40 border border-red-500/30 flex items-center gap-1.5 text-red-300 text-[10px] text-left">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>{reviewError}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="font-mono text-[9px] uppercase text-ink-muted py-2 px-3 border border-[color:var(--raw-border-subtle)] rounded-lg hover:text-ink cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="h-8 flex items-center justify-center gap-1 font-mono text-[9px] tracking-wider uppercase font-bold bg-gradient-to-r from-teal-500 to-amber-500 text-slate-950 px-4 rounded-lg hover:opacity-95 cursor-pointer disabled:opacity-50"
                    >
                      {submittingReview ? (
                        <span className="flex items-center gap-1">
                          <ButtonSpinner size="xs" />
                          {APP_COPY.reviews.submitButtonLoading}
                        </span>
                      ) : (
                        APP_COPY.reviews.submitButton
                      )}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}

            {loadingReviews ? (
              <div className="flex justify-center py-4">
                <ButtonSpinner size="sm" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div key={rev._id || rev.createdAt} className="p-3.5 bg-bg-void/30 border border-[color:var(--raw-border-subtle)] space-y-1.5 text-left">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink-muted">{rev.userName}</span>
                        <span className="text-signal-amber text-xs select-none">
                          {'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}
                        </span>
                      </div>
                      <span className="font-mono text-[8px] text-ink-muted uppercase">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-ink-muted text-xs font-sans leading-relaxed">{rev.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink-muted font-sans italic py-2">
                {APP_COPY.reviews.noReviews}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
