'use client';

import { useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Compass, PlusCircle, Layers, Search, LayoutDashboard, ShieldCheck, X } from 'lucide-react';
import { useModalFocus } from '@/lib/useModalFocus';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isActive: (path: string) => boolean;
  isSignedIn: boolean | undefined;
  isAdmin: boolean;
  /** Sign in/up actions — shown only when signed out. */
  authSlot: React.ReactNode;
  /** Theme toggle — shown regardless of auth state. */
  themeSlot: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/submit', label: 'Submit', icon: PlusCircle },
  { href: '/browse', label: 'Browse', icon: Layers },
  { href: '/search', label: 'Search', icon: Search },
];

/**
 * Mobile-only nav: replaces the old crammed icon row (which overflowed the
 * header at narrow widths) with a single hamburger button that opens this
 * slide-in drawer holding every tab as a full labeled row, plus the
 * sign-in/sign-up actions that no longer fit next to it.
 */
export default function MobileNavDrawer({ isOpen, onClose, isActive, isSignedIn, isAdmin, authSlot, themeSlot }: MobileNavDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && <DrawerPanel onClose={onClose} isActive={isActive} isSignedIn={isSignedIn} isAdmin={isAdmin} authSlot={authSlot} themeSlot={themeSlot} panelRef={panelRef} titleId={titleId} />}
    </AnimatePresence>
  );
}

function DrawerPanel({
  onClose,
  isActive,
  isSignedIn,
  isAdmin,
  authSlot,
  themeSlot,
  panelRef,
  titleId,
}: Omit<MobileNavDrawerProps, 'isOpen'> & { panelRef: React.RefObject<HTMLDivElement | null>; titleId: string }) {
  useModalFocus(onClose, panelRef);

  return (
    <div className="fixed inset-0 z-[2147483644] md:hidden">
      <motion.div
        className="absolute inset-0 bg-ink/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 w-72 max-w-[85vw] bg-bg-panel border-l border-border shadow-xl flex flex-col outline-none"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-border shrink-0">
          <span id={titleId} className="font-serif text-base font-semibold text-ink">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-ink/5 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-col p-3 gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(href) ? 'bg-accent/10 text-accent font-medium' : 'text-ink-muted hover:text-ink hover:bg-ink/5'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}

          {isSignedIn && (
            <Link
              href="/dashboard"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive('/dashboard') ? 'bg-accent/10 text-accent font-medium' : 'text-ink-muted hover:text-ink hover:bg-ink/5'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}

          {isSignedIn && isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive('/admin/dashboard') ? 'bg-danger/10 text-danger font-medium' : 'text-danger/80 hover:text-danger hover:bg-danger/5'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="mt-auto p-4 border-t border-border space-y-3">
          {!isSignedIn && authSlot}
          <div className="flex justify-center">
            {themeSlot}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
