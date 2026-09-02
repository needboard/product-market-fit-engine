import Link from 'next/link';
import { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  accent?: 'amber' | 'teal' | 'coral';
  href?: string;
  className?: string;
  glass?: boolean;
}

const HOVER_BORDER = {
  amber: 'hover:border-accent/40',
  teal: 'hover:border-status-matched/40',
  coral: 'hover:border-status-solved/40',
} as const;

/**
 * The recurring content-panel wrapper: a flat, hairline-bordered surface.
 * `accent` only tints the hover border on clickable (href) panels — it no
 * longer drives a permanent glow/corner-bracket treatment. `glass` is kept
 * for API compatibility but is a no-op now that panels are flat.
 */
export default function Panel({ children, accent = 'amber', href, className = '' }: PanelProps) {
  const classes = `relative rounded-xl panel-surface ${className}`;

  if (href) {
    return (
      <Link href={href} className={`group block ${classes} ${HOVER_BORDER[accent]} transition-colors duration-200`}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}
