import React, { useState } from 'react';
import { Award, CheckCircle2, ExternalLink, X, Eye } from 'lucide-react';
import { CertificationRecord } from '../../types/cms';
import { BorderGlow } from '../reactbits';

interface EditorialCertificationsProps {
  certifications: CertificationRecord[];
}

export const EditorialCertifications: React.FC<EditorialCertificationsProps> = ({ certifications }) => {
  const [activeCert, setActiveCert] = useState<CertificationRecord | null>(null);

  return (
    <section
      id="certifications"
      style={{
        padding: 'clamp(64px, 9vw, 120px) 0',
        backgroundColor: 'var(--bg-section)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        {/* Editorial Eyebrow */}
        <div style={{ marginBottom: '24px' }}>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Accreditations &bull; Verified Credentials
          </span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.9rem, 4.2vw, 3.6rem)',
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            maxWidth: '920px',
            marginBottom: '48px',
            overflowWrap: 'break-word',
          }}
        >
          Verified accreditations in cloud infrastructure, machine learning systems, and enterprise logistics.
        </h2>

        {/* Editorial Certificates Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 'clamp(20px, 3vw, 32px)',
          }}
        >
          {certifications.map((cert) => (
            <BorderGlow
              key={cert.id}
              borderRadius="16px"
              glowRadius={300}
              glowIntensity={0.30}
              glowColor="#D9DDE3"
            >
              <div
                className="glass-card"
                style={{
                  borderRadius: '16px',
                  padding: 'clamp(20px, 3.5vw, 32px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                }}
              >
              <div>
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
                      width: '38px',
                      height: '38px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(214, 168, 84, 0.1)',
                      border: '1px solid rgba(214, 168, 84, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-gold)',
                    }}
                  >
                    <Award size={18} />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: 'var(--accent-emerald)',
                    }}
                  >
                    <CheckCircle2 size={12} />
                    <span>Verified</span>
                  </div>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  {cert.title}
                </h3>

                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    marginBottom: '16px',
                  }}
                >
                  {cert.issuer} &bull; {cert.completionDate}
                </div>

                {cert.credentialId && (
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.04em',
                      marginBottom: '14px',
                    }}
                  >
                    ID: {cert.credentialId}
                  </div>
                )}

                {cert.skillsUsed && cert.skillsUsed.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {cert.skillsUsed.map((sk, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          padding: '2px 8px',
                          backgroundColor: 'rgba(244, 243, 238, 0.04)',
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  onClick={() => setActiveCert(cert)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Eye size={13} />
                  <span>Inspect Credential</span>
                </button>

                {cert.verificationUrl && (
                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: 'var(--text-accent-blue)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      textDecoration: 'none',
                      marginLeft: 'auto',
                    }}
                  >
                    <span>Verify Link</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </BorderGlow>
        ))}
        </div>
      </div>

      {/* Credential Inspection Modal */}
      {activeCert && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 13, 12, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '24px',
          }}
          onClick={() => setActiveCert(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-editorial)',
              borderRadius: '8px',
              padding: '40px',
              maxWidth: '540px',
              width: '100%',
              position: 'relative',
              boxShadow: 'var(--shadow-editorial)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveCert(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  color: 'var(--accent-gold)',
                  letterSpacing: '0.1em',
                  marginBottom: '8px',
                }}
              >
                Verified Certification Record
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.25,
                }}
              >
                {activeCert.title}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  Issuing Organization
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {activeCert.issuer}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  Issue Date
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {activeCert.completionDate}
                </div>
              </div>

              {activeCert.credentialId && (
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Credential License ID
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-primary)' }}>
                    {activeCert.credentialId}
                  </div>
                </div>
              )}
            </div>

            {activeCert.verificationUrl && (
              <a
                href={activeCert.verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-editorial-pill"
                style={{ width: '100%', justifyContent: 'center' }}
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
