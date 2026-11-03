import React from 'react';
import { SkillRecord } from '../../types/cms';

interface EditorialCapabilitiesProps {
  skills: SkillRecord[];
}

export const EditorialCapabilities: React.FC<EditorialCapabilitiesProps> = ({ skills }) => {
  // Group skills by category
  const categories: Record<string, SkillRecord[]> = {};
  skills.forEach((sk) => {
    if (!categories[sk.category]) {
      categories[sk.category] = [];
    }
    categories[sk.category].push(sk);
  });

  return (
    <section
      id="capabilities"
      style={{
        padding: 'clamp(64px, 9vw, 120px) 0',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        {/* Eyebrow */}
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
            Capabilities &bull; Core Disciplines
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
            marginBottom: '48px',
            overflowWrap: 'break-word',
          }}
        >
          Specialized expertise spanning physical supply pipelines, enterprise software, and applied machine intelligence.
        </h2>

        {/* 4-Quadrant Editorial Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: 'clamp(20px, 3vw, 32px)',
          }}
        >
          {Object.entries(categories).map(([categoryName, skillList]) => (
            <div
              key={categoryName}
              className="glass-card"
              style={{
                borderRadius: '14px',
                padding: 'clamp(20px, 3.5vw, 32px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--accent-silver)',
                    marginBottom: '8px',
                  }}
                >
                  Domain
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    lineHeight: 1.3,
                  }}
                >
                  {categoryName}
                </h3>
              </div>

              {/* Skills List without fake percentage bars */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {skillList.map((sk) => (
                  <span
                    key={sk.id}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(244, 243, 238, 0.04)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
