import React, { useState } from 'react';
import {
  ShieldCheck,
  Activity,
  Layers,
  ArrowUpRight,
  Github,
  CheckCircle2,
  Clock,
  Compass,
  Maximize2,
} from 'lucide-react';
import { ProjectRecord } from '../../types/cms';
import { OrionSupplyChainFlow } from '../interactive/OrionSupplyChainFlow';

interface EditorialOrion9Props {
  project?: ProjectRecord;
}

export const EditorialOrion9: React.FC<EditorialOrion9Props> = ({ project }) => {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string>(
    project?.screenshots?.[0] || '/images/orion9/admin-page.png'
  );

  return (
    <section
      id="orion9"
      style={{
        padding: '120px 0',
        backgroundColor: '#07090D',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#42D6A4', letterSpacing: '0.1em' }}>
            04 // FLAGSHIP PROJECT 01
          </span>
          <span style={{ height: '1px', width: '40px', backgroundColor: '#42D6A4', opacity: 0.4 }} />
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
            Orion-9
          </h2>

          <div
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '24px',
              fontWeight: 500,
              color: '#42D6A4',
              marginBottom: '20px',
            }}
          >
            AI-Powered Supply Chain Operating System
          </div>

          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              lineHeight: 1.7,
              color: '#A7B2C0',
            }}
          >
            Conceived and engineered to answer the foundational question:{' '}
            <em>"What if the supply chain had an operating system?"</em> Orion-9 addresses the fragmentation between supplier procurement, inventory warehousing, and multi-tier freight transit through edge streaming telemetry and cryptographic event verification.
          </p>
        </div>

        {/* Actual Project Screenshots Showcase */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#738195', marginBottom: '16px' }}>
            ACTUAL APPLICATION SCREENSHOTS & CONTROL TOWER INTERFACES:
          </div>

          <div
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: '#111923',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
              marginBottom: '16px',
            }}
          >
            <img
              src={selectedScreenshot}
              alt="Orion-9 Interface Screenshot"
              style={{
                width: '100%',
                maxHeight: '580px',
                objectFit: 'contain',
                backgroundColor: '#07090D',
                display: 'block',
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>

          {/* Screenshot Thumbnail Switcher */}
          {project?.screenshots && project.screenshots.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {project.screenshots.map((shot, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => setSelectedScreenshot(shot)}
                  style={{
                    width: '120px',
                    height: '70px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: `2px solid ${selectedScreenshot === shot ? '#42D6A4' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    padding: 0,
                    backgroundColor: '#151E29',
                    flexShrink: 0,
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <img src={shot} alt={`Thumbnail ${sIdx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Supply Chain Flow Component */}
        <div style={{ marginBottom: '64px' }}>
          <OrionSupplyChainFlow />
        </div>

        {/* Clear Capability Lifecycle Matrix: Completed, In-Development, Planned */}
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
            Capabilities Lifecycle Status
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Completed */}
            <div
              style={{
                backgroundColor: '#111923',
                padding: '28px',
                borderRadius: '8px',
                borderTop: '3px solid #42D6A4',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <CheckCircle2 size={16} color="#42D6A4" />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#42D6A4' }}>
                  COMPLETED & VERIFIED
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#A7B2C0' }}>
                <li>✓ Edge telemetry streaming client specification</li>
                <li>✓ Zero-trust mutual TLS payload signing</li>
                <li>✓ Centralized operational control tower console</li>
                <li>✓ Universal Android client packaging</li>
              </ul>
            </div>

            {/* In Development */}
            <div
              style={{
                backgroundColor: '#111923',
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
                  IN ACTIVE DEVELOPMENT
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#A7B2C0' }}>
                <li>● Multi-region event replication over Cloudflare D1</li>
                <li>● Automated carrier discrepancy resolution engine</li>
                <li>● Real-time temperature & cold-chain sensor ingestion</li>
              </ul>
            </div>

            {/* Planned */}
            <div
              style={{
                backgroundColor: '#111923',
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
                <li>○ Automated customs paperwork clearing pipeline</li>
                <li>○ Multi-modal freight carbon footprint accounting</li>
                <li>○ Autonomous ERP webhook bridge</li>
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
            Open-source architecture specifications and telemetry benchmarks are hosted publicly.
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <a
              href={project?.repositoryUrl || 'https://github.com/Ayushprakash21/orion-9'}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '8px 18px' }}
            >
              <Github size={14} />
              <span>Orion-9 Repository</span>
            </a>

            {project?.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ fontSize: '13px', padding: '8px 18px', color: '#42D6A4', borderColor: 'rgba(66, 214, 164, 0.4)' }}
              >
                <span>Live Control Tower</span>
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
