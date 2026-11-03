import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDown } from 'lucide-react';

interface CinematicHeroLayoutProps {
  onNavigateSection?: (sectionId: string) => void;
  onOpenAdmin?: () => void;
}

export const CinematicHeroLayout: React.FC<CinematicHeroLayoutProps> = ({
  onNavigateSection,
  onOpenAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

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
        pointerEvents: 'none', // Allow clicks only on children
      }}
    >
      {/* ========================================================
          TOP HEADER ROW: TOP LEFT NAME + TOP NAVIGATION
          ======================================================== */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: isScrolled ? '18px 48px' : '36px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
          pointerEvents: 'auto',
          backgroundColor: isScrolled ? 'rgba(17, 21, 20, 0.92)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(244, 243, 238, 0.08)' : '1px solid transparent',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* TOP LEFT: AYUSH PRAKASH */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
            }}
          >
            AYUSH PRAKASH
          </span>
        </div>

        {/* TOP NAVIGATION: Work, Experience, About, Projects, Contact */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          }}
        >
          {[
            { label: 'Work', id: 'projects' },
            { label: 'Experience', id: 'experience' },
            { label: 'About', id: 'about' },
            { label: 'Projects', id: 'projects' },
            { label: 'Contact', id: 'contact' },
          ].map((item, idx) => (
            <button
              key={`${item.label}-${idx}`}
              onClick={() => scrollTo(item.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                padding: '4px 0',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {item.label}
            </button>
          ))}

          {/* Understated Admin Key link */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              title="Admin Portal"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                padding: '4px 8px',
                opacity: 0.6,
                transition: 'opacity 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.6';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              CMS
            </button>
          )}
        </nav>
      </header>

      {/* Spacing spacer for top header */}
      <div style={{ height: '60px' }} />

      {/* ========================================================
          LEFT INTRODUCTION (Narrow text column, Section 4)
          ======================================================== */}
      <div
        style={{
          maxWidth: '340px',
          pointerEvents: 'auto',
          marginTop: '40px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            lineHeight: 1.6,
            fontWeight: 400,
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
          Business operations professional exploring the intersection of supply chain management, enterprise systems, artificial intelligence and digital product innovation.
        </p>
      </div>

      {/* ========================================================
          BOTTOM ROW:
          - BOTTOM LEFT: Headline (BUSINESS. SYSTEMS. / Intelligence & Innovation.)
          - BOTTOM CENTRE: SCROLL TO EXPLORE
          - BOTTOM RIGHT: Let's Connect ↗
          ======================================================== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 'auto',
          paddingBottom: '16px',
        }}
      >
        {/* BOTTOM LEFT HEADLINE */}
        <div
          style={{
            maxWidth: '540px',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 4.8vw, 4.4rem)',
              lineHeight: 1.02,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
            }}
          >
            BUSINESS. SYSTEMS.
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 4.5vw, 4.2rem)',
              lineHeight: 1.15,
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'var(--text-secondary)',
              letterSpacing: '0.005em',
              marginTop: '4px',
            }}
          >
            Intelligence &amp; Innovation.
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
          }}
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
            SCROLL TO EXPLORE
          </span>
          <ArrowDown size={13} color="var(--text-muted)" style={{ opacity: 0.7 }} />
        </div>

        {/* BOTTOM RIGHT: Let's Connect ↗ */}
        <div style={{ pointerEvents: 'auto' }}>
          <button
            onClick={() => scrollTo('contact')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 24px',
              borderRadius: '9999px',
              border: '1px solid rgba(244, 243, 238, 0.32)',
              backgroundColor: 'rgba(17, 21, 20, 0.25)',
              backdropFilter: 'blur(8px)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 400,
              letterSpacing: '0.03em',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(244, 243, 238, 0.8)';
              e.currentTarget.style.backgroundColor = 'rgba(244, 243, 238, 0.12)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(244, 243, 238, 0.32)';
              e.currentTarget.style.backgroundColor = 'rgba(17, 21, 20, 0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>Let&apos;s Connect</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
