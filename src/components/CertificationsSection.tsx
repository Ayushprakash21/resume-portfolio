import React from 'react';
import { Award, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';

export const CertificationsSection: React.FC = () => {
  const certifications = [
    {
      id: 'cert-1',
      title: 'Google Cloud Professional Cloud Architect',
      issuer: 'Google Cloud',
      date: 'Verified Credential',
      category: 'Cloud & Distributed Systems',
      highlight: 'ENTERPRISE ARCHITECTURE',
      description:
        'Advanced system design, multi-region scalability, cloud security compliance, and migration frameworks.',
    },
    {
      id: 'cert-2',
      title: 'Generative AI & LLM Systems Specialization',
      issuer: 'DeepLearning.AI / Industry Accreditation',
      date: 'Verified Credential',
      category: 'Artificial Intelligence',
      highlight: 'GENERATIVE INTELLIGENCE',
      description:
        'Large language model orchestration, retrieval augmented generation (RAG), vector semantics, and prompt safety guardrails.',
    },
    {
      id: 'cert-3',
      title: 'Full-Stack Software Architecture Certification',
      issuer: 'Advanced Engineering Institute',
      date: 'Verified Credential',
      category: 'Software Engineering',
      highlight: 'PRODUCTION PROTOCOLS',
      description:
        'High-concurrency Node.js / React micro-architectures, relational data pipelines, and zero-trust authentication schemes.',
    },
  ];

  return (
    <section id="certifications" className="section-wrapper" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '840px', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div className="pill-status">
              <span className="pill-dot pill-dot-gold"></span>
              <span style={{ color: 'var(--accent-gold)' }}>VERIFIED CREDENTIALS // ACCREDITATIONS</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              PROFESSIONAL MILESTONES
            </span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '16px' }}>
            Certifications & Honors
          </h2>

          <p className="type-body" style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            Industry-recognized credentials certifying technical mastery across enterprise cloud architecture,
            generative AI engineering, and distributed systems.
          </p>
        </div>

        {/* Certifications Grid with Gold accents */}
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
                    marginBottom: '18px',
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
                    {cert.highlight}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '19px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                    lineHeight: 1.3,
                  }}
                >
                  {cert.title}
                </h3>

                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '12px',
                  }}
                >
                  {cert.issuer} • {cert.date}
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {cert.description}
                </p>
              </div>

              <div
                style={{
                  marginTop: '24px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-gold)',
                }}
              >
                <CheckCircle2 size={13} color="var(--accent-gold)" />
                <span>ACTIVE CREDENTIAL STANDING</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
