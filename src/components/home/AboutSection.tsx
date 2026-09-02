'use client';

import { Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { HOMEPAGE_COPY } from '@/lib/config/homepage_copy';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';

export default function AboutSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-5xl"
    >
      <Panel accent="amber" className="p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="absolute top-0 left-0 w-32 h-32 bg-signal-amber/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-3 md:max-w-xs shrink-0 text-center md:text-left">
          <SectionBadge icon={Info} index="01" label="ABOUT THE PLATFORM" accent="amber" className="justify-center md:justify-start" />
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            {HOMEPAGE_COPY.about.title}
          </h2>
          <p className="text-xs text-ink-muted font-mono tracking-wide leading-relaxed">
            {HOMEPAGE_COPY.about.subtitle}
          </p>
        </div>

        <p className="text-ink-muted text-sm leading-relaxed max-w-xl font-sans text-center md:text-left border-t md:border-t-0 md:border-l border-[color:var(--raw-border-subtle)] pt-6 md:pt-0 md:pl-8">
          {HOMEPAGE_COPY.about.description}
        </p>
      </Panel>
    </motion.section>
  );
}
