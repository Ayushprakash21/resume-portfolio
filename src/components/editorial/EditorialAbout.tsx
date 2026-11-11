import React from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { ProfileData, AboutSectionSettings } from '../../types/cms';
import { HoloCard, BorderGlow, SpecularButton } from '../reactbits';

interface EditorialAboutProps {
  profile: ProfileData;
  aboutSettings?: AboutSectionSettings;
  onOpenResumeGenerator?: () => void;
}

export const EditorialAbout: React.FC<EditorialAboutProps> = ({
  profile,
  aboutSettings,
  onOpenResumeGenerator,
}) => {
  const headline =
    aboutSettings?.heading ||
    'Supply chain operations, project coordination, and business operations across enterprise IT services and consulting.';
  const quote =
    aboutSettings?.quote ||
    'Operations professional bridging end-to-end fulfillment coordination, structured project delivery, and AI-enabled workflow design.';
  const detailedText = aboutSettings?.detailedText || '';
  const physicalHeading = aboutSettings?.physicalOpsHeading || 'Supply Chain & Project Delivery';
  const physicalText =
    aboutSettings?.physicalOpsText ||
    'Order management, fulfillment coordination, exception handling, process audits, SOP updates, and multi-project coordination.';
  const digitalHeading = aboutSettings?.digitalPlatformsHeading || 'Enterprise Systems & AI';
  const digitalText =
    aboutSettings?.digitalPlatformsText ||
    'OpenText Vendor Invoice Management (VIM), ERP/SAP (working exposure), analytical reporting, and personal AI projects (Orion-9, ApplyWise AI).';
  const resumeBtn = profile.resumeButtonText || 'Download Curriculum Vitae';
  return (
    <section
      id="about"
      className="public-section"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: 'min(94%, 1280px)',
          margin: '0 auto',
          padding: '0 clamp(16px, 3vw, 32px)',
        }}
      >
        {/* Editorial Section Label */}
        <div className="public-eyebrow-wrap">
          <span className="public-eyebrow">
            ABOUT &bull; BACKGROUND
          </span>
        </div>

        {/* Editorial Headline */}
        <h2 className="public-heading-about">
          {headline}
        </h2>

        {/* 2-Column Split: Genuine Photo + Longform Narrative */}
        <div className="editorial-2col-responsive">
          {/* Column 1: Genuine Professional Portrait with HoloCard and BorderGlow */}
          <div>
            <BorderGlow borderRadius="16px" glowRadius={340} glowIntensity={0.32}>
              <HoloCard
                imageSrc={profile.profilePhoto}
                imageAlt={profile.name}
                maxTilt={6}
                hoverScale={1.015}
                foilIntensity={0.28}
                glareIntensity={0.24}
              >
                <div
                  style={{
                    padding: '20px 24px',
                    backgroundColor: 'rgba(12, 12, 16, 0.85)',
                    backdropFilter: 'blur(16px)',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {profile.name}
                    </div>
                    {profile.isLocationVisible !== false && (
                      <div
                        data-testid="profile-location"
                        style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}
                      >
                        {profile.location || (profile.city ? `${profile.city}, ${profile.stateProvince ? profile.stateProvince + ', ' : ''}${profile.countryRegion || 'India'}` : '')}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="var(--accent-silver)" />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Active
                    </span>
                  </div>
                </div>
              </HoloCard>
            </BorderGlow>
          </div>

          {/* Column 2: Editorial Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--type-subheading)',
                lineHeight: 1.48,
                color: 'var(--text-primary)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              &ldquo;{quote}&rdquo;
            </p>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--type-body)', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
              {profile.bio}
            </p>

            {detailedText && detailedText.trim() !== profile.bio.trim() && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--type-body-sm)', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                {detailedText}
              </p>
            )}

            {/* Core Competencies Overview */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                paddingTop: '18px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {physicalHeading}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '14.5px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                  {physicalText}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {digitalHeading}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '14.5px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                  {digitalText}
                </div>
              </div>
            </div>

            {/* Resume / Connect Link with Specular Button */}
            {profile.isResumeDownloadEnabled !== false && (
              <div style={{ marginTop: '8px' }}>
                <SpecularButton
                  onClick={onOpenResumeGenerator ? onOpenResumeGenerator : undefined}
                  href={onOpenResumeGenerator ? undefined : profile.resumeUrl}
                  target={onOpenResumeGenerator ? undefined : "_blank"}
                  icon={<ArrowUpRight size={13} />}
                >
                  {resumeBtn}
                </SpecularButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
