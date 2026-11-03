import React from 'react';
import {
  Shield,
  Activity,
  Layers,
  Cpu,
  Lock,
  Server,
  Zap,
  Globe,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const OrionSection: React.FC = () => {
  return (
    <section id="orion9" className="section-wrapper" style={{ backgroundColor: 'var(--bg-section)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '840px', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div className="pill-status">
              <span className="pill-dot pill-dot-green"></span>
              <span style={{ color: 'var(--accent-success)' }}>SYSTEM OS // ORION-9 INITIATIVE</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              PROJECT TYPE: DISTRIBUTED OS & SUPPLY CHAIN TELEMETRY
            </span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '16px' }}>
            Orion-9
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
            The New Standard in Supply Chain Operating Systems
          </p>

          <p className="type-body" style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            Conceived and engineered <strong>Orion-9</strong> to answer a foundational question:{' '}
            <em>"What if the supply chain had an operating system?"</em> A resilient, zero-trust
            distributed infrastructure combining edge streaming telemetry, real-time control towers,
            and cryptographic provenance across complex global operations.
          </p>
        </div>

        {/* Highlight Architecture Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          <div className="card-base card-orion" style={{ padding: '28px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(66, 214, 164, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-success)',
                marginBottom: '20px',
                border: '1px solid rgba(66, 214, 164, 0.3)',
              }}
            >
              <Activity size={20} />
            </div>

            <div className="type-metadata" style={{ color: 'var(--accent-success)', marginBottom: '8px' }}>
              PILLAR 01 // TELEMETRY
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '10px',
              }}
            >
              Edge Streaming Telemetry
            </h3>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Low-overhead background telemetry ingestion across edge IoT and mobile nodes with optimized battery profiles and zero-packet drop queuing.
            </p>
          </div>

          <div className="card-base card-orion" style={{ padding: '28px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(66, 214, 164, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-success)',
                marginBottom: '20px',
                border: '1px solid rgba(66, 214, 164, 0.3)',
              }}
            >
              <Lock size={20} />
            </div>

            <div className="type-metadata" style={{ color: 'var(--accent-success)', marginBottom: '8px' }}>
              PILLAR 02 // ZERO TRUST
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '10px',
              }}
            >
              Mutual TLS & Cryptographic Proof
            </h3>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Strict cryptographic verification for every event, payload, and command packet, ensuring tampering cannot propagate through logistics pipelines.
            </p>
          </div>

          <div className="card-base card-orion" style={{ padding: '28px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(66, 214, 164, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-success)',
                marginBottom: '20px',
                border: '1px solid rgba(66, 214, 164, 0.3)',
              }}
            >
              <Server size={20} />
            </div>

            <div className="type-metadata" style={{ color: 'var(--accent-success)', marginBottom: '8px' }}>
              PILLAR 03 // VISIBILITY
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '10px',
              }}
            >
              Control Tower & Command Engine
            </h3>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Centralized operational dashboard providing sub-second global visibility, incident auto-triaging, and supply route contingency execution.
            </p>
          </div>
        </div>

        {/* Architectural Specs Summary */}
        <div
          className="card-base"
          style={{
            padding: '24px 28px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(66, 214, 164, 0.1)',
                border: '1px solid rgba(66, 214, 164, 0.3)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--accent-success)',
              }}
            >
              STATUS: ARCHITECTED & DEPLOYED
            </div>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Universal Android & Cloud Native Deployments (ARM64, ARMv7, x86_64)
            </span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            REPOSITORY: <span style={{ color: 'var(--text-primary)' }}>Ayushprakash21/orion-9</span>
          </div>
        </div>
      </div>
    </section>
  );
};
