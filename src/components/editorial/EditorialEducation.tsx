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
        {/* Editorial Eyebrow */}
        <div className="public-eyebrow-wrap">
          <span className="public-eyebrow">
            ACADEMIC &bull; QUALIFICATIONS
          </span>
        </div>

        <h2
          className="public-heading-editorial public-heading-editorial--standalone"
          style={{ maxWidth: '880px' }}
        >
          Business administration, commerce &amp; computer applications foundation.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {education.map((edu) => (
            <div
              key={edu.id}
              className="glass-card editorial-timeline-grid"
              style={{
                borderRadius: '16px',
                padding: 'clamp(20px, 3.5vw, 32px)',
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
                    fontSize: '12.5px',
                    color: 'var(--accent-silver)',
                    marginBottom: '10px',
                  }}
                >
                  <Calendar size={13} />
                  <span>
                    {edu.startYear ? `${edu.startYear} — ${edu.endYear}` : edu.endYear}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(20px, 1.45vw, 22px)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                    lineHeight: 1.25,
                  }}
                >
                  {edu.degree}
                </h3>

                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
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
                    fontSize: '16px',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    marginBottom: edu.associatedCollege ? '4px' : '8px',
                  }}
                >
                  {edu.institution}
                </div>

                {edu.associatedCollege && (
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14.5px',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    Associated College: {edu.associatedCollege}
                  </div>
                )}

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
