import React, { useState } from 'react';
import {
  FileText,
  Search,
  Briefcase,
  AlertCircle,
  Send,
  CheckCircle2,
  Sparkles,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface CareerStage {
  id: string;
  name: string;
  icon: React.ElementType;
  headline: string;
  subtext: string;
  badge: string;
  keyOutputs: string[];
}

const CAREER_STAGES: CareerStage[] = [
  {
    id: 'resume',
    name: 'Resume',
    icon: FileText,
    headline: 'Structured Document Ingestion',
    subtext: 'Parses PDF and DOCX files into raw semantic AST nodes, preserving layout semantics and chronological sequence.',
    badge: 'STAGE 01 // PARSE',
    keyOutputs: ['Multi-page layout preservation', 'Skill tokenization & normalization', 'Date & tenure calculation'],
  },
  {
    id: 'analysis',
    name: 'Analysis',
    icon: Search,
    headline: 'ATS Structure & Signal Validation',
    subtext: 'Audits formatting compliance against applicant tracking parser specifications to prevent scanner truncation or dropped sections.',
    badge: 'STAGE 02 // AUDIT',
    keyOutputs: ['ATS parse rate: 98.6%', 'Header & section classification', 'Zero cryptic formatting artifacts'],
  },
  {
    id: 'job-reqs',
    name: 'Job Reqs',
    icon: Briefcase,
    headline: 'Role Requirement Extraction',
    subtext: 'Ingests target role specifications, decomposing core operational responsibilities from boilerplate corporate clauses.',
    badge: 'STAGE 03 // DECOMPOSE',
    keyOutputs: ['Hard requirement vs nice-to-have weighting', 'Domain context classification', 'Seniority heuristic calibration'],
  },
  {
    id: 'skills-gap',
    name: 'Skills Gap',
    icon: AlertCircle,
    headline: 'Honest Semantic Gap Diagnostics',
    subtext: 'Calculates vector cosine similarity between candidate achievements and role requirements without generating misleading compatibility scores.',
    badge: 'STAGE 04 // EVALUATE',
    keyOutputs: ['Identifies actual qualification shortfalls', 'Suggests strategic framing adjustments', 'Zero hallucinated compatibility claims'],
  },
  {
    id: 'app-prep',
    name: 'Prep & Submit',
    icon: Send,
    headline: 'Application Preparation & Submission',
    subtext: 'Compiles targeted technical cover notes and verified profile packets, simplifying multi-stage recruitment workflows.',
    badge: 'STAGE 05 // DELIVER',
    keyOutputs: ['Targeted role alignment briefing', 'Tailored technical highlights', 'Automated submission tracking'],
  },
];

export const ApplyViseCareerFlow: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<CareerStage>(CAREER_STAGES[0]);

  return (
    <div
      className="card-base card-applywise"
      style={{
        padding: '32px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid rgba(167, 139, 250, 0.35)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div className="type-metadata" style={{ color: '#A78BFA', marginBottom: '4px' }}>
            APPLYVISE AI CAREER INTELLIGENCE ENGINE
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            End-to-End Application Intelligence Flow
          </h3>
        </div>

        <div className="pill-status" style={{ background: 'rgba(167, 139, 250, 0.08)' }}>
          <span className="pill-dot pill-dot-violet"></span>
          <span style={{ color: '#A78BFA' }}>GROUNDED REASONING ACTIVE</span>
        </div>
      </div>

      {/* Interactive Horizontal Pipeline */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          marginBottom: '28px',
        }}
      >
        {CAREER_STAGES.map((stg, idx) => {
          const Icon = stg.icon;
          const isSelected = selectedStage.id === stg.id;
          return (
            <button
              key={stg.id}
              onClick={() => setSelectedStage(stg)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '16px 8px',
                borderRadius: 'var(--radius-sm)',
                background: isSelected ? 'rgba(167, 139, 250, 0.16)' : 'var(--bg-elevated)',
                border: `1px solid ${isSelected ? '#A78BFA' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isSelected ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? '#A78BFA' : 'var(--text-secondary)',
                  marginBottom: '10px',
                }}
              >
                <Icon size={18} />
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                {stg.name}
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: isSelected ? '#A78BFA' : 'var(--text-muted)',
                }}
              >
                STAGE 0{idx + 1}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Box */}
      <div
        style={{
          background: 'var(--bg-elevated)',
          padding: '24px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}
      >
        <div>
          <div className="type-metadata" style={{ color: '#A78BFA', marginBottom: '6px' }}>
            {selectedStage.badge}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '10px',
            }}
          >
            {selectedStage.headline}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {selectedStage.subtext}
          </p>
        </div>

        <div>
          <div className="type-metadata" style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
            KEY REASONING OUTPUTS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedStage.keyOutputs.map((out, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-section)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <CheckCircle2 size={14} color="#A78BFA" />
                <span>{out}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
