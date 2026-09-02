'use client';

import { useState } from 'react';
import { ArrowUp, ExternalLink, Pencil, Trash2, Globe, AlertTriangle, MessageCircle } from 'lucide-react';
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
      className="p-6 rounded-xl panel-surface status-stripe-solved flex flex-col gap-4"
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
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors cursor-pointer ${
              hasUpvoted
                ? 'bg-accent/10 text-accent border-accent/30'
                : 'bg-ink/5 text-ink-muted border-border hover:bg-ink/10 hover:text-ink'
            }`}
            title={hasUpvoted ? "Remove Upvote" : "Upvote"}
          >
            <ArrowUp className="h-4 w-4" />
          </button>

          <span className={`font-mono text-xs font-semibold w-8 text-center transition-colors ${
            hasUpvoted ? 'text-accent' : hasDownvoted ? 'text-danger' : 'text-ink-muted'
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
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors cursor-pointer ${
              hasDownvoted
                ? 'bg-danger/10 text-danger border-danger/30'
                : 'bg-ink/5 text-ink-muted border-border hover:bg-ink/10 hover:text-ink'
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
              className="w-10 h-10 rounded-lg bg-ink/5 border border-border shrink-0 object-contain select-none"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold text-ink">{sol.name}</h4>
                <a
                  href={sol.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-muted hover:text-accent p-1 rounded hover:bg-ink/5 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {sol.builderId === userId && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => onEditStart(sol)}
                      className="p-1.5 rounded-lg bg-ink/5 border border-border hover:bg-accent/10 text-ink-muted hover:text-accent cursor-pointer transition-colors"
                      title="Edit Listing"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteRequest(sol.id)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg bg-ink/5 border border-border hover:bg-danger/10 text-ink-muted hover:text-danger cursor-pointer transition-colors"
                      title="Delete Listing"
                    >
                      {isDeleting ? <ButtonSpinner size="xs" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}
              </div>
              <span className="text-xs text-ink-muted block flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Listed by {sol.builderName}</span>
                {sol.builderBio && (
                  <span className="text-ink-muted italic">({sol.builderBio})</span>
                )}
                {sol.builderGithub && (
                  <a href={sol.builderGithub} target="_blank" rel="noopener noreferrer" className="text-ink-muted hover:text-ink p-0.5 transition-colors" title="Builder GitHub Profile">
                    <GithubIcon className="h-3 w-3 inline -mt-0.5" />
                  </a>
                )}
                {sol.builderWebsite && (
                  <a href={sol.builderWebsite} target="_blank" rel="noopener noreferrer" className="text-ink-muted hover:text-ink p-0.5 transition-colors" title="Builder Personal Website">
                    <Globe className="h-3 w-3 inline -mt-0.5" />
                  </a>
                )}
              </span>
            </div>
          </div>
          <p className="text-ink-muted text-sm leading-relaxed pt-2">{sol.description}</p>
        </div>
      </div>

      {/* Card Footer: Reviews toggle and dynamic stars rating */}
      <div className="flex items-center gap-4 pt-3 border-t border-border flex-wrap">
        <button
          onClick={toggleExpansion}
          className={`text-xs font-medium cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            isExpanded
              ? 'bg-accent/10 text-accent'
              : 'bg-ink/5 text-ink-muted hover:bg-ink/10 hover:text-ink'
          }`}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Reviews ({reviews ? reviews.length : 'View'})
        </button>

        {reviews && reviews.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-accent">
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
            className="space-y-4 pt-4 border-t border-border text-left overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between gap-4">
              <h5 className="text-xs text-ink-muted uppercase tracking-wider font-semibold">
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
                  className="text-xs font-medium bg-ink/5 hover:bg-ink/10 text-ink-muted border border-border px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {APP_COPY.reviews.addReviewButton}
                </button>
              )}
            </div>

            {showReviewForm && (
              <motion.form
                onSubmit={handleReviewSubmit}
                className="p-4 rounded-lg bg-ink/[0.03] border border-border space-y-4"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-muted font-medium">
                    {APP_COPY.reviews.ratingLabel}:
                  </span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRevRating(star)}
                        className={`text-base transition-colors cursor-pointer ${star <= revRating ? 'text-accent' : 'text-ink-muted hover:text-ink'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-ink-muted font-medium block">
                    {APP_COPY.reviews.reviewTextLabel}
                  </label>
                  <textarea
                    value={revText}
                    onChange={(e) => setRevText(e.target.value)}
                    placeholder={APP_COPY.reviews.reviewTextPlaceholder}
                    className="input-field w-full p-3 text-sm h-16 resize-none"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end justify-between">
                  <div className="w-full sm:w-1/2 space-y-1">
                    <label className="text-xs text-ink-muted font-medium block flex justify-between">
                      <span>{APP_COPY.reviews.reviewerNameLabel}</span>
                      <span className="text-ink-muted font-normal">Optional</span>
                    </label>
                    <input
                      type="text"
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      placeholder={APP_COPY.reviews.reviewerNamePlaceholder}
                      className="input-field w-full px-3 py-1.5 text-sm"
                    />
                  </div>

                  {reviewError && (
                    <div className="p-2 rounded-lg bg-danger/10 border border-danger/30 flex items-center gap-1.5 text-danger text-xs text-left">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>{reviewError}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="text-xs text-ink-muted py-2 px-3 border border-border rounded-lg hover:text-ink cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="h-8 flex items-center justify-center gap-1.5 text-xs font-medium bg-accent text-white px-4 rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-50"
                    >
                      {submittingReview ? (
                        <span className="flex items-center gap-1.5">
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
                  <div key={rev._id || rev.createdAt} className="p-3.5 rounded-lg bg-ink/[0.03] border border-border space-y-1.5 text-left">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink">{rev.userName}</span>
                        <span className="text-accent text-xs select-none">
                          {'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}
                        </span>
                      </div>
                      <span className="text-xs text-ink-muted">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-ink-muted text-sm leading-relaxed">{rev.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted italic py-2">
                {APP_COPY.reviews.noReviews}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
