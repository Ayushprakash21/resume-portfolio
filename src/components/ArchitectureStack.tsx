import React from 'react';
import { Cpu, Terminal, Database, Cloud, Shield, GitBranch, Layers } from 'lucide-react';

export const ArchitectureStack: React.FC = () => {
  const stackCategories = [
    {
      category: 'AI & Machine Intelligence',
      icon: Cpu,
      accent: 'var(--accent-primary)',
      items: [
        'Google Gemini 2.0 / Flash / Pro APIs',
        'Semantic Vector Embeddings & Cosine Search',
        'ATS Parsing & Resume Optimization Engines',
        'Deterministic Fallback & Grounding Guardrails',
        'Multi-agent Tool Orchestration',
      ],
    },
    {
      category: 'Distributed Edge & Serverless',
      icon: Cloud,
      accent: 'var(--accent-secondary)',
      items: [
        'Cloudflare Workers (Edge V8 Isolates)',
        'Cloudflare D1 (Distributed SQLite)',
        'Cloudflare R2 Object Storage',
        'Zero-Trust Networking & Mutual TLS',
        'Sub-50ms Global Edge Routing',
      ],
    },
    {
      category: 'Frontend & Reactive Systems',
      icon: Layers,
      accent: '#C084FC',
      items: [
        'React 19 & TypeScript 5.7+',
        'Vite 6 Build Architecture & Bundler Pipelines',
        'High-Performance Canvas / Three.js Shaders',
        'Strict Tokenized Design Systems & CSS Variables',
        'Responsive Mobile-First Interfaces & Micro-Interactions',
      ],
    },
    {
      category: 'Backend, Database & Security',
      icon: Database,
      accent: 'var(--accent-success)',
      items: [
        'Node.js & Express Architecture',
        'Relational Schema Design & D1 Migrations',
        'JWT, Cookie-Parser, & Cryptographic Nonces',
        'Automated Integration & Unit Testing Harnesses',
        'Zero-Packet Drop Queuing & Telemetry Streaming',
      ],
    },
  ];

  return (
    <section id="architecture" className="section-wrapper" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '840px', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div className="pill-status">
              <span className="pill-dot pill-dot-cyan"></span>
              <span style={{ color: 'var(--text-secondary)' }}>TECHNICAL ARSENAL // INFRASTRUCTURE</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              SYSTEM ARCHITECTURE SPECIFICATION
            </span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '16px' }}>
            Core Architecture & Capabilities
          </h2>

          <p className="type-body" style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            A disciplined engineering philosophy prioritizing minimal latency, resilient failovers,
            strict type-safety, and grounded intelligence over superficial complexity.
          </p>
        </div>

        {/* Stack Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {stackCategories.map((group) => {
            const IconComp = group.icon;
            return (
              <div
                key={group.category}
                className="card-base"
                style={{
                  padding: '28px',
                  backgroundColor: 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: group.accent,
                    }}
                  >
                    <IconComp size={18} />
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {group.category}
                  </h3>
                </div>

                <ul
                  style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {group.items.map((item, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: group.accent,
                          marginTop: '2px',
                        }}
                      >
                        ❯
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
