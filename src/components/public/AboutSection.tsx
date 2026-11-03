import React from 'react';
import { User, MapPin, Briefcase, Mail, CheckCircle2 } from 'lucide-react';
import { ProfileData } from '../../types/cms';

interface AboutSectionProps {
  profile: ProfileData;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  return (
    <section id="about" className="section-wrapper" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ maxWidth: '840px', marginBottom: '40px' }}>
          <div className="pill-status" style={{ marginBottom: '14px' }}>
            <span className="pill-dot pill-dot-cyan"></span>
            <span style={{ color: 'var(--accent-primary)' }}>OPERATIONAL PROFILE // FOUNDATION</span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '16px' }}>
            About Ayush Prakash
          </h2>
          <p className="type-body" style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
            Bridging operational discipline with modern software architecture to eliminate supply chain friction and build high-signal career technology.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'center',
          }}
        >
          {/* Profile Card & Photo */}
          <div className="card-base" style={{ padding: '32px', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <img
                src={profile.profilePhoto}
                alt={profile.name}
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                  border: '2px solid var(--accent-primary)',
                }}
                onError={(e) => {
                  // Fallback avatar
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
                }}
              />
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#FFFFFF', marginBottom: '4px' }}>
                  {profile.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--accent-primary)', marginBottom: '4px' }}>
                  <MapPin size={13} />
                  <span>{profile.location}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-success)' }}>
                  ● {profile.availabilityStatus}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Direct Email:</strong> {profile.email}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Focus:</strong> Enterprise Operations, Logistics Protocols, AI Workflows
              </div>
            </div>
          </div>

          {/* Philosophy & Approach */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-base" style={{ padding: '24px', backgroundColor: 'var(--bg-card)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', color: 'var(--accent-primary)', marginBottom: '8px' }}>
                Operational Rigor Meets Systems Engineering
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                Real-world operations are messy—marred by siloed legacy ERPs, lost paper manifests, and communication latency between loading docks and corporate headquarters. My approach starts with ground-level logistics realities before writing a single line of software or designing an AI pipeline.
              </p>
            </div>

            <div className="card-base" style={{ padding: '24px', backgroundColor: 'var(--bg-card)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', color: 'var(--accent-success)', marginBottom: '8px' }}>
                Grounded Artificial Intelligence
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                Artificial intelligence should augment human judgment rather than produce deceptive compatibility promises. Whether in career trajectory modeling or freight anomaly triaging, every algorithm must be backed by verifiable data points and clear attribution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
