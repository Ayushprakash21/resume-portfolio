import React from 'react';
import { Shield, Github, ArrowUpRight, Activity, Cpu } from 'lucide-react';
import { ProjectRecord } from '../../types/cms';
import { OrionSupplyChainFlow } from '../interactive/OrionSupplyChainFlow';

interface OrionSectionProps {
  project?: ProjectRecord;
}

export const OrionSectionRedesigned: React.FC<OrionSectionProps> = ({ project }) => {
  return (
    <section id="orion9" className="section-wrapper" style={{ backgroundColor: 'var(--bg-section)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ maxWidth: '840px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div className="pill-status">
              <span className="pill-dot pill-dot-green"></span>
              <span style={{ color: 'var(--accent-success)' }}>SUPPLY CHAIN OS // ORION-9</span>
            </div>
            <span className="type-metadata" style={{ color: 'var(--text-muted)' }}>
              SYSTEM SPECIFICATION
            </span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '14px' }}>
            Orion-9
          </h2>

          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              fontWeight: 500,
              color: 'var(--accent-success)',
              marginBottom: '16px',
            }}
          >
            AI-Powered Supply Chain Operating System
          </div>

          <p className="type-body" style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            Conceived and engineered to answer the foundational question:{' '}
            <em>"What if the supply chain had an operating system?"</em> Orion-9 addresses the severe fragmentation between supplier procurement, inventory warehousing, and multi-tier freight transit through edge streaming telemetry and cryptographic event verification.
          </p>
        </div>

        {/* Interactive Supply Chain Visualization Requirement */}
        <div style={{ marginBottom: '40px' }}>
          <OrionSupplyChainFlow />
        </div>

        {/* Technical Architecture Notes & Links */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          <div className="card-base" style={{ padding: '24px', backgroundColor: 'var(--bg-card)' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', color: '#FFFFFF', marginBottom: '8px' }}>
              Edge Telemetry Protocol
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Ingests raw sensor and shipment milestone events via low-overhead persistent buffers. Designed specifically to maintain data integrity across areas with intermittent cellular coverage.
            </p>
          </div>

          <div className="card-base" style={{ padding: '24px', backgroundColor: 'var(--bg-card)' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', color: '#FFFFFF', marginBottom: '8px' }}>
              Zero-Trust Verification
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Every bill of lading, temperature log, and custody handoff is cryptographically sealed with mutual TLS and signed payloads, eliminating dispute cycles between freight carriers and warehouses.
            </p>
          </div>

          <div className="card-base" style={{ padding: '24px', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', color: '#FFFFFF', marginBottom: '8px' }}>
                Open Engineering Logs
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Explore the open architectural notes, Android telemetry client packages, and data contract specifications on GitHub.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <a
                href={project?.repositoryUrl || 'https://github.com/Ayushprakash21/orion-9'}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                <Github size={14} />
                <span>View Repository</span>
              </a>

              {project?.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '8px 16px' }}
                >
                  <span>Architecture Docs</span>
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
