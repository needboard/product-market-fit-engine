'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { ButtonSpinner } from '@/components/Loader';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ExploreEmailGate({ onUnlock }: { onUnlock: (email: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source: 'explore-gate' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Could not save your email.');
      }
      onUnlock(trimmed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      setError(message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="text-center py-10 rounded-xl border border-dashed border-border">
      <div className="mx-auto w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
        <Lock className="h-4 w-4" />
      </div>
      <h2 className="text-base font-semibold text-ink">There are a lot more problems waiting</h2>
      <p className="text-sm text-ink-muted mt-1 max-w-sm mx-auto">
        Enter your email to unlock the full catalogue — we&apos;ll remember you next time.
      </p>

      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-5 text-sm font-medium bg-accent text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          View more problems
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 max-w-sm mx-auto space-y-2">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              className="input-field flex-1 px-3 py-2 text-sm"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || email.trim() === ''}
              className="h-10 shrink-0 px-4 text-sm font-medium bg-accent text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
            >
              {submitting ? <ButtonSpinner size="xs" /> : 'Unlock'}
            </button>
          </div>
          {error && <p className="text-xs text-danger text-left">{error}</p>}
        </form>
      )}
    </div>
  );
}
