'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Show, useAuth, useUser, SignInButton, SignUpButton, UserButton } from '@/lib/clerk';
import { dark } from '@clerk/themes';
import { BinocularsIcon, Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import MobileNavDrawer from './MobileNavDrawer';

// Clerk UserButton appearance (popover renders in shadow DOM, so real hex
// colors are required instead of CSS variables).
const clerkUserButtonAppearance = {
  theme: dark,
  variables: {
    colorPrimary: '#b74a26',
    colorBackground: '#191a1d',
    colorText: '#ededef',
    colorTextSecondary: '#96969e',
    colorDanger: '#b3261e',
    colorSuccess: '#4caf82',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    borderRadius: '0.5rem',
  },
  elements: {
    avatarBox: {
      width: '32px',
      height: '32px',
    },
  },
};

export default function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = (user?.publicMetadata?.role as string) || 'user';
  const isAdmin = role === 'admin';

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  // Close the drawer on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b border-border bg-bg/90 backdrop-blur-sm overflow-x-hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <BinocularsIcon className="h-5 w-5 text-accent" />
            <span className="font-serif text-lg font-semibold text-ink">
              NeedBoard
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-ink-muted">
          <Link
            href="/"
            className={`transition-colors duration-150 hover:text-ink ${
              isActive('/') ? 'text-ink font-medium' : ''
            }`}
          >
            Home
          </Link>
          <Link
            href="/explore"
            className={`transition-colors duration-150 hover:text-ink ${
              isActive('/explore') ? 'text-ink font-medium' : ''
            }`}
          >
            Explore
          </Link>
          <Link
            href="/submit"
            className={`transition-colors duration-150 hover:text-ink ${
              isActive('/submit') ? 'text-ink font-medium' : ''
            }`}
          >
            Submit
          </Link>
          <Link
            href="/browse"
            className={`transition-colors duration-150 hover:text-ink ${
              isActive('/browse') ? 'text-ink font-medium' : ''
            }`}
          >
            Browse
          </Link>
          <Link
            href="/search"
            className={`transition-colors duration-150 hover:text-ink ${
              isActive('/search') ? 'text-ink font-medium' : ''
            }`}
          >
            Search
          </Link>
          {isSignedIn && (
            <Link
              href="/dashboard"
              className={`transition-colors duration-150 hover:text-ink ${
                isActive('/dashboard') ? 'text-ink font-medium' : ''
              }`}
            >
              Dashboard
            </Link>
          )}
          {isSignedIn && isAdmin && (
            <Link
              href="/admin/dashboard"
              className={`transition-colors duration-150 hover:text-ink ${
                isActive('/admin/dashboard') ? 'text-ink font-medium' : ''
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Auth / Action Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {isSignedIn ? (
            <UserButton appearance={clerkUserButtonAppearance} />
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Show when={'signed-out'}>
                <SignInButton mode="modal">
                  <button className="text-sm text-ink-muted hover:text-ink transition-colors cursor-pointer px-3 py-1.5">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-sm font-medium bg-accent hover:opacity-90 text-white px-4 py-2 rounded-lg transition-opacity active:scale-95 cursor-pointer">
                    Quick Frustration Check
                  </button>
                </SignUpButton>
              </Show>
            </div>
          )}

          {/* Mobile: single hamburger replaces the nav + auth actions above,
              all of which are cramped/overflowing at narrow widths. */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="md:hidden p-2 -mr-2 text-ink-muted hover:text-ink rounded-lg hover:bg-ink/5 transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

      </div>
    </header>

      <MobileNavDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isActive={isActive}
        isSignedIn={isSignedIn}
        isAdmin={isAdmin}
        authSlot={
          <div className="flex flex-col gap-2">
            <Show when={'signed-out'}>
              <SignUpButton mode="modal">
                <button className="w-full text-sm font-medium bg-accent hover:opacity-90 text-white px-4 py-2.5 rounded-lg transition-opacity active:scale-95 cursor-pointer">
                  Quick Frustration Check
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="w-full text-sm text-ink-muted hover:text-ink transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-ink/5">
                  Sign In
                </button>
              </SignInButton>
            </Show>
          </div>
        }
        themeSlot={<ThemeToggle />}
      />
    </>
  );
}
