import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { ProfileData } from '../../types/cms';
import { ApMonogram } from '../brand/ApMonogram';

export interface NavbarRedesignedProps {
  profile?: ProfileData;
  onNavigateAdmin?: () => void;
  onToggleRecruiterMode?: () => void;
  onSelectZone?: (zoneId: string) => void;
  onNavigateSection?: (sectionId: string) => void;
  isScrolled?: boolean;
}

/**
 * EXACT 5 PUBLIC NAVIGATION OPTIONS:
 * - Work (#projects)
 * - Experience (#experience)
 * - About (#about)
 * - Open to Work (#opentowork)
 * - Contact (#contact)
 * 
 * Orion-9, Recruiter Brief, Admin, and CMS options are excluded.
 */
export const NAV_ITEMS = [
  { label: 'Work', targetId: 'projects' },
  { label: 'Experience', targetId: 'experience' },
  { label: 'About', targetId: 'about' },
  { label: 'Open to Work', targetId: 'opentowork' },
  { label: 'Contact', targetId: 'contact' },
];

/**
 * TOP-RIGHT GLASS NAVIGATION PANEL (Reference Video Implementation)
 * 
 * - Left: AP Brand Monogram + AYUSH PRAKASH wordmark.
 * - Center: Intentionally minimal & spacious.
 * - Right: Refined, compact three-line menu icon trigger toggling
 *   a floating dark translucent glass dropdown panel anchored to the top-right.
 * - Unified across Desktop, Tablet, and Mobile.
 */
export const NavbarRedesigned: React.FC<NavbarRedesignedProps> = ({
  profile,
  onSelectZone,
  onNavigateSection,
  isScrolled: controlledScrolled,
}) => {
  const [internalScrolled, setInternalScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

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

  // Close menu on click outside or on Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleNavigate = (targetId: string) => {
    setMenuOpen(false);
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
        padding: isScrolled ? '6px 20px' : '8px 16px',
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
          HEADER: CLEAN REFINED TOP BAR (MENU CONTROL ON RIGHT)
          ======================================================== */}
      <div style={{ flex: '1 1 auto' }} />

      {/* ========================================================
          RIGHT: REFINED TOP-RIGHT MENU TRIGGER & DROPDOWN PANEL
          ======================================================== */}
      <div
        ref={menuContainerRef}
        className="header-nav-container"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="top-right-nav-dropdown"
          className="top-right-nav-trigger mobile-menu-toggle"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            background: menuOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            border: menuOpen ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
            borderRadius: '8px',
            color: '#D4D7DC',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {menuOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
        </button>

        {/* TOP-RIGHT FLOATING GLASS DROPDOWN PANEL */}
        {menuOpen && (
          <div
            id="top-right-nav-dropdown"
            role="menu"
            aria-label="Portfolio sections"
            className="top-right-glass-dropdown"
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              width: 'min(220px, calc(100vw - 32px))',
              backgroundColor: 'rgba(14, 15, 19, 0.94)',
              backdropFilter: 'blur(24px) saturate(140%)',
              WebkitBackdropFilter: 'blur(24px) saturate(140%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              padding: '14px 14px 16px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {/* Top row with subtle close button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Exactly 5 Navigation Items */}
            {NAV_ITEMS.map((item) => (
              <button
                key={item.targetId}
                role="menuitem"
                onClick={() => handleNavigate(item.targetId)}
                className="top-right-dropdown-link"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#C5C8CE',
                  fontFamily: 'var(--font-display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
                  fontSize: '15px',
                  fontWeight: 600,
                  textAlign: 'center',
                  letterSpacing: '0.01em',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#C5C8CE';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default NavbarRedesigned;
