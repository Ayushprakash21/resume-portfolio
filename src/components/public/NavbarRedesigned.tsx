import React, { useState, useEffect } from 'react';
import { Cpu, Menu, X, ArrowUpRight, Lock, Sparkles } from 'lucide-react';
import { ProfileData } from '../../types/cms';

interface NavbarRedesignedProps {
  profile: ProfileData;
  onNavigateAdmin: () => void;
  onToggleRecruiterMode: () => void;
  onSelectZone: (zoneId: string) => void;
}

export const NavbarRedesigned: React.FC<NavbarRedesignedProps> = ({
  profile,
  onNavigateAdmin,
  onToggleRecruiterMode,
  onSelectZone,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: '3D World', href: '#3d-universe', zoneId: 'overview' },
    { label: 'About', href: '#about', zoneId: null },
    { label: 'Experience', href: '#experience', zoneId: 'experience' },
    { label: 'Capabilities', href: '#skills', zoneId: null },
    { label: 'Orion-9', href: '#orion9', zoneId: 'orion9' },
    { label: 'ApplyVise AI', href: '#applywise', zoneId: 'applywise' },
    { label: 'Architecture', href: '#architecture', zoneId: 'architecture' },
    { label: 'Certifications', href: '#certifications', zoneId: 'certifications' },
    { label: 'Contact', href: '#contact', zoneId: 'contact' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'all var(--transition-normal)',
        backgroundColor: scrolled ? 'rgba(7, 9, 13, 0.9)' : 'rgba(7, 9, 13, 0.4)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}
      >
        {/* Brand identity */}
        <a
          href="#3d-universe"
          onClick={() => onSelectZone('overview')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, rgba(69, 214, 255, 0.2) 0%, rgba(119, 123, 255, 0.1) 100%)',
              border: '1px solid rgba(69, 214, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            <Cpu size={18} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '17px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
              }}
            >
              {profile.name.toUpperCase()}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              OPERATIONS & APPLIED AI
            </div>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '22px' }} className="desktop-nav">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => {
                if (item.zoneId) onSelectZone(item.zoneId);
              }}
              style={{
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
                color: 'var(--text-secondary)',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions: Recruiter Mode & CMS Admin */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-actions">
          <button
            onClick={onToggleRecruiterMode}
            style={{
              background: 'rgba(69, 214, 255, 0.08)',
              border: '1px solid rgba(69, 214, 255, 0.3)',
              color: 'var(--accent-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={12} />
            <span>RECRUITER BRIEF</span>
          </button>

          <button
            onClick={onNavigateAdmin}
            title="Private CMS Console"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <Lock size={12} />
            <span>/ADMIN</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => {
                setMobileMenuOpen(false);
                if (item.zoneId) onSelectZone(item.zoneId);
              }}
              style={{
                color: 'var(--text-primary)',
                fontSize: '14px',
                padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {item.label}
            </a>
          ))}

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onToggleRecruiterMode();
              }}
              className="btn-primary"
              style={{ flex: 1, fontSize: '12px', padding: '8px' }}
            >
              Recruiter Brief
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateAdmin();
              }}
              className="btn-secondary"
              style={{ flex: 1, fontSize: '12px', padding: '8px' }}
            >
              Admin CMS
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 960px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-actions {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
