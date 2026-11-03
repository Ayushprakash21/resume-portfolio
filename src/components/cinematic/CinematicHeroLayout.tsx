import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDown, Menu, X } from 'lucide-react';
import { ProfileData, HomepageSettings } from '../../types/cms';
import { ApMonogram } from '../brand/ApMonogram';
import { HeroSignature } from '../brand/HeroSignature';
import { OptionWheel, SpecularButton } from '../reactbits';

interface CinematicHeroLayoutProps {
  profile?: ProfileData;
  homepageSettings?: HomepageSettings;
  onNavigateSection?: (sectionId: string) => void;
  onOpenAdmin?: () => void;
  reducedMotion?: boolean;
}

export const CinematicHeroLayout: React.FC<CinematicHeroLayoutProps> = ({
  profile,
  homepageSettings,
  onNavigateSection,
  reducedMotion = false,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const name = profile?.name || 'AYUSH PRAKASH';
  const intro =
    homepageSettings?.introParagraph ||
    'Business operations professional exploring the intersection of supply chain management, enterprise systems, artificial intelligence and digital product innovation.';
  const heading = homepageSettings?.mainHeading || 'BUSINESS. SYSTEMS.';
  const subHeading = homepageSettings?.secondaryHeading || 'Intelligence & Innovation.';
  const cta = homepageSettings?.ctaText || "Let's Connect";
  const ctaTarget = homepageSettings?.ctaDestination || 'contact';
  const scrollText = homepageSettings?.scrollIndicatorText || 'SCROLL TO EXPLORE';
  const nav = homepageSettings?.navLabels || {
    work: 'Work',
    experience: 'Experience',
    about: 'About',
    projects: 'Projects',
    contact: 'Contact',
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navItems = [
    { label: nav.work || 'Work', id: 'projects' },
    { label: nav.experience || 'Experience', id: 'experience' },
    { label: nav.about || 'About', id: 'about' },
    { label: 'Open to Work', id: 'opentowork' },
    { label: nav.contact || 'Contact', id: 'contact' },
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 48px)',
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      {/* ========================================================
          TOP NAVIGATION BAR (AP MONOGRAM + AYUSH PRAKASH)
          ======================================================== */}
      <header
        style={{
          position: 'fixed',
          top: isScrolled ? '12px' : '18px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: isScrolled ? 'min(94%, 1160px)' : 'min(94%, 1180px)',
          padding: isScrolled ? '8px 20px' : '10px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
          pointerEvents: 'auto',
          backgroundColor: isScrolled ? 'rgba(9, 9, 11, 0.76)' : 'transparent',
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
        {/* BRAND IDENTITY: [AP MONOGRAM] AYUSH PRAKASH */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            cursor: 'pointer',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: isScrolled ? '16px' : '20px',
            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="brand-logo-trigger"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {/* AP Monogram Logo (Dominant 85–100px desktop width) */}
          <ApMonogram
            width={isScrolled ? 78 : 94}
            className="ap-header-monogram"
            withGlow={true}
          />

          <span
            className="ap-header-name"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              textTransform: 'uppercase',
              color: '#FFFFFF',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'inline-block',
            }}
          >
            {name}
          </span>
        </div>

        {/* DESKTOP TOP NAVIGATION LINKS & OPTION WHEEL */}
        <nav
          className="desktop-nav-links"
          style={{
            alignItems: 'center',
            gap: isScrolled ? '16px' : '24px',
          }}
        >
          {navItems.map((item, idx) => (
            <button
              key={`${item.label}-${idx}`}
              onClick={() => scrollTo(item.id)}
              style={{
                background: 'none',
                border: 'none',
                color: item.id === 'opentowork' ? 'var(--text-highlight)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: item.id === 'opentowork' ? 500 : 400,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                padding: '6px 8px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  item.id === 'opentowork' ? 'var(--text-highlight)' : 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {item.label}
            </button>
          ))}

          {/* REACT BITS: OPTION WHEEL (Flagship Orion-9 Selector Instrument) */}
          <OptionWheel onSelect={(item) => scrollTo(item.targetId)} />
        </nav>

        {/* MOBILE MENU TOGGLE BUTTON (Touch target >= 44x44px) */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* MOBILE GLASSMORPHISM NAVIGATION DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="mobile-nav-backdrop is-open"
          onClick={() => setIsMobileMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div
            className="mobile-nav-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header with AP Brand Lockup & Close Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '24px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '28px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ApMonogram width={48} withGlow={true} />
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        lineHeight: 1.1,
                        textTransform: 'uppercase',
                      }}
                    >
                      AYUSH PRAKASH
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '11px',
                        fontStyle: 'italic',
                        color: 'var(--accent-silver)',
                      }}
                    >
                      Personal Portfolio
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-menu-toggle"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Links with Large Touch Targets */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {navItems.map((item, idx) => (
                  <button
                    key={`mob-${item.label}-${idx}`}
                    onClick={() => scrollTo(item.id)}
                    className="mobile-nav-link"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight size={15} color="var(--accent-silver)" />
                  </button>
                ))}
              </nav>
            </div>

            {/* Drawer Footer CTA */}
            <div
              style={{
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <OptionWheel onSelect={(item) => { scrollTo(item.targetId); setIsMobileMenuOpen(false); }} />
              </div>
              <SpecularButton
                onClick={() => scrollTo(ctaTarget)}
                icon={<ArrowUpRight size={15} />}
                style={{ width: '100%', minHeight: '46px' }}
              >
                {cta}
              </SpecularButton>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  letterSpacing: '0.04em',
                }}
              >
                Business &bull; Systems &bull; Innovation
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent overlap when hero is at top */}
      <div style={{ height: '60px' }} />

      {/* ========================================================
          ILLUMINATED AYUSH PRAKASH SIGNATURE (HERO NEGATIVE SPACE)
          ======================================================== */}
      <HeroSignature reducedMotion={reducedMotion} />

      {/* ========================================================
          LEFT INTRODUCTION (PROTECTED BY LOCAL GLASS BACKDROP)
          ======================================================== */}
      <div
        className="hero-intro-panel"
        style={{
          position: 'relative',
          zIndex: 20,
          pointerEvents: 'auto',
          marginTop: '16px',
          background: 'linear-gradient(135deg, rgba(5, 5, 5, 0.85), rgba(9, 9, 12, 0.52))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          borderRadius: '14px',
          padding: '16px 20px',
          maxWidth: 'min(100%, 430px)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        <p
          className="hero-intro"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(14px, 1.15vw, 17px)',
            lineHeight: 1.65,
            fontWeight: 400,
            color: '#F5F5F5',
            letterSpacing: '0.01em',
            margin: 0,
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.95)',
          }}
        >
          {intro}
        </p>
      </div>

      {/* ========================================================
          BOTTOM ROW (AP BRANDED HERO PRESENTATION):
          - AP MONOGRAM & AYUSH PRAKASH EMBLEM
          - BUSINESS. SYSTEMS.
          - Intelligence & Innovation.
          - SCROLL TO EXPLORE
          - Let's Connect ↗ (With spring physics)
          ======================================================== */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '20px',
          width: '100%',
          marginTop: '24px',
        }}
      >
        {/* BOTTOM LEFT: AP BRAND SIGNATURE + HEADLINE */}
        <div style={{ maxWidth: '100%', minWidth: 0 }}>
          {/* Prominent AP Identity Treatment (Hero Brand Signature) */}
          <div className="hero-brand-signature">
            <ApMonogram width={62} withGlow={true} />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  color: 'var(--accent-silver)',
                  letterSpacing: '0.02em',
                }}
              >
                Personal Brand &bull; Digital Universe
              </span>
            </div>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.9rem, 5.8vw, 5.2rem)',
              lineHeight: 1.0,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
            }}
          >
            {heading}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.8rem, 5.2vw, 4.6rem)',
              lineHeight: 1.15,
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'var(--text-primary)',
              letterSpacing: '0.005em',
              marginTop: '4px',
              overflowWrap: 'break-word',
            }}
          >
            {subHeading}
          </div>
        </div>

        {/* BOTTOM CENTRE & RIGHT: SCROLL TO EXPLORE & CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            pointerEvents: 'auto',
          }}
        >
          {/* SCROLL TO EXPLORE */}
          <div
            onClick={() => scrollTo('about')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '8px 12px',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                transition: 'color 0.2s ease',
              }}
            >
              {scrollText}
            </span>
            <ArrowDown size={13} color="var(--text-muted)" style={{ opacity: 0.7 }} />
          </div>

          {/* Let's Connect ↗ (Specular Button) */}
          <div>
            <SpecularButton
              onClick={() => scrollTo(ctaTarget)}
              icon={<ArrowUpRight size={14} />}
            >
              {cta}
            </SpecularButton>
          </div>
        </div>
      </div>
    </div>
  );
};
