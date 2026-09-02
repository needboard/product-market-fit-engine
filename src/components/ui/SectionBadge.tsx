import { LucideIcon } from 'lucide-react';

interface SectionBadgeProps {
  icon: LucideIcon;
  index: string;
  label: string;
  accent?: 'amber' | 'teal' | 'coral';
  className?: string;
}

const ACCENT_CLASSES = {
  amber: { chip: 'bg-signal-amber/10', icon: 'text-signal-amber', text: 'text-signal-amber' },
  teal: { chip: 'bg-signal-teal/10', icon: 'text-signal-teal', text: 'text-signal-teal' },
  coral: { chip: 'bg-signal-coral/10', icon: 'text-signal-coral', text: 'text-signal-coral' },
} as const;

/**
 * The recurring "0X // SOME LABEL" chip-and-tracked-label pattern used to
 * open every section. Previously copy-pasted per section with drifting
 * markup (some without rounded-xl, some without the icon chip at all).
 */
export default function SectionBadge({ icon: Icon, index, label, accent = 'amber', className = '' }: SectionBadgeProps) {
  const colors = ACCENT_CLASSES[accent];
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`p-2 rounded-xl inline-flex ${colors.chip}`}>
        <Icon className={`h-5 w-5 ${colors.icon}`} />
      </span>
      <span className={`font-mono text-[10px] tracking-[0.3em] uppercase font-bold ${colors.text}`}>
        {index} // {label}
      </span>
    </div>
  );
}
