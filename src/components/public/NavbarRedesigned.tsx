import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
import { ProfileData } from '../../types/cms';
import { ApMonogram } from '../brand/ApMonogram';
import { DEFAULT_NAV_WHEEL_ITEMS } from '../reactbits/OptionWheel';

export interface NavbarRedesignedProps {
  profile?: ProfileData;
  onNavigateAdmin?: () => void;
  onToggleRecruiterMode?: () => void;
  onSelectZone?: (zoneId: string) => void;
  onNavigateSection?: (sectionId: string) => void;
  isScrolled?: boolean;
}

/**
 * RESTORED MINIMAL LUXURY HEADER
 * 
 * In accordance with specifications:
 * - Left: Dominant AP Brand Monogram + AYUSH PRAKASH wordmark.
 * - Center: Completely spacious, uncluttered, no horizontal wheel, no pills.
 * - Right: Spacious on desktop. Clean layout without extraneous pills or public controls.
 * - Mobile: Sleek mobile-menu-toggle opening accessible navigation drawer for sections.
 */
export const NavbarRedesigned: React.FC<NavbarRedesignedProps> = ({
  profile,
  onSelectZone,
  onNavigateSection,
  isScrolled: controlledScrolled,
}) => {
  const [internalScrolled, setInternalScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isScrolled = controlledScrolled !== undefined ? controlledScrolled : internalScrolled;
  const name = profile?.name || 'AYUSH PRAKASH';

  useEffect(() => {
    if (controlledScrolled !== undefined) return;
    const handleScroll = () => {
      setInternalScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [controlledScrolled]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleNavigate = (targetId: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(targetId);
    } else if (onSelectZone) {
      onSelectZone(targetId);
    } else {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`portfolio-navbar${isScrolled ? ' portfolio-navbar--scrolled' : ''}`}
      style={{
        position: 'fixed',
        top: isScrolled ? '12px' : '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: isScrolled ? 'min(94%, 1160px)' : 'min(94%, 1200px)',
        height: isScrolled ? '64px' : '72px',
        padding: isScrolled ? '6px 20px' : '8px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        pointerEvents: 'auto',
        backgroundColor: isScrolled ? 'rgba(9, 9, 11, 0.78)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(24px) saturate(140%)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(24px) saturate(140%)' : 'none',
        borderRadius: isScrolled ? '9999px' : '0',
        border: isScrolled ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
        boxShadow: isScrolled
          ? '0 16px 40px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 24px -4px rgba(242, 242, 244, 0.08)'
          : 'none',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* ========================================================
          LEFT: AP BRAND IDENTITY ([AP MONOGRAM] + AYUSH PRAKASH)
          ======================================================== */}
      <div
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: isScrolled ? '14px' : '18px',
          textDecoration: 'none',
          flexShrink: 0,
        }}
        className="brand-logo-trigger"
        aria-label="Ayush Prakash Home"
      >
        <ApMonogram
          width={isScrolled ? 78 : 94}
          className="ap-header-monogram"
          withGlow={true}
        />
        <span
          className="ap-header-name"
          style={{
            fontFamily: 'var(--font-display, Orenza, sans-serif)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            textTransform: 'uppercase',
            color: '#FFFFFF',
            display: 'inline-block',
          }}
        >
          {name}
        </span>
      </div>

      {/* ========================================================
          CENTER: INTENTIONALLY MINIMAL & SPACIOUS
          (Option Wheel moved to right side of Hero)
          ======================================================== */}
      <div style={{ flex: '1 1 auto' }} />

      {/* ========================================================
          RIGHT ACTIONS: CLEAN & SPACIOUS PUBLIC HEADER
          Mobile Drawer Toggle active on mobile/tablet viewports
          ======================================================== */}
      <div
        className="desktop-actions"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
          aria-expanded={mobileMenuOpen}
          className="mobile-menu-toggle"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '8px',
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ========================================================
          MOBILE NAVIGATION DRAWER OVERLAY
          Clean section links, zero recruiter or admin pills
          Portal-attached to document.body to break out of header transform context
          ======================================================== */}
      {mobileMenuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="mobile-nav-backdrop is-open"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <div
              className="mobile-nav-drawer"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(320px, 85vw)',
                height: '100%',
                backgroundColor: '#0A0A0C',
                borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflowY: 'auto',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ApMonogram width={48} />
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase' }}>
                      {name}
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-menu-toggle"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#D9DDE3',
                      cursor: 'pointer',
                      padding: '8px',
                    }}
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {DEFAULT_NAV_WHEEL_ITEMS.map((item) => {
                    const target = item.targetId || item.id || '';
                    return (
                      <button
                        key={item.id || item.label}
                        onClick={() => handleNavigate(target)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '12px 14px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '8px',
                        color: item.id === 'opentowork' ? '#6CE098' : '#F4F3EE',
                        fontSize: '14px',
                        fontWeight: 500,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor:
                              item.id === 'opentowork'
                                ? 'rgba(74, 180, 120, 0.2)'
                                : 'rgba(255, 255, 255, 0.08)',
                            color: item.id === 'opentowork' ? '#6CE098' : 'rgba(255, 255, 255, 0.6)',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
                </nav>
              </div>

              <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'rgba(217, 221, 227, 0.4)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.08em' }}>
                  AYUSH PRAKASH &bull; PORTFOLIO
                </span>
              </div>
            </div>
          </div>,
          document.body
        )}

      <style>{`
        @media (max-width: 960px) {
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};
