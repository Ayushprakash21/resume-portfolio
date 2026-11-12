import React from 'react';
import { ArrowDown } from 'lucide-react';
import { ProfileData, HomepageSettings } from '../../types/cms';
import { ApMonogram } from '../brand/ApMonogram';
import { HeroSignature } from '../brand/HeroSignature';

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
  const intro =
    homepageSettings?.introParagraph ||
    'Business operations professional exploring the intersection of supply chain management, enterprise systems, artificial intelligence and digital product innovation.';
  const heading = homepageSettings?.mainHeading || 'BUSINESS. SYSTEMS.';
  const subHeading = homepageSettings?.secondaryHeading || 'Intelligence & Innovation.';
  const cta = homepageSettings?.ctaText || "Let's Connect";
  const ctaTarget = homepageSettings?.ctaDestination || 'contact';
  const scrollText = homepageSettings?.scrollIndicatorText || 'SCROLL TO EXPLORE';

  const navItems = [
    { label: 'Work', id: 'projects' },
    { label: 'Experience', id: 'experience' },
    { label: 'About', id: 'about' },
    { label: 'Open to Work', id: 'opentowork' },
    { label: 'Contact', id: 'contact' },
  ];

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
          PREVIOUS NAVIGATION REPLACED BY P0 CURVED PILL NAVIGATION:
          - desktop-nav-links
          - mobile-menu-toggle
          - mobile-nav-backdrop
          - document.body.style.overflow = 'hidden'
          ======================================================== */}
      {/* Top spacer maintaining vertical equilibrium and airy hero space */}
      <div style={{ flex: '0 0 clamp(24px, 5vh, 48px)' }} />

      {/* Spacer to prevent overlap when hero is at top */}
      <div style={{ flex: 1, minHeight: '40px' }} />

      {/* ========================================================
          ILLUMINATED AYUSH PRAKASH SIGNATURE (HERO NEGATIVE SPACE)
          ======================================================== */}
      <HeroSignature reducedMotion={reducedMotion} />

      {/* ========================================================
          BOTTOM ROW (AP APPROVED HERO BRAND LAYOUT):
          1. Professional introduction (restrained & readable)
          2. Large standalone AP logo (90–115px desktop, metallic silver)
          3. AYUSH (Dominant display near-white #F8FAFC)
          4. PRAKASH (Dominant display metallic silver gradient)
          5. BUSINESS. SYSTEMS. (Clean uppercase)
          6. Intelligence & Innovation. (Editorial italic)
          7. Bottom-Right: SCROLL TO EXPLORE
          ======================================================== */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '24px',
          width: '100%',
          marginTop: 'auto',
        }}
      >
        {/* BOTTOM LEFT: HIERARCHY AS APPROVED IN REFERENCE SCREENSHOT */}
        <div style={{ maxWidth: 'min(100%, 740px)', minWidth: 0 }}>
          {/* 1. PROFESSIONAL INTRODUCTION (ABOVE BRAND LOGO AND LARGE NAME) */}
          <div
            className="hero-intro-panel"
            style={{
              position: 'relative',
              zIndex: 20,
              pointerEvents: 'auto',
              marginBottom: '24px',
              maxWidth: 'min(100%, 460px)',
              background: 'transparent',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
              border: 'none',
              borderRadius: 0,
              padding: 0,
              boxShadow: 'none',
            }}
          >
            <p
              className="hero-intro"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(14px, 1.05vw, 15.5px)',
                lineHeight: 1.65,
                fontWeight: 400,
                color: '#E8ECF2',
                letterSpacing: '0.01em',
                margin: 0,
                textShadow: '0 2px 14px rgba(0, 0, 0, 0.95)',
              }}
            >
              {intro}
            </p>
          </div>

          {/* 2. LARGE STANDALONE AP METALLIC SILVER LOGO (PROMINENT: 150-180PX DESKTOP, 105-135PX MOBILE) */}
          <div
            className="hero-standalone-logo-container"
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <ApMonogram
              width={165}
              className="hero-standalone-monogram"
              withGlow={true}
            />
          </div>

          {/* 3. & 4. DOMINANT HERO IDENTITY: AYUSH / PRAKASH (ORIGINAL BRAND DISPLAY GEOMETRIC SANS) */}
          <div
            role="heading"
            aria-level={1}
            className="hero-founder-name hero-name"
            style={{
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 0.90,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              fontFamily: "'Orenza Bold', 'Orenza', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: 800,
              fontSize: 'var(--font-size-hero)',
              margin: '0 0 14px 0',
              userSelect: 'none',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              maxWidth: '100%',
            }}
          >
            <span
              className="hero-name__first"
              style={{
                fontFamily: 'inherit',
                fontWeight: 800,
                background: 'linear-gradient(165deg, #ffffff 0%, #e1e2e6 42%, #9296a1 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: '#e1e2e6',
                display: 'block',
                width: 'fit-content',
                maxWidth: '100%',
                lineHeight: 0.90,
                letterSpacing: '-0.03em',
                filter: 'drop-shadow(0 4px 28px rgba(0, 0, 0, 0.95))',
              }}
            >
              AYUSH
            </span>
            <span
              className="hero-name__last"
              style={{
                fontFamily: 'inherit',
                fontWeight: 800,
                background:
                  'linear-gradient(105deg, #f4f4f6 0%, #a8abb5 24%, #8c1524 52%, #bc3545 76%, #500a15 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: '#e1e2e6',
                display: 'block',
                width: 'fit-content',
                maxWidth: '100%',
                lineHeight: 0.90,
                letterSpacing: '-0.03em',
                filter: 'drop-shadow(0 4px 24px rgba(0, 0, 0, 0.85))',
              }}
            >
              PRAKASH
            </span>
          </div>

          {/* 5. & 6. TAGLINE POSITION: BUSINESS. SYSTEMS. / Intelligence & Innovation. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '6px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--type-hero-tagline)',
                lineHeight: 1.15,
                fontWeight: 600,
                letterSpacing: '-0.01em',
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
                fontSize: 'var(--type-hero-subtagline)',
                lineHeight: 1.18,
                fontWeight: 400,
                fontStyle: 'italic',
                color: 'var(--accent-silver)',
                letterSpacing: '0.005em',
                overflowWrap: 'break-word',
              }}
            >
              {subHeading}
            </div>
          </div>
        </div>

        {/* BOTTOM RIGHT: SCROLL TO EXPLORE */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
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
        </div>
      </div>
    </div>
  );
};
