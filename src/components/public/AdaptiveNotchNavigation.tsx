import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Briefcase, Layers, User, ArrowUpRight } from 'lucide-react';
import { ApMonogram } from '../brand/ApMonogram';

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

export interface AdaptiveNotchNavigationProps {
  onNavigateSection?: (sectionId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * EXACT ADAPTIVE TOP-NOTCH NAVIGATION IMPLEMENTATION
 *
 * Distinctive Architecture (matching reference screenshot):
 * 1. Full-width sculpted black / smoked graphite surface attached to top edge (y = 0).
 * 2. Distinctive Left Brand Notch housing the authentic AP Logo asset.
 * 3. Central Navigation Notch with 4 destinations (Home, Work, Experience, Contact)
 *    and a sliding pearl/silver capsule active highlight.
 * 4. Distinctive Right Action Notch housing the "Connect ↗" quick action.
 * 5. Smooth inverted-curve concave fillets seamlessly transitioning between
 *    the top bar and each notch wall without border seams.
 * 6. Responsive adaptation across Desktop, Tablet, and Mobile.
 * 7. Bi-directional scroll-state tracking with debounce protection against boundary flicker.
 */
export const AdaptiveNotchNavigation: React.FC<AdaptiveNotchNavigationProps> = ({
  onNavigateSection,
  className = '',
  style,
}) => {
  const [activeId, setActiveId] = useState<string>('home');
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );

  const navRef = useRef<HTMLElement>(null);
  const navTabsRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const navigateTimeoutRef = useRef<number | null>(null);

  // Track viewport width responsively
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update sliding indicator pill position to match active tab
  const updateIndicator = useCallback(() => {
    const activeEl = itemRefs.current[activeId];
    const container = navTabsRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      });
    }
  }, [activeId]);

  useEffect(() => {
    updateIndicator();
  }, [activeId, updateIndicator, viewportWidth]);

  // Scroll detection: update active destination based on scroll position
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

        // If near bottom of the page, activate Contact
        if (windowHeight + scrollY >= docHeight - 140) {
          setActiveId('contact');
          ticking = false;
          return;
        }

        const projectsEl = document.getElementById('projects');
        const experienceEl = document.getElementById('experience');
        const contactEl = document.getElementById('contact');

        const triggerLine = windowHeight * 0.42;

        // Check from bottom of page upwards:
        if (contactEl && contactEl.getBoundingClientRect().top <= triggerLine) {
          setActiveId('contact');
        } else if (projectsEl && projectsEl.getBoundingClientRect().top <= triggerLine) {
          setActiveId('work');
        } else if (experienceEl && experienceEl.getBoundingClientRect().top <= triggerLine) {
          setActiveId('experience');
        } else {
          setActiveId('home');
        }

        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (navigateTimeoutRef.current) {
        window.clearTimeout(navigateTimeoutRef.current);
      }
    };
  }, [isNavigating]);

  const handleItemClick = useCallback(
    (destination: NavDestination) => {
      setActiveId(destination.id);
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

  const isMobile = viewportWidth <= 640;
  const isTablet = viewportWidth > 640 && viewportWidth <= 1024;

  // Geometry dimensions
  const notchHeight = isMobile ? 44 : 48;
  const filletRadius = isMobile ? 12 : 16;
  const cornerRadius = isMobile ? 14 : 18;

  // Notch widths
  const leftNotchWidth = isMobile ? 64 : isTablet ? 110 : 130;
  const centerNotchWidth = isMobile ? Math.min(viewportWidth - (leftNotchWidth + 60), 280) : isTablet ? 390 : 440;
  const rightNotchWidth = isMobile ? 48 : isTablet ? 110 : 130;

  return (
    <header
      ref={navRef}
      role="navigation"
      aria-label="Primary Adaptive Notch Navigation"
      className={`adaptive-notch-header ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: `${notchHeight + 4}px`,
        zIndex: 90,
        pointerEvents: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* ========================================================
          CONTINUOUS TOP CONNECTING BAR (Attaches to top edge y = 0)
          ======================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2.5px',
          backgroundColor: '#07080A',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none',
        }}
      />

      {/* ========================================================
          1. LEFT BRAND NOTCH (Logo Notch)
          Flush with left edge, concave fillet on right
          ======================================================== */}
      <div
        className="adaptive-notch-island left-brand-notch"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${leftNotchWidth}px`,
          height: `${notchHeight}px`,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg
          viewBox={`0 0 ${leftNotchWidth + filletRadius} ${notchHeight}`}
          width={leftNotchWidth + filletRadius}
          height={notchHeight}
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
            filter: 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.65))',
          }}
          aria-hidden="true"
        >
          {/* Surface fill */}
          <path
            d={`M 0 0
                L 0 ${notchHeight - cornerRadius}
                A ${cornerRadius} ${cornerRadius} 0 0 0 ${cornerRadius} ${notchHeight}
                L ${leftNotchWidth - cornerRadius} ${notchHeight}
                A ${cornerRadius} ${cornerRadius} 0 0 0 ${leftNotchWidth} ${notchHeight - cornerRadius}
                L ${leftNotchWidth} ${filletRadius}
                A ${filletRadius} ${filletRadius} 0 0 1 ${leftNotchWidth + filletRadius} 0
                Z`}
            fill="#090A0D"
          />
          {/* Subtle metallic silver border contour */}
          <path
            d={`M 0 ${notchHeight}
                L ${leftNotchWidth - cornerRadius} ${notchHeight}
                A ${cornerRadius} ${cornerRadius} 0 0 0 ${leftNotchWidth} ${notchHeight - cornerRadius}
                L ${leftNotchWidth} ${filletRadius}
                A ${filletRadius} ${filletRadius} 0 0 1 ${leftNotchWidth + filletRadius} 0`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
          />
        </svg>

        {/* Content: Authentic AP Logo Asset */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleItemClick(NAV_DESTINATIONS[0]);
          }}
          aria-label="Navigate to top"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: isMobile ? '14px' : '20px',
            textDecoration: 'none',
            height: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isMobile ? '28px' : '32px',
              height: isMobile ? '28px' : '32px',
              borderRadius: '7px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <ApMonogram width={isMobile ? 18 : 22} withGlow={false} />
          </div>
        </a>
      </div>

      {/* ========================================================
          2. CENTRAL NAVIGATION NOTCH (Main Destination Island)
          Concave fillets on left and right, rounded bottom corners
          ======================================================== */}
      <div
        className="adaptive-notch-island center-nav-notch"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${centerNotchWidth}px`,
          height: `${notchHeight}px`,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox={`0 0 ${centerNotchWidth + filletRadius * 2} ${notchHeight}`}
          width={centerNotchWidth + filletRadius * 2}
          height={notchHeight}
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: `-${filletRadius}px`,
            width: `calc(100% + ${filletRadius * 2}px)`,
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
            filter: 'drop-shadow(0 12px 28px rgba(0, 0, 0, 0.7))',
          }}
          aria-hidden="true"
        >
          {/* Surface fill */}
          <path
            d={`M 0 0
                A ${filletRadius} ${filletRadius} 0 0 1 ${filletRadius} ${filletRadius}
                L ${filletRadius} ${notchHeight - cornerRadius}
                A ${cornerRadius} ${cornerRadius} 0 0 0 ${filletRadius + cornerRadius} ${notchHeight}
                L ${centerNotchWidth + filletRadius - cornerRadius} ${notchHeight}
                A ${cornerRadius} ${cornerRadius} 0 0 0 ${centerNotchWidth + filletRadius} ${notchHeight - cornerRadius}
                L ${centerNotchWidth + filletRadius} ${filletRadius}
                A ${filletRadius} ${filletRadius} 0 0 1 ${centerNotchWidth + filletRadius * 2} 0
                Z`}
            fill="#090A0D"
          />
          {/* Subtle metallic silver border contour */}
          <path
            d={`M 0 0
                A ${filletRadius} ${filletRadius} 0 0 1 ${filletRadius} ${filletRadius}
                L ${filletRadius} ${notchHeight - cornerRadius}
                A ${cornerRadius} ${cornerRadius} 0 0 0 ${filletRadius + cornerRadius} ${notchHeight}
                L ${centerNotchWidth + filletRadius - cornerRadius} ${notchHeight}
                A ${cornerRadius} ${cornerRadius} 0 0 0 ${centerNotchWidth + filletRadius} ${notchHeight - cornerRadius}
                L ${centerNotchWidth + filletRadius} ${filletRadius}
                A ${filletRadius} ${filletRadius} 0 0 1 ${centerNotchWidth + filletRadius * 2} 0`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
          />
        </svg>

        {/* Navigation Tabs Container with Sliding Pearl/Silver Capsule Highlight */}
        <div
          ref={navTabsRef}
          role="tablist"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: isMobile ? '0 6px' : '0 12px',
          }}
        >
          {/* Sliding active indicator capsule pill */}
          <div
            className="notch-active-pill"
            style={{
              position: 'absolute',
              top: isMobile ? '5px' : '7px',
              left: 0,
              width: `${indicatorStyle.width}px`,
              height: isMobile ? '34px' : '34px',
              transform: `translateX(${indicatorStyle.left}px)`,
              backgroundColor: 'rgba(255, 255, 255, 0.11)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '9999px',
              boxShadow:
                '0 4px 14px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              pointerEvents: 'none',
              zIndex: 1,
              transition:
                'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), width 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: indicatorStyle.width > 0 ? 1 : 0,
            }}
          />

          {NAV_DESTINATIONS.map((dest) => {
            const Icon = dest.icon;
            const isActive = dest.id === activeId;

            return (
              <button
                key={dest.id}
                ref={(el) => {
                  itemRefs.current[dest.id] = el;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Navigate to ${dest.label}`}
                onClick={() => handleItemClick(dest)}
                className={`notch-nav-item ${isActive ? 'is-active' : ''}`}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isMobile ? '0px' : '7px',
                  padding: isMobile ? '8px 10px' : '7px 14px',
                  minWidth: isMobile ? '44px' : 'auto',
                  minHeight: '44px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  color: isActive ? '#FFFFFF' : '#9CA3AF',
                  fontFamily:
                    'var(--font-display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
                  fontSize: isMobile ? '12px' : '13px',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '-0.01em',
                  transition: 'color 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Icon
                  size={isMobile ? 17 : 16}
                  strokeWidth={isActive ? 2.3 : 1.9}
                  className="notch-icon"
                />
                {!isMobile && <span>{dest.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          3. RIGHT ACTION NOTCH (Action / Account Slot)
          Concave fillet on left, flush with right screen edge
          ======================================================== */}
      <div
        className="adaptive-notch-island right-action-notch"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: `${rightNotchWidth}px`,
          height: `${notchHeight}px`,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <svg
          viewBox={`0 0 ${rightNotchWidth + filletRadius} ${notchHeight}`}
          width={rightNotchWidth + filletRadius}
          height={notchHeight}
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
            filter: 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.65))',
          }}
          aria-hidden="true"
        >
          {/* Surface fill */}
          <path
            d={`M 0 0
                A ${filletRadius} ${filletRadius} 0 0 1 ${filletRadius} ${filletRadius}
                L ${filletRadius} ${notchHeight - cornerRadius}
                A ${cornerRadius} ${cornerRadius} 0 0 0 ${filletRadius + cornerRadius} ${notchHeight}
                L ${rightNotchWidth + filletRadius} ${notchHeight}
                L ${rightNotchWidth + filletRadius} 0
                Z`}
            fill="#090A0D"
          />
          {/* Subtle metallic silver border contour */}
          <path
            d={`M 0 0
                A ${filletRadius} ${filletRadius} 0 0 1 ${filletRadius} ${filletRadius}
                L ${filletRadius} ${notchHeight - cornerRadius}
                A ${cornerRadius} ${cornerRadius} 0 0 0 ${filletRadius + cornerRadius} ${notchHeight}
                L ${rightNotchWidth + filletRadius} ${notchHeight}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
          />
        </svg>

        {/* Content: Connect Quick Action */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            paddingRight: isMobile ? '12px' : '20px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleItemClick(NAV_DESTINATIONS[3]);
            }}
            aria-label="Connect with Ayush"
            className="notch-action-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0' : '6px',
              padding: isMobile ? '7px 8px' : '6px 12px',
              minHeight: '32px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '9999px',
              color: '#E4E4E7',
              fontSize: '12px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
            }}
          >
            {!isMobile && <span>Connect</span>}
            <ArrowUpRight size={14} color="#A1A1AA" />
          </a>
        </div>
      </div>

      {/* Embedded styles for keyboard accessibility and reduced-motion */}
      <style>{`
        .notch-nav-item:hover {
          color: #F4F4F5 !important;
        }

        .notch-nav-item:focus-visible,
        .notch-action-btn:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.6) !important;
          outline-offset: 2px !important;
          border-radius: 9999px !important;
        }

        .notch-action-btn:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.24) !important;
          color: #FFFFFF !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .notch-active-pill,
          .notch-nav-item,
          .notch-action-btn {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default AdaptiveNotchNavigation;
