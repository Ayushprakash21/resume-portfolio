import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  Info,
  Briefcase,
  Layers,
  GraduationCap,
  Award,
  Cpu,
  FileText,
  Image as ImageIcon,
  ListOrdered,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Copy,
  Calendar,
  MapPin,
  Globe,
  Menu,
  X,
  Cloud,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { cmsService } from '../../services/cmsService';
import {
  ProfileData,
  HomepageSettings,
  AboutSectionSettings,
  ExperienceRecord,
  ProjectRecord,
  CertificationRecord,
  SkillRecord,
  EducationRecord,
  ResumeRecord,
  SectionConfig,
  AppearanceSettings,
  ContactMessage,
  SiteSettings,
  MediaAsset,
  OpenToWorkSettings,
} from '../../types/cms';

import { IntroductionEditor } from './editors/IntroductionEditor';
import { AboutEditor } from './editors/AboutEditor';
import { OpenToWorkEditor } from './editors/OpenToWorkEditor';
import { ExperienceEditorModal } from './editors/ExperienceEditorModal';
import { ProjectEditorModal } from './editors/ProjectEditorModal';
import { CertificationEditorModal } from './editors/CertificationEditorModal';
import { EducationEditorModal } from './editors/EducationEditorModal';
import { SkillsManager } from './editors/SkillsManager';
import { ResumeManager } from './editors/ResumeManager';
import { MediaLibraryManager } from './editors/MediaLibraryManager';
import { WebsiteSectionsManager } from './editors/WebsiteSectionsManager';
import { SettingsManager } from './editors/SettingsManager';
import { StorageManager } from './editors/StorageManager';
import { ApMonogram } from '../brand/ApMonogram';

interface AdminConsoleProps {
  onLogout: () => void;
  onReturnToSite: () => void;
}

export type AdminSectionId =
  | 'overview'
  | 'introduction'
  | 'opentowork'
  | 'about'
  | 'experience'
  | 'projects'
  | 'education'
  | 'certifications'
  | 'skills'
  | 'resume'
  | 'media'
  | 'storage'
  | 'sections'
  | 'settings';

export const AdminConsole: React.FC<AdminConsoleProps> = ({ onLogout, onReturnToSite }) => {
  const [activeSection, setActiveSection] = useState<AdminSectionId>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // CMS State
  const [profile, setProfile] = useState<ProfileData>(() => cmsService.getProfile());
  const [openToWork, setOpenToWork] = useState<OpenToWorkSettings>(() =>
    cmsService.getOpenToWorkSettings()
  );
  const [aboutSettings, setAboutSettings] = useState<AboutSectionSettings>(() =>
    cmsService.getAboutSettings()
  );
  const [experiences, setExperiences] = useState<ExperienceRecord[]>(() =>
    cmsService.getExperiences(false)
  );
  const [projects, setProjects] = useState<ProjectRecord[]>(() => cmsService.getProjects(false));
  const [certifications, setCertifications] = useState<CertificationRecord[]>(() =>
    cmsService.getCertifications(false)
  );
  const [skills, setSkills] = useState<SkillRecord[]>(() => cmsService.getSkills());
  const [education, setEducation] = useState<EducationRecord[]>(() => cmsService.getEducation());
  const [resume, setResume] = useState<ResumeRecord>(() => cmsService.getResumeRecord());
  const [media, setMedia] = useState<MediaAsset[]>(() => cmsService.getMediaAssets());
  const [sections, setSections] = useState<SectionConfig[]>(() => cmsService.getSectionsConfig());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => cmsService.getSiteSettings());
  const [messages, setMessages] = useState<ContactMessage[]>(() => cmsService.getContactMessages());

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('success');

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification(msg);
    setNotificationType(type);
    setTimeout(() => setNotification(null), 4000);
  };

  // Modals
  const [editingExp, setEditingExp] = useState<ExperienceRecord | null>(null);
  const [showExpModal, setShowExpModal] = useState(false);

  const [editingProj, setEditingProj] = useState<ProjectRecord | null>(null);
  const [showProjModal, setShowProjModal] = useState(false);

  const [editingCert, setEditingCert] = useState<CertificationRecord | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  const [editingEdu, setEditingEdu] = useState<EducationRecord | null>(null);
  const [showEduModal, setShowEduModal] = useState(false);

  // Subscribe to live CMS sync
  useEffect(() => {
    return cmsService.subscribe(() => {
      setProfile(cmsService.getProfile());
      setOpenToWork(cmsService.getOpenToWorkSettings());
      setAboutSettings(cmsService.getAboutSettings());
      setExperiences(cmsService.getExperiences(false));
      setProjects(cmsService.getProjects(false));
      setCertifications(cmsService.getCertifications(false));
      setSkills(cmsService.getSkills());
      setEducation(cmsService.getEducation());
      setResume(cmsService.getResumeRecord());
      setMedia(cmsService.getMediaAssets());
      setSections(cmsService.getSectionsConfig());
      setSiteSettings(cmsService.getSiteSettings());
      setMessages(cmsService.getContactMessages());
    });
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  // Duplicate helpers
  const handleDuplicateExp = async (id: string) => {
    const copy = await cmsService.duplicateExperience(id);
    if (copy) {
      setExperiences(cmsService.getExperiences(false));
      showNotification('Experience cloned as draft.');
    }
  };

  const handleDuplicateProj = async (id: string) => {
    const copy = await cmsService.duplicateProject(id);
    if (copy) {
      setProjects(cmsService.getProjects(false));
      showNotification('Project cloned as draft.');
    }
  };

  const handleDuplicateCert = async (id: string) => {
    const copy = await cmsService.duplicateCertification(id);
    if (copy) {
      setCertifications(cmsService.getCertifications(false));
      showNotification('Certification cloned as draft.');
    }
  };

  // Reorder helpers
  const handleMoveExp = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= experiences.length) return;
    const reordered = [...experiences];
    const temp = reordered[index];
    reordered[index] = reordered[newIdx];
    reordered[newIdx] = temp;
    await cmsService.reorderExperiences(reordered.map((e) => e.id));
    setExperiences(cmsService.getExperiences(false));
    showNotification('Experience timeline reordered.');
  };

  const handleMoveProj = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= projects.length) return;
    const reordered = [...projects];
    const temp = reordered[index];
    reordered[index] = reordered[newIdx];
    reordered[newIdx] = temp;
    await cmsService.reorderProjects(reordered.map((p) => p.id));
    setProjects(cmsService.getProjects(false));
    showNotification('Projects display order updated.');
  };

  // Nav items matching user's requested sections + dedicated Open to Work editor
  const NAV_ITEMS: { id: AdminSectionId; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'introduction', label: 'Introduction', icon: User },
    { id: 'opentowork', label: 'Open to Work', icon: Globe },
    { id: 'about', label: 'About', icon: Info },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'certifications', label: 'Licenses & Certifications', icon: Award },
    { id: 'skills', label: 'Skills', icon: Cpu },
    { id: 'resume', label: 'Resume Management', icon: FileText },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'storage', label: 'Cloudflare R2 Storage', icon: Cloud },
    { id: 'sections', label: 'Website Sections', icon: ListOrdered },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: messages.filter((m) => !m.read).length,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#050505', color: '#F5F5F5' }}>
      {/* ========================================================
          MOBILE TOP BAR (VISIBLE ON MOBILE & TABLET <= 860px)
          ======================================================== */}
      <header className="admin-mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '8px',
              padding: '8px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px',
            }}
            aria-label="Toggle Navigation Drawer"
          >
            {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <ApMonogram width={36} withGlow={true} />
          <span style={{ fontSize: '14px', fontWeight: 700, textTransform: 'capitalize' }}>
            {NAV_ITEMS.find((n) => n.id === activeSection)?.label || 'Console'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onReturnToSite}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#C8C8CE',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Site</span>
            <ExternalLink size={12} />
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#EF4444',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative', minHeight: 0 }}>
        {/* MOBILE BACKDROP OVERLAY */}
        {isMobileNavOpen && (
          <div
            onClick={() => setIsMobileNavOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 999,
            }}
          />
        )}

        {/* ========================================================
            SIDEBAR NAVIGATION (BLACK LUXURY)
            ======================================================== */}
        <aside
          className={`admin-sidebar ${isMobileNavOpen ? 'is-open' : ''}`}
          style={{
            width: '270px',
            backgroundColor: '#0A0A0E',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            {/* Header with AP Monogram */}
            <div
              style={{
                padding: '24px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <ApMonogram width={48} withGlow={true} />
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      letterSpacing: '0.02em',
                    }}
                  >
                    AYUSH PRAKASH
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      color: 'var(--accent-silver)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Portfolio Administration
                  </div>
                </div>
              </div>
              <button onClick={onReturnToSite} title="View Live Portfolio" className="btn-glass-icon" style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}>
                <ExternalLink size={14} />
              </button>
            </div>

            {/* Nav List */}
            <nav
              style={{
                padding: '14px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                maxHeight: 'calc(100vh - 180px)',
                overflowY: 'auto',
              }}
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileNavOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isActive ? 'rgba(130, 148, 166, 0.18)' : 'transparent',
                      color: isActive ? '#F4F3EE' : '#A7B0A9',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: 'var(--font-body)',
                      fontWeight: isActive ? 600 : 400,
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      minHeight: '40px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={15} color={isActive ? '#8294A6' : '#8E948D'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        style={{
                          backgroundColor: '#D9534F',
                          color: '#FFFFFF',
                          borderRadius: '10px',
                          padding: '1px 6px',
                          fontSize: '10px',
                          fontWeight: 700,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

        {/* User Info & Logout */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(244, 243, 238, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={profile.profilePhoto}
              alt="Avatar"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid rgba(244, 243, 238, 0.15)',
              }}
            />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#F4F3EE' }}>Ayush Prakash</div>
              <div style={{ fontSize: '10px', color: '#6CE098', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>●</span>
                <span>ayush@admin</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} title="Sign out of Admin CMS" className="btn-glass-icon" style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT WORKSPACE
          ======================================================== */}
      <main style={{ flex: 1, minWidth: 0, width: '100%', padding: 'clamp(18px, 3.5vw, 40px)', overflowY: 'auto', maxHeight: '100vh' }}>
        {/* Global Toast Notification */}
        {notification && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '24px',
              zIndex: 99999,
              padding: '12px 18px',
              borderRadius: '6px',
              backgroundColor:
                notificationType === 'error'
                  ? '#D9534F'
                  : notificationType === 'info'
                  ? '#3A483F'
                  : '#2F4F3E',
              color: '#FFFFFF',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </div>
        )}

        {/* ---------------- 1. OVERVIEW DASHBOARD ---------------- */}
        {activeSection === 'overview' && (
          <div style={{ maxWidth: '980px', margin: '0 auto' }}>
            {/* Profile Overview Card (LinkedIn Style) */}
            <div
              style={{
                backgroundColor: 'rgba(18, 18, 22, 0.72)',
                border: '1px solid rgba(244, 243, 238, 0.12)',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '28px',
              }}
            >
              {/* Cover Banner */}
              <div
                style={{
                  height: '140px',
                  backgroundColor: '#1E2822',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={profile.coverImage || profile.profilePhoto}
                  alt="Cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Profile Details */}
              <div style={{ padding: '0 28px 24px', position: 'relative' }}>
                <img
                  src={profile.profilePhoto}
                  alt={profile.name}
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid rgba(18, 18, 22, 0.72)',
                    backgroundColor: 'rgba(18, 18, 22, 0.72)',
                    marginTop: '-45px',
                    marginBottom: '14px',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div style={{ maxWidth: '640px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h1
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '24px',
                          fontWeight: 700,
                          color: '#F4F3EE',
                          margin: 0,
                        }}
                      >
                        {profile.name}
                      </h1>
                      {profile.pronouns && (
                        <span style={{ fontSize: '12px', color: '#8E948D' }}>
                          ({profile.pronouns})
                        </span>
                      )}
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(74, 180, 120, 0.15)',
                          color: '#6CE098',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        ● {profile.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        color: '#C1C4BE',
                        lineHeight: 1.5,
                        margin: '6px 0 10px',
                      }}
                    >
                      {profile.headline}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        color: '#8294A6',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>{profile.location}</span>
                      <span>&bull;</span>
                      <span style={{ color: '#6CE098' }}>{profile.availabilityStatus}</span>
                      <span>&bull;</span>
                      <span>{profile.email}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSection('introduction')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(244, 243, 238, 0.08)',
                      border: '1px solid rgba(244, 243, 238, 0.15)',
                      color: '#F4F3EE',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Edit size={14} />
                    Edit Introduction
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              {[
                { label: 'Work Experiences', count: experiences.length, sec: 'experience' },
                { label: 'Featured Projects', count: projects.length, sec: 'projects' },
                { label: 'Certifications', count: certifications.length, sec: 'certifications' },
                { label: 'Central Skills', count: skills.length, sec: 'skills' },
                { label: 'Media Library Assets', count: media.length, sec: 'media' },
                { label: 'Unread Inquiries', count: messages.filter((m) => !m.read).length, sec: 'settings' },
              ].map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveSection(m.sec as any)}
                  style={{
                    backgroundColor: 'rgba(18, 18, 22, 0.72)',
                    border: '1px solid rgba(244, 243, 238, 0.08)',
                    borderRadius: '8px',
                    padding: '18px 20px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(130, 148, 166, 0.35)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(244, 243, 238, 0.08)')}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: '#F4F3EE' }}>
                    {m.count}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#8E948D', marginTop: '4px' }}>
                    {m.label} &rarr;
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Shortcuts */}
            <div
              style={{
                backgroundColor: 'rgba(18, 18, 22, 0.72)',
                border: '1px solid rgba(244, 243, 238, 0.08)',
                borderRadius: '8px',
                padding: '24px',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#F4F3EE',
                  marginBottom: '16px',
                }}
              >
                Quick Profile Actions
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button type="button" onClick={() => { setEditingExp(null); setShowExpModal(true); }} className="btn-glass-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                  <Plus size={13} /> Add Experience
                </button>

                <button type="button" onClick={() => { setEditingProj(null); setShowProjModal(true); }} className="btn-glass-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                  <Plus size={13} /> Add Project
                </button>

                <button type="button" onClick={() => { setEditingCert(null); setShowCertModal(true); }} className="btn-glass-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                  <Plus size={13} /> Add Certification
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('resume')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(244, 243, 238, 0.05)',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <FileText size={13} /> Upload / Replace Resume
                </button>

                <button
                  type="button"
                  onClick={onReturnToSite}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#F4F3EE',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={13} /> View Live Portfolio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 2. INTRODUCTION EDITOR (REF SCREENSHOT 6) ---------------- */}
        {activeSection === 'introduction' && (
          <IntroductionEditor
            initialProfile={profile}
            onSave={(updated) => setProfile(updated)}
            onCancel={() => setActiveSection('overview')}
            showNotification={showNotification}
          />
        )}

        {/* ---------------- OPEN TO WORK EDITOR ---------------- */}
        {activeSection === 'opentowork' && (
          <OpenToWorkEditor
            initialSettings={openToWork}
            onSave={(saved) => {
              setOpenToWork(saved);
              showNotification('Open to Work settings updated.');
            }}
            showNotification={showNotification}
          />
        )}

        {/* ---------------- 3. ABOUT EDITOR (REF SCREENSHOT 7) ---------------- */}
        {activeSection === 'about' && (
          <AboutEditor
            initialAbout={aboutSettings}
            onSave={(updated) => setAboutSettings(updated)}
            onCancel={() => setActiveSection('overview')}
            showNotification={showNotification}
          />
        )}

        {/* ---------------- 4. EXPERIENCE (REF SCREENSHOTS 4 & 5) ---------------- */}
        {activeSection === 'experience' && (
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
              }}
            >
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: '#F4F3EE', margin: 0 }}>
                  Experience Timeline
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#A7B0A9', margin: '4px 0 0' }}>
                  Manage employment history, key deliverables, associated skills, and media attachments.
                </p>
              </div>

              <button type="button" onClick={() => { setEditingExp(null); setShowExpModal(true); }} className="btn-glass-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                <Plus size={14} /> Add Experience
              </button>
            </div>

            {/* Experience Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  style={{
                    backgroundColor: 'rgba(18, 18, 22, 0.72)',
                    border: '1px solid rgba(244, 243, 238, 0.08)',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, color: '#F4F3EE' }}>
                          {exp.jobTitle}
                        </span>
                        {exp.employmentType && exp.showEmploymentTypeBadge !== false && (
                          <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: 'rgba(244, 243, 238, 0.05)', fontSize: '11px', color: '#A7B0A9' }}>
                            {exp.employmentType}
                          </span>
                        )}
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            backgroundColor: exp.status === 'published' ? 'rgba(74, 180, 120, 0.15)' : 'rgba(214, 168, 84, 0.15)',
                            color: exp.status === 'published' ? '#6CE098' : '#E8CE7D',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          ● {exp.status}
                        </span>
                      </div>

                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#8294A6', marginTop: '2px' }}>
                        {exp.employer} &bull; {exp.startDate} &mdash; {exp.endDate} {exp.isCurrent && '(Present)'}
                      </div>

                      {exp.location && (
                        <div style={{ fontSize: '12px', color: '#8E948D', marginTop: '2px' }}>
                          {exp.location} {exp.locationType && `(${exp.locationType})`}
                        </div>
                      )}
                    </div>

                    {/* Actions: Reorder, Edit, Duplicate, Delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveExp(idx, 'up')}
                        title="Move Up"
                        className="btn-glass-icon" style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', cursor: idx === 0 ? 'not-allowed' : 'pointer'  }}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === experiences.length - 1}
                        onClick={() => handleMoveExp(idx, 'down')}
                        title="Move Down"
                        className="btn-glass-icon" style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', cursor: idx === experiences.length - 1 ? 'not-allowed' : 'pointer'  }}
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateExp(exp.id)}
                        title="Duplicate Role"
                        className="btn-glass-icon" style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', cursor: 'pointer'  }}
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingExp(exp);
                          setShowExpModal(true);
                        }}
                        title="Edit Role"
                        className="btn-glass-icon" style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', cursor: 'pointer' }}
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>

                  {exp.description && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#C1C4BE', lineHeight: 1.5, margin: 0 }}>
                      {exp.description}
                    </p>
                  )}

                  {/* Skills tags */}
                  {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {exp.skillsUsed.map((sk) => (
                        <span key={sk} style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(244, 243, 238, 0.05)', fontSize: '11px', color: '#8E948D' }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Attached media counter */}
                  {exp.mediaItems && exp.mediaItems.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#8294A6' }}>
                      {exp.mediaItems.length} media artifact(s) attached
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 5. PROJECTS (REF SCREENSHOTS 2 & 3) ---------------- */}
        {activeSection === 'projects' && (
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
              }}
            >
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: '#F4F3EE', margin: 0 }}>
                  Projects &amp; Case Studies
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#A7B0A9', margin: '4px 0 0' }}>
                  Preloaded with Orion-9 and ApplyVise AI as editable records. Supports structured content blocks and multi-media galleries.
                </p>
              </div>

              <button type="button" onClick={() => { setEditingProj(null); setShowProjModal(true); }} className="btn-glass-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                <Plus size={14} /> Add Project
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  style={{
                    backgroundColor: 'rgba(18, 18, 22, 0.72)',
                    border: '1px solid rgba(244, 243, 238, 0.08)',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {proj.coverImage ? (
                        <img
                          src={proj.coverImage}
                          alt={proj.name}
                          style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '60px', height: '60px', borderRadius: '6px', backgroundColor: '#1E2822', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8294A6' }}>
                          <Layers size={24} />
                        </div>
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, color: '#F4F3EE' }}>
                            {proj.name}
                          </span>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: 'rgba(244, 243, 238, 0.05)', fontSize: '11px', color: '#A7B0A9' }}>
                            {proj.category}
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '10px',
                              backgroundColor: proj.status === 'published' ? 'rgba(74, 180, 120, 0.15)' : 'rgba(214, 168, 84, 0.15)',
                              color: proj.status === 'published' ? '#6CE098' : '#E8CE7D',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            ● {proj.status}
                          </span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#8294A6', marginTop: '2px' }}>
                          {proj.subtitle}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6CE098', marginTop: '2px' }}>
                          Status: {proj.developmentStatus}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveProj(idx, 'up')}
                        title="Move Up"
                        className="btn-glass-icon" style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', cursor: idx === 0 ? 'not-allowed' : 'pointer'  }}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === projects.length - 1}
                        onClick={() => handleMoveProj(idx, 'down')}
                        title="Move Down"
                        className="btn-glass-icon" style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', cursor: idx === projects.length - 1 ? 'not-allowed' : 'pointer'  }}
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateProj(proj.id)}
                        title="Duplicate Project"
                        className="btn-glass-icon" style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', cursor: 'pointer'  }}
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProj(proj);
                          setShowProjModal(true);
                        }}
                        title="Edit Project"
                        className="btn-glass-icon" style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', cursor: 'pointer' }}
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>

                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#C1C4BE', lineHeight: 1.5, margin: 0 }}>
                    {proj.shortDescription || proj.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#8E948D' }}>
                    {proj.technologyStack && <span>Tech: {proj.technologyStack.slice(0, 4).join(', ')}</span>}
                    {proj.mediaItems && <span>&bull; {proj.mediaItems.length} media asset(s)</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 6. EDUCATION ---------------- */}
        {activeSection === 'education' && (
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
              }}
            >
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: '#F4F3EE', margin: 0 }}>
                  Education &amp; Academic Foundation
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#A7B0A9', margin: '4px 0 0' }}>
                  Manage degrees, coursework highlights, and academic institutions. Unlimited records supported.
                </p>
              </div>

              <button type="button" onClick={() => { setEditingEdu(null); setShowEduModal(true); }} className="btn-glass-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                <Plus size={14} /> Add Education
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {education.map((edu) => (
                <div
                  key={edu.id}
                  style={{
                    backgroundColor: 'rgba(18, 18, 22, 0.72)',
                    border: '1px solid rgba(244, 243, 238, 0.08)',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: '#F4F3EE', margin: 0 }}>
                      {edu.degree}
                    </h3>
                    <div style={{ fontSize: '13px', color: '#8294A6', marginTop: '2px' }}>
                      {edu.institution} &bull; {edu.fieldOfStudy}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8E948D', marginTop: '2px' }}>
                      {edu.startYear} &mdash; {edu.endYear} {edu.grade && `&bull; ${edu.grade}`}
                    </div>
                    {edu.highlights && edu.highlights.length > 0 && (
                      <ul style={{ margin: '8px 0 0', paddingLeft: '18px', fontSize: '12px', color: '#C1C4BE' }}>
                        {edu.highlights.map((h, hIdx) => (
                          <li key={hIdx}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingEdu(edu);
                      setShowEduModal(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(130, 148, 166, 0.15)',
                      border: 'none',
                      color: '#8294A6',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 7. LICENSES & CERTIFICATIONS (REF SCREENSHOT 1) ---------------- */}
        {activeSection === 'certifications' && (
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
              }}
            >
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: '#F4F3EE', margin: 0 }}>
                  Licenses &amp; Certifications
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#A7B0A9', margin: '4px 0 0' }}>
                  LinkedIn Reference Screenshot 1: Manage accredited credentials, issue/expiration dates, credential IDs, and certificate PDFs.
                </p>
              </div>

              <button type="button" onClick={() => { setEditingCert(null); setShowCertModal(true); }} className="btn-glass-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                <Plus size={14} /> Add Certification
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  style={{
                    backgroundColor: 'rgba(18, 18, 22, 0.72)',
                    border: '1px solid rgba(244, 243, 238, 0.08)',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    {cert.issuerLogo ? (
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={cert.issuerLogo}
                          alt={cert.issuer}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#A7B0A9',
                          fontSize: '12px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {cert.issuer ? cert.issuer.slice(0, 3).toUpperCase() : 'CRT'}
                      </div>
                    )}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: '#F4F3EE' }}>
                          {cert.title}
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            backgroundColor: cert.status === 'published' ? 'rgba(74, 180, 120, 0.15)' : 'rgba(214, 168, 84, 0.15)',
                            color: cert.status === 'published' ? '#6CE098' : '#E8CE7D',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          ● {cert.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: '#8294A6', marginTop: '2px' }}>
                        {cert.issuer} &bull; Issued {cert.completionDate}
                      </div>

                      {cert.credentialId && (
                        <div style={{ fontSize: '11px', color: '#8E948D', marginTop: '2px' }}>
                          Credential ID: {cert.credentialId}
                        </div>
                      )}

                      {cert.skillsUsed && cert.skillsUsed.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                          {cert.skillsUsed.map((sk) => (
                            <span key={sk} style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(244, 243, 238, 0.05)', fontSize: '10px', color: '#8E948D' }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleDuplicateCert(cert.id)}
                      title="Duplicate Credential"
                      className="btn-glass-icon" style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', cursor: 'pointer'  }}
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCert(cert);
                        setShowCertModal(true);
                      }}
                      style={{ padding: '6px 12px', borderRadius: '4px', backgroundColor: 'rgba(130, 148, 166, 0.15)', border: 'none', color: '#8294A6', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 8. SKILLS MANAGEMENT ---------------- */}
        {activeSection === 'skills' && (
          <SkillsManager
            skills={skills}
            experiences={experiences}
            projects={projects}
            certifications={certifications}
            showNotification={showNotification}
          />
        )}

        {/* ---------------- 9. RESUME MANAGEMENT ---------------- */}
        {activeSection === 'resume' && (
          <ResumeManager
            currentResume={resume}
            onUpdate={(updated) => setResume(updated)}
            showNotification={showNotification}
          />
        )}

        {/* ---------------- 10. MEDIA LIBRARY ---------------- */}
        {activeSection === 'media' && (
          <MediaLibraryManager
            media={media}
            onRefresh={() => setMedia(cmsService.getMediaAssets())}
            showNotification={showNotification}
          />
        )}

        {/* ---------------- 11. CLOUDFLARE R2 STORAGE ARCHITECTURE ---------------- */}
        {activeSection === 'storage' && (
          <StorageManager onNotify={showNotification} />
        )}

        {/* ---------------- 12. WEBSITE SECTIONS ---------------- */}
        {activeSection === 'sections' && (
          <WebsiteSectionsManager
            sections={sections}
            onUpdate={(updated) => setSections(updated)}
            showNotification={showNotification}
          />
        )}

        {/* ---------------- 12. SETTINGS ---------------- */}
        {activeSection === 'settings' && (
          <SettingsManager
            settings={siteSettings}
            messages={messages}
            onUpdateSettings={(updated) => setSiteSettings(updated)}
            onRefreshMessages={() => setMessages(cmsService.getContactMessages())}
            showNotification={showNotification}
          />
        )}

        {/* Modals */}
        {showExpModal && (
          <ExperienceEditorModal
            initialExperience={editingExp}
            allSkills={skills}
            onSave={() => setExperiences(cmsService.getExperiences(false))}
            onDelete={async (id) => {
              await cmsService.deleteExperience(id);
              setExperiences(cmsService.getExperiences(false));
              showNotification('Experience deleted.');
            }}
            onClose={() => setShowExpModal(false)}
            showNotification={showNotification}
          />
        )}

        {showProjModal && (
          <ProjectEditorModal
            initialProject={editingProj}
            allSkills={skills}
            onSave={() => setProjects(cmsService.getProjects(false))}
            onDelete={async (id) => {
              await cmsService.deleteProject(id);
              setProjects(cmsService.getProjects(false));
              showNotification('Project deleted.');
            }}
            onClose={() => setShowProjModal(false)}
            showNotification={showNotification}
          />
        )}

        {showCertModal && (
          <CertificationEditorModal
            initialCertification={editingCert}
            allSkills={skills}
            onSave={() => setCertifications(cmsService.getCertifications(false))}
            onDelete={async (id) => {
              await cmsService.deleteCertification(id);
              setCertifications(cmsService.getCertifications(false));
              showNotification('Certification deleted.');
            }}
            onClose={() => setShowCertModal(false)}
            showNotification={showNotification}
          />
        )}

        {showEduModal && (
          <EducationEditorModal
            initialEducation={editingEdu}
            allSkills={skills}
            onSave={() => setEducation(cmsService.getEducation())}
            onDelete={async (id) => {
              await cmsService.deleteEducation(id);
              setEducation(cmsService.getEducation());
              showNotification('Education deleted.');
            }}
            onClose={() => setShowEduModal(false)}
            showNotification={showNotification}
          />
        )}
      </main>
      </div>
    </div>
  );
};
