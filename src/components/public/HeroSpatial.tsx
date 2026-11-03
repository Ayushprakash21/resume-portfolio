import React from 'react';
import { ArrowDown, ArrowUpRight, Cpu, Layers, ShieldCheck, Sparkles, Terminal } from 'lucide-react';
import { ProfileData, ProjectRecord } from '../../types/cms';

interface HeroSpatialProps {
  profile: ProfileData;
  projects: ProjectRecord[];
  onExploreZone: (zoneId: string) => void;
  onToggleRecruiterMode: () => void;
  isRecruiterMode: boolean;
}

export const HeroSpatial: React.FC<HeroSpatialProps> = ({
  profile,
  projects,
  onExploreZone,
  onToggleRecruiterMode,
  isRecruiterMode,
}) => {
  const orion = projects.find((p) => p.id === 'orion-9');
  const applywise = projects.find((p) => p.id === 'applywise-ai');

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '92px 24px 80px',
        zIndex: 10,
      }}
    >
      {/* Top HUD Briefing */}
      <div style={{ maxWidth: '820px', pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div className="pill-status">
            <span className="pill-dot pill-dot-cyan"></span>
            <span style={{ color: 'var(--text-secondary)' }}>
              SYSTEM MATRIX // {profile.name.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onToggleRecruiterMode}
            style={{
              background: isRecruiterMode ? 'rgba(69, 214, 255, 0.2)' : 'rgba(21, 30, 41, 0.85)',
              border: `1px solid ${isRecruiterMode ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              color: isRecruiterMode ? '#FFFFFF' : 'var(--accent-primary)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={12} />
            <span>{isRecruiterMode ? 'EXIT RECRUITER BRIEF' : 'ACTIVATE RECRUITER BRIEF'}</span>
          </button>
        </div>

        {/* Distinctive Headline Requirement */}
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.6rem, 6vw, 4.8rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: '16px',
            color: 'var(--text-primary)',
          }}
        >
          {profile.name.toUpperCase()}
        </h1>

        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            fontWeight: 500,
            color: 'var(--accent-primary)',
            lineHeight: 1.3,
            marginBottom: '18px',
          }}
        >
          Business Operations.<br />
          Supply Chain Intelligence.<br />
          AI-Powered Product Innovation.
        </div>

        {/* Supporting Copy Requirement */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            color: 'var(--text-secondary)',
            maxWidth: '640px',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}
        >
          "{profile.bio}"
        </p>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ padding: '10px 22px' }}
          >
            <span>Download Active Resume</span>
            <ArrowUpRight size={14} />
          </a>

          <a href="#about" className="btn-secondary" style={{ padding: '10px 20px' }}>
            <span>Explore Experience Log</span>
            <ArrowDown size={14} />
          </a>
        </div>
      </div>

      {/* Two Flagship Projects Quick-Access HUD at Right / Lower Corner */}
      <div
        style={{
          alignSelf: 'flex-end',
          maxWidth: '520px',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
        className="hud-flagships"
      >
        {orion && (
          <div
            onClick={() => onExploreZone('orion9')}
            className="card-base card-orion"
            style={{
              padding: '16px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div className="type-metadata" style={{ color: 'var(--accent-success)', marginBottom: '2px' }}>
                FLAGSHIP 01 // SUPPLY CHAIN OS
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>
                ORION-9
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {orion.subtitle}
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-success)' }}>
              VIEW ❯
            </span>
          </div>
        )}

        {applywise && (
          <div
            onClick={() => onExploreZone('applywise')}
            className="card-base card-applywise"
            style={{
              padding: '16px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div className="type-metadata" style={{ color: '#A78BFA', marginBottom: '2px' }}>
                FLAGSHIP 02 // CAREER INTELLIGENCE
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>
                APPLYVISE AI
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {applywise.subtitle}
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#A78BFA' }}>
              VIEW ❯
            </span>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 840px) {
          .hud-flagships {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
