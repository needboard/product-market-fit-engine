'use client';

import { HelpCircle, AlertTriangle } from 'lucide-react';
import ModalShell from '@/components/ui/ModalShell';

interface ConfirmModalProps {
  isOpen: boolean;
  type?: 'info' | 'warning';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * A beautiful, theme-appropriate modal replacing standard browser confirm() boxes.
 * Features an interactive layout, spring actions, and custom status warning configurations.
 */
export default function ConfirmModal({
  isOpen,
  type = 'info',
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
}: ConfirmModalProps) {

  // Custom theme configurations matching our brand design layers
  const themeConfig = {
    info: {
      icon: <HelpCircle className="h-6 w-6 text-amber-400" />,
      circleClass: "bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
      confirmButtonClass: "bg-gradient-to-r from-brand-amber to-brand-coral text-slate-950 hover:opacity-90",
      accentGlow: "bg-amber-500/5",
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-red-400" />,
      circleClass: "bg-red-500/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]",
      confirmButtonClass: "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90",
      accentGlow: "bg-red-500/5",
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
      titleClassName="px-2"
    >
      {/* Action CTA Buttons grid (Cancel & Confirm) */}
      <div className="mt-7 pt-2 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 font-mono text-xs uppercase tracking-wider font-bold rounded-xl bg-white/5 hover:bg-white/10 text-ink-muted transition-all active:scale-95 cursor-pointer flex items-center justify-center border border-[color:var(--raw-border-subtle)]"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`w-full h-10 font-mono text-xs uppercase tracking-wider font-bold rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center ${themeConfig.confirmButtonClass}`}
        >
          {confirmText}
        </button>
      </div>
    </ModalShell>
  );
}
