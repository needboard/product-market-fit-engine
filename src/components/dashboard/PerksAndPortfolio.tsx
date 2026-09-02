'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle, Globe, Loader2, Lock, Save, Zap } from 'lucide-react';
import AlertModal from '@/components/AlertModal';
import Panel from '@/components/ui/Panel';
import SectionBadge from '@/components/ui/SectionBadge';
import GithubIcon from '@/components/icons/GithubIcon';
import type { UserProfile, RolePerks } from './types';

interface PerksAndPortfolioProps {
  profile: UserProfile;
  perks: RolePerks;
  onProfileUpdate: (updates: Partial<UserProfile>) => void;
}

export default function PerksAndPortfolio({ profile, perks, onProfileUpdate }: PerksAndPortfolioProps) {
  const [bioInput, setBioInput] = useState('');
  const [githubInput, setGithubInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'success' as 'success' | 'error' | 'info', title: '', message: '' });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perks.customLinksEnabled) return;

    setSavingProfile(true);
    try {
      const res = await fetch('/api/user/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customBio: bioInput, githubUrl: githubInput, websiteUrl: websiteInput }),
      });

      const data = await res.json();
      if (res.ok) {
        onProfileUpdate({
          customBio: data.updatedFields.customBio || profile.customBio,
          githubUrl: data.updatedFields.githubUrl || profile.githubUrl,
          websiteUrl: data.updatedFields.websiteUrl || profile.websiteUrl,
        });
        setAlertModal({ isOpen: true, type: 'success', title: 'Profile Updated!', message: 'Your Builder Portfolio links and custom bio tagline have been saved.' });
      } else {
        throw new Error(data.message || 'Unable to update profile.');
      }
    } catch (err: any) {
      setAlertModal({ isOpen: true, type: 'error', title: 'Update Failed', message: err.message || 'An error occurred while saving your portfolio changes.' });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6 lg:sticky lg:top-8">
      <Panel accent="teal" className="p-6 space-y-4">
        <div className="border-b border-[color:var(--raw-border-subtle)] pb-3">
          <SectionBadge icon={Zap} index="01" label="Dynamic Role Benefits" accent="amber" />
        </div>

        <ul className="space-y-3.5 text-xs text-ink-muted">
          {perks.perksHighlights.map((perk, idx) => (
            <li key={idx} className="flex gap-2.5 leading-relaxed font-sans">
              <CheckCircle className="h-4 w-4 text-signal-teal shrink-0 mt-0.5" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>

        <div className="pt-3 border-t border-[color:var(--raw-border-subtle)] flex flex-col gap-2 font-mono text-[10px] text-ink-muted">
          <div className="flex justify-between">
            <span>Speed limits (Minute):</span>
            <strong className="text-ink-muted font-semibold">{perks.rateLimitPerMin} req / min</strong>
          </div>
          <div className="flex justify-between">
            <span>Validation limits (Daily):</span>
            <strong className="text-ink-muted font-semibold">{perks.rateLimitPerDay} req / day</strong>
          </div>
        </div>
      </Panel>

      <div className="relative overflow-hidden border border-[color:var(--raw-border-subtle)]">
        {!perks.customLinksEnabled && (
          <div className="absolute inset-0 bg-bg-void/70 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 text-center select-none space-y-4">
            <div className="p-3 bg-signal-amber/10 border border-signal-amber/35 rounded-full text-brand-amber">
              <Lock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">Portfolio Features Locked</h4>
              <p className="text-[10px] text-ink-muted leading-normal leading-relaxed mt-2 max-w-[210px] mx-auto">
                Submit your first verified product solution to promote your account, unlock 6x faster speed, and edit your custom founder card!
              </p>
            </div>
            <Link
              href="/browse"
              className="inline-flex h-8 px-4 items-center justify-center font-mono text-[9px] uppercase tracking-widest font-bold bg-signal-amber hover:opacity-90 text-slate-950 rounded-lg"
            >
              Scan Problems & Solve
            </Link>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="p-6 bg-bg-panel/20 space-y-4">
          <div className="border-b border-[color:var(--raw-border-subtle)] pb-3">
            <SectionBadge icon={Award} index="02" label="Builder Profile Customizer" accent="teal" />
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[9px] text-ink-muted tracking-wider block uppercase font-bold">
              Founder bio tagline (160 Chars)
            </label>
            <textarea
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value.substring(0, 160))}
              placeholder="e.g. Building micro-SaaS developer tooling since 2021. Founder of Webpack TurboLoader."
              className="input-terminal input-terminal-teal w-full p-3 text-xs resize-none h-20"
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[9px] text-ink-muted tracking-wider block uppercase font-bold flex items-center gap-1">
              <GithubIcon className="h-3 w-3" /> GitHub URL
            </label>
            <input
              type="text"
              value={githubInput}
              onChange={(e) => setGithubInput(e.target.value)}
              placeholder="github.com/your-username"
              className="input-terminal input-terminal-teal w-full px-3 py-2 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[9px] text-ink-muted tracking-wider block uppercase font-bold flex items-center gap-1">
              <Globe className="h-3 w-3" /> Personal / Agency website URL
            </label>
            <input
              type="text"
              value={websiteInput}
              onChange={(e) => setWebsiteInput(e.target.value)}
              placeholder="https://your-agency.io"
              className="input-terminal input-terminal-teal w-full px-3 py-2 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full h-9 bg-teal-400 text-slate-950 font-mono text-[9px] uppercase tracking-widest font-bold rounded-lg hover:bg-teal-300 transition-colors disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1"
          >
            {savingProfile ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" /> Save Profile Details
              </>
            )}
          </button>
        </form>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
