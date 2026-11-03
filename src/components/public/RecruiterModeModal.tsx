import React from 'react';
import { X, Download, Mail, ExternalLink, CheckCircle2, Briefcase, Award, Sparkles } from 'lucide-react';
import { ProfileData, ExperienceRecord, ProjectRecord, CertificationRecord, SkillRecord } from '../../types/cms';

interface RecruiterModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  experiences: ExperienceRecord[];
  projects: ProjectRecord[];
  certifications: CertificationRecord[];
  skills: SkillRecord[];
}

export const RecruiterModeModal: React.FC<RecruiterModeModalProps> = ({
  isOpen,
  onClose,
  profile,
  experiences,
  projects,
  certifications,
  skills,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        backgroundColor: 'rgba(7, 9, 13, 0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflowY: 'auto',
      }}
    >
      <div
        className="card-base"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          padding: '36px',
          position: 'relative',
        }}
      >
        {/* Header / Close Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '20px',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="pill-status" style={{ background: 'rgba(69, 214, 255, 0.12)' }}>
              <span className="pill-dot pill-dot-cyan"></span>
              <span style={{ color: 'var(--accent-primary)' }}>EXECUTIVE RECRUITER DOSSIER</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              QUICK-SCAN BRIEFING
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Recruiter Dossier"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Candidate Profile Summary */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
            {profile.name}
          </h2>
          <div style={{ fontSize: '16px', color: 'var(--accent-primary)', fontWeight: 500, marginBottom: '12px' }}>
            {profile.headline}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            {profile.bio}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: '13px' }}
            >
              <Download size={14} />
              <span>Download Active PDF Resume</span>
            </a>

            <a
              href={`mailto:${profile.email}`}
              className="btn-secondary"
              style={{ padding: '8px 20px', fontSize: '13px' }}
            >
              <Mail size={14} />
              <span>{profile.email}</span>
            </a>
          </div>
        </div>

        {/* Core Competencies Quick Matrix */}
        <div style={{ marginBottom: '28px' }}>
          <div className="type-metadata" style={{ color: 'var(--accent-primary)', marginBottom: '12px' }}>
            PRIMARY DOMAIN COMPETENCIES:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.slice(0, 10).map((sk) => (
              <span
                key={sk.id}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {sk.name}
              </span>
            ))}
          </div>
        </div>

        {/* Flagship Projects Summary */}
        <div style={{ marginBottom: '28px' }}>
          <div className="type-metadata" style={{ color: 'var(--accent-primary)', marginBottom: '12px' }}>
            KEY ARCHITECTURAL PLATFORMS:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {projects.slice(0, 2).map((proj) => (
              <div
                key={proj.id}
                style={{
                  background: 'var(--bg-card)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                  {proj.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {proj.subtitle}
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-success)' }}>
                  STATUS: {proj.developmentStatus}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Snapshot */}
        <div>
          <div className="type-metadata" style={{ color: 'var(--accent-primary)', marginBottom: '12px' }}>
            EMPLOYMENT TRACK:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {experiences.map((exp) => (
              <div
                key={exp.id}
                style={{
                  background: 'var(--bg-elevated)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {exp.jobTitle} • {exp.employer}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {exp.startDate} – {exp.endDate}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {exp.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
