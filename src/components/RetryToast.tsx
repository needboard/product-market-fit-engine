'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export interface RetryToastItem {
  id: number;
  attempt: number;
  maxRetries: number;
  context: string;
}

interface RetryToastProps {
  toasts: RetryToastItem[];
  onDismiss: (id: number) => void;
}

const TOAST_DURATION_MS = 3000;

/**
 * Each toast drops down below the header when a request is being retried,
 * auto-dismisses after 3s, and is fully independent of other toasts (new
 * retries stack, never replace).
 */
export function RetryToast({ toasts, onDismiss }: RetryToastProps) {
  return (
    <div className="fixed top-20 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: RetryToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -90, opacity: 0 }}
      transition={{ type: 'spring', damping: 18, stiffness: 260 }}
      className="flex items-center gap-3 pl-4 pr-5 py-3 panel-surface rounded-xl shadow-lg pointer-events-auto"
    >
      <RefreshCw className="h-4 w-4 text-accent animate-spin shrink-0" />
      <div>
        <p className="text-xs font-medium text-ink leading-none">
          Retrying connection
        </p>
        <p className="text-xs text-ink-muted mt-1.5 leading-none">
          {toast.context} · Attempt {toast.attempt}/{toast.maxRetries}
        </p>
      </div>
    </motion.div>
  );
}
