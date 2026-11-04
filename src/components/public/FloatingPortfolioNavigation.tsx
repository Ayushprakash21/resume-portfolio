import React from 'react';

export interface FloatingPortfolioNavigationProps {
  onNavigateSection?: (sectionId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * OptionWheel component removed from public homepage per user directive.
 * Replaced by the video-reference Top-Right Glass Navigation Panel in NavbarRedesigned.
 * This component safely renders null to prevent orphaned wheel instances.
 */
export const FloatingPortfolioNavigation: React.FC<FloatingPortfolioNavigationProps> = () => {
  return null;
};

export default FloatingPortfolioNavigation;
