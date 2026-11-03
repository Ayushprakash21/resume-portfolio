import React from 'react';
import { Truck, TrendingUp, Cpu, Database } from 'lucide-react';
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

  const categoryMetadata: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    'Supply Chain & Logistics Systems': {
      icon: Truck,
      color: '#42D6A4',
      label: 'PHYSICAL SYSTEMS & FLEETS',
    },
    'Business Operations & Strategy': {
      icon: TrendingUp,
      color: '#45D6FF',
      label: 'ORGANIZATIONAL EXCELLENCE',
    },
    'AI & Applied Product Innovation': {
      icon: Cpu,
      color: '#A78BFA',
      label: 'MACHINE INTELLIGENCE & HEURISTICS',
    },
    'Full-Stack & Cloud Architecture': {
      icon: Database,
      color: '#8AB4FF',
      label: 'DISTRIBUTED ARCHITECTURE',
    },
  };

  return (
    <section
      id="skills"
      style={{
        padding: '120px 0',
        backgroundColor: '#0C1118',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#45D6FF', letterSpacing: '0.1em' }}>
            03 // CAPABILITIES & KNOWLEDGE
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
            marginBottom: '64px',
          }}
        >
          Practical competencies spanning ground logistics, operational strategy, and modern software engineering.
        </h2>

        {/* Editorial 2x2 Grid with Asymmetric Accents */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
          }}
        >
          {Object.entries(categories).map(([catTitle, items]) => {
            const meta = categoryMetadata[catTitle] || { icon: Database, color: '#45D6FF', label: 'DOMAIN' };
            const Icon = meta.icon;
            return (
              <div
                key={catTitle}
                style={{
                  padding: '36px',
                  backgroundColor: '#111923',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: meta.color,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: meta.color }}>
                        {meta.label}
                      </div>
                      <h3
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: '18px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                        }}
                      >
                        {catTitle}
                      </h3>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {items.map((sk) => (
                      <div
                        key={sk.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          paddingBottom: '12px',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#F5F7FA',
                            marginBottom: '4px',
                          }}
                        >
                          {sk.name}
                        </div>
                        {sk.description && (
                          <div style={{ fontSize: '13px', color: '#A7B2C0', lineHeight: 1.5 }}>
                            {sk.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '24px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    color: '#738195',
                  }}
                >
                  VERIFIED COMPETENCY // NO INFLATED PERCENTAGES
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
