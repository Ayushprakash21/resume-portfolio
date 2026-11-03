import React from 'react';
import {
  Sparkles,
  ArrowUpRight,
  Github,
  CheckCircle2,
  Activity,
  Clock,
  Cpu,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import { ProjectRecord } from '../../types/cms';
import { ApplyViseCareerFlow } from '../interactive/ApplyViseCareerFlow';

interface EditorialApplyViseProps {
  project?: ProjectRecord;
}

export const EditorialApplyVise: React.FC<EditorialApplyViseProps> = ({ project }) => {
  return (
    <section
      id="applywise"
      style={{
        padding: '120px 0',
        backgroundColor: '#0C1118',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#A78BFA', letterSpacing: '0.1em' }}>
            05 // FLAGSHIP PROJECT 02
          </span>
          <span style={{ height: '1px', width: '40px', backgroundColor: '#A78BFA', opacity: 0.4 }} />
        </div>

        {/* Project Header */}
        <div style={{ maxWidth: '920px', marginBottom: '56px' }}>
          <h2
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(2.6rem, 5.5vw, 4.4rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              marginBottom: '16px',
            }}
          >
            ApplyVise AI
          </h2>

          <div
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '24px',
              fontWeight: 500,
              color: '#A78BFA',
              marginBottom: '20px',
            }}
          >
            AI-Powered Career Intelligence Platform
          </div>

          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              lineHeight: 1.7,
              color: '#A7B2C0',
            }}
          >
            An independent product development initiative designed to transform career evaluation and job applications. Unlike tools that inflate compatibility claims, ApplyVise AI applies grounded semantic reasoning to diagnose genuine skill gaps, optimize ATS parsing fidelity, and simplify application workflows.
          </p>
        </div>

        {/* Visual Brand & Architectural Banner */}
        <div
          style={{
            borderRadius: '12px',
            backgroundColor: '#111923',
            border: '1px solid rgba(167, 139, 250, 0.25)',
            padding: '40px',
            marginBottom: '64px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
          }}
        >
          <div style={{ maxWidth: '580px' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#A78BFA', marginBottom: '8px' }}>
              NON-HALLUCINATORY EVALUATION
            </div>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', color: '#FFFFFF', marginBottom: '12px' }}>
              Eliminating False Compatibility Claims
            </h3>
            <p style={{ fontSize: '15px', color: '#A7B2C0', lineHeight: 1.65 }}>
              Generic recruitment tools flatter candidates with automated 99% match scores by mechanically counting keyword matches. ApplyVise AI parses accomplishments as structured AST nodes and performs vector cosine analysis against hard role requirements to diagnose actionable skill gaps.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <img
              src="/images/applyvise/applyvise-logo.png"
              alt="ApplyVise AI Brand"
              style={{
                width: '180px',
                height: 'auto',
                borderRadius: '8px',
                border: '1px solid rgba(167, 139, 250, 0.3)',
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>
        </div>

        {/* Interactive Career Intelligence Flow Component */}
        <div style={{ marginBottom: '64px' }}>
          <ApplyViseCareerFlow />
        </div>

        {/* Clear Functional Status Breakdown */}
        <div style={{ marginBottom: '56px' }}>
          <h3
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '22px',
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: '24px',
            }}
          >
            Product Development Status
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Working */}
            <div
              style={{
                backgroundColor: '#151E29',
                padding: '28px',
                borderRadius: '8px',
                borderTop: '3px solid #A78BFA',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <CheckCircle2 size={16} color="#A78BFA" />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#A78BFA' }}>
                  WORKING FUNCTIONALITY
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#A7B2C0' }}>
                <li>✓ Multi-page PDF/DOCX structural AST parser</li>
                <li>✓ Semantic vector embedding comparison engine</li>
                <li>✓ ATS formatting audit and scanner compliance check</li>
                <li>✓ Edge-deployed API infrastructure (Cloudflare D1 SQL)</li>
              </ul>
            </div>

            {/* In Development */}
            <div
              style={{
                backgroundColor: '#151E29',
                padding: '28px',
                borderRadius: '8px',
                borderTop: '3px solid #8AB4FF',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Activity size={16} color="#8AB4FF" />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#8AB4FF' }}>
                  IN DEVELOPMENT
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#A7B2C0' }}>
                <li>● Multi-channel job board ingestion and deduplication</li>
                <li>● Candidate chronological milestone timeline viewer</li>
                <li>● Dynamic cover note generation guardrails</li>
              </ul>
            </div>

            {/* Planned */}
            <div
              style={{
                backgroundColor: '#151E29',
                padding: '28px',
                borderRadius: '8px',
                borderTop: '3px solid #738195',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Clock size={16} color="#738195" />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#738195' }}>
                  PLANNED CAPABILITIES
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#738195' }}>
                <li>○ Direct recruiter-candidate encrypted dispatch channel</li>
                <li>○ Historical career compensation percentile model</li>
                <li>○ Automated status webhook notification gateway</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Project Links Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '24px 32px',
            backgroundColor: '#111923',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ fontSize: '14px', color: '#A7B2C0' }}>
            Explore the codebase and Cloudflare Workers implementation on GitHub.
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <a
              href={project?.repositoryUrl || 'https://github.com/Ayushprakash21/applywise-ai'}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '8px 18px' }}
            >
              <Github size={14} />
              <span>ApplyVise AI Repository</span>
            </a>

            {project?.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ fontSize: '13px', padding: '8px 18px', color: '#A78BFA', borderColor: 'rgba(167, 139, 250, 0.4)' }}
              >
                <span>Launch Web Client</span>
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
