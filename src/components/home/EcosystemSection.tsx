'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { HOMEPAGE_COPY } from '@/lib/config/homepage_copy';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';

export default function EcosystemSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-6xl space-y-16"
    >
      <div className="text-center space-y-3">
        <SectionBadge icon={Users} index="03" label="THE PLATFORM PARTICIPANTS" accent="amber" className="justify-center" />
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-ink">
          {HOMEPAGE_COPY.ecosystem.title}
        </h2>
        <p className="text-ink-muted text-sm max-w-xl mx-auto font-sans leading-relaxed">
          {HOMEPAGE_COPY.ecosystem.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

        {/* Reporter Card */}
        <Panel accent="amber" className="p-8 flex flex-col justify-between overflow-hidden group transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-signal-amber/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-display text-ink">{HOMEPAGE_COPY.ecosystem.reporters.title}</h3>
              <p className="text-xs text-ink-muted font-mono tracking-wide">{HOMEPAGE_COPY.ecosystem.reporters.subtitle}</p>
            </div>

            <div className="space-y-4">
              {HOMEPAGE_COPY.ecosystem.reporters.benefits.map((ben, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-signal-amber shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-ink">{ben.title}</h4>
                    <p className="text-[11px] text-ink-muted leading-relaxed mt-1 font-sans">{ben.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[color:var(--raw-border-subtle)] flex">
            <Link
              href="/submit"
              className="font-mono text-[10px] tracking-widest uppercase font-bold text-signal-amber hover:text-amber-400 flex items-center gap-1.5 transition-colors"
            >
              Report Your First Problem <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Panel>

        {/* Builder Card */}
        <Panel accent="teal" className="p-8 flex flex-col justify-between overflow-hidden group transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-signal-teal/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-display text-ink">{HOMEPAGE_COPY.ecosystem.builders.title}</h3>
              <p className="text-xs text-ink-muted font-mono tracking-wide">{HOMEPAGE_COPY.ecosystem.builders.subtitle}</p>
            </div>

            <div className="space-y-4">
              {HOMEPAGE_COPY.ecosystem.builders.benefits.map((ben, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-signal-teal shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-ink">{ben.title}</h4>
                    <p className="text-[11px] text-ink-muted leading-relaxed mt-1 font-sans">{ben.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[color:var(--raw-border-subtle)] flex">
            <Link
              href="/browse"
              className="font-mono text-[10px] tracking-widest uppercase font-bold text-signal-teal hover:text-teal-300 flex items-center gap-1.5 transition-colors"
            >
              Browse Open Problems <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Panel>

      </div>
    </motion.section>
  );
}
