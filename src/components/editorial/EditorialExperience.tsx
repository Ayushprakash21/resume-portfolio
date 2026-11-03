import React from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { ExperienceRecord } from '../../types/cms';

interface EditorialExperienceProps {
  experiences: ExperienceRecord[];
}

export const EditorialExperience: React.FC<EditorialExperienceProps> = ({ experiences }) => {
  return (
    <section
      id="experience"
      style={{
        padding: '120px 0',
        backgroundColor: '#07090D',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#8AB4FF', letterSpacing: '0.1em' }}>
            02 // CAREER TIMELINE
          </span>
          <span style={{ height: '1px', width: '40px', backgroundColor: '#8AB4FF', opacity: 0.4 }} />
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
          A disciplined track record in supply chain operations, process mapping, and technical product leadership.
        </h2>

        {/* Sophisticated Editorial Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {experiences.map((exp, idx) => (
            <div
              key={exp.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '40px',
                paddingBottom: '48px',
                borderBottom: idx !== experiences.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
              }}
            >
              {/* Left Column: Organization & Tenure */}
              <div>
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '13px',
                    color: '#8AB4FF',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Calendar size={13} />
                  <span>{exp.startDate} — {exp.endDate}</span>
                </div>

                <h3
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '26px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    lineHeight: 1.2,
                    marginBottom: '6px',
                  }}
                >
                  {exp.jobTitle}
                </h3>

                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    marginBottom: '12px',
                  }}
                >
                  {exp.employer}
                </div>

                {exp.location && (
                  <div style={{ fontSize: '13px', color: '#738195', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} />
                    <span>{exp.location}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Narrative & Key Deliverables */}
              <div>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    lineHeight: 1.7,
                    color: '#A7B2C0',
                    marginBottom: '24px',
                  }}
                >
                  {exp.description}
                </p>

                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#738195', marginBottom: '12px' }}>
                      KEY CONTRIBUTIONS & IMPACT:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {exp.responsibilities.map((resp, rIdx) => (
                        <div
                          key={rIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            fontSize: '14px',
                            color: '#F5F7FA',
                            lineHeight: 1.6,
                          }}
                        >
                          <span style={{ color: '#8AB4FF', marginTop: '3px' }}>—</span>
                          <span>{resp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '12px' }}>
                    {exp.skillsUsed.map((sk) => (
                      <span
                        key={sk}
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '11px',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          backgroundColor: '#111923',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#A7B2C0',
                        }}
                      >
                        {sk}
                      </span>
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
