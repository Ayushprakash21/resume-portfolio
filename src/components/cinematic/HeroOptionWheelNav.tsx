import React, { useCallback } from 'react';
import { OptionWheel, DEFAULT_NAV_WHEEL_ITEMS, OptionWheelItemInput } from '../reactbits/OptionWheel';

export interface HeroOptionWheelNavProps {
  onNavigateSection?: (sectionId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HERO RIGHT-SIDE NAVIGATION WHEEL (Official React Bits Option Wheel)
 * 
 * Positioned in the prominent right-side negative space of the hero cinematic scene.
 * Authentic 3D cylindrical drum barrel interaction for portfolio-wide navigation:
 * - Work (#projects)
 * - Orion-9 (#orion-9)
 * - Experience (#experience)
 * - About (#about)
 * - Open to Work (#opentowork)
 * - Contact (#contact)
 */
export const HeroOptionWheelNav: React.FC<HeroOptionWheelNavProps> = ({
  onNavigateSection,
  className = '',
  style = {},
}) => {
  const handleSelect = useCallback(
    (item: OptionWheelItemInput) => {
      const targetId =
        typeof item === 'object' && item.targetId
          ? item.targetId
          : typeof item === 'string'
          ? item.toLowerCase()
          : item.id;
      if (onNavigateSection) {
        onNavigateSection(targetId);
      } else {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [onNavigateSection]
  );

  return (
    <aside
      className={`hero-right-wheel-dock desktop-nav-links ${className}`}
      style={style}
      aria-label="Section Navigation"
    >
      <div className="hero-right-wheel-card">
        <div className="hero-right-wheel-header">
          <span className="hero-right-wheel-tag">NAVIGATION</span>
          <span className="hero-right-wheel-dot" />
        </div>
        <OptionWheel
          items={DEFAULT_NAV_WHEEL_ITEMS}
          side="center"
          height="100%"
          fontSize={1.12}
          spacing={1.65}
          curve={0.45}
          tilt={4.5}
          blur={0.8}
          fade={0.32}
          minOpacity={0.12}
          smoothing={160}
          inset={20}
          onSelect={handleSelect}
          className="option-wheel--hero-dock"
          label="Portfolio Section Navigation Wheel"
        />
      </div>
    </aside>
  );
};
