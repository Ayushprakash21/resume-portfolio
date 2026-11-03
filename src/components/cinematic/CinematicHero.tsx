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
        backgroundColor: '#050505',
      }}
    >
      {/* LAYER 1: 3D Natural Landscape Scene (pointer-events: none) */}
      <CinematicHeroScene reducedMotion={reducedMotion} />

      {/* LAYER 2: Dark Atmospheric Contrast Vignette (prevents 3D background from visually competing with text) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 20% 32%, rgba(5, 5, 5, 0.85) 0%, rgba(5, 5, 5, 0.45) 55%, rgba(5, 5, 5, 0.85) 100%), linear-gradient(180deg, rgba(5, 5, 5, 0.6) 0%, transparent 40%, rgba(5, 5, 5, 0.9) 100%)',
        }}
      />

      {/* LAYER 3, 4, 5: Exact Layout Elements Overlay with Local Glass Backdrop & High-Contrast Typography */}
      <CinematicHeroLayout
        reducedMotion={reducedMotion}
        profile={profile}
        homepageSettings={homepageSettings}
        onNavigateSection={onNavigateSection}
        onOpenAdmin={onOpenAdmin}
      />
    </section>
  );
};
