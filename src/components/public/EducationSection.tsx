import React from 'react';
import { GraduationCap, Calendar, Award } from 'lucide-react';
import { EducationRecord } from '../../types/cms';

interface EducationSectionProps {
  education: EducationRecord[];
}

export const EducationSection: React.FC<EducationSectionProps> = ({ education }) => {
  return (
    <section id="education" className="section-wrapper" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ maxWidth: '840px', marginBottom: '40px' }}>
          <div className="pill-status" style={{ marginBottom: '14px' }}>
            <span className="pill-dot pill-dot-cyan"></span>
            <span style={{ color: 'var(--text-secondary)' }}>ACADEMIC PEDIGREE // FORMATION</span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '16px' }}>
            Education & Academic Background
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {education.map((edu) => (
            <div
              key={edu.id}
              className="card-base"
              style={{
                padding: '28px',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(69, 214, 255, 0.1)',
                    border: '1px solid rgba(69, 214, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
                    {edu.degree}
                  </h3>
                  <div style={{ fontSize: '15px', color: 'var(--accent-primary)', marginTop: '2px' }}>
                    {edu.fieldOfStudy}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {edu.institution}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Calendar size={14} color="var(--accent-primary)" />
                <span>
                  {edu.startYear ? `${edu.startYear} — ${edu.endYear}` : edu.endYear}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
