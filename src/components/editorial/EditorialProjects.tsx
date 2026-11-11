import React from 'react';
import { ArrowUpRight, ArrowRight, ExternalLink } from 'lucide-react';
import { ProjectRecord } from '../../types/cms';
import { BorderGlow, SpecularButton } from '../reactbits';

interface EditorialProjectsProps {
  projects: ProjectRecord[];
  onSelectProject?: (projectId: string) => void;
}

export const EditorialProjects: React.FC<EditorialProjectsProps> = ({
  projects,
  onSelectProject,
}) => {
  const publishedProjects = projects.filter((p) => p.status === 'published');

  const scrollToCaseStudy = (projectId: string) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    }
    const targetId = projectId === 'orion-9' ? 'orion-9' : projectId === 'applywise-ai' ? 'applyvise-ai' : `project-${projectId}`;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="projects"
      style={{
        padding: 'clamp(56px, 6vw, 84px) 0',
        backgroundColor: '#050505',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
        {/* Section Header */}
        <div style={{ marginBottom: '44px' }}>
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
              FEATURED WORK &bull; SELECTED SYSTEMS
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4.4vw, 56px)',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.12,
              marginBottom: '16px',
            }}
          >
            Projects
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(14px, 1.1vw, 16.5px)',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Personal AI-powered platforms designed for supply chain operations and career intelligence.
          </p>
        </div>

        {/* Compact Horizontal Project Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {publishedProjects.map((proj) => {
            const logoSrc =
              proj.logoUrl ||
              (proj.id === 'orion-9'
                ? '/images/orion9/orion9-logo.svg'
                : '/images/applyvise/applyvise-logo.svg');
            const tags =
              proj.skillsUsed && proj.skillsUsed.length > 0
                ? proj.skillsUsed.slice(0, 4)
                : [proj.category];

            return (
              <BorderGlow
                key={proj.id}
                borderRadius="20px"
                glowRadius={360}
                glowIntensity={0.34}
                glowColor="#D9DDE3"
              >
                <div
                  className="project-compact-card"
                  style={{
                    background: 'linear-gradient(135deg, rgba(22, 23, 28, 0.72) 0%, rgba(10, 11, 14, 0.88) 100%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.10)',
                    borderRadius: '20px',
                    padding: '28px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '28px',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {/* ================= LEFT: PROJECT LOGO ================= */}
                  <div
                    className="project-logo-container"
                    style={{
                      width: '94px',
                      height: '94px',
                      minWidth: '94px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #16171E 0%, #0A0B0E 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      padding: '8px',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={logoSrc}
                      alt={`${proj.name} Logo`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4))',
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* ================= CENTRE: INFORMATION ================= */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(22px, 2.2vw, 28px)',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          letterSpacing: '-0.01em',
                          margin: 0,
                        }}
                      >
                        {proj.name}
                      </h3>
                    </div>

                    {/* Elegant Italic Subtitle */}
                    <div
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(14px, 1.2vw, 16px)',
                        fontStyle: 'italic',
                        color: 'var(--accent-silver)',
                        letterSpacing: '0.01em',
                        marginBottom: '10px',
                      }}
                    >
                      {proj.subtitle}
                    </div>

                    {/* Short Description (max 2-3 lines) */}
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: 'var(--text-secondary)',
                        maxWidth: '680px',
                        margin: '0 0 14px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {proj.shortDescription || proj.description}
                    </p>

                    {/* Category Tags */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            color: '#A5A5A9',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.09)',
                            borderRadius: '9999px',
                            padding: '4px 12px',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ================= RIGHT: CTAS ================= */}
                  <div
                    className="project-card-actions"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '12px',
                      flexShrink: 0,
                    }}
                  >
                    {/* Case Study Specular Button */}
                    <SpecularButton
                      onClick={() => scrollToCaseStudy(proj.id)}
                      size="sm"
                      variant="primary"
                      icon={<ArrowUpRight size={14} color="#FFFFFF" />}
                      iconPosition="right"
                    >
                      Case Study
                    </SpecularButton>

                    {/* External Live Platform / Demo Link */}
                    {proj.projectUrl ? (
                      <a
                        href={proj.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Open Live Deployment"
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-silver)',
                          transition: 'all 0.25s ease',
                          cursor: 'pointer',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.28)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.color = 'var(--accent-silver)';
                        }}
                      >
                        <ArrowRight size={15} />
                      </a>
                    ) : (
                      <button
                        onClick={() => scrollToCaseStudy(proj.id)}
                        title="Inspect Details"
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-silver)',
                          transition: 'all 0.25s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.28)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.color = 'var(--accent-silver)';
                        }}
                      >
                        <ArrowRight size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </BorderGlow>
            );
          })}
        </div>
      </div>
    </section>
  );
};
