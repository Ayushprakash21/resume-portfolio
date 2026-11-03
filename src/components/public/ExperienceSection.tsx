import React from 'react';
import { Briefcase, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { ExperienceRecord } from '../../types/cms';

interface ExperienceSectionProps {
  experiences: ExperienceRecord[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences }) => {
  return (
    <section id="experience" className="section-wrapper" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ maxWidth: '840px', marginBottom: '48px' }}>
          <div className="pill-status" style={{ marginBottom: '14px' }}>
            <span className="pill-dot pill-dot-cyan"></span>
            <span style={{ color: 'var(--accent-secondary)' }}>CHRONOLOGICAL RECORD // OPERATIONS & PRODUCT</span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '16px' }}>
            Professional Experience
          </h2>

          <p className="type-body" style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            Demonstrated track record leading operational roadmaps, streamlining multi-tier logistics pipelines, and bridging enterprise ERP processes with modern software architectures.
          </p>
        </div>

        {/* Structured Experience Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {experiences.map((exp, idx) => (
            <div
              key={exp.id}
              className="card-base"
              style={{
                padding: '32px',
                backgroundColor: 'var(--bg-card)',
                borderLeft: '4px solid var(--accent-primary)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '22px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}
                  >
                    {exp.jobTitle}
                  </h3>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: 'var(--accent-primary)',
                    }}
                  >
                    {exp.employer}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} color="var(--accent-primary)" />
                    <span>
                      {exp.startDate} — {exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} />
                      <span>{exp.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  marginBottom: '20px',
                }}
              >
                {exp.description}
              </p>

              {/* Responsibilities list */}
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div
                    className="type-metadata"
                    style={{ color: 'var(--text-muted)', marginBottom: '10px' }}
                  >
                    CORE DELIVERABLES & IMPACT:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {exp.responsibilities.map((resp, rIdx) => (
                      <div
                        key={rIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          fontSize: '14px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span style={{ color: 'var(--accent-primary)', marginTop: '2px' }}>❯</span>
                        <span>{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Used Tags */}
              {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '16px',
                  }}
                >
                  <span className="type-metadata" style={{ color: 'var(--text-muted)', marginRight: '6px' }}>
                    TECH & CAPABILITIES:
                  </span>
                  {exp.skillsUsed.map((sk) => (
                    <span
                      key={sk}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
