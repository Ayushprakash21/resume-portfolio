import React, { useState } from 'react';
import { ArrowUpRight, Github, CheckCircle2, Clock } from 'lucide-react';
import { ProjectRecord } from '../../types/cms';
import { OrionSupplyChainFlow } from '../interactive/OrionSupplyChainFlow';

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

  const [selectedScreenshot, setSelectedScreenshot] = useState<string>(screenshots[0]);

  return (
    <section
      id="projects"
      style={{
        padding: '130px 0',
        backgroundColor: 'var(--bg-section)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        {/* Editorial Eyebrow */}
        <div style={{ marginBottom: '28px' }}>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Case Study &bull; Flagship Project
          </span>
        </div>

        {/* Project Header */}
        <div style={{ maxWidth: '920px', marginBottom: '56px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.6rem, 5vw, 4.4rem)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}
          >
            Orion-9
          </h2>

          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)',
              fontStyle: 'italic',
              color: 'var(--text-secondary)',
              lineHeight: 1.3,
              marginBottom: '24px',
            }}
          >
            AI-Powered Autonomous Supply Chain Operating System
          </div>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '17px',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              maxWidth: '840px',
            }}
          >
            Orion-9 bridges real-time warehouse execution, freight route intelligence, and dynamic supplier procurement. Engineered to eradicate blind spots between ground dispatch operations and enterprise resource planning.
          </p>

          {/* Action Links */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '28px', flexWrap: 'wrap' }}>
            {project?.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-editorial-pill"
              >
                <Github size={14} />
                <span>Source Repository</span>
              </a>
            )}
            {project?.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-editorial-pill"
              >
                <span>Live System Demo</span>
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>

        {/* High-Resolution Screenshot Showcase */}
        <div style={{ marginBottom: '64px' }}>
          <div
            style={{
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-editorial)',
              boxShadow: 'var(--shadow-editorial)',
            }}
          >
            <img
              src={selectedScreenshot}
              alt="Orion-9 System Screenshot"
              style={{
                width: '100%',
                maxHeight: '620px',
                objectFit: 'contain',
                backgroundColor: '#0D1312',
                display: 'block',
              }}
            />
          </div>

          {/* Screenshot Thumbnail Switcher */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '16px',
              overflowX: 'auto',
              paddingBottom: '8px',
            }}
          >
            {screenshots.map((imgUrl, i) => (
              <button
                key={i}
                onClick={() => setSelectedScreenshot(imgUrl)}
                style={{
                  width: '130px',
                  height: '75px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border:
                    selectedScreenshot === imgUrl
                      ? '2px solid var(--text-primary)'
                      : '1px solid var(--border-subtle)',
                  padding: 0,
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-primary)',
                  flexShrink: 0,
                  opacity: selectedScreenshot === imgUrl ? 1 : 0.6,
                  transition: 'opacity 0.2s ease',
                }}
              >
                <img
                  src={imgUrl}
                  alt={`Orion-9 preview ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Supply Chain Flow */}
        <div style={{ marginBottom: '72px' }}>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              marginBottom: '16px',
            }}
          >
            Operational Pipeline Architecture
          </div>
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              padding: '32px 24px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <OrionSupplyChainFlow />
          </div>
        </div>

        {/* Feature Lifecycle & Status Breakdown */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
          }}
        >
          {/* Completed Features */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              padding: '32px 28px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Production / Completed
              </span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Full-stack administrative dashboard with multi-tenant org routing
              </li>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Cloudflare R2 media and branding asset management pipeline
              </li>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Vendor authentication and session lifecycle with Firestore
              </li>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Real-time freight node status tracking and event logs
              </li>
            </ul>
          </div>

          {/* In Development & Planned */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              padding: '32px 28px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Clock size={16} color="var(--text-accent-blue)" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                In Development &amp; Architecture Roadmap
              </span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Automated freight delay anomaly prediction heuristic
              </li>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Direct SAP ERP &amp; Oracle SCM connector integration layer
              </li>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Autonomous inventory re-order triggering based on warehouse safety stock thresholds
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
