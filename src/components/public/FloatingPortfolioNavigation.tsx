import React, { useCallback } from 'react';
import { OptionWheel, DEFAULT_NAV_WHEEL_ITEMS, OptionWheelItemInput } from '../reactbits/OptionWheel';

export interface FloatingPortfolioNavigationProps {
  onNavigateSection?: (sectionId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * GLOBAL FLOATING PORTFOLIO NAVIGATION (Official React Bits Option Wheel)
 * 
 * Positioned independently on the far-right side of the website.
 * Standalone vertical 3D cylindrical option wheel floating with transparent background.
 * No outer cards, no borders, no showcase panels.
 * 
 * Portfolio Navigation Targets:
 * 1. Work (#projects)
 * 2. Orion-9 (#orion-9)
 * 3. Experience (#experience)
 * 4. About (#about)
 * 5. Open to Work (#opentowork)
 * 6. Contact (#contact)
 */
export const FloatingPortfolioNavigation: React.FC<FloatingPortfolioNavigationProps> = ({
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
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    [onNavigateSection]
  );

  return (
    <aside
      className={`floating-portfolio-nav desktop-nav-links ${className}`}
      style={style}
      aria-label="Global Portfolio Navigation"
    >
      <OptionWheel
        items={DEFAULT_NAV_WHEEL_ITEMS}
        side="center"
        height="100%"
        fontSize={1.15}
        spacing={1.65}
        curve={0.45}
        tilt={4.5}
        blur={0.8}
        fade={0.32}
        minOpacity={0.12}
        smoothing={160}
        inset={20}
        textColor="#7E8590"
        activeColor="#FFFFFF"
        onSelect={handleSelect}
        className="option-wheel--floating-nav"
        label="Global Section Navigation Wheel"
      />
    </aside>
  );
};

export default FloatingPortfolioNavigation;
