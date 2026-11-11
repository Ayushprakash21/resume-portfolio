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
      className="public-section"
      style={{
        backgroundColor: 'var(--bg-section)',
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
            EXPERIENCE &bull; CAREER JOURNEY
          </span>
        </div>

        <h2 className="public-heading-experience">
          Career history across supply chain operations, project coordination, business technology delivery, and banking operations.
        </h2>

        {/* Editorial Timeline Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {experiences.map((exp, idx) => (
            <div
              key={exp.id}
              className="editorial-timeline-grid"
              style={{
                paddingBottom: idx !== experiences.length - 1 ? '40px' : '0',
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
                    color: 'var(--accent-silver)',
                    marginBottom: '10px',
                    letterSpacing: '0.04em',
                    flexWrap: 'wrap',
                  }}
                >
                  <Calendar size={13} />
                  <span>
                    {exp.isCurrent || exp.endDate === 'Present'
                      ? `${exp.startDate} — Present`
                      : !exp.endDate || exp.startDate === exp.endDate
                      ? exp.startDate
                      : `${exp.startDate} — ${exp.endDate}`}
                  </span>
                  {exp.isCurrent && (
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'rgba(200, 200, 206, 0.12)',
                        border: '1px solid rgba(200, 200, 206, 0.25)',
                        borderRadius: '12px',
                        fontSize: '10px',
                        color: 'var(--accent-silver)',
                      }}
                    >
                      Current
                    </span>
                  )}
                  {exp.employmentType && exp.showEmploymentTypeBadge !== false && (
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'rgba(244, 243, 238, 0.05)',
                        borderRadius: '12px',
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {exp.employmentType}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(20px, 1.5vw, 23px)',
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
                    fontSize: '15.5px',
                    color: 'var(--text-secondary)',
                    marginBottom: '12px',
                  }}
                >
                  {exp.employer}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {exp.location && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '12.5px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <MapPin size={12} />
                      <span>{exp.location}</span>
                    </div>
                  )}
                  {exp.locationType && (
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      &bull; {exp.locationType}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Narrative & Key Responsibilities */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {exp.description && (
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '16px',
                      lineHeight: 1.65,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {exp.description}
                  </p>
                )}

                {(!exp.description && (!exp.responsibilities || exp.responsibilities.length === 0)) && (
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      lineHeight: 1.6,
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                    }}
                  >
                    {exp.jobTitle} at {exp.employer}.
                  </p>
                )}

                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div style={{ marginTop: '2px' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--text-muted)',
                        marginBottom: '12px',
                      }}
                    >
                      Key Deliverables &amp; Responsibilities
                    </div>
                    <ul
                      style={{
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
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
                            fontSize: '15px',
                            lineHeight: 1.6,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <span
                            style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--accent-silver)',
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

                {/* Associated Skills */}
                {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--text-muted)',
                        marginBottom: '10px',
                      }}
                    >
                      Skills &amp; Capabilities
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {exp.skillsUsed.map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-body)',
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media Gallery / Work Samples */}
                {exp.mediaItems && exp.mediaItems.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--text-muted)',
                        marginBottom: '10px',
                      }}
                    >
                      Media &amp; Work Samples
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '14px',
                      }}
                    >
                      {exp.mediaItems.map((med) => (
                        <div
                          key={med.id}
                          className="glass-card"
                          style={{
                            borderRadius: '8px',
                            overflow: 'hidden',
                          }}
                        >
                          {med.type === 'image' && (
                            <img
                              src={med.url}
                              alt={med.altText || med.title || 'Work sample'}
                              style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div style={{ padding: '8px 10px' }}>
                            <div
                              style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {med.title || 'Attachment'}
                            </div>
                            {med.caption && (
                              <div
                                style={{
                                  fontFamily: 'var(--font-body)',
                                  fontSize: '11px',
                                  color: 'var(--text-muted)',
                                  marginTop: '2px',
                                  lineHeight: 1.3,
                                }}
                              >
                                {med.caption}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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
