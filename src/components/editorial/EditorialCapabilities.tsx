import React, { useMemo } from 'react';
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
        <h2 className="public-heading-editorial">
          Core capabilities across supply chain operations, project coordination, business operations, and enterprise tools.
        </h2>

        <p className="public-section-subtitle">
          Five specialized skill groups combining operational execution, project coordination, enterprise systems, and applied AI. Drag horizontally or use arrow keys to navigate.
        </p>

        {/* ========================================================
            APPLE-STYLE HORIZONTAL CAPABILITIES CAROUSEL
            Centered active panel, subtle flanking cards, zero overlap
            ======================================================== */}
        <ConcaveCarousel
          items={capabilityGroups}
          startIndex={0}
          gap={28}
          autoplay="step"
          interval={4.5}
          renderItem={(group) => {
            return (
              <div className="capabilities-card">
                {/* Card Top Row: Domain Pill & Counter */}
                <div className="capabilities-card__header">
                  <div className="capabilities-card__badge">
                    <span>{group.domainLabel}</span>
                  </div>

                  <span className="capabilities-card__count">
                    {group.skills.length} Capabilities
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="capabilities-card__title">
                  {group.category}
                </h3>

                {/* Subtle Divider */}
                <div className="capabilities-card__divider" />

                {/* Natural Two-Column Capabilities Grid (Zero Internal Scrollbars) */}
                <div className="capabilities-card__grid">
                  {group.skills.map((sk) => (
                    <div key={sk.id} className="capabilities-card__item">
                      <div className="capabilities-card__item-name">
                        <span className="capabilities-card__item-dot" />
                        <span>{sk.name}</span>
                      </div>

                      {sk.description && (
                        <p className="capabilities-card__item-desc">
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
