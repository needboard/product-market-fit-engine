import { LucideIcon } from 'lucide-react';

interface SectionBadgeProps {
  icon: LucideIcon;
  index: string;
  label: string;
  accent?: 'amber' | 'teal' | 'coral';
  className?: string;
}

const ACCENT_CLASSES = {
  amber: { chip: 'bg-accent/10', icon: 'text-accent', text: 'text-accent' },
  teal: { chip: 'bg-status-matched/10', icon: 'text-status-matched', text: 'text-status-matched' },
  coral: { chip: 'bg-status-solved/10', icon: 'text-status-solved', text: 'text-status-solved' },
} as const;

/**
 * Plain section eyebrow: an icon chip plus a small tracked label. The
 * `index` prop is accepted for backward compatibility with existing call
 * sites but intentionally not rendered — bracketed "0X //" numbering was
 * part of the old HUD aesthetic this redesign removes.
 */
export default function SectionBadge({ icon: Icon, label, accent = 'amber', className = '' }: SectionBadgeProps) {
  const colors = ACCENT_CLASSES[accent];
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className={`p-2 rounded-lg inline-flex ${colors.chip}`}>
        <Icon className={`h-4 w-4 ${colors.icon}`} />
      </span>
      <span className={`text-xs tracking-[0.15em] uppercase font-semibold ${colors.text}`}>
        {label}
      </span>
    </div>
  );
}
