'use client';

import { useState, useEffect } from 'react';
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
  const [bioInput, setBioInput] = useState(profile.customBio ?? '');
  const [githubInput, setGithubInput] = useState(profile.githubUrl ?? '');
  const [websiteInput, setWebsiteInput] = useState(profile.websiteUrl ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'success' as 'success' | 'error' | 'info', title: '', message: '' });

  // Profile can arrive after mount (parent fetches it), so resync once it does.
  useEffect(() => {
    setBioInput(profile.customBio ?? '');
    setGithubInput(profile.githubUrl ?? '');
    setWebsiteInput(profile.websiteUrl ?? '');
  }, [profile.customBio, profile.githubUrl, profile.websiteUrl]);

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      setAlertModal({ isOpen: true, type: 'error', title: 'Update Failed', message: message || 'An error occurred while saving your portfolio changes.' });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6 lg:sticky lg:top-8">
      <Panel accent="teal" className="p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <SectionBadge icon={Zap} index="01" label="Dynamic Role Benefits" accent="amber" />
        </div>

        <ul className="space-y-3.5 text-xs text-ink-muted">
          {perks.perksHighlights.map((perk, idx) => (
            <li key={idx} className="flex gap-2.5 leading-relaxed">
              <CheckCircle className="h-4 w-4 text-status-matched shrink-0 mt-0.5" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>

        <div className="pt-3 border-t border-border flex flex-col gap-2 text-xs text-ink-muted">
          <div className="flex justify-between">
            <span>Speed limits (Minute):</span>
            <strong className="font-mono text-ink font-semibold">{perks.rateLimitPerMin} req / min</strong>
          </div>
          <div className="flex justify-between">
            <span>Validation limits (Daily):</span>
            <strong className="font-mono text-ink font-semibold">{perks.rateLimitPerDay} req / day</strong>
          </div>
        </div>
      </Panel>

      <div className="relative overflow-hidden rounded-xl border border-border">
        {!perks.customLinksEnabled && (
          <div className="absolute inset-0 bg-bg-panel/95 z-10 flex flex-col items-center justify-center p-6 text-center select-none space-y-4">
            <div className="p-3 bg-accent/10 border border-accent/30 rounded-full text-accent">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink">Portfolio Features Locked</h4>
              <p className="text-xs text-ink-muted leading-relaxed mt-2 max-w-[210px] mx-auto">
                Submit your first verified product solution to promote your account, unlock 6x faster speed, and edit your custom founder card!
              </p>
            </div>
            <Link
              href="/browse"
              className="inline-flex h-8 px-4 items-center justify-center text-xs font-semibold bg-accent hover:opacity-90 text-white rounded-lg"
            >
              Scan Problems & Solve
            </Link>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="p-6 bg-bg-panel space-y-4">
          <div className="border-b border-border pb-3">
            <SectionBadge icon={Award} index="02" label="Builder Profile Customizer" accent="teal" />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-ink-muted block font-medium">
              Founder bio tagline (160 Chars)
            </label>
            <textarea
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value.substring(0, 160))}
              placeholder="e.g. Building micro-SaaS developer tooling since 2021. Founder of Webpack TurboLoader."
              className="input-field w-full p-3 text-sm resize-none h-20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-ink-muted block font-medium flex items-center gap-1">
              <GithubIcon className="h-3 w-3" /> GitHub URL
            </label>
            <input
              type="text"
              value={githubInput}
              onChange={(e) => setGithubInput(e.target.value)}
              placeholder="github.com/your-username"
              className="input-field w-full px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-ink-muted block font-medium flex items-center gap-1">
              <Globe className="h-3 w-3" /> Personal / Agency website URL
            </label>
            <input
              type="text"
              value={websiteInput}
              onChange={(e) => setWebsiteInput(e.target.value)}
              placeholder="https://your-agency.io"
              className="input-field w-full px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full h-9 bg-status-matched text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1"
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
