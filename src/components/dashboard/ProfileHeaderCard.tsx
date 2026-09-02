'use client';

import { Award, Globe, User } from 'lucide-react';
import Panel from '@/components/ui/Panel';
import SignalMeter from '@/components/SignalMeter';
import GithubIcon from '@/components/icons/GithubIcon';
import type { UserProfile, RolePerks } from './types';

interface ProfileHeaderCardProps {
  profile: UserProfile;
  perks: RolePerks;
  avatarUrl?: string | null;
  builderSolutionsCount: number;
  totalUpvotes: number;
}

export default function ProfileHeaderCard({ profile, perks, avatarUrl, builderSolutionsCount, totalUpvotes }: ProfileHeaderCardProps) {
  const isBuilder = profile.role === 'builder' || profile.role === 'admin';

  return (
    <Panel accent="teal" className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center relative overflow-hidden select-none shrink-0 ${
          profile.role === 'builder' ? 'border-teal-400/50 shadow-[0_0_20px_rgba(20,184,166,0.15)]' : 'border-amber-500/35'
        }`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <User className="h-7 w-7 text-ink-muted" />
          )}
          {profile.role === 'builder' && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-teal-400 border-2 border-bg-panel rounded-full flex items-center justify-center animate-pulse" />
          )}
        </div>

        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold font-sans capitalize text-ink flex flex-wrap items-center gap-3 justify-center sm:justify-start">
            {profile.name}
            <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider ${perks.badgeColor}`}>
              {profile.role === 'builder' && <Award className="h-3 w-3 inline mr-1 -mt-0.5 animate-bounce" />}
              {perks.label}
            </span>
          </h1>
          <p className="text-xs text-ink-muted font-mono tracking-wide">
            Registered Account: <span className="text-ink-muted">{new Date(profile.createdAt).toLocaleDateString()}</span>
          </p>
          <span className="text-[12px] font-mono text-ink-muted uppercase tracking-widest block flex flex-wrap items-center gap-x-2 gap-y-1 justify-center sm:justify-start">
            {profile.customBio && (
              <span className="text-ink-muted italic normal-case font-sans">({profile.customBio})</span>
            )}
            {profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-ink-muted hover:text-ink p-0.5 transition-colors" title="Builder GitHub Profile">
                <GithubIcon className="h-3 w-3 inline -mt-0.5" />
              </a>
            )}
            {profile.websiteUrl && (
              <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-ink-muted hover:text-ink p-0.5 transition-colors" title="Builder Personal Website">
                <Globe className="h-3 w-3 inline -mt-0.5" />
              </a>
            )}
          </span>
        </div>
      </div>

      {isBuilder && (
        <div className="flex gap-4 shrink-0 font-mono select-none">
          <div className="px-5 py-3.5 bg-bg-void/70 border border-[color:var(--raw-border-subtle)] text-center min-w-[100px] shadow-lg">
            <span className="text-[9px] text-ink-muted uppercase tracking-widest block font-bold">SOLUTIONS</span>
            <strong className="text-xl font-bold text-signal-teal">{builderSolutionsCount}</strong>
          </div>
          <div className="px-5 py-3.5 bg-bg-void/70 border border-[color:var(--raw-border-subtle)] text-center min-w-[100px] shadow-lg">
            <span className="text-[9px] text-ink-muted uppercase tracking-widest block font-bold">TOTAL SCORE</span>
            <strong className="text-xl font-bold text-signal-teal">+{totalUpvotes}</strong>
            <div className="flex justify-center mt-1.5">
              <SignalMeter value={totalUpvotes} max={Math.max(totalUpvotes, 20)} solved={1} size="sm" />
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
