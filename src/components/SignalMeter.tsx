'use client';

import { motion } from 'framer-motion';

interface SignalMeterProps {
  /** Current amplitude, e.g. number of reporters in a cluster, or chars typed. */
  value: number;
  /** Value at which the meter reads full. */
  max?: number;
  /** Number of solutions attached — bleeds the fill from amber to teal. Ignored in 'capacity' tone. */
  solved?: number;
  /**
   * 'demand' (default): amber, bleeding to teal once `solved` > 0 — reads a
   * cluster's reporter count. 'capacity': ink-muted -> amber -> coral past
   * the limit — reads how much of a bounded input (e.g. a char limit) is used.
   */
  tone?: 'demand' | 'capacity';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const BAR_COUNTS = { sm: 8, md: 12, lg: 18 } as const;
const BAR_HEIGHTS = { sm: 14, md: 20, lg: 28 } as const;

/**
 * The signature "signal" motif: an oscilloscope-style bar meter. In 'demand'
 * tone it visualizes reporter amplitude for a problem cluster, bleeding
 * amber to teal once a builder has attached a solution. In 'capacity' tone
 * the same bars read a bounded input's fill level (e.g. a character count),
 * turning coral past the limit — same visual language, reused for a second
 * meaning rather than inventing a separate progress-bar component.
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
  const bars = BAR_COUNTS[size];
  const barHeight = BAR_HEIGHTS[size];
  const intensity = Math.max(0, Math.min(1, value / max));
  const litBars = tone === 'capacity'
    ? Math.ceil(intensity * bars)
    : Math.max(1, Math.round(intensity * bars));
  const isAnswered = tone === 'demand' && solved > 0;
  const isOverCapacity = tone === 'capacity' && value > max;

  return (
    <div className={`flex items-center gap-2 ${className}`} role="img" aria-label={label ?? `Signal strength ${value}`}>
      <div className="flex items-end gap-[3px]" style={{ height: barHeight }}>
        {Array.from({ length: bars }).map((_, i) => {
          const isLit = i < litBars;
          const barIntensity = (i + 1) / bars;
          const h = Math.max(0.25, barIntensity) * barHeight;
          const litColor = tone === 'capacity'
            ? (isOverCapacity ? '#fb6b53' : '#f5a623')
            : (isAnswered ? 'linear-gradient(180deg, #2dd4bf 0%, #f5a623 100%)' : '#f5a623');
          const litGlow = tone === 'capacity'
            ? (isOverCapacity ? '0 0 6px rgba(251,107,83,0.5)' : '0 0 6px rgba(245,166,35,0.4)')
            : (isAnswered ? '0 0 6px rgba(45,212,191,0.45)' : '0 0 6px rgba(245,166,35,0.45)');
          return (
            <motion.span
              key={i}
              className="w-[3px] rounded-[1px]"
              style={{
                height: h,
                background: isLit ? litColor : 'rgba(255,255,255,0.08)',
                boxShadow: isLit ? litGlow : 'none',
              }}
              initial={tone === 'demand' ? { scaleY: 0 } : false}
              animate={{ scaleY: 1 }}
              transition={tone === 'demand' ? { delay: i * 0.02, duration: 0.3, ease: 'easeOut' } : { duration: 0.15, ease: 'easeOut' }}
            />
          );
        })}
      </div>
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          {label}
        </span>
      )}
    </div>
  );
}
