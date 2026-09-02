'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  /** Icon rendered inside the glowing icon well (top of the card). */
  icon: ReactNode;
  /** Background/border/shadow classes for the icon well circle. */
  iconWellClass: string;
  /** Ambient glow-spot classes (e.g. "bg-teal-500/5"). */
  accentGlowClass: string;
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
 * Shared modal chrome: backdrop overlay + panel card + icon-well/title/body
 * layout. Extracted from AlertModal/ConfirmModal, which previously
 * re-implemented this shell independently. Callers own their icon theming
 * and action buttons; this component owns only the shell and animation.
 */
export default function ModalShell({
  isOpen,
  onClose,
  icon,
  iconWellClass,
  accentGlowClass,
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
        <div className="fixed inset-0 z-[2147483645] flex items-center justify-center p-4">

          {/* Backdrop Blur */}
          <motion.div
            className="absolute inset-0 bg-bg-void/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Card Content */}
          <motion.div
            className="relative bg-bg-panel max-w-sm w-full p-6 sm:p-8 shadow-2xl overflow-hidden text-center backdrop-blur-2xl hud-corners"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          >
            {/* Subtle glow spot */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 ${accentGlowClass} rounded-full blur-3xl pointer-events-none`} />

            {/* Close Button X */}
            <button
              onClick={onClose}
              data-testid={closeButtonTestId}
              className={`${closeButtonClassName} absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-white/5 transition-colors cursor-pointer`}
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Glowing Type Icon */}
            <div className={`mx-auto w-12 h-12 rounded-full border flex items-center justify-center mb-5 animate-bounce ${iconWellClass}`}>
              {icon}
            </div>

            {/* Title & Description */}
            <h3 className={`text-xl font-bold font-display italic text-ink leading-snug ${titleClassName}`}>
              {title}
            </h3>
            <p className="text-xs text-ink-muted mt-3 leading-relaxed font-sans max-w-xs mx-auto">
              {message}
            </p>

            {children}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
