import Link from 'next/link';
import { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  accent?: 'amber' | 'teal' | 'coral';
  href?: string;
  className?: string;
  glass?: boolean;
}

const HUD_CLASS = {
  amber: 'hud-corners',
  teal: 'hud-corners-teal',
  coral: 'hud-corners-coral',
} as const;

/**
 * The recurring content-panel wrapper (bg-panel surface + HUD corner
 * brackets + shadow) that used to be copy-pasted per page as
 * "bg-slate-900/NN shadow-xl hud-corners-violet", drifting in opacity and
 * accent color each time. One shape, one accent system.
 */
export default function Panel({ children, accent = 'amber', href, className = '', glass = true }: PanelProps) {
  const classes = `relative bg-bg-panel/40 shadow-xl ${glass ? 'glass-card' : ''} ${HUD_CLASS[accent]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={`group block ${classes} hover:bg-bg-panel/70 transition-colors duration-300`}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}
