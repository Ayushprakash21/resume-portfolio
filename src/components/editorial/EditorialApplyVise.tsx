import React from 'react';
import { ArrowUpRight, Github, CheckCircle2, Clock } from 'lucide-react';
import { ProjectRecord } from '../../types/cms';
import { ApplyViseCareerFlow } from '../interactive/ApplyViseCareerFlow';

interface EditorialApplyViseProps {
  project?: ProjectRecord;
}

export const EditorialApplyVise: React.FC<EditorialApplyViseProps> = ({ project }) => {
  return (
    <section
      id="applyvise"
      style={{
        padding: '130px 0',
        backgroundColor: 'var(--bg-primary)',
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
            Case Study &bull; Product Innovation
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
            ApplyVise AI
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
            AI-Powered Career Intelligence &amp; Job Application Platform
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
            An intelligent career intelligence platform designed to replace opaque ATS rejections with transparent resume diagnostics, high-accuracy job requirement alignment, and structured application intelligence.
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
                <span>Live Platform</span>
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Brand Banner / Official Visual Asset */}
        <div style={{ marginBottom: '64px' }}>
          <div
            className="glass-card"
            style={{
              borderRadius: '16px',
              padding: '60px 40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-editorial)',
            }}
          >
            <img
              src="/images/applyvise/applyvise-logo.png"
              alt="ApplyVise AI Official Identity"
              style={{
                maxWidth: '380px',
                width: '100%',
                height: 'auto',
                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.6))',
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Interactive Career Flow */}
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
            Intelligence &amp; Optimization Pipeline
          </div>
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              padding: '32px 24px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <ApplyViseCareerFlow />
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
          {/* Active Features */}
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
                Active &amp; Functional
              </span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Full-stack reactive web interface with modern responsive layouts
              </li>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Resume parsing engine and keyword ATS alignment diagnostics
              </li>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Objective career suitability assessment without fabricated claims
              </li>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Firebase-backed user profiles and application tracking logs
              </li>
            </ul>
          </div>

          {/* Planned Features */}
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
                Planned Architecture &amp; Next Milestones
              </span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Multi-provider job board aggregation scraper with deduplication
              </li>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Automated cover letter synthesis matching verified career milestones
              </li>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                &bull; Chrome extension for one-click job application data capture
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
