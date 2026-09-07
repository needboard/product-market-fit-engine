import { useEffect, useRef } from 'react';

/**
 * Minimal accessible-dialog behavior shared by ModalShell and
 * AddSolutionModal: Escape closes, focus moves into the dialog on open,
 * and returns to whatever triggered it on close. Does not implement a full
 * Tab focus trap — the small forms these wrap don't have content outside
 * the dialog to tab into, so the marginal benefit didn't justify the
 * complexity here.
 */
export function useModalFocus(onClose: () => void, dialogRef: React.RefObject<HTMLElement | null>) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
