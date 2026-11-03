import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { ExperienceRecord } from '../../types/cms';

interface EditorialExperienceProps {
  experiences: ExperienceRecord[];
}

export const EditorialExperience: React.FC<EditorialExperienceProps> = ({ experiences }) => {
  return (
    <section
      id="experience"
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
            Experience &bull; Career Journey
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
          A disciplined track record in supply chain operations, process mapping, and operational systems execution.
        </h2>

        {/* Editorial Timeline Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
          {experiences.map((exp, idx) => (
            <div
              key={exp.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(260px, 340px) 1fr',
                gap: '48px',
                paddingBottom: '56px',
                borderBottom: idx !== experiences.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              {/* Left Column: Organization, Dates, Location */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-accent-blue)',
                    marginBottom: '10px',
                    letterSpacing: '0.04em',
                  }}
                >
                  <Calendar size={13} />
                  <span>
                    {exp.startDate} &mdash; {exp.endDate}
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    lineHeight: 1.25,
                    marginBottom: '6px',
                  }}
                >
                  {exp.jobTitle}
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    marginBottom: '12px',
                  }}
                >
                  {exp.employer}
                </div>

                {exp.location && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <MapPin size={12} />
                    <span>{exp.location}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Narrative & Key Responsibilities */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {exp.description}
                </p>

                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--text-muted)',
                        marginBottom: '14px',
                      }}
                    >
                      Key Deliverables &amp; Responsibilities
                    </div>
                    <ul
                      style={{
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {exp.responsibilities.map((resp, rIdx) => (
                        <li
                          key={rIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '12px',
                            fontFamily: 'var(--font-body)',
                            fontSize: '14px',
                            lineHeight: 1.6,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <span
                            style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--text-accent-blue)',
                              flexShrink: 0,
                              transform: 'translateY(-2px)',
                            }}
                          />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
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
