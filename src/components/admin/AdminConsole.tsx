import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  Home,
  Info,
  Briefcase,
  Layers,
  Award,
  Cpu,
  GraduationCap,
  FileText,
  ListOrdered,
  Palette,
  Image as ImageIcon,
  Mail,
  Settings,
  Search,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  X,
  Upload,
  Eye,
  Download,
  Copy,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
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
} from '../../types/cms';

interface AdminConsoleProps {
  onLogout: () => void;
  onReturnToSite: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ onLogout, onReturnToSite }) => {
  const [activeModule, setActiveModule] = useState<
    | 'overview'
    | 'profile'
    | 'homepage'
    | 'about'
    | 'experience'
    | 'projects'
    | 'certifications'
    | 'skills'
    | 'education'
    | 'resume'
    | 'sections'
    | 'appearance'
    | 'media'
    | 'messages'
    | 'settings'
    | 'seo'
  >('overview');

  // CMS state hooks
  const [profile, setProfile] = useState<ProfileData>(() => cmsService.getProfile());
  const [homepage, setHomepage] = useState<HomepageSettings>(() => cmsService.getHomepageSettings());
  const [aboutSettings, setAboutSettings] = useState<AboutSectionSettings>(() => cmsService.getAboutSettings());
  const [experiences, setExperiences] = useState<ExperienceRecord[]>(() => cmsService.getExperiences(false));
  const [projects, setProjects] = useState<ProjectRecord[]>(() => cmsService.getProjects(false));
  const [certifications, setCertifications] = useState<CertificationRecord[]>(() => cmsService.getCertifications(false));
  const [skills, setSkills] = useState<SkillRecord[]>(() => cmsService.getSkills());
  const [education, setEducation] = useState<EducationRecord[]>(() => cmsService.getEducation());
  const [resume, setResume] = useState<ResumeRecord>(() => cmsService.getResumeRecord());
  const [sections, setSections] = useState<SectionConfig[]>(() => cmsService.getSectionsConfig());
  const [appearance, setAppearance] = useState<AppearanceSettings>(() => cmsService.getAppearanceSettings());
  const [messages, setMessages] = useState<ContactMessage[]>(() => cmsService.getContactMessages());
  const [settings, setSettings] = useState<SiteSettings>(() => cmsService.getSiteSettings());
  const [media, setMedia] = useState<MediaAsset[]>(() => cmsService.getMediaAssets());

  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('success');

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification(msg);
    setNotificationType(type);
    setTimeout(() => setNotification(null), 4000);
  };

  // Re-sync on CMS reactive updates
  useEffect(() => {
    return cmsService.subscribe(() => {
      setProfile(cmsService.getProfile());
      setHomepage(cmsService.getHomepageSettings());
      setAboutSettings(cmsService.getAboutSettings());
      setExperiences(cmsService.getExperiences(false));
      setProjects(cmsService.getProjects(false));
      setCertifications(cmsService.getCertifications(false));
      setSkills(cmsService.getSkills());
      setEducation(cmsService.getEducation());
      setResume(cmsService.getResumeRecord());
      setSections(cmsService.getSectionsConfig());
      setAppearance(cmsService.getAppearanceSettings());
      setMessages(cmsService.getContactMessages());
      setSettings(cmsService.getSiteSettings());
      setMedia(cmsService.getMediaAssets());
    });
  }, []);

  // Modal / Form states for CRUD
  const [editingExp, setEditingExp] = useState<ExperienceRecord | null>(null);
  const [showExpModal, setShowExpModal] = useState(false);

  const [editingProj, setEditingProj] = useState<ProjectRecord | null>(null);
  const [showProjModal, setShowProjModal] = useState(false);

  const [editingCert, setEditingCert] = useState<CertificationRecord | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  const [editingEdu, setEditingEdu] = useState<EducationRecord | null>(null);
  const [showEduModal, setShowEduModal] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Supply Chain & Logistics Systems');

  // Resume File Upload State
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await cmsService.updateProfile(profile);
    showNotification('Profile updated and published successfully.');
  };

  // Homepage Save
  const handleSaveHomepage = async (e: React.FormEvent) => {
    e.preventDefault();
    await cmsService.updateHomepageSettings(homepage);
    showNotification('Homepage wording & layout settings updated.');
  };

  // About Section Save
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    await cmsService.updateAboutSettings(aboutSettings);
    showNotification('About section content published.');
  };

  // Resume File Handler
  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showNotification('Please select a valid PDF file.', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showNotification('PDF file size exceeds 15 MB limit.', 'error');
      return;
    }

    setIsUploadingResume(true);
    try {
      const updated = await cmsService.uploadResumeFile(file, resume.buttonText);
      setResume(updated);
      showNotification(`Resume "${file.name}" uploaded and set as active.`);
    } catch (err: any) {
      showNotification('Upload failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Appearance Save
  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    await cmsService.updateAppearanceSettings(appearance);
    showNotification('Appearance settings saved.');
  };

  // Section Reorder
  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    // re-assign display orders
    updated.forEach((s, i) => {
      s.displayOrder = i + 1;
    });

    await cmsService.updateSectionsConfig(updated);
    showNotification('Section order updated.');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0E1412', color: '#F4F3EE' }}>
      {/* ========================================================
          CMS SIDEBAR NAVIGATION (16 MODULES)
          ======================================================== */}
      <aside
        style={{
          width: '270px',
          backgroundColor: '#141C19',
          borderRight: '1px solid rgba(244, 243, 238, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          {/* Header */}
          <div
            style={{
              padding: '24px 20px',
              borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                AYUSH CMS
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#8294A6', letterSpacing: '0.05em' }}>
                ADMIN CONTROL TOWER
              </div>
            </div>
            <button
              onClick={onReturnToSite}
              title="View Public Cinematic Site"
              style={{
                background: 'rgba(244, 243, 238, 0.06)',
                border: '1px solid rgba(244, 243, 238, 0.12)',
                color: '#C1C4BE',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
              }}
            >
              <ExternalLink size={14} />
            </button>
          </div>

          {/* Navigation Items */}
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
            {[
              { id: 'overview', label: '1. Dashboard', icon: LayoutDashboard },
              { id: 'profile', label: '2. Profile Manager', icon: User },
              { id: 'homepage', label: '3. Homepage Hero', icon: Home },
              { id: 'about', label: '4. About Section', icon: Info },
              { id: 'experience', label: '5. Experience', icon: Briefcase },
              { id: 'projects', label: '6. Projects', icon: Layers },
              { id: 'certifications', label: '7. Certifications', icon: Award },
              { id: 'skills', label: '8. Skills Matrix', icon: Cpu },
              { id: 'education', label: '9. Education', icon: GraduationCap },
              { id: 'resume', label: '10. Resume Manager', icon: FileText },
              { id: 'sections', label: '11. Section Manager', icon: ListOrdered },
              { id: 'appearance', label: '12. Appearance', icon: Palette },
              { id: 'media', label: '13. Media Library', icon: ImageIcon },
              {
                id: 'messages',
                label: '14. Contact Messages',
                icon: Mail,
                badge: messages.filter((m) => !m.read).length,
              },
              { id: 'settings', label: '15. Site Settings', icon: Settings },
              { id: 'seo', label: '16. SEO Management', icon: Search },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isActive ? 'rgba(130, 148, 166, 0.18)' : 'transparent',
                    color: isActive ? '#F4F3EE' : '#A7B0A9',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: isActive ? 600 : 400,
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={14} color={isActive ? '#8294A6' : '#8E948D'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      style={{
                        background: '#D9534F',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontWeight: 600,
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

        {/* User Session & Logout */}
        <div style={{ padding: '18px 16px', borderTop: '1px solid rgba(244, 243, 238, 0.08)' }}>
          <div style={{ fontSize: '11px', color: '#8E948D', marginBottom: '8px', wordBreak: 'break-all' }}>
            Authenticated Admin:<br />
            <strong style={{ color: '#F4F3EE' }}>ayushprakash0021@gmail.com</strong>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px',
              backgroundColor: 'rgba(217, 83, 79, 0.12)',
              border: '1px solid rgba(217, 83, 79, 0.3)',
              borderRadius: '6px',
              color: '#FF7B75',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'var(--font-body)',
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          CMS MAIN CONTENT AREA
          ======================================================== */}
      <main style={{ flex: 1, padding: '36px 44px', overflowY: 'auto', maxHeight: '100vh' }}>
        {/* Floating Notification */}
        {notification && (
          <div
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              backgroundColor:
                notificationType === 'error'
                  ? '#D9534F'
                  : notificationType === 'info'
                  ? '#3A506B'
                  : '#2F4858',
              color: '#FFFFFF',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 1000,
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 1: DASHBOARD OVERVIEW
            ---------------------------------------------------- */}
        {activeModule === 'overview' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 600, color: '#FFFFFF', marginBottom: '6px' }}>
                Operations Dashboard
              </h1>
              <p style={{ fontSize: '14px', color: '#A7B0A9' }}>
                Complete administrative control tower for Ayush Prakash&apos;s digital portfolio.
              </p>
            </div>

            {/* Metric Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '20px',
                marginBottom: '36px',
              }}
            >
              {[
                { label: 'Total Experiences', val: experiences.length, sub: 'Verified roles & practice' },
                { label: 'Flagship Projects', val: projects.length, sub: 'Orion-9 & ApplyVise AI' },
                { label: 'Certifications', val: certifications.length, sub: 'Verified cloud & AI credentials' },
                { label: 'Unread Messages', val: messages.filter((m) => !m.read).length, sub: 'Public contact inquiries' },
              ].map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#15201C',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(244, 243, 238, 0.08)',
                  }}
                >
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8294A6', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
                    {m.val}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8E948D', marginTop: '6px' }}>
                    {m.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Active Resume Quick Card */}
            <div
              style={{
                backgroundColor: '#15201C',
                padding: '28px',
                borderRadius: '8px',
                border: '1px solid rgba(244, 243, 238, 0.08)',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8294A6', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Current Active Curriculum Vitae
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>
                  {resume.fileName}
                </div>
                <div style={{ fontSize: '12px', color: '#8E948D', marginTop: '4px' }}>
                  Uploaded: {resume.uploadedAt} &bull; {(resume.fileSizeBytes / 1024).toFixed(1)} KB &bull;{' '}
                  Status: {resume.isPublicEnabled ? 'Publicly Available' : 'Download Disabled'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-editorial-pill"
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  <Eye size={13} />
                  <span>Preview PDF</span>
                </a>
                <button
                  onClick={() => setActiveModule('resume')}
                  className="btn-editorial-pill"
                  style={{ fontSize: '12px', padding: '8px 16px', borderColor: 'rgba(244, 243, 238, 0.6)' }}
                >
                  <Upload size={13} />
                  <span>Manage / Replace</span>
                </button>
              </div>
            </div>

            {/* Quick Navigation Shortcuts */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {[
                { title: 'Homepage Hero Wording', desc: 'Change main heading, secondary line, intro and button text', action: () => setActiveModule('homepage') },
                { title: 'Experience Manager', desc: 'Add new jobs, edit bullet points, or duplicate experiences', action: () => setActiveModule('experience') },
                { title: 'Section Manager', desc: 'Reorder sections, hide sections or publish new blocks', action: () => setActiveModule('sections') },
                { title: 'Contact Inquiries', desc: 'Read and archive client or recruiter contact transmissions', action: () => setActiveModule('messages') },
              ].map((card, i) => (
                <div
                  key={i}
                  onClick={card.action}
                  style={{
                    backgroundColor: '#15201C',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(244, 243, 238, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(244, 243, 238, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(244, 243, 238, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '6px' }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#8E948D', lineHeight: 1.5 }}>
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 2: PROFILE MANAGEMENT (Section 3.1)
            ---------------------------------------------------- */}
        {activeModule === 'profile' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Profile Manager
              </h1>
              <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                Manage verified identity credentials, longform bio, contact channels, and curriculum vitae download.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '820px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Professional Headline</label>
                <input
                  type="text"
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Full Professional Description (Bio)</label>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Direct Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>LinkedIn URL</label>
                  <input
                    type="url"
                    value={profile.linkedinUrl}
                    onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>GitHub URL</label>
                  <input
                    type="url"
                    value={profile.githubUrl}
                    onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Profile Photograph Asset URL</label>
                <input
                  type="text"
                  value={profile.profilePhoto}
                  onChange={(e) => setProfile({ ...profile, profilePhoto: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <button
                type="submit"
                className="btn-editorial-pill"
                style={{ width: 'fit-content', padding: '12px 28px', backgroundColor: 'rgba(244, 243, 238, 0.1)' }}
              >
                <Save size={14} />
                <span>Save &amp; Publish Profile</span>
              </button>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 3: HOMEPAGE HERO MANAGEMENT (Section 3.2)
            ---------------------------------------------------- */}
        {activeModule === 'homepage' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Homepage Hero Management
              </h1>
              <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                Modify the primary display headlines, introductory paragraph, CTA button text, and destination without touching code.
              </p>
            </div>

            <form onSubmit={handleSaveHomepage} style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '820px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>
                    Main Headline (Line 1 - Sans)
                  </label>
                  <input
                    type="text"
                    value={homepage.mainHeading}
                    onChange={(e) => setHomepage({ ...homepage, mainHeading: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>
                    Secondary Headline (Line 2 - Serif Italic)
                  </label>
                  <input
                    type="text"
                    value={homepage.secondaryHeading}
                    onChange={(e) => setHomepage({ ...homepage, secondaryHeading: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>
                  Left Introductory Paragraph (Narrow Column)
                </label>
                <textarea
                  rows={3}
                  value={homepage.introParagraph}
                  onChange={(e) => setHomepage({ ...homepage, introParagraph: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={homepage.ctaText}
                    onChange={(e) => setHomepage({ ...homepage, ctaText: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>
                    CTA Destination Anchor / URL
                  </label>
                  <input
                    type="text"
                    value={homepage.ctaDestination}
                    onChange={(e) => setHomepage({ ...homepage, ctaDestination: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>
                  Scroll Indicator Text
                </label>
                <input
                  type="text"
                  value={homepage.scrollIndicatorText}
                  onChange={(e) => setHomepage({ ...homepage, scrollIndicatorText: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <button
                type="submit"
                className="btn-editorial-pill"
                style={{ width: 'fit-content', padding: '12px 28px', backgroundColor: 'rgba(244, 243, 238, 0.1)' }}
              >
                <Save size={14} />
                <span>Save Homepage Settings</span>
              </button>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 4: ABOUT SECTION (Section 3.3)
            ---------------------------------------------------- */}
        {activeModule === 'about' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                About Section Management
              </h1>
              <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                Edit section headings, career thesis quote, operations philosophy, and narrative content blocks.
              </p>
            </div>

            <form onSubmit={handleSaveAbout} style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '820px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>
                  Section Headline
                </label>
                <input
                  type="text"
                  value={aboutSettings.heading}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, heading: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>
                  Featured Quote (Italic Callout)
                </label>
                <textarea
                  rows={2}
                  value={aboutSettings.quote}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, quote: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>
                  Detailed Operational Background Text
                </label>
                <textarea
                  rows={4}
                  value={aboutSettings.detailedText}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, detailedText: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Physical Operations Heading</label>
                  <input
                    type="text"
                    value={aboutSettings.physicalOpsHeading}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, physicalOpsHeading: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF', marginBottom: '8px' }}
                  />
                  <textarea
                    rows={2}
                    value={aboutSettings.physicalOpsText}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, physicalOpsText: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Digital Platforms Heading</label>
                  <input
                    type="text"
                    value={aboutSettings.digitalPlatformsHeading}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, digitalPlatformsHeading: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF', marginBottom: '8px' }}
                  />
                  <textarea
                    rows={2}
                    value={aboutSettings.digitalPlatformsText}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, digitalPlatformsText: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-editorial-pill"
                style={{ width: 'fit-content', padding: '12px 28px', backgroundColor: 'rgba(244, 243, 238, 0.1)' }}
              >
                <Save size={14} />
                <span>Save About Content</span>
              </button>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 5: EXPERIENCE MANAGEMENT (Section 3.4)
            ---------------------------------------------------- */}
        {activeModule === 'experience' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                  Experience Management
                </h1>
                <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                  Add, edit, duplicate, reorder, and publish professional positions and verified achievements.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingExp({
                    id: '',
                    employer: '',
                    jobTitle: '',
                    startDate: '',
                    endDate: 'Present',
                    description: '',
                    responsibilities: [],
                    skillsUsed: [],
                    displayOrder: experiences.length + 1,
                    status: 'published',
                  });
                  setShowExpModal(true);
                }}
                className="btn-editorial-pill"
                style={{ backgroundColor: 'rgba(244, 243, 238, 0.1)' }}
              >
                <Plus size={14} />
                <span>Add Position</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    backgroundColor: '#15201C',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(244, 243, 238, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#FFFFFF' }}>{exp.jobTitle}</h3>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: exp.status === 'published' ? 'rgba(76, 168, 130, 0.15)' : 'rgba(255, 191, 105, 0.15)',
                          color: exp.status === 'published' ? '#4CA882' : '#FFBF69',
                        }}
                      >
                        {exp.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#C1C4BE' }}>
                      {exp.employer} &bull; {exp.startDate} &mdash; {exp.endDate}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={async () => {
                        await cmsService.duplicateExperience(exp.id);
                        showNotification(`Duplicated "${exp.jobTitle}" as draft.`);
                      }}
                      className="btn-editorial-pill"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      title="Duplicate Experience"
                    >
                      <Copy size={12} />
                      <span>Clone</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingExp(exp);
                        setShowExpModal(true);
                      }}
                      className="btn-editorial-pill"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete experience "${exp.jobTitle}"?`)) {
                          await cmsService.deleteExperience(exp.id);
                          showNotification('Experience removed.');
                        }
                      }}
                      className="btn-editorial-pill"
                      style={{ padding: '6px 12px', fontSize: '12px', color: '#FF7B75' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 6: PROJECTS MANAGEMENT (Section 3.5)
            ---------------------------------------------------- */}
        {activeModule === 'projects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                  Projects Management
                </h1>
                <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                  Manage Orion-9, ApplyVise AI, and independent technical platforms.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProj({
                    id: '',
                    name: '',
                    category: 'Enterprise Systems',
                    subtitle: '',
                    description: '',
                    screenshots: [],
                    technologyStack: [],
                    features: [],
                    developmentStatus: 'In Development',
                    featured: true,
                    displayOrder: projects.length + 1,
                    status: 'published',
                  });
                  setShowProjModal(true);
                }}
                className="btn-editorial-pill"
                style={{ backgroundColor: 'rgba(244, 243, 238, 0.1)' }}
              >
                <Plus size={14} />
                <span>Add Project</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  style={{
                    backgroundColor: '#15201C',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(244, 243, 238, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>{proj.name}</h3>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(130, 148, 166, 0.15)',
                          color: '#8294A6',
                        }}
                      >
                        {proj.developmentStatus}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#C1C4BE' }}>
                      {proj.subtitle} &bull; {proj.category}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingProj(proj);
                        setShowProjModal(true);
                      }}
                      className="btn-editorial-pill"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete project "${proj.name}"?`)) {
                          await cmsService.deleteProject(proj.id);
                          showNotification('Project removed.');
                        }
                      }}
                      className="btn-editorial-pill"
                      style={{ padding: '6px 12px', fontSize: '12px', color: '#FF7B75' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 10: RESUME MANAGEMENT (Part 4 Dedicated)
            ---------------------------------------------------- */}
        {activeModule === 'resume' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Curriculum Vitae / Resume Management
              </h1>
              <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                Directly upload, replace, preview, and configure the active resume PDF served across the entire portfolio.
              </p>
            </div>

            {/* Current Active Resume Details Card */}
            <div
              style={{
                backgroundColor: '#15201C',
                padding: '32px',
                borderRadius: '8px',
                border: '1px solid rgba(244, 243, 238, 0.1)',
                marginBottom: '32px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <FileText size={22} color="#8294A6" />
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>Active Curriculum Vitae</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#8E948D', textTransform: 'uppercase' }}>File Name</div>
                  <div style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 500, marginTop: '4px' }}>{resume.fileName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#8E948D', textTransform: 'uppercase' }}>File Size</div>
                  <div style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 500, marginTop: '4px' }}>
                    {(resume.fileSizeBytes / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#8E948D', textTransform: 'uppercase' }}>Upload Date</div>
                  <div style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 500, marginTop: '4px' }}>{resume.uploadedAt}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#8E948D', textTransform: 'uppercase' }}>Public Status</div>
                  <div style={{ fontSize: '15px', color: resume.isPublicEnabled ? '#4CA882' : '#D9534F', fontWeight: 500, marginTop: '4px' }}>
                    {resume.isPublicEnabled ? 'Publicly Downloadable' : 'Disabled'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-editorial-pill"
                >
                  <Eye size={13} />
                  <span>Preview in New Tab</span>
                </a>
                <a
                  href={resume.fileUrl}
                  download={resume.fileName}
                  className="btn-editorial-pill"
                >
                  <Download size={13} />
                  <span>Download Active File</span>
                </a>
              </div>
            </div>

            {/* Replace / Upload Dedicated Dropzone */}
            <div
              style={{
                backgroundColor: '#15201C',
                padding: '36px',
                borderRadius: '8px',
                border: '2px dashed rgba(244, 243, 238, 0.2)',
                textAlign: 'center',
                marginBottom: '32px',
              }}
            >
              <Upload size={32} color="#8294A6" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '6px' }}>
                Replace Resume PDF
              </h3>
              <p style={{ fontSize: '13px', color: '#8E948D', marginBottom: '20px' }}>
                Select a new PDF document. When uploaded, the public website automatically serves this version immediately.
              </p>

              <label
                className="btn-editorial-pill"
                style={{
                  cursor: isUploadingResume ? 'wait' : 'pointer',
                  backgroundColor: 'rgba(244, 243, 238, 0.1)',
                  display: 'inline-flex',
                }}
              >
                <span>{isUploadingResume ? 'Uploading...' : 'Choose PDF File'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeFileUpload}
                  disabled={isUploadingResume}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Resume Button Text & Public Toggle Settings */}
            <div
              style={{
                backgroundColor: '#15201C',
                padding: '28px',
                borderRadius: '8px',
                border: '1px solid rgba(244, 243, 238, 0.08)',
                maxWidth: '680px',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                Resume Button Display Settings
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>
                  Public Download Button Text
                </label>
                <input
                  type="text"
                  value={resume.buttonText}
                  onChange={(e) => setResume({ ...resume, buttonText: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <input
                  type="checkbox"
                  id="resumePublic"
                  checked={resume.isPublicEnabled}
                  onChange={(e) => setResume({ ...resume, isPublicEnabled: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#8294A6' }}
                />
                <label htmlFor="resumePublic" style={{ fontSize: '13px', color: '#C1C4BE', cursor: 'pointer' }}>
                  Enable public resume downloads across the portfolio
                </label>
              </div>

              <button
                onClick={async () => {
                  await cmsService.updateResumeRecord(resume);
                  showNotification('Resume configuration updated.');
                }}
                className="btn-editorial-pill"
                style={{ backgroundColor: 'rgba(244, 243, 238, 0.1)' }}
              >
                <Save size={13} />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 11: SECTION MANAGER (Part 5 Dedicated)
            ---------------------------------------------------- */}
        {activeModule === 'sections' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Section Manager
              </h1>
              <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                Control the arrangement, visibility, and titles of every section appearing on the homepage.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '820px' }}>
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  style={{
                    backgroundColor: '#15201C',
                    padding: '20px 24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(244, 243, 238, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#8294A6', fontFamily: 'monospace', width: '20px' }}>
                      {idx + 1}.
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>{sec.title}</span>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: sec.isVisible ? 'rgba(76, 168, 130, 0.15)' : 'rgba(217, 83, 79, 0.15)',
                            color: sec.isVisible ? '#4CA882' : '#D9534F',
                          }}
                        >
                          {sec.isVisible ? 'VISIBLE' : 'HIDDEN'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#8E948D', marginTop: '2px' }}>
                        Identifier: #{sec.sectionKey} &bull; {sec.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Up / Down Reordering */}
                    <button
                      onClick={() => handleMoveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="btn-editorial-pill"
                      style={{ padding: '6px', opacity: idx === 0 ? 0.3 : 1 }}
                      title="Move Up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveSection(idx, 'down')}
                      disabled={idx === sections.length - 1}
                      className="btn-editorial-pill"
                      style={{ padding: '6px', opacity: idx === sections.length - 1 ? 0.3 : 1 }}
                      title="Move Down"
                    >
                      <ChevronDown size={14} />
                    </button>

                    {/* Toggle Visibility */}
                    <button
                      onClick={async () => {
                        await cmsService.toggleSectionVisibility(sec.id);
                        showNotification(`Section "${sec.title}" visibility toggled.`);
                      }}
                      className="btn-editorial-pill"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {sec.isVisible ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 12: APPEARANCE SETTINGS (Part 6 Dedicated)
            ---------------------------------------------------- */}
        {activeModule === 'appearance' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Website Appearance &amp; Theming
              </h1>
              <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                Control brand palettes, typographic pairings, and section rhythm without compromising the established natural editorial identity.
              </p>
            </div>

            <form onSubmit={handleSaveAppearance} style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '680px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Main Charcoal Background</label>
                  <input
                    type="text"
                    value={appearance.primaryBg}
                    onChange={(e) => setAppearance({ ...appearance, primaryBg: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Card Surface Tone</label>
                  <input
                    type="text"
                    value={appearance.cardBg}
                    onChange={(e) => setAppearance({ ...appearance, cardBg: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Primary Warm White Text</label>
                  <input
                    type="text"
                    value={appearance.textPrimary}
                    onChange={(e) => setAppearance({ ...appearance, textPrimary: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Atmospheric Blue Accent</label>
                  <input
                    type="text"
                    value={appearance.accentColor}
                    onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Section Spacing</label>
                <select
                  value={appearance.sectionSpacing}
                  onChange={(e) => setAppearance({ ...appearance, sectionSpacing: e.target.value as any })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                >
                  <option value="compact">Compact Rhythm</option>
                  <option value="normal">Standard Editorial Spacing</option>
                  <option value="spacious">Expansive Editorial Spacing</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-editorial-pill"
                style={{ width: 'fit-content', padding: '12px 28px', backgroundColor: 'rgba(244, 243, 238, 0.1)' }}
              >
                <Save size={14} />
                <span>Save Appearance Tokens</span>
              </button>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 14: CONTACT MESSAGES INBOX (Part 7)
            ---------------------------------------------------- */}
        {activeModule === 'messages' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Contact Messages &amp; Inquiries
              </h1>
              <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                Incoming inquiries dispatched directly from the public portfolio transmission form.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {messages.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#15201C', borderRadius: '8px', color: '#8E948D' }}>
                  No incoming transmissions recorded.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      backgroundColor: msg.read ? '#15201C' : '#1A2823',
                      padding: '24px',
                      borderRadius: '8px',
                      border: msg.read ? '1px solid rgba(244, 243, 238, 0.08)' : '1px solid rgba(130, 148, 166, 0.35)',
                      display: 'flex',
                      alignItems: 'start',
                      justifyContent: 'space-between',
                      gap: '20px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>{msg.name}</span>
                        {!msg.read && (
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#8294A6', color: '#111514', fontWeight: 600 }}>
                            NEW
                          </span>
                        )}
                        <span style={{ fontSize: '12px', color: '#8E948D' }}>&bull; {msg.email}</span>
                        {msg.organization && <span style={{ fontSize: '12px', color: '#8294A6' }}>({msg.organization})</span>}
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#F4F3EE', marginBottom: '8px' }}>
                        {msg.subject}
                      </div>

                      <p style={{ fontSize: '13px', color: '#C1C4BE', lineHeight: 1.6 }}>
                        {msg.message}
                      </p>

                      <div style={{ fontSize: '11px', color: '#8E948D', marginTop: '10px' }}>
                        Received: {msg.createdAt}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={async () => {
                          await cmsService.markMessageRead(msg.id, !msg.read);
                          showNotification(msg.read ? 'Marked unread' : 'Marked read');
                        }}
                        className="btn-editorial-pill"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        {msg.read ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this message?')) {
                            await cmsService.deleteMessage(msg.id);
                            showNotification('Message deleted.');
                          }
                        }}
                        className="btn-editorial-pill"
                        style={{ padding: '6px 12px', fontSize: '12px', color: '#FF7B75' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 7: CERTIFICATIONS MANAGEMENT (Section 3.6)
            ---------------------------------------------------- */}
        {activeModule === 'certifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                  Certifications Management
                </h1>
                <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                  Manage verified accreditations, credential IDs, and issuer verification authorities.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCert({
                    id: '',
                    title: '',
                    issuer: '',
                    completionDate: '',
                    category: 'Cloud Architecture',
                    highlightTag: 'Verified',
                    status: 'published',
                  });
                  setShowCertModal(true);
                }}
                className="btn-editorial-pill"
                style={{ backgroundColor: 'rgba(244, 243, 238, 0.1)' }}
              >
                <Plus size={14} />
                <span>Add Certification</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  style={{
                    backgroundColor: '#15201C',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(244, 243, 238, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{cert.title}</h3>
                    <div style={{ fontSize: '13px', color: '#C1C4BE' }}>
                      {cert.issuer} &bull; {cert.completionDate} {cert.credentialId ? `&bull; ID: ${cert.credentialId}` : ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingCert(cert);
                        setShowCertModal(true);
                      }}
                      className="btn-editorial-pill"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete certification "${cert.title}"?`)) {
                          await cmsService.deleteCertification(cert.id);
                          showNotification('Certification removed.');
                        }
                      }}
                      className="btn-editorial-pill"
                      style={{ padding: '6px 12px', fontSize: '12px', color: '#FF7B75' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 8: SKILLS MATRIX (Section 3.8)
            ---------------------------------------------------- */}
        {activeModule === 'skills' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Skills &amp; Capabilities Matrix
              </h1>
              <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                Add and organize competencies across operational and digital domains. No fake percentages.
              </p>
            </div>

            {/* Add Skill Form */}
            <div
              style={{
                backgroundColor: '#15201C',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid rgba(244, 243, 238, 0.08)',
                marginBottom: '32px',
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
              }}
            >
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. ERP Systems Integration"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div style={{ width: '280px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Domain Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                >
                  <option value="Supply Chain & Logistics Systems">Supply Chain &amp; Logistics Systems</option>
                  <option value="Business Operations & Strategy">Business Operations &amp; Strategy</option>
                  <option value="AI & Applied Product Innovation">AI &amp; Applied Product Innovation</option>
                  <option value="Full-Stack & Cloud Architecture">Full-Stack &amp; Cloud Architecture</option>
                </select>
              </div>

              <button
                onClick={async () => {
                  if (!newSkillName.trim()) return;
                  await cmsService.addSkill({
                    name: newSkillName.trim(),
                    category: newSkillCategory as any,
                    displayOrder: skills.length + 1,
                  });
                  setNewSkillName('');
                  showNotification('Skill added.');
                }}
                className="btn-editorial-pill"
                style={{ backgroundColor: 'rgba(244, 243, 238, 0.1)' }}
              >
                <Plus size={14} />
                <span>Add Capability</span>
              </button>
            </div>

            {/* List Skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {skills.map((sk) => (
                <div
                  key={sk.id}
                  style={{
                    backgroundColor: '#15201C',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid rgba(244, 243, 238, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                  }}
                >
                  <span>{sk.name}</span>
                  <button
                    onClick={async () => {
                      await cmsService.deleteSkill(sk.id);
                      showNotification('Skill removed.');
                    }}
                    style={{ background: 'none', border: 'none', color: '#FF7B75', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 9: EDUCATION MANAGEMENT (Section 3.7)
            ---------------------------------------------------- */}
        {activeModule === 'education' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                  Education &amp; Qualifications
                </h1>
                <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                  Manage verified degrees, institutions, graduation dates, and academic honors.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingEdu({
                    id: '',
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    startYear: '',
                    endYear: '',
                    highlights: [],
                    displayOrder: education.length + 1,
                  });
                  setShowEduModal(true);
                }}
                className="btn-editorial-pill"
                style={{ backgroundColor: 'rgba(244, 243, 238, 0.1)' }}
              >
                <Plus size={14} />
                <span>Add Qualification</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {education.map((edu) => (
                <div
                  key={edu.id}
                  style={{
                    backgroundColor: '#15201C',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(244, 243, 238, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                      {edu.degree} &mdash; {edu.fieldOfStudy}
                    </h3>
                    <div style={{ fontSize: '13px', color: '#C1C4BE' }}>
                      {edu.institution} &bull; {edu.startYear} &mdash; {edu.endYear}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingEdu(edu);
                        setShowEduModal(true);
                      }}
                      className="btn-editorial-pill"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete qualification "${edu.degree}"?`)) {
                          await cmsService.deleteEducation(edu.id);
                          showNotification('Qualification removed.');
                        }
                      }}
                      className="btn-editorial-pill"
                      style={{ padding: '6px 12px', fontSize: '12px', color: '#FF7B75' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 13: MEDIA LIBRARY
            ---------------------------------------------------- */}
        {activeModule === 'media' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Media Library
              </h1>
              <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                Assets, screenshots, and visual branding elements stored in the portfolio repository.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '20px',
              }}
            >
              {media.map((asset) => (
                <div
                  key={asset.id}
                  style={{
                    backgroundColor: '#15201C',
                    borderRadius: '8px',
                    border: '1px solid rgba(244, 243, 238, 0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ height: '140px', backgroundColor: '#0D1311', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {asset.type.startsWith('image/') ? (
                      <img src={asset.url} alt={asset.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <FileText size={36} color="#8294A6" />
                    )}
                  </div>
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF', wordBreak: 'break-all' }}>{asset.name}</div>
                    <div style={{ fontSize: '11px', color: '#8E948D', marginTop: '4px' }}>
                      {(asset.sizeBytes / 1024).toFixed(1)} KB &bull; {asset.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 15: SITE SETTINGS
            ---------------------------------------------------- */}
        {activeModule === 'settings' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                System &amp; Site Settings
              </h1>
              <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                Core telemetry settings, footer annotations, and system parameters.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await cmsService.updateSiteSettings(settings);
                showNotification('Site settings saved.');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '680px' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Site Title</label>
                <input
                  type="text"
                  value={settings.siteTitle}
                  onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Site Meta Description</label>
                <textarea
                  rows={3}
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '6px' }}>Footer Note</label>
                <input
                  type="text"
                  value={settings.footerNote}
                  onChange={(e) => setSettings({ ...settings, footerNote: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <button
                type="submit"
                className="btn-editorial-pill"
                style={{ width: 'fit-content', padding: '12px 28px', backgroundColor: 'rgba(244, 243, 238, 0.1)' }}
              >
                <Save size={14} />
                <span>Save System Settings</span>
              </button>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------
            MODULE 16: SEO MANAGEMENT
            ---------------------------------------------------- */}
        {activeModule === 'seo' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                SEO &amp; OpenGraph Settings
              </h1>
              <p style={{ fontSize: '13px', color: '#A7B0A9' }}>
                Social preview card generation, search engine indexing, and metadata configuration.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#15201C',
                padding: '28px',
                borderRadius: '8px',
                border: '1px solid rgba(244, 243, 238, 0.08)',
                maxWidth: '680px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '14px' }}>
                Social Preview Card (OpenGraph)
              </h3>
              <div
                style={{
                  border: '1px solid rgba(244, 243, 238, 0.15)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: '#101714',
                  marginBottom: '20px',
                }}
              >
                <div style={{ height: '180px', backgroundColor: '#1A2420', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.04em' }}>AYUSH PRAKASH</span>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#8294A6', textTransform: 'uppercase' }}>resume-portfolio.ayushprakash0021.workers.dev</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginTop: '4px' }}>
                    Ayush Prakash &mdash; Cinematic Digital Portfolio
                  </div>
                  <div style={{ fontSize: '12px', color: '#8E948D', marginTop: '4px' }}>
                    Business operations professional exploring the intersection of supply chain management, enterprise systems, artificial intelligence and digital product innovation.
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#4CA882', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} />
                <span>Canonical tags, Twitter Card tags, and robots.txt index directives active.</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          EXPERIENCE MODAL
          ======================================================== */}
      {showExpModal && editingExp && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 14, 12, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#15201C',
              borderRadius: '8px',
              border: '1px solid rgba(244, 243, 238, 0.15)',
              padding: '36px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{editingExp.id ? 'Edit Position' : 'Add Position'}</h2>
              <button onClick={() => setShowExpModal(false)} style={{ background: 'none', border: 'none', color: '#8E948D', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Employer / Organization</label>
                <input
                  type="text"
                  value={editingExp.employer}
                  onChange={(e) => setEditingExp({ ...editingExp, employer: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Job Title</label>
                <input
                  type="text"
                  value={editingExp.jobTitle}
                  onChange={(e) => setEditingExp({ ...editingExp, jobTitle: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Start Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024"
                    value={editingExp.startDate}
                    onChange={(e) => setEditingExp({ ...editingExp, startDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>End Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Present"
                    value={editingExp.endDate}
                    onChange={(e) => setEditingExp({ ...editingExp, endDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={3}
                  value={editingExp.description}
                  onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Publication Status</label>
                <select
                  value={editingExp.status}
                  onChange={(e) => setEditingExp({ ...editingExp, status: e.target.value as any })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft (Private)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={async () => {
                    if (editingExp.id) {
                      await cmsService.updateExperience(editingExp.id, editingExp);
                      showNotification('Experience updated.');
                    } else {
                      await cmsService.addExperience(editingExp);
                      showNotification('Experience added.');
                    }
                    setShowExpModal(false);
                  }}
                  className="btn-editorial-pill"
                  style={{ backgroundColor: 'rgba(244, 243, 238, 0.12)' }}
                >
                  <Save size={13} />
                  <span>Save Record</span>
                </button>
                <button
                  onClick={() => setShowExpModal(false)}
                  className="btn-editorial-pill"
                  style={{ border: 'none' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PROJECT MODAL
          ======================================================== */}
      {showProjModal && editingProj && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 14, 12, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#15201C',
              borderRadius: '8px',
              border: '1px solid rgba(244, 243, 238, 0.15)',
              padding: '36px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{editingProj.id ? 'Edit Project' : 'Add Project'}</h2>
              <button onClick={() => setShowProjModal(false)} style={{ background: 'none', border: 'none', color: '#8E948D', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Project Name</label>
                <input
                  type="text"
                  value={editingProj.name}
                  onChange={(e) => setEditingProj({ ...editingProj, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Subtitle</label>
                <input
                  type="text"
                  value={editingProj.subtitle}
                  onChange={(e) => setEditingProj({ ...editingProj, subtitle: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Detailed Description</label>
                <textarea
                  rows={3}
                  value={editingProj.description}
                  onChange={(e) => setEditingProj({ ...editingProj, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>GitHub Repo URL</label>
                  <input
                    type="url"
                    value={editingProj.repositoryUrl || ''}
                    onChange={(e) => setEditingProj({ ...editingProj, repositoryUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Live URL</label>
                  <input
                    type="url"
                    value={editingProj.projectUrl || ''}
                    onChange={(e) => setEditingProj({ ...editingProj, projectUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Development Status</label>
                <select
                  value={editingProj.developmentStatus}
                  onChange={(e) => setEditingProj({ ...editingProj, developmentStatus: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                >
                  <option value="Production / Completed">Production / Completed</option>
                  <option value="In Development">In Development</option>
                  <option value="Architecture Roadmap">Architecture Roadmap</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={async () => {
                    if (editingProj.id) {
                      await cmsService.updateProject(editingProj.id, editingProj);
                      showNotification('Project updated.');
                    } else {
                      await cmsService.addProject(editingProj);
                      showNotification('Project added.');
                    }
                    setShowProjModal(false);
                  }}
                  className="btn-editorial-pill"
                  style={{ backgroundColor: 'rgba(244, 243, 238, 0.12)' }}
                >
                  <Save size={13} />
                  <span>Save Record</span>
                </button>
                <button
                  onClick={() => setShowProjModal(false)}
                  className="btn-editorial-pill"
                  style={{ border: 'none' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CERTIFICATION MODAL
          ======================================================== */}
      {showCertModal && editingCert && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 14, 12, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#15201C',
              borderRadius: '8px',
              border: '1px solid rgba(244, 243, 238, 0.15)',
              padding: '36px',
              maxWidth: '600px',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{editingCert.id ? 'Edit Certification' : 'Add Certification'}</h2>
              <button onClick={() => setShowCertModal(false)} style={{ background: 'none', border: 'none', color: '#8E948D', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Certification Name</label>
                <input
                  type="text"
                  value={editingCert.title}
                  onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Issuing Organization</label>
                <input
                  type="text"
                  value={editingCert.issuer}
                  onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Completion Date</label>
                  <input
                    type="text"
                    value={editingCert.completionDate}
                    onChange={(e) => setEditingCert({ ...editingCert, completionDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Credential License ID</label>
                  <input
                    type="text"
                    value={editingCert.credentialId || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, credentialId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Verification URL</label>
                <input
                  type="url"
                  value={editingCert.verificationUrl || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, verificationUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={async () => {
                    if (editingCert.id) {
                      await cmsService.updateCertification(editingCert.id, editingCert);
                      showNotification('Certification updated.');
                    } else {
                      await cmsService.addCertification(editingCert);
                      showNotification('Certification added.');
                    }
                    setShowCertModal(false);
                  }}
                  className="btn-editorial-pill"
                  style={{ backgroundColor: 'rgba(244, 243, 238, 0.12)' }}
                >
                  <Save size={13} />
                  <span>Save Record</span>
                </button>
                <button onClick={() => setShowCertModal(false)} className="btn-editorial-pill" style={{ border: 'none' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          EDUCATION MODAL
          ======================================================== */}
      {showEduModal && editingEdu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 14, 12, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#15201C',
              borderRadius: '8px',
              border: '1px solid rgba(244, 243, 238, 0.15)',
              padding: '36px',
              maxWidth: '600px',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{editingEdu.id ? 'Edit Qualification' : 'Add Qualification'}</h2>
              <button onClick={() => setShowEduModal(false)} style={{ background: 'none', border: 'none', color: '#8E948D', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Degree Title</label>
                <input
                  type="text"
                  placeholder="e.g. Bachelor of Technology (B.Tech)"
                  value={editingEdu.degree}
                  onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Institution</label>
                <input
                  type="text"
                  value={editingEdu.institution}
                  onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>Start Year</label>
                  <input
                    type="text"
                    value={editingEdu.startYear}
                    onChange={(e) => setEditingEdu({ ...editingEdu, startYear: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#C1C4BE', marginBottom: '4px' }}>End / Graduation Year</label>
                  <input
                    type="text"
                    value={editingEdu.endYear}
                    onChange={(e) => setEditingEdu({ ...editingEdu, endYear: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(244, 243, 238, 0.15)', backgroundColor: '#101714', color: '#FFF' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={async () => {
                    if (editingEdu.id) {
                      await cmsService.updateEducation(editingEdu.id, editingEdu);
                      showNotification('Qualification updated.');
                    } else {
                      await cmsService.addEducation(editingEdu);
                      showNotification('Qualification added.');
                    }
                    setShowEduModal(false);
                  }}
                  className="btn-editorial-pill"
                  style={{ backgroundColor: 'rgba(244, 243, 238, 0.12)' }}
                >
                  <Save size={13} />
                  <span>Save Record</span>
                </button>
                <button onClick={() => setShowEduModal(false)} className="btn-editorial-pill" style={{ border: 'none' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
