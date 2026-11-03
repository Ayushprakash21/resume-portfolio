import React from 'react';
import { Sparkles, Github, ArrowUpRight, Bot, ShieldCheck } from 'lucide-react';
import { ProjectRecord } from '../../types/cms';
import { ApplyViseCareerFlow } from '../interactive/ApplyViseCareerFlow';

interface ApplyViseSectionProps {
  project?: ProjectRecord;
}

export const ApplyViseSectionRedesigned: React.FC<ApplyViseSectionProps> = ({ project }) => {
  return (
    <section id="applywise" className="section-wrapper" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ maxWidth: '840px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div className="pill-status">
              <span className="pill-dot pill-dot-violet"></span>
              <span style={{ color: '#A78BFA' }}>INDEPENDENT PRODUCT DEVELOPMENT</span>
            </div>
            <span className="type-metadata" style={{ color: 'var(--text-muted)' }}>
              CAREER TECHNOLOGY
            </span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '14px' }}>
            ApplyVise AI
          </h2>

          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              fontWeight: 500,
              color: '#A78BFA',
              marginBottom: '16px',
            }}
          >
            AI-Powered Career Intelligence Platform
          </div>

          <p className="type-body" style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            Designed and developed as an independent product, ApplyVise AI helps candidates navigate complex recruitment markets with data-driven clarity. It replaces superficial keyword matching with grounded semantic analysis to uncover true skill gaps and optimize applications for modern ATS parsers.
          </p>
        </div>

        {/* Interactive Career Intelligence Visualization Requirement */}
        <div style={{ marginBottom: '40px' }}>
          <ApplyViseCareerFlow />
        </div>

        {/* Core Architectural Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          <div className="card-base card-applywise" style={{ padding: '24px' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', color: '#FFFFFF', marginBottom: '8px' }}>
              Semantic Vector Matching
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Calculates multidimensional similarity vectors comparing resume accomplishments directly with job requirements, avoiding keyword-stuffing penalties and identifying non-obvious transferable skills.
            </p>
          </div>

          <div className="card-base card-applywise" style={{ padding: '24px' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', color: '#FFFFFF', marginBottom: '8px' }}>
              Grounded, Non-Hallucinatory Scoring
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Unlike generic AI tools that flatter candidates with fictional 99% match scores, ApplyVise AI diagnoses concrete qualification gaps and provides actionable recommendations to bridge them.
            </p>
          </div>

          <div className="card-base card-applywise" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', color: '#FFFFFF', marginBottom: '8px' }}>
                Full-Stack Product Engineering
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Engineered with React 19, TypeScript, Cloudflare Workers, and D1 serverless SQL for global sub-50ms edge responsiveness.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <a
                href={project?.repositoryUrl || 'https://github.com/Ayushprakash21/applywise-ai'}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                <Github size={14} />
                <span>Repository</span>
              </a>

              {project?.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '8px 16px', borderColor: 'rgba(167, 139, 250, 0.4)', color: '#A78BFA' }}
                >
                  <span>Launch Preview</span>
                  <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
