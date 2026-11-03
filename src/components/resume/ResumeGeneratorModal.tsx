import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import {
  ProfileData,
  AboutSectionSettings,
  ExperienceRecord,
  ProjectRecord,
  SkillRecord,
  EducationRecord,
  CertificationRecord,
  ResumeGeneratorSettings,
} from '../../types/cms';
import {
  extractResumeData,
  downloadPdf,
  ATSResumeData,
} from '../../services/resumeGeneratorService';

interface ResumeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  about: AboutSectionSettings;
  experiences: ExperienceRecord[];
  projects: ProjectRecord[];
  skills: SkillRecord[];
  education: EducationRecord[];
  certifications: CertificationRecord[];
  settings?: ResumeGeneratorSettings;
}

export const ResumeGeneratorModal: React.FC<ResumeGeneratorModalProps> = ({
  isOpen,
  onClose,
  profile,
  about,
  experiences,
  projects,
  skills,
  education,
  certifications,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'options' | 'preview'>('options');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Extract clean ATS resume data dynamically from live CMS props
  const resumeData: ATSResumeData = useMemo(() => {
    return extractResumeData(
      profile,
      about,
      experiences,
      projects,
      skills,
      education,
      certifications,
      settings
    );
  }, [profile, about, experiences, projects, skills, education, certifications, settings]);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      downloadPdf(resumeData);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 600);
    }
  };

  const handleCopyText = () => {
    const textLines: string[] = [
      resumeData.fullName.toUpperCase(),
      resumeData.headline,
      Object.values(resumeData.contact).filter(Boolean).join(' | '),
      '',
      'PROFESSIONAL SUMMARY',
      resumeData.summary,
      '',
      'CORE COMPETENCIES & TECHNICAL SKILLS',
      ...resumeData.skills.map((s) => `${s.category}: ${s.skills.join(', ')}`),
      '',
      'WORK EXPERIENCE',
      ...resumeData.experience.flatMap((e) => [
        `${e.jobTitle} - ${e.employer} (${e.period})`,
        e.location ? `Location: ${e.location}` : '',
        ...e.bullets.map((b) => `• ${b}`),
        '',
      ]),
      'NOTABLE PROJECTS',
      ...resumeData.projects.flatMap((p) => [
        `${p.name} ${p.category ? `(${p.category})` : ''}`,
        p.description,
        p.technologies.length > 0 ? `Technologies: ${p.technologies.join(', ')}` : '',
        ...p.highlights.map((h) => `• ${h}`),
        '',
      ]),
      'EDUCATION',
      ...resumeData.education.map(
        (ed) => `${ed.degree} in ${ed.fieldOfStudy} - ${ed.institution} (${ed.period})`
      ),
      '',
      'CERTIFICATIONS',
      ...resumeData.certifications.map((c) => `${c.title} - ${c.issuer} (${c.date})`),
    ].filter((line) => line !== undefined);

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(3, 4, 6, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: activeTab === 'preview' ? '920px' : '640px',
          maxHeight: '92vh',
          backgroundColor: '#0C0D12',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08) inset',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 9px',
                borderRadius: '100px',
                backgroundColor: 'rgba(217, 221, 227, 0.08)',
                border: '1px solid rgba(217, 221, 227, 0.18)',
                marginBottom: '10px',
              }}
            >
              <ShieldCheck size={12} color="#D9DDE3" />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#D9DDE3',
                }}
              >
                ATS Compliant Document Engine
              </span>
            </div>

            <h2
              id="resume-modal-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: 600,
                color: '#FFFFFF',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Generate My Resume
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.65)',
                margin: '6px 0 0 0',
                lineHeight: 1.45,
              }}
            >
              Generate a professional, ATS-friendly resume using the information published on this website.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* View Mode Toggle Bar (Options vs Preview) */}
        <div
          style={{
            padding: '10px 24px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('options')}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'options' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                color: activeTab === 'options' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                transition: 'all 0.15s ease',
              }}
            >
              Export Options
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: activeTab === 'preview' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                color: activeTab === 'preview' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                transition: 'all 0.15s ease',
              }}
            >
              <Eye size={13} />
              Live ATS Preview
            </button>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.45)',
            }}
          >
            Live Data &bull; {resumeData.generatedDate}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {activeTab === 'options' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Option 1: PDF Download */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(217, 221, 227, 0.3)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(220, 38, 38, 0.12)',
                      border: '1px solid rgba(220, 38, 38, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#F87171',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          margin: 0,
                        }}
                      >
                        Download ATS-Friendly Resume (PDF)
                      </h3>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(34, 197, 94, 0.15)',
                          color: '#4ADE80',
                          fontWeight: 600,
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        RECOMMENDED
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12.5px',
                        color: 'rgba(255, 255, 255, 0.65)',
                        margin: '6px 0 0 0',
                        lineHeight: 1.45,
                      }}
                    >
                      Vector-rendered A4 PDF with 100% searchable text, standard headings, and clean ATS single-column hierarchy. Verified against Greenhouse, Workday, and Lever parsers.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(255, 255, 255, 0.15)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E5E7EB';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Download size={15} />
                  {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                </button>
              </div>

              {/* Option 2: Preview Resume */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(217, 221, 227, 0.3)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(168, 85, 247, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.28)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#C084FC',
                      flexShrink: 0,
                    }}
                  >
                    <Eye size={22} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        margin: 0,
                      }}
                    >
                      Preview Resume
                    </h3>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12.5px',
                        color: 'rgba(255, 255, 255, 0.65)',
                        margin: '6px 0 0 0',
                        lineHeight: 1.45,
                      }}
                    >
                      Inspect the exact single-column ATS document structure, typography, dates, and chronology rendered directly in your browser.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('preview')}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Eye size={15} />
                  Preview Resume
                </button>
              </div>

              {/* ATS Compliance Checklist Note */}
              <div
                style={{
                  marginTop: '8px',
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={15} color="#4ADE80" />
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.75)',
                    }}
                  >
                    No photos &bull; No icons &bull; Single-column &bull; Selectable text &bull; Zero tables
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  Synchronized with Central Database
                </div>
              </div>
            </div>
          ) : (
            /* Live High-Fidelity ATS Resume Preview */
            <div>
              {/* Preview Action Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '18px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={handleDownloadPdf}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Download size={13} />
                    Download PDF
                  </button>
                  <button
                    onClick={handleCopyText}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {copiedNotification ? <Check size={13} color="#4ADE80" /> : <Copy size={13} />}
                    {copiedNotification ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  Standard A4 Single Column Format
                </div>
              </div>

              {/* The Authentic White Paper Document */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#111111',
                  borderRadius: '4px',
                  padding: '36px 40px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                  fontFamily: 'Calibri, Arial, sans-serif',
                  lineHeight: 1.45,
                }}
              >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <h1
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: '#000000',
                      margin: '0 0 6px 0',
                    }}
                  >
                    {resumeData.fullName.toUpperCase()}
                  </h1>
                  {resumeData.headline && (
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#444444',
                        marginBottom: '8px',
                        lineHeight: 1.35,
                      }}
                    >
                      {resumeData.headline}
                    </div>
                  )}
                  {/* Contact line */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#555555',
                      display: 'flex',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    {resumeData.contact.email && <span>{resumeData.contact.email}</span>}
                    {resumeData.contact.phone && <span>&bull; {resumeData.contact.phone}</span>}
                    {resumeData.contact.location && <span>&bull; {resumeData.contact.location}</span>}
                    {resumeData.contact.linkedin && <span>&bull; LinkedIn</span>}
                    {resumeData.contact.github && <span>&bull; GitHub</span>}
                    {resumeData.contact.portfolio && <span>&bull; Portfolio</span>}
                  </div>
                </div>

                {/* Professional Summary */}
                {resumeData.summary && (
                  <div style={{ marginBottom: '18px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #D0D4DC',
                        paddingBottom: '3px',
                        marginBottom: '8px',
                        color: '#111111',
                      }}
                    >
                      Professional Summary
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#222222', lineHeight: 1.5 }}>
                      {resumeData.summary}
                    </div>
                  </div>
                )}

                {/* Core Competencies & Skills */}
                {resumeData.skills && resumeData.skills.length > 0 && (
                  <div style={{ marginBottom: '18px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #D0D4DC',
                        paddingBottom: '3px',
                        marginBottom: '8px',
                        color: '#111111',
                      }}
                    >
                      Core Competencies & Technical Skills
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {resumeData.skills.map((group, idx) => (
                        <div key={idx} style={{ fontSize: '12px', color: '#222222' }}>
                          <strong style={{ color: '#000000' }}>{group.category}: </strong>
                          <span>{group.skills.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {resumeData.experience && resumeData.experience.length > 0 && (
                  <div style={{ marginBottom: '18px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #D0D4DC',
                        paddingBottom: '3px',
                        marginBottom: '10px',
                        color: '#111111',
                      }}
                    >
                      Work Experience
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {resumeData.experience.map((exp, idx) => (
                        <div key={idx}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                            }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#000000' }}>
                              {exp.jobTitle}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#555555' }}>
                              {exp.period}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#555555', marginBottom: '6px' }}>
                            {exp.employer} {exp.location ? `| ${exp.location}` : ''}
                          </div>
                          {exp.bullets && exp.bullets.length > 0 && (
                            <ul style={{ margin: '0 0 0 18px', padding: 0 }}>
                              {exp.bullets.map((b, bi) => (
                                <li
                                  key={bi}
                                  style={{
                                    fontSize: '12px',
                                    color: '#333333',
                                    marginBottom: '3px',
                                    lineHeight: 1.45,
                                  }}
                                >
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notable Projects */}
                {resumeData.projects && resumeData.projects.length > 0 && (
                  <div style={{ marginBottom: '18px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #D0D4DC',
                        paddingBottom: '3px',
                        marginBottom: '10px',
                        color: '#111111',
                      }}
                    >
                      Notable Projects & Systems Architecture
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {resumeData.projects.map((p, idx) => (
                        <div key={idx}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                            }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#000000' }}>
                              {p.name} {p.category ? `| ${p.category}` : ''}
                            </span>
                            {p.period && (
                              <span style={{ fontSize: '12px', color: '#666666' }}>{p.period}</span>
                            )}
                          </div>
                          {p.description && (
                            <div style={{ fontSize: '12px', color: '#333333', marginTop: '2px' }}>
                              {p.description}
                            </div>
                          )}
                          {p.technologies && p.technologies.length > 0 && (
                            <div style={{ fontSize: '11.5px', color: '#555555', marginTop: '2px' }}>
                              <strong>Technologies: </strong>
                              {p.technologies.join(', ')}
                            </div>
                          )}
                          {p.highlights && p.highlights.length > 0 && (
                            <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                              {p.highlights.map((h, hi) => (
                                <li
                                  key={hi}
                                  style={{
                                    fontSize: '12px',
                                    color: '#333333',
                                    marginBottom: '2px',
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {h}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education && resumeData.education.length > 0 && (
                  <div style={{ marginBottom: '18px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #D0D4DC',
                        paddingBottom: '3px',
                        marginBottom: '8px',
                        color: '#111111',
                      }}
                    >
                      Education
                    </div>
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} style={{ marginBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#000000' }}>
                            {edu.degree} in {edu.fieldOfStudy}
                          </span>
                          <span style={{ fontSize: '12px', color: '#666666' }}>{edu.period}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#555555' }}>
                          {edu.institution} {edu.grade ? `| Grade: ${edu.grade}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {resumeData.certifications && resumeData.certifications.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #D0D4DC',
                        paddingBottom: '3px',
                        marginBottom: '8px',
                        color: '#111111',
                      }}
                    >
                      Certifications & Credentials
                    </div>
                    {resumeData.certifications.map((c, idx) => (
                      <div key={idx} style={{ marginBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#000000' }}>
                            {c.title}
                          </span>
                          <span style={{ fontSize: '12px', color: '#666666' }}>{c.date}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#555555' }}>
                          {c.issuer} {c.credentialId ? `| ID: ${c.credentialId}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
