import React from 'react';
import { Layers, CheckCircle2, Cpu, Database, Truck, TrendingUp } from 'lucide-react';
import { SkillRecord } from '../../types/cms';

interface SkillsSectionProps {
  skills: SkillRecord[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  // Group skills by category
  const categories: Record<string, SkillRecord[]> = {};
  skills.forEach((sk) => {
    if (!categories[sk.category]) {
      categories[sk.category] = [];
    }
    categories[sk.category].push(sk);
  });

  const categoryIcons: Record<string, React.ElementType> = {
    'Supply Chain & Logistics Systems': Truck,
    'Business Operations & Strategy': TrendingUp,
    'AI & Applied Product Innovation': Cpu,
    'Full-Stack & Cloud Architecture': Database,
  };

  return (
    <section id="skills" className="section-wrapper" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ maxWidth: '840px', marginBottom: '48px' }}>
          <div className="pill-status" style={{ marginBottom: '14px' }}>
            <span className="pill-dot pill-dot-cyan"></span>
            <span style={{ color: 'var(--text-secondary)' }}>VERIFIED COMPETENCIES // CAPABILITIES</span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '16px' }}>
            Skills & Capabilities
          </h2>

          <p className="type-body" style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            A cross-disciplinary toolkit spanning physical logistics operations, strategic enterprise roadmaps, and modern cloud / AI implementations.
          </p>
        </div>

        {/* Categorized Skills Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {Object.entries(categories).map(([catTitle, items]) => {
            const Icon = categoryIcons[catTitle] || Layers;
            return (
              <div
                key={catTitle}
                className="card-base"
                style={{
                  padding: '28px',
                  backgroundColor: 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(69, 214, 255, 0.1)',
                      border: '1px solid rgba(69, 214, 255, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                    }}
                  >
                    {catTitle}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {items.map((sk) => (
                    <div
                      key={sk.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: '4px',
                        }}
                      >
                        {sk.name}
                      </div>
                      {sk.description && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {sk.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
