'use client';

import { Check, AlertTriangle, Info } from 'lucide-react';
import ModalShell from '@/components/ui/ModalShell';

interface AlertModalProps {
  isOpen: boolean;
  type?: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

/**
 * A theme-consistent alert modal replacing standard JavaScript alert() boxes.
 */
export default function AlertModal({
  isOpen,
  type = 'success',
  title,
  message,
  onClose,
}: AlertModalProps) {

  const themeConfig = {
    success: {
      icon: <Check className="h-6 w-6 text-status-solved" />,
      circleClass: 'bg-status-solved/10 border-status-solved/30',
      buttonClass: 'bg-status-solved text-white hover:opacity-90',
    },
    error: {
      icon: <AlertTriangle className="h-6 w-6 text-danger" />,
      circleClass: 'bg-danger/10 border-danger/30',
      buttonClass: 'bg-danger text-white hover:opacity-90',
    },
    info: {
      icon: <Info className="h-6 w-6 text-accent" />,
      circleClass: 'bg-accent/10 border-accent/30',
      buttonClass: 'bg-accent text-white hover:opacity-90',
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
      closeButtonTestId="modal-cross-button"
      closeButtonClassName="modal-cross-button"
    >
      <div className="mt-6 pt-2">
        <button
          type="button"
          onClick={onClose}
          className={`w-full h-10 text-sm font-medium rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center ${themeConfig.buttonClass}`}
        >
          Dismiss
        </button>
      </div>
    </ModalShell>
  );
}
