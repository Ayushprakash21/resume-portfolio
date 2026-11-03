import React from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { ProfileData, AboutSectionSettings } from '../../types/cms';

interface EditorialAboutProps {
  profile: ProfileData;
  aboutSettings?: AboutSectionSettings;
}

export const EditorialAbout: React.FC<EditorialAboutProps> = ({ profile, aboutSettings }) => {
  const headline =
    aboutSettings?.heading ||
    'Operating at the intersection of enterprise logistics, physical workflows, and autonomous digital systems.';
  const quote =
    aboutSettings?.quote ||
    'Modern supply chains fail not from a lack of data, but from fragmented operational visibility between physical warehouses and enterprise software.';
  const detailedText =
    aboutSettings?.detailedText ||
    'My operational background centers on orchestrating freight schedules, streamlining procurement pipelines, and translating on-the-ground warehouse hurdles into reliable software architectures. Through building independent platforms like Orion-9 and ApplyVise AI, I connect the rigor of supply chain execution with human-centric software.';
  const physicalHeading = aboutSettings?.physicalOpsHeading || 'Physical Operations';
  const physicalText =
    aboutSettings?.physicalOpsText ||
    'Freight logistics, inventory replenishment, vendor coordination, and warehouse workflows.';
  const digitalHeading = aboutSettings?.digitalPlatformsHeading || 'Digital Platforms';
  const digitalText =
    aboutSettings?.digitalPlatformsText ||
    'Enterprise SaaS, applied language models, ATS parsing systems, and distributed cloud backends.';
  const resumeBtn = profile.resumeButtonText || 'View Full Curriculum Vitae';
  return (
    <section
      id="about"
      style={{
        padding: '130px 0',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        {/* Editorial Section Label */}
        <div style={{ marginBottom: '28px' }}>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            About &bull; Background
          </span>
        </div>

        {/* Editorial Headline */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem, 4.2vw, 3.8rem)',
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            maxWidth: '920px',
            marginBottom: '56px',
          }}
        >
          {headline}
        </h2>

        {/* 2-Column Split: Genuine Photo + Longform Narrative */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '64px',
            alignItems: 'start',
          }}
        >
          {/* Column 1: Genuine Professional Portrait */}
          <div>
            <div
              style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-forest)',
                border: '1px solid var(--border-editorial)',
                boxShadow: 'var(--shadow-editorial)',
              }}
            >
              <img
                src={profile.profilePhoto}
                alt={profile.name}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '520px',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div
                style={{
                  padding: '20px 24px',
                  backgroundColor: 'rgba(17, 21, 20, 0.94)',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {profile.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Bengaluru, India
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} color="var(--text-accent-blue)" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Editorial Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '24px',
                lineHeight: 1.4,
                color: 'var(--text-primary)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              &ldquo;{quote}&rdquo;
            </p>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              {profile.bio}
            </p>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              {detailedText}
            </p>

            {/* Core Competencies Overview */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {physicalHeading}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {physicalText}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {digitalHeading}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {digitalText}
                </div>
              </div>
            </div>

            {/* Resume / Connect Link */}
            {profile.isResumeDownloadEnabled !== false && (
              <div style={{ marginTop: '8px' }}>
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-editorial-pill"
                >
                  <span>{resumeBtn}</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
