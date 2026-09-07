'use client';

import { motion } from 'framer-motion';

interface SignalMeterProps {
  /** Current amplitude, e.g. number of reporters in a cluster, or chars typed. */
  value: number;
  /** Value at which the meter reads full. */
  max?: number;
  /** Number of solutions attached — fills in the "solved" color once > 0. Ignored in 'capacity' tone. */
  solved?: number;
  /**
   * 'demand' (default): accent fill, switching to the solved color once
   * `solved` > 0 — reads a cluster's reporter count. 'capacity': reads how
   * much of a bounded input (e.g. a char limit) is used.
   */
  tone?: 'demand' | 'capacity';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const TRACK_WIDTHS = { sm: 48, md: 72, lg: 96 } as const;
const TRACK_HEIGHT = 6;

/**
 * A plain horizontal progress bar — reads a cluster's reporter demand (or,
 * in 'capacity' tone, how much of a bounded input is used). Replaces the
 * old oscilloscope-bar visualization with a quieter, more legible meter.
 */
export default function SignalMeter({
  value,
  max = 40,
  solved = 0,
  tone = 'demand',
  size = 'md',
  label,
  className = '',
}: SignalMeterProps) {
  const width = TRACK_WIDTHS[size];
  const fillPct = Math.max(0, Math.min(1, value / max)) * 100;
  const isAnswered = tone === 'demand' && solved > 0;
  const fillColor = isAnswered ? 'var(--raw-status-solved)' : 'var(--raw-accent)';

  return (
    <div className={`flex items-center gap-2 ${className}`} role="img" aria-label={label ?? `Signal strength ${value}`}>
      <div
        className="rounded-full overflow-hidden bg-ink-muted/15"
        style={{ width, height: TRACK_HEIGHT }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: fillColor }}
          initial={{ width: 0 }}
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      {label && (
        <span className="text-[11px] uppercase tracking-wider text-ink-muted">
          {label}
        </span>
      )}
    </div>
  );
}
