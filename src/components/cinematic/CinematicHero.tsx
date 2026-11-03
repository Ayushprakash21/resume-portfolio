import React from 'react';
import { CinematicHeroScene } from './CinematicHeroScene';
import { CinematicHeroLayout } from './CinematicHeroLayout';
import { ProfileData, HomepageSettings } from '../../types/cms';

interface CinematicHeroProps {
  reducedMotion?: boolean;
  profile?: ProfileData;
  homepageSettings?: HomepageSettings;
  onNavigateSection?: (sectionId: string) => void;
  onOpenAdmin?: () => void;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  reducedMotion = false,
  profile,
  homepageSettings,
  onNavigateSection,
  onOpenAdmin,
}) => {
  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '700px',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* 3D Natural Landscape Scene with proper ambient, key, rim lighting & no fake particles */}
      <CinematicHeroScene reducedMotion={reducedMotion} />

      {/* Exact Layout Elements Overlay (Section 4 + CMS reactive fields) */}
      <CinematicHeroLayout
        profile={profile}
        homepageSettings={homepageSettings}
        onNavigateSection={onNavigateSection}
        onOpenAdmin={onOpenAdmin}
      />
    </section>
  );
};
