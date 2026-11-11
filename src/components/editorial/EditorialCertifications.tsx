import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, ExternalLink, X, Eye, FileText } from 'lucide-react';
import { CertificationRecord } from '../../types/cms';
import CircularCarousel from '../reactbits/CircularCarousel';
import { BorderGlow } from '../reactbits';

interface EditorialCertificationsProps {
  certifications: CertificationRecord[];
}

export const EditorialCertifications: React.FC<EditorialCertificationsProps> = ({ certifications }) => {
  const [activeCert, setActiveCert] = useState<CertificationRecord | null>(null);

  // Lock body scroll and register Escape listener when modal is active
  useEffect(() => {
    if (activeCert) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setActiveCert(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [activeCert]);

  // Filter only published certifications for public view
  const publishedCertifications = (certifications || []).filter(
    (c) => c.status === 'published'
  );

  // Map real fields to CircularCarousel item format
  const carouselItems = publishedCertifications.map((cert) => ({
    src: cert.issuerLogo || '',
    title: cert.title,
    subtitle: [cert.issuer || 'Issuer not listed', cert.completionDate].filter(Boolean).join(' • '),
    alt: cert.issuerLogoAlt || `${cert.issuer || 'Credential'} Certificate`,
    cert,
  }));

  return (
    <section
      id="certifications"
      className="public-section"
      style={{
        backgroundColor: 'var(--bg-section)',
        borderBottom: '1px solid var(--border-subtle)',
        overflow: 'hidden',
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
        {/* Editorial Eyebrow */}
        <div className="public-eyebrow-wrap">
          <span className="public-eyebrow">
            ACCREDITATIONS &bull; VERIFIED CREDENTIALS
          </span>
        </div>

        <h2 className="public-heading-editorial" style={{ maxWidth: '920px' }}>
          Certifications in project management, supply chain, business analytics, and Claude AI.
        </h2>

        <p className="public-section-subtitle">
          Professional certifications listed on my resume across operations, project delivery, data analytics, and Anthropic Claude credentials. Drag horizontally or use arrow controls to rotate.
        </p>

        {/* ========================================================
            OFFICIAL REACT BITS PRO: CIRCULAR CAROUSEL
            3D Cylindrical accreditation showcase with live CMS data
            ======================================================== */}
        {carouselItems.length > 0 ? (
          <CircularCarousel
            items={carouselItems}
            preset="cylinder"
            intro="rise"
            cardWidth={340}
            cardHeight={450}
            aspectRatio={0.75}
            speed={3.8}
            autoplay={true}
            isPaused={!!activeCert}
            captions={true}
            gap={48}
            tilt={-1.5}
            curve={0.65}
            parallax={0.95}
            cornerRadius={22}
            renderCard={(item, index, isCenter) => {
              const cert = item.cert as CertificationRecord;
              return (
                <BorderGlow
                  borderRadius="22px"
                  glowRadius={300}
                  glowIntensity={0.30}
                  glowColor={isCenter ? '#DC505F' : '#B8C0CC'}
                  style={{ width: '100%', height: '100%' }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '22px',
                      background: isCenter
                        ? 'linear-gradient(145deg, rgba(18, 20, 26, 0.98) 0%, rgba(10, 11, 15, 0.98) 100%)'
                        : 'linear-gradient(145deg, rgba(14, 16, 22, 0.92) 0%, rgba(8, 9, 13, 0.96) 100%)',
                      border: isCenter
                        ? '1px solid rgba(255, 255, 255, 0.24)'
                        : '1px solid rgba(255, 255, 255, 0.10)',
                      padding: '24px 22px',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isCenter
                        ? '0 24px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(220, 80, 95, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.20)'
                        : '0 12px 30px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    }}
                  >
                    {/* Card Top Row: Badge & Verified Pill */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          fontSize: '10px',
                          color: '#E0E3E8',
                          fontWeight: 600,
                          letterSpacing: '0.07em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {cert.highlightTag || 'ACCREDITATION'}
                      </span>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          color: cert.verificationUrl || cert.credentialId ? 'var(--accent-emerald)' : 'var(--accent-silver)',
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>{cert.verificationUrl || cert.credentialId ? 'Verified' : 'Credential'}</span>
                      </div>
                    </div>

                    {/* Prominent Issuer Brand Logo */}
                    <div
                      style={{
                        height: '74px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        margin: '10px 0',
                      }}
                    >
                      {cert.issuerLogo ? (
                        <img
                          src={cert.issuerLogo}
                          alt={cert.issuerLogoAlt || `${cert.issuer} Brand Logo`}
                          style={{
                            maxHeight: '52px',
                            maxWidth: '200px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.75))',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(214, 168, 84, 0.1)',
                            border: '1px solid rgba(214, 168, 84, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-gold)',
                          }}
                        >
                          <Award size={24} />
                        </div>
                      )}
                    </div>

                    {/* Credential Name & Organization */}
                    <div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '16.5px',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          color: '#FFFFFF',
                          margin: '0 0 6px 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {cert.title}
                      </h3>

                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12.5px',
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {[cert.issuer || 'Issuer not specified', cert.completionDate].filter(Boolean).join(' • ')}
                      </div>

                      {cert.credentialId && (
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '10.5px',
                            color: 'var(--text-muted)',
                            marginTop: '2px',
                          }}
                        >
                          ID: {cert.credentialId}
                        </div>
                      )}
                    </div>

                    {/* Skill Tags preview */}
                    {cert.skillsUsed && cert.skillsUsed.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                          marginTop: '8px',
                        }}
                      >
                        {cert.skillsUsed.slice(0, 3).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            style={{
                              padding: '2.5px 7px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              fontSize: '10px',
                              color: '#A7B0A9',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Action Pill */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        marginTop: '8px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCert(cert);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'none',
                          border: 'none',
                          color: '#FFFFFF',
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'color 0.2s ease',
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#DC505F')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#FFFFFF')}
                      >
                        <Eye size={13} />
                        <span>Inspect Credential</span>
                      </button>

                      {cert.verificationUrl && (
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#6CE098',
                            fontFamily: 'var(--font-body)',
                            fontSize: '11.5px',
                            textDecoration: 'none',
                            fontWeight: 500,
                          }}
                        >
                          <span>Verify</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </BorderGlow>
              );
            }}
          />
        ) : (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-muted)',
              fontSize: '14px',
            }}
          >
            No verified accreditations published yet.
          </div>
        )}
      </div>

      {/* Credential Inspection Modal */}
      {activeCert && (
        <div
          id="credential-detail-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 10, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '24px',
          }}
          onClick={() => setActiveCert(null)}
        >
          <div
            style={{
              backgroundColor: '#0F1015',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '16px',
              padding: '36px',
              maxWidth: '560px',
              width: '100%',
              position: 'relative',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(140, 21, 36, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveCert(null)}
              aria-label="Close modal"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#A7B0A9',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Header: Issuer Logo & Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {activeCert.issuerLogo ? (
                  <img
                    src={activeCert.issuerLogo}
                    alt={activeCert.issuer}
                    style={{
                      maxHeight: '38px',
                      maxWidth: '180px',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                    }}
                  >
                    {activeCert.issuer || 'Credential Record'}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: activeCert.verificationUrl || activeCert.credentialId ? 'var(--accent-emerald)' : 'var(--accent-silver)',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={13} />
                <span>{activeCert.verificationUrl || activeCert.credentialId ? 'Verified Authority' : 'Resume Credential'}</span>
              </div>
            </div>

            {/* Credential Title */}
            <div style={{ marginBottom: '22px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10.5px',
                  textTransform: 'uppercase',
                  color: '#DC505F',
                  letterSpacing: '0.12em',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {activeCert.highlightTag || 'ACCREDITATION RECORD'}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.25,
                  margin: 0,
                }}
              >
                {activeCert.title}
              </h3>
            </div>

            {/* Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                marginBottom: '22px',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#8E948D' }}>
                  Issuing Organization
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: '#F4F3EE', fontWeight: 600, marginTop: '2px' }}>
                  {activeCert.issuer || 'Unavailable in resume'}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#8E948D' }}>
                  Issue Date
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: '#F4F3EE', marginTop: '2px' }}>
                  {activeCert.completionDate || 'Unavailable in resume'}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#8E948D' }}>
                  Credential ID
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: '#D4D7DC', marginTop: '2px' }}>
                  {activeCert.credentialId || 'Unavailable in resume'}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#8E948D' }}>
                  Expiration
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: '#D4D7DC', marginTop: '2px' }}>
                  {activeCert.expiryDate || 'Unavailable in resume'}
                </div>
              </div>
            </div>

            {/* Description */}
            {activeCert.description && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: '#C1C4BE',
                  margin: '0 0 20px 0',
                }}
              >
                {activeCert.description}
              </p>
            )}

            {/* Associated Skills */}
            {activeCert.skillsUsed && activeCert.skillsUsed.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: '#8E948D', marginBottom: '8px' }}>
                  Validated Skills:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activeCert.skillsUsed.map((sk, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        padding: '3px 9px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#E1E2E6',
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certificate Attachment Preview */}
            {(activeCert.certificatePdfUrl || activeCert.certificateImage) && (
              <div style={{ marginBottom: '24px' }}>
                <a
                  href={activeCert.certificatePdfUrl || activeCert.certificateImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                >
                  <FileText size={13} />
                  <span>View Attached Certificate Document</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            )}

            {/* Verification Link Button */}
            {activeCert.verificationUrl && (
              <a
                href={activeCert.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  color: '#050505',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                  boxSizing: 'border-box',
                }}
              >
                <span>Open Official Verification Authority</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default EditorialCertifications;
