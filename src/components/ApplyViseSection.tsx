import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  FileSearch,
  Target,
  Layers,
  Database,
  ArrowRight,
  CheckCircle2,
  Workflow,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Layout,
  ExternalLink,
} from 'lucide-react';

export const ApplyViseSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'features' | 'architecture' | 'simulation'>('features');

  // Interactive ATS & Match Simulation state for dynamic user engagement
  const [targetJobRole, setTargetJobRole] = useState<'Staff AI Engineer' | 'Lead Systems Architect' | 'Principal Full-Stack'>('Staff AI Engineer');

  const simulationData = {
    'Staff AI Engineer': {
      matchScore: '96.4%',
      atsReadiness: 'Optimal (98/100)',
      gapIdentified: 'None critical — Suggested: Highlight Distributed Fine-Tuning',
      fitCategory: 'High Direct Fit',
      primarySignals: ['LLM Orchestration', 'Vector Embeddings', 'Cloudflare Workers/D1', 'Latency Profiling'],
    },
    'Lead Systems Architect': {
      matchScore: '94.2%',
      atsReadiness: 'Strong (95/100)',
      gapIdentified: 'Minor: Expand on Multi-Region Failover Architecture',
      fitCategory: 'Enterprise Architecture Fit',
      primarySignals: ['Zero-Trust Security', 'Edge Streaming', 'Database Partitioning', 'High Availability'],
    },
    'Principal Full-Stack': {
      matchScore: '98.0%',
      atsReadiness: 'Optimal (99/100)',
      gapIdentified: 'Optimal match across all required frontend & backend competencies',
      fitCategory: 'Flawless Technical Alignment',
      primarySignals: ['React 19 / TypeScript', 'Serverless APIs', 'Real-time UX', 'State Machine Engines'],
    },
  };

  const currentSim = simulationData[targetJobRole];

  const features = [
    {
      id: 'job-matching',
      title: 'AI-Powered Job Matching',
      icon: Target,
      tag: 'SEMANTIC REASONING',
      description:
        'Intelligent job-to-candidate matching based on deep skill semantics, verified experience, qualifications, and holistic career objectives.',
    },
    {
      id: 'resume-intel',
      title: 'Resume Intelligence & ATS',
      icon: FileSearch,
      tag: 'PARSER & SCORING',
      description:
        'AI-assisted resume analysis, rigorous ATS structure optimization, and surgical identification of qualification gaps before submission.',
    },
    {
      id: 'career-fit',
      title: 'Career Fit Analysis',
      icon: ShieldCheck,
      tag: 'HONEST EVALUATION',
      description:
        'Evaluates candidate suitability against stringent role requirements without generating hallucinated or misleading compatibility scores.',
    },
    {
      id: 'discovery',
      title: 'Intelligent Job Discovery',
      icon: Sparkles,
      tag: 'AGGREGATION ARCH',
      description:
        'Custom discovery and multi-channel aggregation architecture engineered to streamline high-signal tech job sourcing.',
    },
    {
      id: 'application-intel',
      title: 'Application Intelligence',
      icon: Workflow,
      tag: 'WORKFLOW AUTOMATION',
      description:
        'Simplifies multi-stage application workflows and guides candidates through preparing targeted, high-impact submissions.',
    },
    {
      id: 'full-stack',
      title: 'Full-Stack Development',
      icon: Database,
      tag: 'END-TO-END TECH',
      description:
        'Crafted from the ground up across high-performance client layers, serverless API backends, relational D1 database schema, and LLM integrations.',
    },
    {
      id: 'premium-ux',
      title: 'Enterprise-Grade UX',
      icon: Layout,
      tag: 'USABILITY & DESIGN',
      description:
        'Clean, accessible, data-rich interface focused on low cognitive load, actionable intelligence, and seamless navigation.',
    },
  ];

  return (
    <section id="applywise" className="section-wrapper" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '840px', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div className="pill-status">
              <span className="pill-dot pill-dot-violet"></span>
              <span style={{ color: '#C084FC' }}>FLAGSHIP PRODUCT // INDEPENDENT VENTURE</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              PROJECT TYPE: AI, SAAS, CAREER TECHNOLOGY
            </span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '16px' }}>
            ApplyVise AI
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              marginBottom: '16px',
            }}
          >
            AI-Powered Career Intelligence & Job Application Platform
          </p>

          <p className="type-body" style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            Designed and developed <strong>ApplyVise AI</strong> as an independent product developer,
            aimed at transforming how professionals discover, evaluate, and apply for high-impact roles.
            The platform focuses on making career progression more intelligent, personalized, transparent,
            and efficient through grounded artificial intelligence.
          </p>
        </div>

        {/* Project Meta Bar */}
        <div
          className="card-base card-applywise"
          style={{
            padding: '24px 28px',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
          }}
        >
          <div>
            <div className="type-metadata" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
              ROLE & OWNERSHIP
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Founder & Independent Developer
            </div>
          </div>

          <div>
            <div className="type-metadata" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
              CORE PARADIGM
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Non-Hallucinatory Career Intelligence
            </div>
          </div>

          <div>
            <div className="type-metadata" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
              INTELLIGENCE ENGINE
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#C084FC' }}>
              Gemini & Semantic Vector Embeddings
            </div>
          </div>

          <div>
            <div className="type-metadata" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
              INFRASTRUCTURE
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Cloudflare Edge, D1 SQL, R2
            </div>
          </div>
        </div>

        {/* Interactive Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '16px',
            marginBottom: '36px',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('features')}
            style={{
              background: activeTab === 'features' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: activeTab === 'features' ? '#C084FC' : 'var(--text-secondary)',
              border: `1px solid ${activeTab === 'features' ? 'rgba(139, 92, 246, 0.4)' : 'transparent'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '8px 18px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Bot size={15} />
            <span>Key Features & Capabilities</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            style={{
              background: activeTab === 'simulation' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: activeTab === 'simulation' ? '#C084FC' : 'var(--text-secondary)',
              border: `1px solid ${activeTab === 'simulation' ? 'rgba(139, 92, 246, 0.4)' : 'transparent'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '8px 18px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Sparkles size={15} />
            <span>Live Intelligence Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            style={{
              background: activeTab === 'architecture' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: activeTab === 'architecture' ? '#C084FC' : 'var(--text-secondary)',
              border: `1px solid ${activeTab === 'architecture' ? 'rgba(139, 92, 246, 0.4)' : 'transparent'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '8px 18px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Layers size={15} />
            <span>System Pipeline & Architecture</span>
          </button>
        </div>

        {/* Tab 1: Features Grid */}
        {activeTab === 'features' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {features.map((feat) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="card-base card-applywise"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(139, 92, 246, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#C084FC',
                          border: '1px solid rgba(139, 92, 246, 0.25)',
                        }}
                      >
                        <IconComp size={18} />
                      </div>
                      <span className="type-metadata" style={{ color: 'var(--text-muted)' }}>
                        {feat.tag}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '10px',
                      }}
                    >
                      {feat.title}
                    </h3>

                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                      }}
                    >
                      {feat.description}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: '20px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    <CheckCircle2 size={13} color="#45D6FF" />
                    <span>PRODUCTION IMPLEMENTED</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Simulation Demo */}
        {activeTab === 'simulation' && (
          <div
            className="card-base"
            style={{
              padding: '32px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <div className="type-metadata" style={{ color: '#C084FC', marginBottom: '8px' }}>
                INTERACTIVE DEMO // SIMULATE APPLYVISE AI REASONING
              </div>
              <h3 className="type-subheading" style={{ marginBottom: '8px' }}>
                Career Fit & ATS Evaluation Engine
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                Select a target job architecture to observe how ApplyVise AI calculates semantic alignment without deceptive score inflation:
              </p>
            </div>

            {/* Role Selectors */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
              {(['Staff AI Engineer', 'Lead Systems Architect', 'Principal Full-Stack'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setTargetJobRole(role)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    background: targetJobRole === role ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-elevated)',
                    color: targetJobRole === role ? '#FFFFFF' : 'var(--text-secondary)',
                    border: `1px solid ${targetJobRole === role ? 'rgba(139, 92, 246, 0.5)' : 'var(--border-subtle)'}`,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-section)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="type-metadata" style={{ color: 'var(--text-muted)' }}>
                  SEMANTIC FIT SCORE
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '26px',
                    fontWeight: 700,
                    color: '#C084FC',
                    marginTop: '4px',
                  }}
                >
                  {currentSim.matchScore}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-section)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="type-metadata" style={{ color: 'var(--text-muted)' }}>
                  ATS READINESS
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                    marginTop: '8px',
                  }}
                >
                  {currentSim.atsReadiness}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-section)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="type-metadata" style={{ color: 'var(--text-muted)' }}>
                  FIT CATEGORY
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--accent-success)',
                    marginTop: '8px',
                  }}
                >
                  {currentSim.fitCategory}
                </div>
              </div>
            </div>

            {/* Skill signals & gap analysis */}
            <div
              style={{
                background: 'var(--bg-elevated)',
                padding: '20px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <span className="type-metadata" style={{ color: 'var(--accent-warning)', marginRight: '8px' }}>
                  SKILL GAP & HONEST ADVISORY:
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                  {currentSim.gapIdentified}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                <span className="type-metadata" style={{ color: 'var(--text-muted)', marginRight: '6px' }}>
                  VERIFIED SIGNALS:
                </span>
                {currentSim.primarySignals.map((signal) => (
                  <span
                    key={signal}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'rgba(69, 214, 255, 0.08)',
                      border: '1px solid rgba(69, 214, 255, 0.25)',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: System Pipeline */}
        {activeTab === 'architecture' && (
          <div
            className="card-base"
            style={{
              padding: '32px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h3 className="type-subheading" style={{ marginBottom: '16px' }}>
              ApplyVise AI Architectural Blueprint
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '720px' }}>
              A serverless, distributed topology designed for millisecond resume ingestion, semantic embedding calculation, and zero cold-start delivery via global edge nodes.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  padding: '20px',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid #8B5CF6',
                }}
              >
                <div className="type-metadata" style={{ color: '#C084FC', marginBottom: '8px' }}>
                  STEP 01 // PARSE & EMBED
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Multimodal Ingestion
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Extracts raw text, semantic nodes, and career chronological milestones from PDF / DOCX with zero layout disruption.
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  padding: '20px',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--accent-primary)',
                }}
              >
                <div className="type-metadata" style={{ color: 'var(--accent-primary)', marginBottom: '8px' }}>
                  STEP 02 // VECTOR MATCHING
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Semantic Cosine Engine
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Compares role requirements with candidate trajectory using vector embeddings without keyword stuffing vulnerabilities.
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  padding: '20px',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--accent-success)',
                }}
              >
                <div className="type-metadata" style={{ color: 'var(--accent-success)', marginBottom: '8px' }}>
                  STEP 03 // DISCOVERY & D1
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Edge Persistence
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Cloudflare Workers and D1 database store candidates, application timelines, and real-time alerts with global replication.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vision Statement Callout */}
        <div
          style={{
            marginTop: '36px',
            padding: '24px 28px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(12, 17, 24, 0.95) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div className="type-metadata" style={{ color: '#C084FC' }}>
            FOUNDER VISION
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '18px',
              fontStyle: 'italic',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
            }}
          >
            "Build a next-generation AI career platform that helps people make better career decisions and approach job applications with confidence, clarity, and data-driven insights."
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
            — Ayush Prakash, Founder & Independent Product Developer
          </div>
        </div>
      </div>
    </section>
  );
};
