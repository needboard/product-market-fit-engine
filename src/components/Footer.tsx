'use client';

import Link from 'next/link';
import { BinocularsIcon, Mail } from 'lucide-react';
import LinkedinIcon from '@/components/icons/LinkedinIcon';
import XIcon from '@/components/icons/XIcon';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

const LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: 'Navigate',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Explore', href: '/explore' },
      { label: 'Browse Problems', href: '/browse' },
      { label: 'Search', href: '/search' },
    ],
  },
  {
    title: 'Get Involved',
    links: [
      { label: 'Report a Problem', href: '/submit' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
];

interface ContactLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Order matters here (Abhishek's channels first), no names attached to
// either cluster of three links.
const CONTACT_LINKS: ContactLink[] = [
  { label: 'Email - Abhishek', href: 'mailto:agblion9@gmail.com', icon: Mail },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/abhishek-gupta-ab377b305', icon: LinkedinIcon },
  { label: 'X', href: 'https://x.com/manyfacess14', icon: XIcon },
  { label: 'Email - Sundaram', href: 'mailto:sundaramsinghsdnr@gmail.com', icon: Mail },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/sundaram-singh04', icon: LinkedinIcon },
  { label: 'X', href: 'https://x.com/sundaram_011', icon: XIcon },
];

/**
 * Adapted from Watermelon UI's "Footer 1" block (ui.watermelon.sh/block/footer-1),
 * re-themed onto this app's own design tokens instead of shadcn's — the source
 * block used bg-background/text-foreground/text-primary; here that's
 * bg-bg-panel/text-ink/text-accent etc.
 */
export default function Footer() {
  return (
    <footer className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl panel-surface p-8 sm:p-12">
        <div className="flex flex-col justify-between gap-12 xl:flex-row xl:gap-24">
          <div className="shrink-0 space-y-6 xl:w-[360px]">
            <Link href="/" className="flex items-center gap-2">
              <BinocularsIcon className="h-5 w-5 text-accent" />
              <span className="font-serif text-lg font-semibold text-ink">NeedBoard</span>
            </Link>

            <p className="max-w-sm text-xs leading-relaxed text-ink-muted">
              Built by two people who got tired of guessing what to ship next.
            </p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-ink">Contact</h4>
              <ul className="space-y-3">
                {CONTACT_LINKS.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                      className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors"
                    >
                      <link.icon className="h-3.5 w-3.5 shrink-0" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {LINK_GROUPS.map((group) => (
              <div key={group.title} className="space-y-4">
                <h4 className="text-sm font-medium text-ink">{group.title}</h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-muted hover:text-ink transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center border-t border-border pt-8">
          <p className="text-center text-xs text-ink-muted">
            © 2026 NeedBoard. All individual voices resonate in collective signal.
          </p>
        </div>
      </div>
    </footer>
  );
}
