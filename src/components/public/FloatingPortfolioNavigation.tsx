import React, { useCallback } from 'react';
import { OptionWheel, OptionWheelItemInput, DEFAULT_NAV_WHEEL_ITEMS } from '../reactbits/OptionWheel';

export interface FloatingPortfolioNavigationProps {
  onNavigateSection?: (sectionId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Real Section Targets in published portfolio DOM:
 * - Work -> 'projects' (id="projects")
 * - Experience -> 'experience' (id="experience")
 * - About -> 'about' (id="about")
 * - Open to Work -> 'opentowork' (id="opentowork")
 * - Contact -> 'contact' (id="contact")
 */
export const portfolioItems = [
  'Work',
  'Experience',
  'About',
  'Open to Work',
  'Contact',
];

export const PORTFOLIO_NAV_ITEMS = portfolioItems;

const SECTION_MAP: Record<string, string> = {
  work: 'projects',
  projects: 'projects',
  'orion-9': 'orion-9',
  orion9: 'orion-9',
  experience: 'experience',
  about: 'about',
  'open to work': 'opentowork',
  opentowork: 'opentowork',
  contact: 'contact',
};

export const resolvePortfolioSectionId = (item: OptionWheelItemInput): string => {
  if (typeof item === 'object' && item !== null) {
    if (item.targetId) return item.targetId;
    if (item.id && SECTION_MAP[item.id.toLowerCase()]) return SECTION_MAP[item.id.toLowerCase()];
    if (item.label && SECTION_MAP[item.label.toLowerCase()]) return SECTION_MAP[item.label.toLowerCase()];
    if (item.id) return item.id;
  }
  const str = String(item).trim().toLowerCase();
  return SECTION_MAP[str] || str.replace(/\s+/g, '-');
};

/**
 * GLOBAL FLOATING PORTFOLIO NAVIGATION (Official React Bits Option Wheel)
 * 
 * Positioned independently on the far-right side of the website.
 * Standalone vertical 3D cylindrical option wheel floating with transparent background.
 * No outer cards, no borders, no showcase panels, no extraneous title/case-study buttons.
 */
export const FloatingPortfolioNavigation: React.FC<FloatingPortfolioNavigationProps> = ({
  onNavigateSection,
  className = '',
  style = {},
}) => {
  const navigateToPortfolioSection = useCallback(
    (item: OptionWheelItemInput) => {
      const targetId = resolvePortfolioSectionId(item);
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
      className={`floating-portfolio-navigation floating-portfolio-nav desktop-nav-links ${className}`.trim()}
      style={style}
      aria-label="Global Portfolio Navigation"
    >
      <OptionWheel
        items={portfolioItems}
        defaultSelected={0}
        textColor="#a6a6a6"
        activeColor="#ffffff"
        side="right"
        fontSize={1.55}
        spacing={1.65}
        curve={1}
        tilt={6}
        blur={1.5}
        fade={0.25}
        smoothing={200}
        inset={12}
        loop={false}
        draggable={true}
        soundUrl=""
        soundVolume={0.5}
        onChange={(_index, item) => navigateToPortfolioSection(item)}
        className="option-wheel--floating-nav"
        label="Global Portfolio Section Navigation Wheel"
      />
    </aside>
  );
};

export { DEFAULT_NAV_WHEEL_ITEMS };
export default FloatingPortfolioNavigation;
