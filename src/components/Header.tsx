'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Show, useAuth, useUser, SignInButton, SignUpButton, UserButton } from '@/lib/clerk';
import { dark } from '@clerk/themes';
import { BinocularsIcon, Search, Layers, PlusCircle, LayoutDashboard, ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

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

  const role = (user?.publicMetadata?.role as string) || 'user';
  const isAdmin = role === 'admin';

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  return (
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
        <div className="flex items-center gap-3">
          {/* Mobile nav icons */}
          <div className="flex md:hidden items-center gap-1 text-ink-muted">
            <Link href="/submit" className={`p-2 rounded-md ${isActive('/submit') ? 'text-accent' : ''}`} title="Submit">
              <PlusCircle className="h-5 w-5" />
            </Link>
            <Link href="/browse" className={`p-2 rounded-md ${isActive('/browse') ? 'text-accent' : ''}`} title="Browse">
              <Layers className="h-5 w-5" />
            </Link>
            <Link href="/search" className={`p-2 rounded-md ${isActive('/search') ? 'text-accent' : ''}`} title="Search">
              <Search className="h-5 w-5" />
            </Link>
            {isSignedIn && (
              <Link href="/dashboard" className={`p-2 rounded-md ${isActive('/dashboard') ? 'text-accent' : ''}`} title="Dashboard">
                <LayoutDashboard className="h-5 w-5" />
              </Link>
            )}
            {isSignedIn && isAdmin && (
              <Link href="/admin/dashboard" className={`p-2 rounded-md ${isActive('/admin/dashboard') ? 'text-accent' : ''}`} title="Admin Dashboard">
                <ShieldCheck className="h-5 w-5" />
              </Link>
            )}
          </div>

          <ThemeToggle />

          {isSignedIn ? (
            <UserButton appearance={clerkUserButtonAppearance} />
          ) : (
            <div className="flex items-center gap-2">
              <Show when={'signed-out'}>
                <SignInButton mode="modal">
                  <button className="text-sm text-ink-muted hover:text-ink transition-colors cursor-pointer px-3 py-1.5">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-sm font-medium bg-accent hover:opacity-90 text-white px-4 py-2 rounded-lg transition-opacity active:scale-95 cursor-pointer">
                    <span className="hidden sm:inline">Quick Frustration Check</span>
                    <span className="sm:hidden">Quick Check</span>
                  </button>
                </SignUpButton>
              </Show>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
