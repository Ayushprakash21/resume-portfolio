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
  const notchHeight = isMobile ? 44 : 50;
  const filletRadius = isMobile ? 12 : 16;
  const cornerRadius = isMobile ? 14 : 18;
  const centerNotchWidth = isMobile
    ? Math.min(viewportWidth - 20, 360)
    : isTablet
    ? 520
    : 560;

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
          Clean, continuous top navigation surface spanning flush
          from left to right boundary with zero outer corner shapes
          ======================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2.5px',
          background:
            'linear-gradient(105deg, #080809 0%, #240609 25%, #480B12 50%, #26070B 75%, #090909 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.16)',
          pointerEvents: 'none',
        }}
      />

      {/* ========================================================
          CENTRAL NAVIGATION STRUCTURE (UNIFIED ADAPTIVE NOTCH)
          Houses the AP logo, central navigation destinations,
          and Connect action within a single sculpted notch island.
          Both outer corner notch structures at left & right are
          completely removed.
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
          justifyContent: 'space-between',
          padding: isMobile ? '0 8px' : '0 14px',
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
            filter: 'drop-shadow(0 12px 28px rgba(0, 0, 0, 0.75))',
          }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="apCenterNotchGrad" x1="0%" y1="0%" x2="100%" y2="25%">
              <stop offset="0%" stopColor="#220508" />
              <stop offset="22%" stopColor="#30070D" />
              <stop offset="50%" stopColor="#480B12" />
              <stop offset="78%" stopColor="#32070D" />
              <stop offset="100%" stopColor="#24060A" />
            </linearGradient>
            <linearGradient id="apCenterBorderGrad" x1="0%" y1="0%" x2="100%" y2="25%">
              <stop offset="0%" stopColor="rgba(220, 80, 95, 0.22)" />
              <stop offset="25%" stopColor="rgba(255, 255, 255, 0.12)" />
              <stop offset="50%" stopColor="rgba(244, 114, 130, 0.3)" />
              <stop offset="75%" stopColor="rgba(255, 255, 255, 0.12)" />
              <stop offset="100%" stopColor="rgba(220, 80, 95, 0.22)" />
            </linearGradient>
          </defs>
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
            fill="url(#apCenterNotchGrad)"
          />
          {/* Subtle metallic silver/crimson border contour */}
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
            stroke="url(#apCenterBorderGrad)"
            strokeWidth="1.2"
          />
          {/* Subtle silver highlight along upper border */}
          <line
            x1={filletRadius}
            y1="0"
            x2={centerNotchWidth + filletRadius}
            y2="0"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1"
          />
        </svg>

        {/* 1. RELOCATED AP BRAND MONOGRAM (integrated inside main navigation island) */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleItemClick(NAV_DESTINATIONS[0]);
          }}
          aria-label="Navigate to top"
          className="left-brand-notch"
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? '28px' : '32px',
            height: isMobile ? '28px' : '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            flexShrink: 0,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <ApMonogram width={isMobile ? 18 : 22} withGlow={false} />
        </a>

        {/* Subtle vertical divider */}
        <div
          style={{
            width: '1px',
            height: isMobile ? '16px' : '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            margin: isMobile ? '0 4px' : '0 8px',
            flexShrink: 0,
            zIndex: 2,
          }}
          aria-hidden="true"
        />

        {/* 2. NAVIGATION TABS with Sliding Translucent Crimson Capsule Highlight */}
        <div
          ref={navTabsRef}
          role="tablist"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            height: '100%',
            padding: isMobile ? '0 2px' : '0 4px',
          }}
        >
          {/* Sliding active indicator capsule pill */}
          <div
            className="notch-active-pill"
            style={{
              position: 'absolute',
              top: isMobile ? '5px' : '8px',
              left: 0,
              width: `${indicatorStyle.width}px`,
              height: isMobile ? '34px' : '34px',
              transform: `translateX(${indicatorStyle.left}px)`,
              background:
                'linear-gradient(135deg, rgba(120, 18, 28, 0.44) 0%, rgba(68, 11, 18, 0.52) 100%)',
              border: '1px solid rgba(220, 100, 115, 0.38)',
              borderRadius: '9999px',
              boxShadow:
                'inset 0 0 10px rgba(200, 35, 52, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 14px rgba(0, 0, 0, 0.5)',
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
                  gap: isMobile ? '0px' : '6px',
                  padding: isMobile ? '6px 7px' : '6px 11px',
                  minWidth: isMobile ? '38px' : 'auto',
                  minHeight: '38px',
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
                  size={isMobile ? 16 : 15}
                  strokeWidth={isActive ? 2.3 : 1.9}
                  className="notch-icon"
                />
                {!isMobile && <span>{dest.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Subtle vertical divider */}
        <div
          style={{
            width: '1px',
            height: isMobile ? '16px' : '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            margin: isMobile ? '0 4px' : '0 8px',
            flexShrink: 0,
            zIndex: 2,
          }}
          aria-hidden="true"
        />

        {/* 3. RELOCATED CONNECT QUICK ACTION (integrated inside main navigation island) */}
        <div
          className="right-action-notch"
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
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
              gap: isMobile ? '0' : '5px',
              padding: isMobile ? '6px 8px' : '5px 11px',
              minHeight: '30px',
              background:
                'linear-gradient(135deg, rgba(48, 7, 13, 0.7) 0%, rgba(20, 5, 9, 0.8) 100%)',
              border: '1px solid rgba(200, 70, 85, 0.3)',
              borderRadius: '9999px',
              color: '#E4E4E7',
              fontSize: '12px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            {!isMobile && <span>Connect</span>}
            <ArrowUpRight size={13} color="#D4D4D8" />
          </a>
        </div>
      </div>

      {/* Embedded styles for keyboard accessibility and reduced-motion */}
      <style>{`
        .notch-nav-item:hover {
          color: #FFFFFF !important;
        }

        .notch-nav-item:focus-visible,
        .notch-action-btn:focus-visible {
          outline: 2px solid rgba(220, 100, 115, 0.6) !important;
          outline-offset: 2px !important;
          border-radius: 9999px !important;
        }

        .notch-action-btn:hover {
          background: linear-gradient(135deg, rgba(72, 11, 18, 0.75) 0%, rgba(38, 7, 11, 0.85) 100%) !important;
          border-color: rgba(230, 95, 110, 0.45) !important;
          color: #FFFFFF !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 0 8px rgba(200, 35, 52, 0.25) !important;
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
