'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/home/Hero';
import AboutSection from '@/components/home/AboutSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import EcosystemSection from '@/components/home/EcosystemSection';
import ActiveSignalsSection from '@/components/home/ActiveSignalsSection';
import type { Cluster } from '@/components/home/types';

export default function LandingPage() {
  const [trending, setTrending] = useState<Cluster[]>([]);
  const [loadingNiches, setLoadingNiches] = useState(true);

  // Fetch live active clusters to show real-time platform signal, shared
  // by the hero's live ticker and the active-signals section below.
  useEffect(() => {
    async function loadActiveSignals() {
      setLoadingNiches(true);
      try {
        const res = await fetch('/api/clusters');
        if (res.ok) {
          const data = await res.json();
          setTrending(data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load active signals:', err);
      } finally {
        setLoadingNiches(false);
      }
    }
    loadActiveSignals();
  }, []);

  return (
    <div className="flex-grow flex flex-col items-center justify-start py-8 px-4 sm:px-6 lg:px-8 space-y-24 text-ink selection:bg-accent/20 selection:text-accent">
      <Hero trending={trending} />
      <AboutSection />
      <FeaturesSection />
      <EcosystemSection />
      <ActiveSignalsSection trending={trending} loadingNiches={loadingNiches} />
    </div>
  );
}
