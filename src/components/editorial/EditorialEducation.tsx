import React from 'react';
import { Calendar } from 'lucide-react';
import { EducationRecord } from '../../types/cms';

interface EditorialEducationProps {
  education: EducationRecord[];
}

export const EditorialEducation: React.FC<EditorialEducationProps> = ({ education }) => {
  const publishedEducation = (education || []).filter((e) => e.status !== 'draft');

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

        <h2 className="public-heading-editorial public-heading-editorial--standalone">
          Business administration, commerce &amp; computer applications foundation.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {publishedEducation.map((edu) => {
            const overviewText = (edu.courseOverview || edu.description || '').trim();
            const areasOfStudy = Array.from(
              new Set([
                ...(edu.subjects || []).map((s) => s.trim()).filter(Boolean),
                ...(edu.relevantCoursework || []).map((c) => c.trim()).filter(Boolean),
              ])
            );
            const focusText = (edu.academicFocus || '').trim();
            const outcomes = (edu.learningOutcomes || []).map((o) => o.trim()).filter(Boolean);
            const researchText = (edu.projectsResearch || '').trim();
            const achievements = (edu.academicAchievements || []).map((a) => a.trim()).filter(Boolean);
            const highlights = (edu.highlights || []).map((h) => h.trim()).filter(Boolean);
            const skills = (edu.skillsUsed || []).map((sk) => sk.trim()).filter(Boolean);
            const notesText = (edu.additionalNotes || '').trim();

            return (
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
                  {(edu.startYear || edu.endYear) && (
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
                        {edu.startYear && edu.endYear
                          ? `${edu.startYear} — ${edu.endYear}`
                          : edu.endYear || edu.startYear}
                      </span>
                    </div>
                  )}

                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--type-card-title)',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '6px',
                      lineHeight: 1.25,
                    }}
                  >
                    {edu.degree}
                  </h3>

                  {edu.fieldOfStudy && (
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '15px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {edu.fieldOfStudy}
                    </div>
                  )}

                  {edu.grade && (
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12.5px',
                        color: 'var(--text-muted)',
                        marginTop: '6px',
                      }}
                    >
                      {edu.grade}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '16px',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                        marginBottom: edu.associatedCollege || edu.specialization ? '4px' : '0',
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
                          marginBottom: edu.specialization ? '4px' : '0',
                        }}
                      >
                        Associated College: {edu.associatedCollege}
                      </div>
                    )}

                    {edu.specialization && edu.specialization.trim().toLowerCase() !== (edu.fieldOfStudy || '').trim().toLowerCase() && (
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14.5px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Specialization: {edu.specialization}
                      </div>
                    )}
                  </div>

                  {overviewText && (
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11.5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.09em',
                          color: 'var(--text-muted)',
                          marginBottom: '5px',
                        }}
                      >
                        About the Qualification
                      </div>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14.5px',
                          lineHeight: 1.6,
                          color: 'var(--text-secondary)',
                          margin: 0,
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {overviewText}
                      </p>
                    </div>
                  )}

                  {areasOfStudy.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11.5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.09em',
                          color: 'var(--text-muted)',
                          marginBottom: '7px',
                        }}
                      >
                        Areas of Study
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                        {areasOfStudy.map((topic, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.09)',
                              fontFamily: 'var(--font-body)',
                              fontSize: '12.5px',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {focusText && (
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11.5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.09em',
                          color: 'var(--text-muted)',
                          marginBottom: '5px',
                        }}
                      >
                        Academic Focus
                      </div>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14.5px',
                          lineHeight: 1.6,
                          color: 'var(--text-secondary)',
                          margin: 0,
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {focusText}
                      </p>
                    </div>
                  )}

                  {outcomes.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11.5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.09em',
                          color: 'var(--text-muted)',
                          marginBottom: '6px',
                        }}
                      >
                        Key Learning Outcomes
                      </div>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '5px',
                        }}
                      >
                        {outcomes.map((outcome, oIdx) => (
                          <li
                            key={oIdx}
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '14px',
                              lineHeight: 1.55,
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {researchText && (
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11.5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.09em',
                          color: 'var(--text-muted)',
                          marginBottom: '5px',
                        }}
                      >
                        Projects &amp; Research
                      </div>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14.5px',
                          lineHeight: 1.6,
                          color: 'var(--text-secondary)',
                          margin: 0,
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {researchText}
                      </p>
                    </div>
                  )}

                  {achievements.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11.5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.09em',
                          color: 'var(--text-muted)',
                          marginBottom: '6px',
                        }}
                      >
                        Academic Achievements
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {achievements.map((ach, aIdx) => (
                          <div
                            key={aIdx}
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '14px',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.55,
                            }}
                          >
                            &bull; {ach}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {highlights.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {highlights.map((hl, hIdx) => (
                        <div
                          key={hIdx}
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '14px',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.55,
                          }}
                        >
                          &bull; {hl}
                        </div>
                      ))}
                    </div>
                  )}

                  {skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {skills.map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          style={{
                            padding: '3px 9px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {notesText && (
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '13.5px',
                        lineHeight: 1.55,
                        color: 'var(--text-muted)',
                        margin: 0,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {notesText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
