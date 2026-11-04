import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Briefcase, Layers, User } from 'lucide-react';

export interface NavDestination {
  id: string;
  label: string;
  targetId: string;
  icon: React.FC<{ size?: number; className?: string; strokeWidth?: number }>;
}

export const NAV_DESTINATIONS: NavDestination[] = [
  { id: 'home', label: 'Home', targetId: 'hero', icon: Home },
  { id: 'work', label: 'Work', targetId: 'projects', icon: Briefcase },
  { id: 'experience', label: 'Experience', targetId: 'experience', icon: Layers },
  { id: 'contact', label: 'Contact', targetId: 'contact', icon: User },
];

export interface CurvedPillNavigationProps {
  onNavigateSection?: (sectionId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Animated Floating Curved Pill Navigation (P0 Reference Video Implementation)
 *
 * Visual Characteristics:
 * - Wide white pill-shaped horizontal floating surface.
 * - Four evenly distributed destinations (Home, Work, Experience, Contact).
 * - Active indicator is a bright lime-green circular badge with deep black icon.
 * - The white navigation surface features a smooth curved downward indentation (notch)
 *   that cradles the active circle.
 * - A dark curved shadow/cutout rim traces the notch curve under the active circle.
 * - The active indicator, notch indentation, and cutout shadow glide horizontally
 *   as one coherent visual unit with spring-like physics.
 * - Inactive icons are near-black, centered, and smoothly transition visibility.
 * - Bi-directional scroll synchronization using IntersectionObserver + scroll detection.
 */
export const CurvedPillNavigation: React.FC<CurvedPillNavigationProps> = ({
  onNavigateSection,
  className = '',
  style,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 360,
    height: 68,
  });

  const navRef = useRef<HTMLDivElement>(null);
  const navigateTimeoutRef = useRef<number | null>(null);

  // Measure container width responsively
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window === 'undefined') return;
      const isMobile = window.innerWidth <= 480;
      const isTablet = window.innerWidth > 480 && window.innerWidth <= 768;
      
      const width = isMobile ? Math.min(320, window.innerWidth - 32) : isTablet ? 340 : 360;
      const height = isMobile ? 62 : 68;
      
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Determine section offsets and update active item on scroll
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;

    const handleScroll = () => {
      if (isNavigating) return;
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;

        // If user is near the very bottom of the page, activate Contact
        if (windowHeight + scrollY >= docHeight - 120) {
          setActiveIndex(3);
          ticking = false;
          return;
        }

        // If user is near top (inside Hero / before Work)
        const projectsEl = document.getElementById('projects');
        const experienceEl = document.getElementById('experience');
        const contactEl = document.getElementById('contact');

        const triggerLine = windowHeight * 0.4;

        if (projectsEl) {
          const pRect = projectsEl.getBoundingClientRect();
          if (pRect.top > triggerLine) {
            setActiveIndex(0); // Still in Home/Hero zone
            ticking = false;
            return;
          }
        }

        // Check contact
        if (contactEl) {
          const cRect = contactEl.getBoundingClientRect();
          if (cRect.top <= triggerLine) {
            setActiveIndex(3);
            ticking = false;
            return;
          }
        }

        // Check experience
        if (experienceEl) {
          const eRect = experienceEl.getBoundingClientRect();
          if (eRect.top <= triggerLine) {
            setActiveIndex(2);
            ticking = false;
            return;
          }
        }

        // Otherwise inside projects / work
        if (projectsEl) {
          setActiveIndex(1);
        }

        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial evaluation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (navigateTimeoutRef.current) {
        window.clearTimeout(navigateTimeoutRef.current);
      }
    };
  }, [isNavigating]);

  // Click handler
  const handleItemClick = useCallback(
    (index: number, destination: NavDestination) => {
      setActiveIndex(index);
      setIsNavigating(true);

      if (navigateTimeoutRef.current) {
        window.clearTimeout(navigateTimeoutRef.current);
      }
      navigateTimeoutRef.current = window.setTimeout(() => {
        setIsNavigating(false);
      }, 850);

      if (onNavigateSection) {
        onNavigateSection(destination.targetId);
      } else {
        if (destination.targetId === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.getElementById(destination.targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    },
    [onNavigateSection]
  );

  // Geometric calculations
  const { width: navWidth, height: navHeight } = dimensions;
  const slotWidth = navWidth / 4;
  const activeCenterX = (activeIndex + 0.5) * slotWidth;
  const activeTabTranslateX = activeIndex * slotWidth;

  // Active circle & notch dimensions
  const pillRadius = navHeight / 2;
  const circleSize = navHeight > 64 ? 54 : 48;
  const circleRadius = circleSize / 2;
  const notchHalfWidth = circleRadius + 12; // ~36px to 39px
  const notchDepth = navHeight > 64 ? 26 : 22; // ~22px to 26px

  const ActiveIconComponent = NAV_DESTINATIONS[activeIndex].icon;

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Main Portfolio Navigation"
      className={`curved-pill-navigation ${className}`}
      style={{
        position: 'fixed',
        bottom: 'max(24px, calc(env(safe-area-inset-bottom, 0px) + 16px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${navWidth}px`,
        height: `${navHeight}px`,
        zIndex: 85,
        pointerEvents: 'auto',
        userSelect: 'none',
        filter: 'drop-shadow(0 16px 36px rgba(0, 0, 0, 0.65)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45))',
        transition: 'width 0.3s ease, height 0.3s ease',
        ...style,
      }}
    >
      {/* ========================================================
          SVG LAYER: WHITE PILL SURFACE WITH ANIMATED CURVED NOTCH
          Uses an SVG <mask> with hardware-accelerated translateX
          ======================================================== */}
      <svg
        className="curved-nav-surface-svg"
        viewBox={`0 0 ${navWidth} ${navHeight}`}
        width={navWidth}
        height={navHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          display: 'block',
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Mask that carves out the moving curved notch */}
          <mask id="pill-curved-notch-mask">
            {/* Opaque white pill covering entire navbar */}
            <rect x="0" y="0" width={navWidth} height={navHeight} rx={pillRadius} fill="#FFFFFF" />

            {/* Black notch cutout shape translating horizontally in lockstep with activeIndex */}
            <g
              style={{
                transform: `translateX(${activeCenterX}px)`,
                transition: 'transform 0.48s cubic-bezier(0.34, 1.35, 0.64, 1)',
                willChange: 'transform',
              }}
            >
              {/* Smooth dual-cubic bezier notch cutout */}
              <path
                d={`M -${notchHalfWidth} 0
                    C -${notchHalfWidth * 0.55} 0, -${notchHalfWidth * 0.48} ${notchDepth}, 0 ${notchDepth}
                    C ${notchHalfWidth * 0.48} ${notchDepth}, ${notchHalfWidth * 0.55} 0, ${notchHalfWidth} 0
                    Z`}
                fill="#000000"
              />
            </g>
          </mask>
        </defs>

        {/* 1. White Nav Pill Surface (Masked by the Curved Notch) */}
        <rect
          x="0"
          y="0"
          width={navWidth}
          height={navHeight}
          rx={pillRadius}
          fill="#FFFFFF"
          mask="url(#pill-curved-notch-mask)"
        />

        {/* 2. Restrained Black Shadow / Cutout Rim along the curved notch */}
        <g
          style={{
            transform: `translateX(${activeCenterX}px)`,
            transition: 'transform 0.48s cubic-bezier(0.34, 1.35, 0.64, 1)',
            willChange: 'transform',
          }}
        >
          {/* Subtle dark contour along the notch curve to give natural depth */}
          <path
            d={`M -${notchHalfWidth} 0
                C -${notchHalfWidth * 0.55} 0, -${notchHalfWidth * 0.48} ${notchDepth}, 0 ${notchDepth}
                C ${notchHalfWidth * 0.48} ${notchDepth}, ${notchHalfWidth * 0.55} 0, ${notchHalfWidth} 0`}
            fill="none"
            stroke="rgba(0, 0, 0, 0.22)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* ========================================================
          SLIDING ACTIVE INDICATOR: BRIGHT LIME CIRCLE + BLACK ICON
          Translates horizontally in 100% synchronization with notch
          ======================================================== */}
      <div
        className="curved-nav-indicator-slider"
        style={{
          position: 'absolute',
          top: `-${circleRadius * 0.52}px`, // Elevated above the bar, cradled in the notch
          left: 0,
          width: `${slotWidth}px`,
          height: `${circleSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 25,
          transform: `translateX(${activeTabTranslateX}px)`,
          transition: 'transform 0.48s cubic-bezier(0.34, 1.35, 0.64, 1)',
          willChange: 'transform',
        }}
      >
        <div
          className="curved-nav-active-circle"
          style={{
            width: `${circleSize}px`,
            height: `${circleSize}px`,
            borderRadius: '50%',
            backgroundColor: '#B5FF14', // Vibrant bright lime/chartreuse
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0A0A0C', // Deep black icon
            border: '3.5px solid #050505', // Black cutout surround matching portfolio background
            boxShadow:
              '0 8px 22px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(181, 255, 20, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
            transform: 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <ActiveIconComponent
            size={navHeight > 64 ? 23 : 20}
            strokeWidth={2.4}
            className="curved-nav-active-icon"
          />
        </div>
      </div>

      {/* ========================================================
          FOUR EVENLY DISTRIBUTED DESTINATION BUTTONS & INACTIVE ICONS
          ======================================================== */}
      <div
        className="curved-nav-tabs"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          zIndex: 30,
        }}
      >
        {NAV_DESTINATIONS.map((dest, index) => {
          const Icon = dest.icon;
          const isActive = index === activeIndex;

          return (
            <button
              key={dest.id}
              type="button"
              onClick={() => handleItemClick(index, dest)}
              aria-label={`Navigate to ${dest.label} section`}
              aria-current={isActive ? 'page' : undefined}
              className={`curved-nav-tab-btn ${isActive ? 'is-active' : ''}`}
              style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                outline: 'none',
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Inactive Icon: Sleek near-black, vertically and horizontally centered */}
              <div
                className="curved-nav-inactive-icon-wrapper"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#111827',
                  opacity: isActive ? 0 : 0.9,
                  transform: isActive ? 'scale(0.55)' : 'scale(1)',
                  transition: 'opacity 0.24s ease, transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: 'none',
                }}
              >
                <Icon size={navHeight > 64 ? 22 : 19} strokeWidth={2.2} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Embedded scoped styles for keyboard accessibility & reduced-motion */}
      <style>{`
        .curved-nav-tab-btn:focus-visible {
          border-radius: 9999px;
          outline: 2px solid #B5FF14 !important;
          outline-offset: 2px !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .curved-pill-navigation *,
          .curved-nav-surface-svg g,
          .curved-nav-indicator-slider,
          .curved-nav-inactive-icon-wrapper {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default CurvedPillNavigation;
