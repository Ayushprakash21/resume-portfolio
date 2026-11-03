import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import { ProfileData, HomepageSettings } from '../../types/cms';
import { ApMonogram } from '../brand/ApMonogram';

interface CinematicHeroLayoutProps {
  profile?: ProfileData;
  homepageSettings?: HomepageSettings;
  onNavigateSection?: (sectionId: string) => void;
  onOpenAdmin?: () => void;
}

export const CinematicHeroLayout: React.FC<CinematicHeroLayoutProps> = ({
  profile,
  homepageSettings,
  onNavigateSection,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

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
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '700px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '36px 48px',
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
          top: isScrolled ? '18px' : '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: isScrolled ? 'min(92%, 1160px)' : 'calc(100% - 96px)',
          padding: isScrolled ? '10px 24px' : '12px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
          pointerEvents: 'auto',
          backgroundColor: isScrolled ? 'rgba(9, 9, 11, 0.72)' : 'transparent',
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
            gap: isScrolled ? '14px' : '20px',
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
          {/* AP Monogram Logo (Prominent 64–76px desktop width) */}
          <ApMonogram
            width={isScrolled ? 64 : 72}
            className="ap-header-monogram"
            withGlow={true}
          />

          <span
            className="ap-header-name"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isScrolled ? '22px' : '34px',
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

        {/* TOP NAVIGATION LINKS: Work, Experience, About, Open to Work, Contact */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isScrolled ? '24px' : '36px',
            transition: 'gap 0.3s ease',
          }}
        >
          {[
            { label: nav.work || 'Work', id: 'projects' },
            { label: nav.experience || 'Experience', id: 'experience' },
            { label: nav.about || 'About', id: 'about' },
            { label: 'Open to Work', id: 'opentowork' },
            { label: nav.contact || 'Contact', id: 'contact' },
          ].map((item, idx) => (
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
        </nav>
      </header>

      {/* Spacer to prevent overlap when hero is at top */}
      <div style={{ height: '70px' }} />

      {/* ========================================================
          LEFT INTRODUCTION (PROTECTED BY LOCAL GLASS BACKDROP)
          ======================================================== */}
      <div
        className="hero-intro-panel"
        style={{
          position: 'relative',
          zIndex: 20,
          pointerEvents: 'auto',
          marginTop: '28px',
          background: 'linear-gradient(135deg, rgba(5, 5, 5, 0.85), rgba(9, 9, 12, 0.52))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          borderRadius: '14px',
          padding: '18px 22px',
          maxWidth: '430px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        <p
          className="hero-intro"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(15px, 1.15vw, 17px)',
            lineHeight: 1.7,
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
          gap: '24px',
          width: '100%',
        }}
      >
        {/* BOTTOM LEFT: AP BRAND SIGNATURE + HEADLINE */}
        <div>
          {/* Prominent AP Identity Treatment (Hero Brand Signature) */}
          <div className="hero-brand-signature">
            <ApMonogram width={62} withGlow={true} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#FFFFFF',
                  lineHeight: 1.2,
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
              fontSize: 'clamp(2.4rem, 5.2vw, 5.2rem)',
              lineHeight: 1.0,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
            }}
          >
            {heading}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.4rem, 4.8vw, 4.6rem)',
              lineHeight: 1.15,
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'var(--text-primary)',
              letterSpacing: '0.005em',
              marginTop: '2px',
            }}
          >
            {subHeading}
          </div>
        </div>

        {/* BOTTOM CENTRE: SCROLL TO EXPLORE */}
        <div
          onClick={() => scrollTo('about')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            pointerEvents: 'auto',
            userSelect: 'none',
            padding: '10px 16px',
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

        {/* BOTTOM RIGHT: Let's Connect ↗ (With spring bouncy hover physics) */}
        <div style={{ pointerEvents: 'auto' }}>
          <button
            onClick={() => scrollTo(ctaTarget)}
            className="btn-editorial-pill"
          >
            <span>{cta}</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
