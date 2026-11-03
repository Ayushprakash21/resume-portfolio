import React, { useState } from 'react';
import { Award, CheckCircle2, ExternalLink, X, Eye } from 'lucide-react';
import { CertificationRecord } from '../../types/cms';

interface EditorialCertificationsProps {
  certifications: CertificationRecord[];
}

export const EditorialCertifications: React.FC<EditorialCertificationsProps> = ({ certifications }) => {
  const [activeCert, setActiveCert] = useState<CertificationRecord | null>(null);

  return (
    <section
      id="certifications"
      style={{
        padding: '130px 0',
        backgroundColor: 'var(--bg-section)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        {/* Editorial Eyebrow */}
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
            Accreditations &bull; Verified Credentials
          </span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem, 4.2vw, 3.8rem)',
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            maxWidth: '920px',
            marginBottom: '64px',
          }}
        >
          Verified accreditations in cloud infrastructure, machine learning systems, and enterprise logistics.
        </h2>

        {/* Editorial Certificates Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
          }}
        >
          {certifications.map((cert) => (
            <div
              key={cert.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s ease',
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
                      marginBottom: '20px',
                    }}
                  >
                    ID: {cert.credentialId}
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
