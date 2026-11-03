import React from 'react';
import { ArrowRight, Terminal, Layers, Sparkles, Shield, Cpu, Activity } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section
      id="overview"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '130px',
        paddingBottom: '80px',
        overflow: 'hidden',
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '960px' }}>
          {/* System Indicator pill */}
          <div style={{ marginBottom: '24px' }}>
            <div className="pill-status">
              <span className="pill-dot pill-dot-cyan"></span>
              <span style={{ color: 'var(--text-secondary)' }}>
                SYSTEM MATRIX // AYUSH PRAKASH
              </span>
              <span style={{ color: 'var(--border-hover)', margin: '0 4px' }}>|</span>
              <span style={{ color: 'var(--accent-primary)' }}>AI & SYSTEMS ARCHITECT</span>
            </div>
          </div>

          {/* Hero Typography — Space Grotesk clamp(3.5rem, 8vw, 6.5rem) */}
          <h1 className="type-hero" style={{ marginBottom: '28px' }}>
            ENGINEERING <br />
            <span
              style={{
                color: 'var(--text-primary)',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #A7B2C0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              INTELLIGENT SYSTEMS
            </span>{' '}
            <br />
            <span
              style={{
                color: 'var(--accent-primary)',
                textShadow: '0 0 40px rgba(69, 214, 255, 0.25)',
              }}
            >
              & AUTONOMOUS APPS.
            </span>
          </h1>

          {/* Body description in Inter 16px–18px */}
          <p
            className="type-body"
            style={{
              maxWidth: '720px',
              fontSize: '18px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '36px',
            }}
          >
            Founder and product architect designing enterprise-grade AI software, autonomous career
            intelligence platforms, and edge-native distributed systems. Builder behind{' '}
            <strong style={{ color: '#C084FC' }}>ApplyVise AI</strong> and the{' '}
            <strong style={{ color: 'var(--accent-success)' }}>Orion-9</strong> Supply Chain OS.
          </p>

          {/* Hero CTAs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center',
              marginBottom: '60px',
            }}
          >
            <a href="#applywise" className="btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
              <span>Explore ApplyVise AI</span>
              <ArrowRight size={16} />
            </a>

            <a href="#orion9" className="btn-secondary" style={{ padding: '12px 26px', fontSize: '15px' }}>
              <span>View Orion-9 Architecture</span>
            </a>

            <a
              href="#architecture"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '8px',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Terminal size={14} />
              <span>STACK_SPEC.v2</span>
            </a>
          </div>

          {/* Metrics & Architecture Telemetry Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '32px',
            }}
          >
            <div className="card-base" style={{ padding: '18px 20px', backgroundColor: 'rgba(21, 30, 41, 0.4)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={12} color="#8B5CF6" />
                <span>Primary SaaS Focus</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                ApplyVise AI
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Career Intelligence Engine
              </div>
            </div>

            <div className="card-base" style={{ padding: '18px 20px', backgroundColor: 'rgba(21, 30, 41, 0.4)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Shield size={12} color="var(--accent-success)" />
                <span>Enterprise Platform</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                Orion-9 OS
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Supply Chain Telemetry
              </div>
            </div>

            <div className="card-base" style={{ padding: '18px 20px', backgroundColor: 'rgba(21, 30, 41, 0.4)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Cpu size={12} color="var(--accent-primary)" />
                <span>Core Paradigm</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                Edge & AI Native
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Low-Latency Distributed Infra
              </div>
            </div>

            <div className="card-base" style={{ padding: '18px 20px', backgroundColor: 'rgba(21, 30, 41, 0.4)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Activity size={12} color="var(--accent-secondary)" />
                <span>Runtime State</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--accent-primary)',
                }}
              >
                Production Ready
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Zero-Trust Security & SLAs
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
