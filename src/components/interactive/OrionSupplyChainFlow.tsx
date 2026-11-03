import React, { useState } from 'react';
import {
  Factory,
  FileCheck,
  Boxes,
  Building2,
  Truck,
  CheckCircle2,
  Activity,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  icon: React.ElementType;
  status: string;
  telemetryMetric: string;
  details: string;
  securityHash: string;
}

const STAGES: Stage[] = [
  {
    id: 'supplier',
    name: 'Supplier',
    icon: Factory,
    status: 'Verified Contract SLA',
    telemetryMetric: '14 Active Raw Suppliers',
    details: 'Initial raw component manifests cryptographically signed at origin node.',
    securityHash: 'sha256-8a9f02c...',
  },
  {
    id: 'procurement',
    name: 'Procurement',
    icon: FileCheck,
    status: 'Zero-Discrepancy POs',
    telemetryMetric: '99.4% PO Matching',
    details: 'Automated 3-way matching between purchase order, packing manifest, and customs clearing.',
    securityHash: 'sha256-b3e198a...',
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: Boxes,
    status: 'Dynamic Safety Stock',
    telemetryMetric: '12,450 Tracked SKUs',
    details: 'Real-time telemetry reconciliation preventing phantom stock and stockout delays.',
    securityHash: 'sha256-4c78fe2...',
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    icon: Building2,
    status: 'Automated Bin Allocation',
    telemetryMetric: 'Sub-4min Pick Cycle',
    details: 'Micro-location sensors stream pallet movements over low-energy edge telemetry protocol.',
    securityHash: 'sha256-91d4aa1...',
  },
  {
    id: 'shipment',
    name: 'Shipment',
    icon: Truck,
    status: 'Cold-Chain & Route Telemetry',
    telemetryMetric: '28 Transit Fleets Live',
    details: 'Battery-optimized edge tracking client reporting location, velocity, and cold-chain compliance.',
    securityHash: 'sha256-0ea3419...',
  },
  {
    id: 'customer',
    name: 'Customer',
    icon: CheckCircle2,
    status: 'Proof-of-Delivery Cryptographic Sign',
    telemetryMetric: 'Zero Tampering Incidents',
    details: 'Final milestone handoff sealed with mutual TLS verification and customer digital receipt.',
    securityHash: 'sha256-fa9921b...',
  },
];

export const OrionSupplyChainFlow: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<Stage>(STAGES[0]);
  const [simulationActive, setSimulationActive] = useState(true);

  return (
    <div
      className="card-base card-orion"
      style={{
        padding: '32px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid rgba(66, 214, 164, 0.3)',
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
          <div className="type-metadata" style={{ color: 'var(--accent-success)', marginBottom: '4px' }}>
            ORION-9 INTERACTIVE TELEMETRY PROTOCOL
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            End-to-End Supply Chain Telemetry Pipeline
          </h3>
        </div>

        <div className="pill-status" style={{ background: 'rgba(66, 214, 164, 0.08)' }}>
          <span className="pill-dot pill-dot-green"></span>
          <span style={{ color: 'var(--accent-success)' }}>EDGE INGESTION: OPERATIONAL</span>
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
        {STAGES.map((stg, idx) => {
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
                background: isSelected ? 'rgba(66, 214, 164, 0.16)' : 'var(--bg-elevated)',
                border: `1px solid ${isSelected ? 'var(--accent-success)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isSelected ? 'rgba(66, 214, 164, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? 'var(--accent-success)' : 'var(--text-secondary)',
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
                  color: isSelected ? 'var(--accent-success)' : 'var(--text-muted)',
                }}
              >
                STAGE 0{idx + 1}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Telemetry Readout */}
      <div
        style={{
          background: 'var(--bg-elevated)',
          padding: '24px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
        }}
      >
        <div>
          <div className="type-metadata" style={{ color: 'var(--accent-success)', marginBottom: '6px' }}>
            ACTIVE STAGE TELEMETRY ANALYSIS
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
            {selectedStage.name} Telemetry Node
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
            {selectedStage.details}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--accent-success)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              VERIFIED RECORD: <span style={{ color: 'var(--text-primary)' }}>{selectedStage.securityHash}</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              background: 'var(--bg-section)',
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="type-metadata" style={{ color: 'var(--text-muted)' }}>
              NODE HEALTH & STATUS
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-success)', marginTop: '4px' }}>
              {selectedStage.status}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-section)',
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="type-metadata" style={{ color: 'var(--text-muted)' }}>
              LIVE THROUGHPUT METRIC
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
              {selectedStage.telemetryMetric}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
