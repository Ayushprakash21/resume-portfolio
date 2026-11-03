import React from 'react';
import { Award, CheckCircle2, ExternalLink } from 'lucide-react';
import { CertificationRecord } from '../../types/cms';

interface CertificationsSectionProps {
  certifications: CertificationRecord[];
}

export const CertificationsSectionRedesigned: React.FC<CertificationsSectionProps> = ({ certifications }) => {
  return (
    <section id="certifications" className="section-wrapper" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ maxWidth: '840px', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div className="pill-status">
              <span className="pill-dot pill-dot-gold"></span>
              <span style={{ color: 'var(--accent-gold)' }}>VERIFIED CREDENTIALS // ACCREDITATIONS</span>
            </div>
            <span className="type-metadata" style={{ color: 'var(--text-muted)' }}>
              DYNAMIC CMS SYNC
            </span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '16px' }}>
            Certifications & Honors
          </h2>

          <p className="type-body" style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            Rigorous industry credentials validating competency across enterprise cloud architecture, applied generative AI, and supply chain operations.
          </p>
        </div>

        {/* Certifications Grid with Gold Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="card-base card-cert"
              style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
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
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(229, 185, 78, 0.12)',
                      border: '1px solid rgba(229, 185, 78, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-gold)',
                    }}
                  >
                    <Award size={20} />
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--accent-gold)',
                      background: 'rgba(229, 185, 78, 0.08)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid rgba(229, 185, 78, 0.25)',
                    }}
                  >
                    {cert.highlightTag || 'VERIFIED'}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '19px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                    lineHeight: 1.35,
                  }}
                >
                  {cert.title}
                </h3>

                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '10px',
                  }}
                >
                  {cert.issuer} • {cert.completionDate}
                </div>

                {cert.credentialId && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      marginBottom: '16px',
                    }}
                  >
                    CREDENTIAL ID: <span style={{ color: 'var(--text-primary)' }}>{cert.credentialId}</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-gold)' }}>
                  <CheckCircle2 size={14} color="var(--accent-gold)" />
                  <span style={{ fontFamily: 'var(--font-mono)' }}>VERIFIED CREDENTIAL</span>
                </div>

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
                      color: 'var(--text-secondary)',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <span>Verify</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
