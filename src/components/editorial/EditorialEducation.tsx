import React from 'react';
import { GraduationCap, Calendar, Award } from 'lucide-react';
import { EducationRecord } from '../../types/cms';

interface EditorialEducationProps {
  education: EducationRecord[];
}

export const EditorialEducation: React.FC<EditorialEducationProps> = ({ education }) => {
  return (
    <section
      id="education"
      style={{
        padding: '100px 0',
        backgroundColor: '#0C1118',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#45D6FF', letterSpacing: '0.1em' }}>
            07 // ACADEMIC FOUNDATION
          </span>
          <span style={{ height: '1px', width: '40px', backgroundColor: '#45D6FF', opacity: 0.4 }} />
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
            marginBottom: '48px',
          }}
        >
          Education & Academic Qualifications
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {education.map((edu) => (
            <div
              key={edu.id}
              style={{
                backgroundColor: '#111923',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '36px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '28px',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(69, 214, 255, 0.1)',
                    border: '1px solid rgba(69, 214, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#45D6FF',
                    flexShrink: 0,
                  }}
                >
                  <GraduationCap size={26} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', fontWeight: 600, color: '#FFFFFF' }}>
                    {edu.degree}
                  </h3>
                  <div style={{ fontSize: '16px', color: '#8AB4FF', marginTop: '2px', fontWeight: 500 }}>
                    {edu.fieldOfStudy}
                  </div>
                  <div style={{ fontSize: '14px', color: '#A7B2C0', marginTop: '4px' }}>
                    {edu.institution}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#45D6FF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} />
                  <span>{edu.startYear} — {edu.endYear}</span>
                </div>

                {edu.highlights && edu.highlights.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {edu.highlights.map((hl, hIdx) => (
                      <div key={hIdx} style={{ fontSize: '13px', color: '#A7B2C0', lineHeight: 1.5 }}>
                        • {hl}
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
