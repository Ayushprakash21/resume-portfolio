import React, { useState } from 'react';
import {
  ArrowUpRight,
  Github,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Cpu,
  Boxes,
} from 'lucide-react';
import { ProjectRecord } from '../../types/cms';
import { OrionSupplyChainFlow } from '../interactive/OrionSupplyChainFlow';
import { SpecularButton } from '../reactbits';

interface EditorialOrion9Props {
  project?: ProjectRecord;
}

export const EditorialOrion9: React.FC<EditorialOrion9Props> = ({ project }) => {
  const screenshots = project?.screenshots && project.screenshots.length > 0
    ? project.screenshots
    : [
        '/images/orion9/admin-page.png',
        '/images/orion9/admin-branding-tab.png',
        '/images/orion9/login-view.png',
        '/images/orion9/navbar-home.png',
      ];

  const logoSrc = project?.logoUrl || '/images/orion9/orion9-logo.svg';

  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
  const [showArchitecture, setShowArchitecture] = useState<boolean>(false);
  const [showScreenshots, setShowScreenshots] = useState<boolean>(false);

  return (
    <section
      id="orion-9"
      style={{
        padding: '90px 0',
        backgroundColor: '#070709',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
      }}
    >
      <div className="container" style={{ maxWidth: '1080px' }}>
        {/* ========================================================
            TOP SECTION: Category, Logo, Name, Subtitle, Intro, Buttons
            ======================================================== */}
        <div
          className="glass-card"
          style={{
            padding: 'clamp(20px, 4vw, 36px) clamp(18px, 4vw, 40px)',
            borderRadius: '20px',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(22, 23, 28, 0.75) 0%, rgba(10, 11, 14, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
          }}
        >
          {/* Category Eyebrow */}
          <div style={{ marginBottom: '18px' }}>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--accent-silver)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                display: 'inline-block',
                padding: '3px 10px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              Case Study &bull; Autonomous Supply Chain
            </span>
          </div>

          {/* Logo & Name Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                minWidth: '68px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #181920 0%, #0A0B0E 100%)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5)',
              }}
            >
              <img
                src={logoSrc}
                alt="Orion-9 Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 3.2vw, 38px)',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {project?.name || 'Orion-9'}
              </h2>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(15px, 1.3vw, 18px)',
                  fontStyle: 'italic',
                  color: 'var(--accent-silver)',
                  letterSpacing: '0.01em',
                  marginTop: '4px',
                }}
              >
                {project?.subtitle || 'Supply Chain Operating System'}
              </div>
            </div>
          </div>

          {/* Short Introduction */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              maxWidth: '820px',
              margin: '0 0 24px 0',
            }}
          >
            {project?.description ||
              'AI-powered supply chain operating system designed to bring enterprise supply chain operations into one platform.'}
          </p>

          {/* Action Links with Specular Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {project?.repositoryUrl && (
              <SpecularButton
                href={project.repositoryUrl}
                target="_blank"
                icon={<Github size={13} />}
                iconPosition="left"
                variant="secondary"
                size="sm"
              >
                Source Repository
              </SpecularButton>
            )}
            {project?.projectUrl && (
              <SpecularButton
                href={project.projectUrl}
                target="_blank"
                icon={<ArrowUpRight size={13} />}
                variant="primary"
                size="sm"
              >
                Live System Demo
              </SpecularButton>
            )}
          </div>
        </div>

        {/* ========================================================
            KEY CAPABILITIES (COMPACT GRID)
            ======================================================== */}
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Boxes size={13} />
            <span>Key Capabilities</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '16px',
            }}
          >
            {[
              {
                title: 'End-to-End Pipeline Visualization',
                desc: 'Supplier → Procurement → Inventory → Warehouse → Transit → Delivery.',
              },
              {
                title: 'Cryptographic Handoff Integrity',
                desc: 'Hash-linked custody receipts preventing lost freight disputes.',
              },
              {
                title: 'Edge Telemetry Ingestion',
                desc: 'Sub-second event streaming via Cloudflare Workers V8 isolates.',
              },
              {
                title: 'Central Control Tower',
                desc: 'Unified operational exception dashboard with dynamic rerouting.',
              },
            ].map((cap, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '18px 20px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', marginBottom: '6px' }}>
                  {cap.title}
                </div>
                <div style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                  {cap.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            ARCHITECTURE OVERVIEW (COLLAPSIBLE / STREAMLINED)
            ======================================================== */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            marginBottom: '28px',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setShowArchitecture(!showArchitecture)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={16} color="var(--accent-silver)" />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Architecture Overview &amp; Pipeline Flow</span>
            </div>
            {showArchitecture ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showArchitecture && (
            <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <p
                style={{
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  marginTop: '16px',
                  marginBottom: '20px',
                }}
              >
                Distributed edge architecture leveraging Cloudflare Workers V8 isolates, mutual TLS telemetry streams, and immutable hash-linked custody ledgers across 6 operational transit tiers.
              </p>
              <OrionSupplyChainFlow />
            </div>
          )}
        </div>

        {/* ========================================================
            IMPORTANT SCREENSHOTS (OPTIONAL THUMBNAILS & LIGHTBOX)
            ======================================================== */}
        {screenshots && screenshots.length > 0 && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              marginBottom: '28px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setShowScreenshots(!showScreenshots)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ImageIcon size={16} color="var(--accent-silver)" />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  System Screenshots ({screenshots.length} available)
                </span>
              </div>
              {showScreenshots ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showScreenshots && (
              <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                  {screenshots.map((imgUrl, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveScreenshot(activeScreenshot === imgUrl ? null : imgUrl)}
                      style={{
                        width: '180px',
                        height: '110px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border:
                          activeScreenshot === imgUrl
                            ? '2px solid #FFFFFF'
                            : '1px solid rgba(255, 255, 255, 0.12)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={`Screenshot ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>

                {activeScreenshot && (
                  <div
                    style={{
                      marginTop: '20px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      maxHeight: '480px',
                      backgroundColor: '#000000',
                    }}
                  >
                    <img
                      src={activeScreenshot}
                      alt="Enlarged screenshot"
                      style={{ width: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            PRODUCTION VS IN-DEVELOPMENT FEATURES (COMPACT GRID)
            ======================================================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '20px',
            marginBottom: '28px',
          }}
        >
          {/* Completed Features */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              padding: '20px clamp(16px, 3.5vw, 26px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <CheckCircle2 size={15} color="#8CE8A0" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                Production / Completed
              </span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                &bull; Administrative UI prototype and multi-tenant branding configuration views
              </li>
              <li style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                &bull; Portal authentication flow and Cloudflare R2 media asset views
              </li>
              <li style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                &bull; Supply chain workflow conceptual UI and control tower screens
              </li>
            </ul>
          </div>

          {/* In Development Features */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              padding: '20px clamp(16px, 3.5vw, 26px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Clock size={15} color="#90B8FF" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                In Development &amp; Architecture Roadmap
              </span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                &bull; Direct ERP system integrations and real-time operational monitoring
              </li>
              <li style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                &bull; Predictive disruption alerting and risk identification workflows
              </li>
              <li style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                &bull; Specialized AI agents, digital twins, and autonomous control tower decision support
              </li>
            </ul>
          </div>
        </div>

        {/* ========================================================
            TECHNOLOGY STACK (PILLS)
            ======================================================== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Cpu size={13} />
            <span>Technology Stack:</span>
          </div>
          {(project?.technologyStack || ['TypeScript']).map((tech, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '11px',
                color: '#C8C8CE',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '3px 10px',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
