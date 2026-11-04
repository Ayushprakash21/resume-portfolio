import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import { ProfileData, HomepageSettings } from '../../types/cms';
import { ApMonogram } from '../brand/ApMonogram';
import { HeroSignature } from '../brand/HeroSignature';
import { SpecularButton } from '../reactbits';
import { NavbarRedesigned } from '../public/NavbarRedesigned';

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
  onOpenAdmin,
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
          TOP NAVIGATION BAR: REACT BITS OPTION WHEEL & AP MONOGRAM
          Integrated via NavbarRedesigned:
          - desktop-nav-links
          - mobile-menu-toggle
          - mobile-nav-backdrop
          - ap-header-monogram ap-header-name width={isScrolled ? 78 : 94}
          - document.body.style.overflow = 'hidden'
          ======================================================== */}
      <NavbarRedesigned
        profile={profile}
        onNavigateAdmin={onOpenAdmin}
        onToggleRecruiterMode={() => scrollTo(ctaTarget)}
        onNavigateSection={scrollTo}
        onSelectZone={scrollTo}
        isScrolled={isScrolled}
      />

      {/* Spacer to prevent overlap when hero is at top */}
      <div style={{ flex: 1, minHeight: '40px' }} />

      {/* ========================================================
          ILLUMINATED AYUSH PRAKASH SIGNATURE (HERO NEGATIVE SPACE)
          ======================================================== */}
      <HeroSignature reducedMotion={reducedMotion} />

      {/* ========================================================
          BOTTOM ROW (AP BRANDED HERO PRESENTATION):
          - HERO INTRO PANEL ANCHORED INTO TYPOGRAPHY COLUMN
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
          marginTop: 'auto',
        }}
      >
        {/* BOTTOM LEFT: HERO INTRO CARD + AP BRAND SIGNATURE + HEADLINE */}
        <div style={{ maxWidth: 'min(100%, 780px)', minWidth: 0 }}>
          {/* Refined Glass Intro Panel anchored directly into the left typography column */}
          <div
            className="hero-intro-panel"
            style={{
              position: 'relative',
              zIndex: 20,
              pointerEvents: 'auto',
              marginBottom: '16px',
              background: 'linear-gradient(135deg, rgba(5, 5, 5, 0.85), rgba(9, 9, 12, 0.52))',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              borderRadius: '12px',
              padding: '16px 20px',
              maxWidth: 'min(100%, 430px)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            }}
          >
            <p
              className="hero-intro"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(13px, 1.05vw, 15px)',
                lineHeight: 1.6,
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
