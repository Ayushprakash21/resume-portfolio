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
        padding: '120px 0',
        backgroundColor: '#07090D',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#E5B94E', letterSpacing: '0.1em' }}>
            06 // ACCREDITATIONS
          </span>
          <span style={{ height: '1px', width: '40px', backgroundColor: '#E5B94E', opacity: 0.4 }} />
        </div>

        <h2
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#F5F7FA',
            maxWidth: '920px',
            marginBottom: '64px',
          }}
        >
          Verified technical accreditations in cloud architecture, generative AI, and operations logistics.
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
                backgroundColor: '#111923',
                borderRadius: '12px',
                border: '1px solid rgba(229, 185, 78, 0.25)',
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(229, 185, 78, 0.1)',
                      border: '1px solid rgba(229, 185, 78, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#E5B94E',
                    }}
                  >
                    <Award size={22} />
                  </div>

                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px',
                      color: '#E5B94E',
                      background: 'rgba(229, 185, 78, 0.08)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: '1px solid rgba(229, 185, 78, 0.25)',
                    }}
                  >
                    {cert.highlightTag || 'ACCREDITATION'}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    lineHeight: 1.35,
                    marginBottom: '10px',
                  }}
                >
                  {cert.title}
                </h3>

                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '13px',
                    color: '#A7B2C0',
                    marginBottom: '16px',
                  }}
                >
                  {cert.issuer} • {cert.completionDate}
                </div>

                <div
                  style={{
                    fontSize: '13px',
                    color: '#738195',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  DOMAIN: <span style={{ color: '#F5F7FA' }}>{cert.category}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '20px',
                  marginTop: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <button
                  onClick={() => setActiveCert(cert)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#E5B94E',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: 0,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  <Eye size={14} />
                  <span>Inspect Credential</span>
                </button>

                {cert.verificationUrl && (
                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: '#A7B2C0',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#A7B2C0')}
                  >
                    <span>Verify Link</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Certificate Inspection Modal */}
        {activeCert && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              zIndex: 100,
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '560px',
                backgroundColor: '#0C1118',
                borderRadius: '12px',
                border: '1px solid #E5B94E',
                padding: '36px',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setActiveCert(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: '#151E29',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#A7B2C0',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CheckCircle2 size={16} color="#E5B94E" />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#E5B94E' }}>
                  ACCREDITATION RECORD VERIFIED
                </span>
              </div>

              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                {activeCert.title}
              </h3>

              <div style={{ fontSize: '14px', color: '#8AB4FF', marginBottom: '16px' }}>
                Issued by {activeCert.issuer}
              </div>

              <div
                style={{
                  backgroundColor: '#111923',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  color: '#A7B2C0',
                }}
              >
                <div>STATUS: <span style={{ color: '#42D6A4' }}>ACTIVE & STANDING</span></div>
                <div>DOMAIN: <span style={{ color: '#FFFFFF' }}>{activeCert.category}</span></div>
                <div>DATE: <span style={{ color: '#FFFFFF' }}>{activeCert.completionDate}</span></div>
              </div>

              {activeCert.verificationUrl && (
                <a
                  href={activeCert.verificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ width: '100%', borderColor: 'rgba(229, 185, 78, 0.4)', color: '#E5B94E' }}
                >
                  <span>Open Official Issuer Verification Portal</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
