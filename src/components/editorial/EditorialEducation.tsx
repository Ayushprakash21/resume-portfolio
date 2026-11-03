import React from 'react';
import { Calendar, GraduationCap } from 'lucide-react';
import { EducationRecord } from '../../types/cms';

interface EditorialEducationProps {
  education: EducationRecord[];
}

export const EditorialEducation: React.FC<EditorialEducationProps> = ({ education }) => {
  return (
    <section
      id="education"
      style={{
        padding: 'clamp(64px, 9vw, 110px) 0',
        backgroundColor: 'var(--bg-primary)',
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
            Academic &bull; Qualifications
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
            marginBottom: '40px',
            overflowWrap: 'break-word',
          }}
        >
          Engineering foundation &amp; quantitative systems training.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {education.map((edu) => (
            <div
              key={edu.id}
              className="glass-card editorial-timeline-grid"
              style={{
                borderRadius: '16px',
                padding: 'clamp(20px, 4vw, 36px)',
                alignItems: 'start',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--accent-silver)',
                    marginBottom: '10px',
                  }}
                >
                  <Calendar size={13} />
                  <span>
                    {edu.startYear} &mdash; {edu.endYear}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  {edu.degree}
                </h3>

                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {edu.fieldOfStudy}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    marginBottom: '8px',
                  }}
                >
                  {edu.institution}
                </div>

                {edu.highlights && edu.highlights.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      marginTop: '8px',
                    }}
                  >
                    {edu.highlights.map((hl, hIdx) => (
                      <div
                        key={hIdx}
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        &bull; {hl}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
