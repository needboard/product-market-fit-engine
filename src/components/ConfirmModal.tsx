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
 * A theme-consistent modal replacing standard browser confirm() boxes.
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

  const themeConfig = {
    info: {
      icon: <HelpCircle className="h-6 w-6 text-accent" />,
      circleClass: 'bg-accent/10 border-accent/30',
      confirmButtonClass: 'bg-accent text-white hover:opacity-90',
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-danger" />,
      circleClass: 'bg-danger/10 border-danger/30',
      confirmButtonClass: 'bg-danger text-white hover:opacity-90',
    },
  }[type];

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={themeConfig.icon}
      iconWellClass={themeConfig.circleClass}
      title={title}
      message={message}
      titleClassName="px-2"
    >
      <div className="mt-7 pt-2 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 text-sm font-medium rounded-lg bg-ink/5 hover:bg-ink/10 text-ink-muted transition-all active:scale-95 cursor-pointer flex items-center justify-center border border-border"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`w-full h-10 text-sm font-medium rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center ${themeConfig.confirmButtonClass}`}
        >
          {confirmText}
        </button>
      </div>
    </ModalShell>
  );
}
