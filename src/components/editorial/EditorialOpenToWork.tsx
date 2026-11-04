import React from 'react';
import { ArrowUpRight, Download, Globe, Briefcase, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { OpenToWorkSettings, ProfileData } from '../../types/cms';
import { BorderGlow, SpecularButton } from '../reactbits';

interface EditorialOpenToWorkProps {
  settings: OpenToWorkSettings;
  profile?: ProfileData;
  onOpenResumeGenerator?: () => void;
}

export const EditorialOpenToWork: React.FC<EditorialOpenToWorkProps> = ({
  settings,
  profile,
  onOpenResumeGenerator,
}) => {
  if (!settings || settings.enabled === false) {
    return null;
  }

  const headline = settings.headline || "Building What's Next.";
  const sectionHeading = settings.sectionHeading || 'OPEN TO OPPORTUNITIES';
  const description =
    settings.description ||
    'Actively exploring strategic leadership and operations opportunities combining business operations, global supply chain strategy, enterprise systems architecture, and generative AI innovation. Ready to deliver immediate value to ambitious teams worldwide.';
  const availabilityStatus = settings.availabilityStatus || 'Open to opportunities';
  const employmentPreferences = settings.employmentPreferences || [];
  const workArrangements = settings.workArrangements || [];
  const preferredLocations = (settings.preferredLocations || [])
    .filter((loc) => loc.isVisible !== false)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const preferredJobCategories = settings.preferredJobCategories || [];

  const resumeUrl = settings.secondaryCtaLink || profile?.resumeUrl || '/Ayush_Prakash_Resume.pdf';
  const primaryCta = settings.primaryCtaText || 'Discuss an Opportunity ↗';
  const secondaryCta = settings.secondaryCtaText || 'Download Resume ↓';

  const scrollToContact = () => {
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="opentowork"
      style={{
        padding: 'clamp(56px, 6vw, 84px) 0',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Luxury Radial Glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="container"
        style={{
          maxWidth: 'min(94%, 1280px)',
          margin: '0 auto',
          padding: '0 clamp(16px, 3vw, 32px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Top Header Row with Status Badge */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          {/* Eyebrow Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(12px, 0.95vw, 13.5px)',
                color: '#D4D7DC',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {sectionHeading || 'OPEN TO OPPORTUNITIES'}
            </span>
          </div>

          {/* Glowing Green Open to Work Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 16px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.28)',
              boxShadow: '0 0 20px -3px rgba(16, 185, 129, 0.2)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 10px #10B981',
                display: 'inline-block',
                animation: 'pulse 2s infinite',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#34D399',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {settings.badgeText || 'OPEN TO WORK'} &bull; {availabilityStatus}
            </span>
          </div>
        </div>

        {/* Section Headline */}
        <div style={{ maxWidth: '960px', marginBottom: '40px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4.4vw, 56px)',
              fontWeight: 600,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              marginBottom: '20px',
            }}
          >
            {headline}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '17px',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              maxWidth: '820px',
            }}
          >
            {description}
          </p>
        </div>

        {/* Main 2-Column Luxury Glass Layout */}
        <div className="open-to-work-grid" style={{ marginBottom: '40px' }}>
          {/* Card 1: Target Disciplines & Job Categories */}
          <BorderGlow borderRadius="20px" glowRadius={350} glowIntensity={0.32}>
            <div className="glass-card" style={{ padding: 'clamp(20px, 4vw, 36px)', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-silver)',
                }}
              >
                <Briefcase size={18} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                Target Roles &amp; Disciplines
              </h3>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginBottom: '24px',
                lineHeight: 1.5,
              }}
            >
              Directing strategic operations, building high-throughput logistics backbones, and deploying production AI systems.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {preferredJobCategories.map((cat, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.01em',
                  }}
                >
                  <Sparkles size={11} color="var(--accent-champagne)" style={{ opacity: 0.8 }} />
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Card 2: Employment Types & Work Arrangements */}
          <div className="glass-card" style={{ padding: 'clamp(20px, 4vw, 36px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-silver)',
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                Engagement Preferences
              </h3>
            </div>

            <div style={{ marginBottom: '26px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '12px',
                }}
              >
                Employment Types
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {employmentPreferences.map((type, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 13px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '12px',
                }}
              >
                Work Arrangements
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {workArrangements.map((mode, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 13px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(229, 224, 216, 0.08)',
                      border: '1px solid rgba(229, 224, 216, 0.2)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--accent-champagne)',
                    }}
                  >
                    {mode}
                  </span>
                ))}
              </div>
            </div>
          </div>
          </BorderGlow>
        </div>

        {/* Global Locations Card with Border Glow */}
        <BorderGlow borderRadius="20px" glowRadius={450} glowIntensity={0.28} style={{ marginBottom: '44px' }}>
          <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 36px)', height: '100%' }}>
            <div
              style={{
                display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-silver)',
                }}
              >
                <Globe size={18} />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Geographic Availability &amp; Target Locations
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                  }}
                >
                  Configured international locations for on-site, hybrid, or remote deployment.
                </p>
              </div>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-champagne)',
                }}
              />
              Willing to relocate internationally
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
              gap: '16px',
            }}
          >
            {preferredLocations.map((loc) => (
              <div
                key={loc.id}
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <MapPin size={13} color="var(--accent-silver)" />
                    {loc.name}
                  </div>
                  {loc.relocationWilling && (
                    <span
                      title="Relocation Willing"
                      style={{
                        fontSize: '10px',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(229, 224, 216, 0.12)',
                        color: 'var(--accent-champagne)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Relocate
                    </span>
                  )}
                </div>

                {loc.city && (
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '8px',
                    }}
                  >
                    {loc.city}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '6px' }}>
                  {loc.remoteAvailable && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-body)',
                        opacity: 0.85,
                      }}
                    >
                      &bull; Remote eligible
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        </BorderGlow>

        {/* Dual Bouncy Spring CTAs with Specular Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            padding: '28px 0',
          }}
        >
          {/* Primary CTA */}
          <SpecularButton
            onClick={scrollToContact}
            icon={<ArrowUpRight size={15} />}
            size="lg"
          >
            {primaryCta}
          </SpecularButton>

          {/* Secondary CTA */}
          <SpecularButton
            onClick={onOpenResumeGenerator ? onOpenResumeGenerator : undefined}
            href={onOpenResumeGenerator ? undefined : resumeUrl}
            target={onOpenResumeGenerator ? undefined : "_blank"}
            download={onOpenResumeGenerator ? undefined : true}
            icon={<Download size={14} />}
            variant="secondary"
            size="lg"
          >
            {secondaryCta}
          </SpecularButton>
        </div>
      </div>
    </section>
  );
};
