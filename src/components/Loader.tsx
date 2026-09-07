'use client';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Inline spinner for buttons. All buttons in this design use white text on
 * a solid accent/danger fill, so a fixed white-on-translucent spinner works
 * universally rather than trying to track currentColor.
 */
export function ButtonSpinner({ size = 'sm' }: { size?: 'xs' | 'sm' | 'md' }) {
  const dimensions = {
    xs: 'h-3.5 w-3.5 border-2',
    sm: 'h-4 w-4 border-2',
    md: 'h-5 w-5 border-[3px]',
  }[size];

  return (
    <div
      className={`${dimensions} rounded-full border-white/30 border-t-white animate-spin`}
    />
  );
}

/**
 * A calm full-section loading state: a plain spinner plus a status message.
 */
export function PageScanner({ message = 'Loading…', size = 'md' }: LoaderProps) {
  const containerClass = size === 'sm'
    ? 'flex flex-col items-center justify-center gap-3 py-6 px-4 w-full'
    : 'flex flex-col items-center justify-center gap-4 min-h-[40vh] py-16 px-4 w-full';

  const spinnerSize = size === 'sm' ? 'h-5 w-5 border-2' : 'h-7 w-7 border-[3px]';

  return (
    <div className={containerClass}>
      <div className={`${spinnerSize} rounded-full border-ink-muted/20 border-t-accent animate-spin`} />
      {message && (
        <p className="text-sm text-ink-muted text-center max-w-sm leading-relaxed">
          {message}
        </p>
      )}
    </div>
  );
}
