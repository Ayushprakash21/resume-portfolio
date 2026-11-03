import React from 'react';
import { MapPin, ArrowUpRight, Compass, Shield, Cpu, Activity } from 'lucide-react';
import { ProfileData } from '../../types/cms';

interface EditorialAboutProps {
  profile: ProfileData;
}

export const EditorialAbout: React.FC<EditorialAboutProps> = ({ profile }) => {
  return (
    <section
      id="about"
      style={{
        padding: '120px 0',
        backgroundColor: '#0C1118',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        {/* Editorial Section Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#45D6FF', letterSpacing: '0.1em' }}>
            01 // EDITORIAL PROFILE
          </span>
          <span style={{ height: '1px', width: '40px', backgroundColor: '#45D6FF', opacity: 0.4 }} />
        </div>

        {/* Large Editorial Headline */}
        <h2
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#F5F7FA',
            maxWidth: '940px',
            marginBottom: '48px',
          }}
        >
          Operating at the confluence of enterprise logistics, physical workflows, and autonomous digital systems.
        </h2>

        {/* Editorial 2-Column Split: Genuine Photo + Longform Narrative */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '64px',
            alignItems: 'start',
          }}
        >
          {/* Column 1: Genuine Professional Portrait & Metadata Frame */}
          <div>
            <div
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#151E29',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
              }}
            >
              <img
                src={profile.profilePhoto}
                alt={profile.name}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '520px',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div
                style={{
                  padding: '20px 24px',
                  backgroundColor: 'rgba(12, 17, 24, 0.95)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>
                    {profile.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#8AB4FF', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <MapPin size={12} />
                    <span>{profile.location}</span>
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    color: '#42D6A4',
                    background: 'rgba(66, 214, 164, 0.1)',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(66, 214, 164, 0.3)',
                  }}
                >
                  ● {profile.availabilityStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Editorial Prose & Philosophical Focus */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h3
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginBottom: '16px',
                }}
              >
                Background & Career Thesis
              </h3>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '17px',
                  lineHeight: 1.75,
                  color: '#A7B2C0',
                  marginBottom: '16px',
                }}
              >
                In complex operations, information latency is the silent killer of productivity. Ground logistics and warehouse teams frequently struggle with fragmented systems of record, paper custody handoffs, and disconnected ERP data that leave supply managers blind to transit bottlenecks.
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '17px',
                  lineHeight: 1.75,
                  color: '#A7B2C0',
                }}
              >
                My work centers on designing transparent systems that eliminate operational friction. Rather than adding superficial dashboards over broken processes, I focus on data integrity, distributed event verification, and grounded software architecture that respects physical realities.
              </p>
            </div>

            {/* Core Focus Areas */}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '28px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
              }}
            >
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#45D6FF', marginBottom: '8px' }}>
                  OPERATIONAL PURSUITS
                </div>
                <div style={{ fontSize: '14px', color: '#F5F7FA', lineHeight: 1.6 }}>
                  Supply Chain Synchronization, Procurement Workflows, Multi-Tier Route Telemetry, ERP Harmonization.
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#A78BFA', marginBottom: '8px' }}>
                  DIGITAL PRODUCT DESIGN
                </div>
                <div style={{ fontSize: '14px', color: '#F5F7FA', lineHeight: 1.6 }}>
                  Edge Computing, Vector Embeddings, ATS Parsing Heuristics, High-Density Reactive User Interfaces.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
