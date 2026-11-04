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
        padding: 'clamp(56px, 6vw, 84px) 0',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
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
        {/* Eyebrow */}
        <div style={{ marginBottom: '18px' }}>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(12px, 0.95vw, 13.5px)',
              color: '#D4D7DC',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            CAPABILITIES &bull; CORE DISCIPLINES
          </span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4.4vw, 56px)',
            fontWeight: 600,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            maxWidth: '920px',
            marginBottom: '36px',
            overflowWrap: 'break-word',
          }}
        >
          Specialized expertise spanning physical supply pipelines, enterprise software, and applied machine intelligence.
        </h2>

        {/* 4-Quadrant Balanced Editorial Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(20px, 2.5vw, 28px)',
          }}
        >
          {Object.entries(categories).map(([categoryName, skillList]) => (
            <div
              key={categoryName}
              className="glass-card"
              style={{
                borderRadius: '16px',
                padding: 'clamp(24px, 3vw, 32px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                background: 'linear-gradient(135deg, rgba(16, 18, 24, 0.75) 0%, rgba(9, 10, 14, 0.88) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
                transition: 'border-color 0.3s ease, transform 0.3s ease',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--accent-silver)',
                    marginBottom: '8px',
                    fontWeight: 600,
                  }}
                >
                  Domain
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(18px, 1.4vw, 21px)',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    lineHeight: 1.3,
                    margin: 0,
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
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      lineHeight: 1.4,
                      transition: 'all 0.2s ease',
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
