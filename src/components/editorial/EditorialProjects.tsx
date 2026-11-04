import React, { useState } from 'react';
import { ArrowUpRight, ArrowRight, ExternalLink, Github, X, CheckCircle2, Layers, Cpu } from 'lucide-react';
import { ProjectRecord } from '../../types/cms';
import { ConcaveCarousel, SpecularButton, BorderGlow } from '../reactbits';

interface EditorialProjectsProps {
  projects: ProjectRecord[];
  onSelectProject?: (projectId: string) => void;
}

export const EditorialProjects: React.FC<EditorialProjectsProps> = ({
  projects,
  onSelectProject,
}) => {
  const publishedProjects = projects.filter((p) => p.status === 'published');
  const [activeModalProject, setActiveModalProject] = useState<ProjectRecord | null>(null);

  const openProjectDetails = (proj: ProjectRecord) => {
    setActiveModalProject(proj);
    if (onSelectProject) {
      onSelectProject(proj.id);
    }
  };

  const closeProjectDetails = () => {
    setActiveModalProject(null);
  };

  return (
    <section
      id="projects"
      style={{
        padding: 'clamp(56px, 6vw, 84px) 0',
        backgroundColor: '#050505',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
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
        {/* Section Header */}
        <div style={{ marginBottom: '36px' }}>
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
              maxWidth: '920px',
            }}
          >
            Autonomous architectures, operating platforms and applied machine intelligence.
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(14px, 1.1vw, 16.5px)',
              color: 'var(--text-secondary)',
              maxWidth: '740px',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Engineered systems, operating protocols, and autonomous platforms built with zero-trust execution and applied intelligence. Drag smoothly or use controls to explore the carousel.
          </p>
        </div>

        {/* ========================================================
            OFFICIAL REACT BITS PRO: CONCAVE CAROUSEL
            Inward 3D curved gallery wall with smooth physics loop
            ======================================================== */}
        <ConcaveCarousel
          items={publishedProjects}
          curvature={0.62}
          tilt={0}
          gap={24}
          dim={0.34}
          reflection={0.10}
          autoplay="off"
          renderItem={(proj, index, isActive) => {
            const logoSrc =
              proj.logoUrl ||
              (proj.id === 'orion-9'
                ? '/images/orion9/orion9-logo.svg'
                : '/images/applyvise/applyvise-logo.svg');
            const coverImage =
              proj.coverImage ||
              (proj.screenshots && proj.screenshots[0]) ||
              '/images/orion9/admin-page.png';
            const tags =
              proj.technologyStack && proj.technologyStack.length > 0
                ? proj.technologyStack.slice(0, 4)
                : proj.skillsUsed && proj.skillsUsed.length > 0
                ? proj.skillsUsed.slice(0, 4)
                : [proj.category];

            return (
              <BorderGlow
                key={proj.id}
                borderRadius="20px"
                glowRadius={340}
                glowIntensity={0.32}
                glowColor="#D9DDE3"
              >
                <div
                  className="project-compact-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(180deg, #12141A 0%, #0A0B0E 100%)',
                    borderRadius: '20px',
                  }}
                >
                {/* Panel Media Banner */}
                <div
                  style={{
                    position: 'relative',
                    height: '190px',
                    width: '100%',
                    backgroundColor: '#07080A',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={coverImage}
                    alt={proj.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.82) contrast(1.08)',
                      transition: 'transform 0.5s ease',
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = '0.3';
                    }}
                  />
                  {/* Subtle Top-Down & Bottom-Up Vignettes */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(10, 11, 14, 0.95) 100%)',
                    }}
                  />

                  {/* Top Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '16px',
                      right: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      zIndex: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#E2E8F0',
                        background: 'rgba(5, 5, 8, 0.75)',
                        backdropFilter: 'blur(8px)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                      }}
                    >
                      {proj.category}
                    </span>

                    {proj.featured && (
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#F1F5F9',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
                          backdropFilter: 'blur(8px)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255, 255, 255, 0.22)',
                        }}
                      >
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Panel Content Body */}
                <div
                  style={{
                    padding: '18px 22px 20px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'space-between',
                    minHeight: 0,
                  }}
                >
                  <div>
                    {/* Header: Title + Subtitle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <div
                        className="project-logo-container"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden',
                          padding: '3px',
                        }}
                      >
                        <img
                          src={logoSrc}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>

                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(20px, 1.8vw, 24px)',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          letterSpacing: '-0.01em',
                          margin: 0,
                        }}
                      >
                        {proj.name}
                      </h3>
                    </div>

                    <div
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '13.5px',
                        fontStyle: 'italic',
                        color: 'var(--accent-silver)',
                        letterSpacing: '0.01em',
                        marginBottom: '8px',
                      }}
                    >
                      {proj.subtitle}
                    </div>

                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        lineHeight: 1.55,
                        color: 'var(--text-secondary)',
                        margin: '0 0 12px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {proj.shortDescription || proj.description}
                    </p>

                    {/* Technology Badges */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                      {tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            color: '#CBD5E1',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '4px',
                            padding: '2px 8px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <SpecularButton
                      onClick={() => openProjectDetails(proj)}
                      size="sm"
                      variant="primary"
                      icon={<ArrowUpRight size={14} color="#FFFFFF" />}
                      iconPosition="right"
                    >
                      Case Study
                    </SpecularButton>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {proj.repositoryUrl && (
                        <a
                          href={proj.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="View Repository"
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-silver)',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Github size={15} />
                        </a>
                      )}

                      {proj.projectUrl && (
                        <a
                          href={proj.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Open Live Platform"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            padding: '8px 14px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.14)',
                            color: '#FFFFFF',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <span>Live System</span>
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </BorderGlow>
          );
        }}
        />
      </div>

      {/* ========================================================
          PROJECT ARCHITECTURE & CASE STUDY DETAIL MODAL
          Full specifications, screenshots, and system breakdown
          ======================================================== */}
      {activeModalProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(16px, 4vw, 36px)',
            animation: 'fadeIn 0.25s ease forwards',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeProjectDetails();
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '860px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#0C0D11',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '20px',
              padding: 'clamp(24px, 4vw, 40px)',
              boxShadow: '0 32px 80px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeProjectDetails}
              aria-label="Close Case Study"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: '24px', paddingRight: '48px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-silver)',
                  marginBottom: '8px',
                }}
              >
                {activeModalProject.category} &bull; Case Study &amp; Architecture
              </div>

              <h2
                id="project-modal-title"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(24px, 3.2vw, 36px)',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: '0 0 6px 0',
                }}
              >
                {activeModalProject.name}
              </h2>

              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '16px',
                  fontStyle: 'italic',
                  color: 'var(--accent-silver)',
                  margin: 0,
                }}
              >
                {activeModalProject.subtitle}
              </p>
            </div>

            {/* Screenshots Gallery if available */}
            {activeModalProject.screenshots && activeModalProject.screenshots.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '12px',
                  marginBottom: '28px',
                }}
              >
                {activeModalProject.screenshots.slice(0, 2).map((src, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: '#050505',
                      aspectRatio: '16/10',
                    }}
                  >
                    <img
                      src={src}
                      alt={`${activeModalProject.name} preview ${sIdx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Narrative & Problem / Solution */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
              <div>
                <h4
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#94A3B8',
                    marginBottom: '8px',
                  }}
                >
                  System Overview
                </h4>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14.5px',
                    lineHeight: 1.7,
                    color: '#E2E8F0',
                    margin: 0,
                  }}
                >
                  {activeModalProject.description}
                </p>
              </div>

              {activeModalProject.problemStatement && (
                <div>
                  <h4
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#94A3B8',
                      marginBottom: '8px',
                    }}
                  >
                    The Operational Challenge
                  </h4>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14.5px',
                      lineHeight: 1.7,
                      color: '#CBD5E1',
                      margin: 0,
                    }}
                  >
                    {activeModalProject.problemStatement}
                  </p>
                </div>
              )}

              {activeModalProject.solution && (
                <div>
                  <h4
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#94A3B8',
                      marginBottom: '8px',
                    }}
                  >
                    Architectural Solution
                  </h4>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14.5px',
                      lineHeight: 1.7,
                      color: '#CBD5E1',
                      margin: 0,
                    }}
                  >
                    {activeModalProject.solution}
                  </p>
                </div>
              )}
            </div>

            {/* Core Capabilities & Features */}
            {activeModalProject.features && activeModalProject.features.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h4
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#94A3B8',
                    marginBottom: '12px',
                  }}
                >
                  Key Architectural Features
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                  {activeModalProject.features.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                      }}
                    >
                      <CheckCircle2 size={15} color="#94A3B8" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: 1.5 }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack Chips */}
            {activeModalProject.technologyStack && activeModalProject.technologyStack.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h4
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#94A3B8',
                    marginBottom: '10px',
                  }}
                >
                  Technology Stack
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {activeModalProject.technologyStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#F1F5F9',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '6px',
                        padding: '4px 12px',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal CTAs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {activeModalProject.repositoryUrl && (
                <a
                  href={activeModalProject.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  <Github size={15} />
                  <span>Repository</span>
                </a>
              )}

              {activeModalProject.projectUrl && (
                <a
                  href={activeModalProject.projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <span>Launch Live Platform</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
