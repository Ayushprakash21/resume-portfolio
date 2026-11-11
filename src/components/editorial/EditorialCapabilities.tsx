import React, { useMemo } from 'react';
import { Layers, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { SkillRecord } from '../../types/cms';
import { ConcaveCarousel } from '../reactbits';

interface EditorialCapabilitiesProps {
  skills: SkillRecord[];
}

interface CapabilityGroup {
  id: string;
  category: string;
  domainLabel: string;
  skills: SkillRecord[];
}

export const EditorialCapabilities: React.FC<EditorialCapabilitiesProps> = ({ skills }) => {
  // Group skills dynamically by category preserving record order
  const capabilityGroups = useMemo<CapabilityGroup[]>(() => {
    const map: Record<string, SkillRecord[]> = {};
    skills.forEach((sk) => {
      const cat = sk.category || 'Specialized Capabilities';
      if (!map[cat]) {
        map[cat] = [];
      }
      map[cat].push(sk);
    });

    const domainLabels: Record<string, string> = {
      'Supply Chain': 'Operations & Fulfillment Domain',
      'Project Coordination': 'Delivery & Governance Domain',
      'Business Operations': 'Process & Reporting Domain',
      'Systems and Tools': 'Enterprise Platforms Domain',
      'AI and Development': 'Applied AI & Development Domain',
      'Supply Chain & Logistics Systems': 'Operations & Logistics Domain',
      'Business Operations & Strategy': 'Enterprise Strategy Domain',
      'AI & Applied Product Innovation': 'Applied Intelligence Domain',
      'Full-Stack & Cloud Architecture': 'Distributed Systems Domain',
      'Core Competencies': 'Execution & Operations Domain',
    };

    return Object.entries(map).map(([category, skillList]) => ({
      id: category,
      category,
      domainLabel: domainLabels[category] || 'Core Technical Domain',
      skills: skillList,
    }));
  }, [skills]);

  return (
    <section
      id="capabilities"
      className="public-section"
      style={{
        scrollMarginTop: '80px',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        overflow: 'hidden',
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
        {/* Section Eyebrow */}
        <div className="public-eyebrow-wrap">
          <span className="public-eyebrow">
            CAPABILITIES &bull; CORE DISCIPLINES
          </span>
        </div>

        {/* Editorial Section Heading */}
        <h2 className="public-heading-editorial" style={{ maxWidth: '960px' }}>
          Core capabilities across supply chain operations, project coordination, business operations, and enterprise tools.
        </h2>

        <p className="public-section-subtitle">
          Five specialized skill groups combining operational execution, project coordination, enterprise systems, and applied AI. Drag horizontally or use arrow keys to navigate.
        </p>

        {/* ========================================================
            LAYERED 3D SPECIALIZED EXPERTISE CAROUSEL
            Inspired by Orion-9 telemetry layered composition
            ======================================================== */}
        <ConcaveCarousel
          items={capabilityGroups}
          startIndex={0}
          curvature={0.5}
          tilt={0}
          reflection={0.08}
          autoplay="step"
          interval={4.5}
          renderItem={(group, index, isActive) => {
            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  width: '100%',
                  background: isActive
                    ? 'linear-gradient(145deg, rgba(16, 18, 24, 0.96) 0%, rgba(9, 10, 14, 0.98) 100%)'
                    : 'linear-gradient(145deg, rgba(13, 15, 20, 0.92) 0%, rgba(8, 9, 12, 0.96) 100%)',
                  padding: 'clamp(24px, 3.2vw, 32px)',
                  boxSizing: 'border-box',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '20px',
                  border: isActive
                    ? '1px solid rgba(255, 255, 255, 0.18)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isActive
                    ? '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(140, 21, 36, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                    : '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                  transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
                }}
              >
                {/* Card Top Row: Domain Pill & Counter */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '14px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: 'var(--accent-silver)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                    }}
                  >
                    <span>{group.domainLabel}</span>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: '#94A3B8',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {group.skills.length} Capabilities
                  </span>
                </div>

                {/* Card Title */}
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(20px, 1.8vw, 24px)',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    lineHeight: 1.25,
                    margin: '0 0 18px 0',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {group.category}
                </h3>

                {/* Subtle Divider */}
                <div
                  style={{
                    height: '1px',
                    width: '100%',
                    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%)',
                    marginBottom: '18px',
                  }}
                />

                {/* Scrollable Capabilities List with Descriptions */}
                <div
                  className="concave-carousel__panel-content"
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    paddingRight: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {group.skills.map((sk) => (
                    <div
                      key={sk.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.035)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'background-color 0.2s ease, border-color 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#F1F5F9',
                          marginBottom: sk.description ? '4px' : '0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-silver)',
                            display: 'inline-block',
                          }}
                        />
                        {sk.name}
                      </div>

                      {sk.description && (
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '12px',
                            lineHeight: 1.5,
                            color: 'var(--text-secondary)',
                            margin: 0,
                            paddingLeft: '10px',
                          }}
                        >
                          {sk.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          }}
        />
      </div>
    </section>
  );
};
