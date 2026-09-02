'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, Cpu, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HOMEPAGE_COPY } from '@/lib/config/homepage_copy';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';

export default function FeaturesSection() {
  // Search Mock Interactive State
  const [searchMockPhase, setSearchMockPhase] = useState<'idle' | 'typing' | 'scanning' | 'matched'>('idle');
  const [searchText, setSearchText] = useState('');

  // Submit Mock Interactive State
  const [submitMockStage, setSubmitMockStage] = useState(0);

  // Voting Mock State
  const [mockUpvoted, setMockUpvoted] = useState(false);
  const [mockDownvoted, setMockDownvoted] = useState(false);
  const [mockScore, setMockScore] = useState(12);

  // Interactive Search Mock Typing Loop
  useEffect(() => {
    const fullText = HOMEPAGE_COPY.features.list[0]?.interactiveInput || 'flaky microfrontend compile failures';
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const runSearchSimulation = () => {
      if (cancelled) return;
      setSearchMockPhase('typing');
      setSearchText('');

      let index = 0;

      const typeChar = () => {
        if (cancelled) return;

        if (index < fullText.length) {
          const char = fullText[index];
          index++;
          setSearchText(prev => prev + char);
          timer = setTimeout(typeChar, 40);
          return;
        }

        // Finished typing, trigger scan!
        timer = setTimeout(() => {
          if (cancelled) return;
          setSearchMockPhase('scanning');

          // Scan for 1.5 seconds, then show match!
          timer = setTimeout(() => {
            if (cancelled) return;
            setSearchMockPhase('matched');

            // Hold match for 4 seconds, then repeat!
            timer = setTimeout(runSearchSimulation, 4000);
          }, 1500);
        }, 800);
      };

      // Start typing delay
      timer = setTimeout(typeChar, 1000);
    };

    runSearchSimulation();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Interactive Submit Lifecycle Stage Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSubmitMockStage(prev => (prev + 1) % 3);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const handleMockVote = (type: 'up' | 'down') => {
    if (type === 'up') {
      if (mockUpvoted) {
        setMockUpvoted(false);
        setMockScore(12);
      } else {
        setMockUpvoted(true);
        setMockDownvoted(false);
        setMockScore(13);
      }
    } else {
      if (mockDownvoted) {
        setMockDownvoted(false);
        setMockScore(12);
      } else {
        setMockDownvoted(true);
        setMockUpvoted(false);
        setMockScore(11);
      }
    }
  };

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      className="w-full max-w-6xl space-y-16"
    >
      <div className="text-center space-y-3">
        <SectionBadge icon={Layers} index="02" label="CORE ENGINE CAPABILITIES" accent="amber" className="justify-center" />
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-ink">
          {HOMEPAGE_COPY.features.title}
        </h2>
        <p className="text-ink-muted text-sm max-w-xl mx-auto font-sans leading-relaxed">
          {HOMEPAGE_COPY.features.subtitle}
        </p>
      </div>

      {/* Feature 1: Semantic Search */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
      >
        <div className="space-y-4">
          <span className="font-mono text-[10px] text-signal-amber tracking-wider font-bold block">
            {HOMEPAGE_COPY.features.list[0]?.badge}
          </span>
          <h3 className="text-2xl font-bold text-ink font-display">
            {HOMEPAGE_COPY.features.list[0]?.title}
          </h3>
          <p className="text-ink-muted text-sm leading-relaxed font-sans">
            {HOMEPAGE_COPY.features.list[0]?.desc}
          </p>
        </div>

        {/* Interactive Search Console Mock */}
        <Panel accent="amber" className="p-6 font-mono text-xs select-none">
          <div className="flex items-center justify-between border-b border-[color:var(--raw-border-subtle)] pb-3 mb-4 text-[10px] text-ink-muted uppercase font-bold tracking-wider">
            <span>{HOMEPAGE_COPY.features.list[0]?.interactiveTitle}</span>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500/40" />
              <span className="w-2 h-2 rounded-full bg-signal-amber/40" />
              <span className="w-2 h-2 rounded-full bg-teal-500/40" />
            </div>
          </div>

          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="bg-bg-void/80 rounded-xl p-4 border border-[color:var(--raw-border-subtle)] h-[185px] flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-2">
              <span className="text-signal-amber font-bold shrink-0">$ query:</span>
              <span className="text-ink-muted">
                {searchText}
                {searchMockPhase === 'typing' && <span className="animate-pulse font-bold text-signal-amber">|</span>}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {searchMockPhase === 'scanning' && (
                <motion.div
                  key="scanning"
                  className="flex items-center gap-2 text-signal-teal text-[10px] font-bold tracking-widest uppercase animate-pulse"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Cpu className="h-4 w-4 animate-spin" /> Finding anything related to your pain-point...
                </motion.div>
              )}

              {searchMockPhase === 'matched' && (
                <motion.div
                  key="matched"
                  className="p-3 bg-signal-teal/5 border border-signal-teal/20 rounded-xl space-y-1.5"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between text-[9px] text-signal-teal font-bold uppercase tracking-wider">
                    <span>Matched Problem</span>
                    <span className="bg-signal-teal/10 px-2 py-0.5 rounded border border-signal-teal/20">{HOMEPAGE_COPY.features.list[0]?.interactiveScore}</span>
                  </div>
                  <p className="text-xs text-ink leading-normal">&quot;{HOMEPAGE_COPY.features.list[0]?.interactiveMatch}&quot;</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Panel>
      </motion.div>

      {/* Feature 2: Seeding Lifecycle (Flipped) */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pt-6"
      >
        <div className="lg:order-last space-y-4">
          <span className="font-mono text-[10px] text-signal-amber tracking-wider font-bold block">
            {HOMEPAGE_COPY.features.list[1]?.badge}
          </span>
          <h3 className="text-2xl font-bold text-ink font-display">
            {HOMEPAGE_COPY.features.list[1]?.title}
          </h3>
          <p className="text-ink-muted text-sm leading-relaxed font-sans">
            {HOMEPAGE_COPY.features.list[1]?.desc}
          </p>
        </div>

        <Panel accent="amber" className="p-6 font-mono text-xs select-none">
          <div className="flex items-center justify-between border-b border-[color:var(--raw-border-subtle)] pb-3 mb-4 text-[10px] text-ink-muted uppercase font-bold tracking-wider">
            <span>{HOMEPAGE_COPY.features.list[1]?.interactiveTitle}</span>
            <div className="flex gap-1.5">
              <span className={`w-2 h-2 rounded-full transition-colors duration-500 ${submitMockStage === 0 ? 'bg-signal-amber shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-white/5'}`} />
              <span className={`w-2 h-2 rounded-full transition-colors duration-500 ${submitMockStage === 1 ? 'bg-signal-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]' : 'bg-white/5'}`} />
              <span className={`w-2 h-2 rounded-full transition-colors duration-500 ${submitMockStage === 2 ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/5'}`} />
            </div>
          </div>

          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="bg-bg-void/80 rounded-xl p-4 border border-[color:var(--raw-border-subtle)] space-y-4 h-[185px] flex flex-col justify-center"
          >
            {(HOMEPAGE_COPY.features.list[1]?.stages || []).map((stage, idx) => {
              const isActive = submitMockStage === idx;
              return (
                <div
                  key={idx}
                  className={`transition-all duration-500 ${isActive ? 'opacity-100 scale-100 translate-x-1.5' : 'opacity-25 scale-95 pointer-events-none'}`}
                >
                  <span className={`font-bold block text-[9px] uppercase tracking-wider mb-0.5 ${isActive ? 'text-signal-amber' : 'text-ink-muted'}`}>
                    {stage.label}
                  </span>
                  <p className={`text-xs leading-normal ${isActive ? 'text-ink' : 'text-ink-muted'}`}>
                    {isActive ? stage.value : '...'}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </Panel>
      </motion.div>

      {/* Feature 3: Reddit-Style voting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pt-6">
        <div className="space-y-4">
          <span className="font-mono text-[10px] text-signal-amber tracking-wider font-bold block">
            {HOMEPAGE_COPY.features.list[2]?.badge}
          </span>
          <h3 className="text-2xl font-bold text-ink font-display">
            {HOMEPAGE_COPY.features.list[2]?.title}
          </h3>
          <p className="text-ink-muted text-sm leading-relaxed font-sans">
            {HOMEPAGE_COPY.features.list[2]?.desc}
          </p>
        </div>

        {/* Interactive Voting Console Mock */}
        <Panel accent="amber" className="p-6 select-none">
          <div className="flex items-center justify-between border-b border-[color:var(--raw-border-subtle)] pb-3 mb-5 font-mono text-[10px] text-ink-muted uppercase font-bold tracking-wider">
            <span>{HOMEPAGE_COPY.features.list[2]?.interactiveTitle}</span>
          </div>

          <div className="p-5 bg-bg-void/60 border border-[color:var(--raw-border-subtle)] rounded-xl flex flex-col gap-3 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 shrink-0 font-mono">
                <button
                  onClick={() => handleMockVote('up')}
                  className={`w-7 h-7 rounded border flex items-center justify-center cursor-pointer transition-all ${
                    mockUpvoted
                      ? 'bg-amber-500/20 text-brand-amber border-brand-amber/35 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                      : 'bg-bg-panel text-ink-muted border-[color:var(--raw-border-subtle)] hover:text-ink'
                  }`}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <span className={`text-[10px] font-bold ${mockUpvoted ? 'text-brand-amber' : mockDownvoted ? 'text-rose-500' : 'text-ink-muted'}`}>
                  {mockScore > 0 ? `+${mockScore}` : mockScore}
                </span>
                <button
                  onClick={() => handleMockVote('down')}
                  className={`w-7 h-7 rounded border flex items-center justify-center cursor-pointer transition-all ${
                    mockDownvoted
                      ? 'bg-rose-500/20 text-rose-500 border-rose-500/35 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                      : 'bg-bg-panel text-ink-muted border-[color:var(--raw-border-subtle)] hover:text-ink'
                  }`}
                >
                  <ArrowUp className="h-3.5 w-3.5 rotate-180" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-ink leading-none">{HOMEPAGE_COPY.features.list[2]?.solName}</h4>
                  <span className="text-[8px] font-mono text-signal-teal uppercase bg-signal-teal/10 px-1.5 py-0.5 rounded border border-signal-teal/10">verified</span>
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed font-sans">{HOMEPAGE_COPY.features.list[2]?.solDesc}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[color:var(--raw-border-subtle)]">
              <span className="font-mono text-[9px] text-signal-amber uppercase tracking-widest font-bold">
                {HOMEPAGE_COPY.features.list[2]?.reviewsCount}
              </span>
            </div>
          </div>
        </Panel>
      </div>
    </motion.section>
  );
}
