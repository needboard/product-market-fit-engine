'use client';

import { Check, AlertTriangle, Sparkles } from 'lucide-react';
import ModalShell from '@/components/ui/ModalShell';

interface AlertModalProps {
  isOpen: boolean;
  type?: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

/**
 * A beautiful, modern, theme-consistent alert modal replacing standard JavaScript alert() boxes.
 * Features glassmorphic backdrops, glowing icons, and smooth spring animations.
 */
export default function AlertModal({
  isOpen,
  type = 'success',
  title,
  message,
  onClose,
}: AlertModalProps) {

  // Icon and theme config based on modal type
  const themeConfig = {
    success: {
      icon: <Check className="h-6 w-6 text-teal-400" />,
      circleClass: "bg-teal-500/20 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.2)]",
      buttonClass: "bg-gradient-to-r from-teal-500 to-brand-teal text-slate-950 hover:opacity-90",
      accentGlow: "bg-teal-500/5",
    },
    error: {
      icon: <AlertTriangle className="h-6 w-6 text-red-400" />,
      circleClass: "bg-red-500/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]",
      buttonClass: "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90",
      accentGlow: "bg-red-500/5",
    },
    info: {
      icon: <Sparkles className="h-6 w-6 text-amber-400" />,
      circleClass: "bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
      buttonClass: "bg-gradient-to-r from-brand-amber to-brand-coral text-slate-950 hover:opacity-90",
      accentGlow: "bg-amber-500/5",
    },
  }[type];

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={themeConfig.icon}
      iconWellClass={themeConfig.circleClass}
      accentGlowClass={themeConfig.accentGlow}
      title={title}
      message={message}
      closeButtonTestId="modal-cross-button"
      closeButtonClassName="modal-cross-button"
    >
      {/* CTA Button */}
      <div className="mt-6 pt-2">
        <button
          type="button"
          onClick={onClose}
          className={`w-full h-10 font-mono text-xs uppercase tracking-wider font-bold rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center ${themeConfig.buttonClass}`}
        >
          Dismiss
        </button>
      </div>
    </ModalShell>
  );
}
