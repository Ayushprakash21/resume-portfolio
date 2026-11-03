import React from 'react';
import { CinematicHeroScene } from './CinematicHeroScene';
import { CinematicHeroLayout } from './CinematicHeroLayout';

interface CinematicHeroProps {
  reducedMotion?: boolean;
  onNavigateSection?: (sectionId: string) => void;
  onOpenAdmin?: () => void;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  reducedMotion = false,
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
      {/* 3D Natural Landscape Scene */}
      <CinematicHeroScene reducedMotion={reducedMotion} />

      {/* Exact Layout Elements Overlay (Section 4) */}
      <CinematicHeroLayout
        onNavigateSection={onNavigateSection}
        onOpenAdmin={onOpenAdmin}
      />
    </section>
  );
};
