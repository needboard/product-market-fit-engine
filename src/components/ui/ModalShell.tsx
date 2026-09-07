'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  /** Icon rendered inside the icon well (top of the card). */
  icon: ReactNode;
  /** Background/border classes for the icon well circle. */
  iconWellClass: string;
  /** Accepted for API compatibility; unused now that panels are flat. */
  accentGlowClass?: string;
  title: string;
  message: string;
  /** Extra classes appended to the title heading. */
  titleClassName?: string;
  /** Extra classes appended to the close (X) button, e.g. a test hook class. */
  closeButtonClassName?: string;
  closeButtonTestId?: string;
  /** Action row(s) rendered below the message — varies per modal type. */
  children: ReactNode;
}

/**
 * Shared modal chrome: backdrop overlay + flat panel card + icon-well/title/
 * body layout. Callers own their icon theming and action buttons; this
 * component owns only the shell and animation.
 */
export default function ModalShell({
  isOpen,
  onClose,
  icon,
  iconWellClass,
  title,
  message,
  titleClassName = '',
  closeButtonClassName = '',
  closeButtonTestId,
  children,
}: ModalShellProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2147483645]">

          {/* Backdrop */}
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
              viewports). */}
          <div className="absolute inset-x-0 top-16 bottom-0 flex items-center justify-center p-4">
            {/* Modal Card */}
            <motion.div
              className="relative panel-surface rounded-2xl max-w-sm w-full max-h-full overflow-y-auto p-6 sm:p-8 shadow-xl text-center"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                data-testid={closeButtonTestId}
                className={`${closeButtonClassName} absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-ink/5 transition-colors cursor-pointer`}
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Type Icon */}
              <div className={`mx-auto w-12 h-12 rounded-full border flex items-center justify-center mb-5 ${iconWellClass}`}>
                {icon}
              </div>

              {/* Title & Description */}
              <h3 className={`text-xl font-serif font-semibold text-ink leading-snug ${titleClassName}`}>
                {title}
              </h3>
              <p className="text-sm text-ink-muted mt-3 leading-relaxed max-w-xs mx-auto">
                {message}
              </p>

              {children}

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
