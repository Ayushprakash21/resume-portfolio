import React from 'react';
import { Cpu, Server, Database, Cloud, Lock, Code2, Terminal } from 'lucide-react';

export const ArchitectureSection: React.FC = () => {
  return (
    <section id="architecture" className="section-wrapper" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ maxWidth: '840px', marginBottom: '48px' }}>
          <div className="pill-status" style={{ marginBottom: '14px' }}>
            <span className="pill-dot pill-dot-cyan"></span>
            <span style={{ color: 'var(--accent-secondary)' }}>TECHNICAL EXPLORATION // DEEP DIVE</span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '16px' }}>
            Architecture & Technical Exploration
          </h2>

          <p className="type-body" style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            An engineering philosophy emphasizing low runtime latency, strict schema boundaries,
            and cryptographic guarantees across edge and serverless environments.
          </p>
        </div>

        {/* 2-Column Asymmetric Deep Dive Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '32px',
          }}
        >
          {/* Architecture 1: Edge & Serverless Persistence */}
          <div
            className="card-base"
            style={{
              padding: '32px',
              backgroundColor: 'var(--bg-card)',
              borderTop: '3px solid var(--accent-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(69, 214, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                }}
              >
                <Cloud size={20} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#FFFFFF' }}>
                Edge Isolation & D1 SQLite
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '20px' }}>
              Traditional cloud architectures suffer from cold-start latency and geographic routing hops. By leveraging Cloudflare Workers running on V8 isolates paired with distributed SQLite (Cloudflare D1), API queries execute within &lt;50ms from any continent without standing container overhead.
            </p>

            <div
              style={{
                background: 'var(--bg-elevated)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ color: 'var(--accent-primary)', marginBottom: '4px' }}>// DATA ACCESS TOPOLOGY</div>
              <div>CLIENT ➔ EDGE WORKER (V8) ➔ D1 READ REPLICA ➔ SUB-50MS RESPONSE</div>
            </div>
          </div>

          {/* Architecture 2: Grounded LLM Orchestration */}
          <div
            className="card-base"
            style={{
              padding: '32px',
              backgroundColor: 'var(--bg-card)',
              borderTop: '3px solid #A78BFA',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(167, 139, 250, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A78BFA',
                }}
              >
                <Cpu size={20} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#FFFFFF' }}>
                Grounded LLM & RAG Pipelines
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '20px' }}>
              Generative models are prone to hallucinating qualifications or non-existent career compatibilities. Our integration layer with Google Gemini API imposes strict schema-enforced JSON outputs and vector cosine thresholds, ensuring all suggestions are grounded in verifiable accomplishments.
            </p>

            <div
              style={{
                background: 'var(--bg-elevated)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ color: '#A78BFA', marginBottom: '4px' }}>// INFERENCE SAFETY PIPELINE</div>
              <div>INPUT AST ➔ VECTOR EMBEDDINGS ➔ COSINE DISTANCE ➔ VALIDATED ADVISORY</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
