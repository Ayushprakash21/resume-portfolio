import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  Briefcase,
  Layers,
  Award,
  Cpu,
  GraduationCap,
  Image as ImageIcon,
  FileText,
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
} from 'lucide-react';
import { authService } from '../../services/authService';
import { cmsService } from '../../services/cmsService';
import {
  ProfileData,
  ExperienceRecord,
  ProjectRecord,
  CertificationRecord,
  SkillRecord,
  EducationRecord,
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
    'overview' | 'profile' | 'experience' | 'projects' | 'certifications' | 'skills' | 'education' | 'media' | 'resume' | 'messages' | 'settings' | 'seo'
  >('overview');

  // CMS state hooks
  const [profile, setProfile] = useState<ProfileData>(() => cmsService.getProfile());
  const [experiences, setExperiences] = useState<ExperienceRecord[]>(() => cmsService.getExperiences(false));
  const [projects, setProjects] = useState<ProjectRecord[]>(() => cmsService.getProjects(false));
  const [certifications, setCertifications] = useState<CertificationRecord[]>(() => cmsService.getCertifications(false));
  const [skills, setSkills] = useState<SkillRecord[]>(() => cmsService.getSkills());
  const [education, setEducation] = useState<EducationRecord[]>(() => cmsService.getEducation());
  const [messages, setMessages] = useState<ContactMessage[]>(() => cmsService.getContactMessages());
  const [settings, setSettings] = useState<SiteSettings>(() => cmsService.getSiteSettings());
  const [media, setMedia] = useState<MediaAsset[]>(() => cmsService.getMediaAssets());

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Re-sync on CMS updates
  useEffect(() => {
    return cmsService.subscribe(() => {
      setProfile(cmsService.getProfile());
      setExperiences(cmsService.getExperiences(false));
      setProjects(cmsService.getProjects(false));
      setCertifications(cmsService.getCertifications(false));
      setSkills(cmsService.getSkills());
      setEducation(cmsService.getEducation());
      setMessages(cmsService.getContactMessages());
      setSettings(cmsService.getSiteSettings());
      setMedia(cmsService.getMediaAssets());
    });
  }, []);

  // Modal / Form state for Experience CRUD
  const [editingExp, setEditingExp] = useState<ExperienceRecord | null>(null);
  const [showExpModal, setShowExpModal] = useState(false);

  // Modal / Form state for Project CRUD
  const [editingProj, setEditingProj] = useState<ProjectRecord | null>(null);
  const [showProjModal, setShowProjModal] = useState(false);

  // Modal / Form state for Certification CRUD
  const [editingCert, setEditingCert] = useState<CertificationRecord | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  // Modal / Form state for Education CRUD
  const [editingEdu, setEditingEdu] = useState<EducationRecord | null>(null);
  const [showEduModal, setShowEduModal] = useState(false);

  // Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillRecord['category']>('Supply Chain & Logistics Systems');
  const [newSkillDesc, setNewSkillDesc] = useState('');

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#07090D', color: '#F5F7FA' }}>
      {/* CMS Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#0C1118',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
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
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                AYUSH CMS
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#45D6FF' }}>
                ADMIN CONTROL TOWER
              </div>
            </div>
            <button
              onClick={onReturnToSite}
              title="View Public 3D Site"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#A7B2C0',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
              }}
            >
              <ExternalLink size={14} />
            </button>
          </div>

          {/* 12 Navigation Modules */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {[
              { id: 'overview', label: '1. Dashboard', icon: LayoutDashboard },
              { id: 'profile', label: '2. Profile Manager', icon: User },
              { id: 'experience', label: '3. Experience', icon: Briefcase },
              { id: 'projects', label: '4. Projects', icon: Layers },
              { id: 'certifications', label: '5. Certifications', icon: Award },
              { id: 'skills', label: '6. Skills & Knowledge', icon: Cpu },
              { id: 'education', label: '7. Education', icon: GraduationCap },
              { id: 'media', label: '8. Media Library', icon: ImageIcon },
              { id: 'resume', label: '9. Resume PDF', icon: FileText },
              { id: 'messages', label: '10. Contact Messages', icon: Mail, badge: messages.filter((m) => !m.read).length },
              { id: 'settings', label: '11. Site Settings', icon: Settings },
              { id: 'seo', label: '12. SEO Management', icon: Search },
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
                    background: isActive ? 'rgba(69, 214, 255, 0.15)' : 'transparent',
                    color: isActive ? '#45D6FF' : '#A7B2C0',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: isActive ? 600 : 400,
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      style={{
                        background: '#FF6B75',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontFamily: 'JetBrains Mono, monospace',
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
        <div style={{ padding: '20px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '12px', color: '#738195', marginBottom: '8px', wordBreak: 'break-all' }}>
            Authenticated:<br />
            <strong style={{ color: '#F5F7FA' }}>ayushprakash0021@gmail.com</strong>
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
              backgroundColor: 'rgba(255, 107, 117, 0.1)',
              border: '1px solid rgba(255, 107, 117, 0.3)',
              borderRadius: '6px',
              color: '#FF6B75',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main CMS Workspace */}
      <main style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>
        {/* Floating Notification */}
        {notification && (
          <div
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 100,
              backgroundColor: '#111923',
              border: '1px solid #42D6A4',
              color: '#42D6A4',
              padding: '12px 20px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </div>
        )}

        {/* 1. DASHBOARD */}
        {activeModule === 'overview' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
                Console Dashboard
              </h1>
              <p style={{ color: '#A7B2C0', fontSize: '14px' }}>
                Synchronized CMS state. All edits made in this console immediately reflect on the live public website and 3D environment.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '36px' }}>
              <div style={{ background: '#111923', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#738195' }}>PUBLISHED PROJECTS</div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 700, color: '#45D6FF', marginTop: '6px' }}>
                  {projects.filter((p) => p.status === 'published').length}
                </div>
              </div>

              <div style={{ background: '#111923', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#738195' }}>CAREER RECORDS</div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 700, color: '#8AB4FF', marginTop: '6px' }}>
                  {experiences.length}
                </div>
              </div>

              <div style={{ background: '#111923', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#738195' }}>ACCREDITATIONS</div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 700, color: '#E5B94E', marginTop: '6px' }}>
                  {certifications.length}
                </div>
              </div>

              <div style={{ background: '#111923', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#738195' }}>INCOMING INQUIRIES</div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 700, color: '#42D6A4', marginTop: '6px' }}>
                  {messages.length}
                </div>
              </div>
            </div>

            <div style={{ background: '#111923', padding: '28px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                Recent Content Operations Log
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px 14px', background: '#151E29', borderRadius: '6px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Orion-9 actual screenshots & supply chain flow connected</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#42D6A4' }}>ACTIVE</span>
                </div>
                <div style={{ padding: '10px 14px', background: '#151E29', borderRadius: '6px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>ApplyVise AI grounded career intelligence workflow synced</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#A78BFA' }}>ACTIVE</span>
                </div>
                <div style={{ padding: '10px 14px', background: '#151E29', borderRadius: '6px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Active Resume version validated on edge storage</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#45D6FF' }}>ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PROFILE MANAGEMENT */}
        {activeModule === 'profile' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
                Profile Management
              </h1>
              <p style={{ color: '#A7B2C0', fontSize: '14px' }}>
                Manage professional identity, verified coordinates, portrait, and status.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await cmsService.updateProfile(profile);
                showNotification('Profile updated successfully.');
              }}
              style={{
                background: '#111923',
                padding: '32px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#738195', marginBottom: '6px' }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#738195', marginBottom: '6px' }}>
                  PROFESSIONAL HEADLINE
                </label>
                <input
                  type="text"
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#738195', marginBottom: '6px' }}>
                  BIOGRAPHY / CAREER THESIS
                </label>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#738195', marginBottom: '6px' }}>
                  PORTRAIT IMAGE URL
                </label>
                <input
                  type="text"
                  value={profile.profilePhoto}
                  onChange={(e) => setProfile({ ...profile, profilePhoto: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#738195', marginBottom: '6px' }}>
                  EMAIL
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#738195', marginBottom: '6px' }}>
                  LINKEDIN
                </label>
                <input
                  type="url"
                  value={profile.linkedinUrl}
                  onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#738195', marginBottom: '6px' }}>
                  GITHUB
                </label>
                <input
                  type="url"
                  value={profile.githubUrl}
                  onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#738195', marginBottom: '6px' }}>
                  AVAILABILITY STATUS
                </label>
                <input
                  type="text"
                  value={profile.availabilityStatus}
                  onChange={(e) => setProfile({ ...profile, availabilityStatus: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#45D6FF',
                    color: '#07090D',
                    fontWeight: 600,
                    padding: '12px 28px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Save size={16} />
                  <span>Save Profile Updates</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. EXPERIENCE MANAGEMENT (CRUD) */}
        {activeModule === 'experience' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
                  Experience Management
                </h1>
                <p style={{ color: '#A7B2C0', fontSize: '14px' }}>
                  Full CRUD: Create, edit, reorder, and remove employment records.
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
                style={{
                  backgroundColor: 'rgba(69, 214, 255, 0.15)',
                  border: '1px solid #45D6FF',
                  color: '#45D6FF',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                }}
              >
                <Plus size={16} />
                <span>Add Employment Record</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    background: '#111923',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>
                      {exp.jobTitle}
                    </h3>
                    <div style={{ fontSize: '14px', color: '#45D6FF', margin: '4px 0 8px' }}>
                      {exp.employer} ({exp.startDate} – {exp.endDate})
                    </div>
                    <p style={{ fontSize: '13px', color: '#A7B2C0', maxWidth: '720px' }}>
                      {exp.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingExp(exp);
                        setShowExpModal(true);
                      }}
                      style={{ background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#45D6FF', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete experience: ${exp.jobTitle}?`)) {
                          await cmsService.deleteExperience(exp.id);
                          showNotification('Experience deleted.');
                        }
                      }}
                      style={{ background: 'rgba(255, 107, 117, 0.1)', border: '1px solid rgba(255, 107, 117, 0.3)', color: '#FF6B75', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Exp Modal */}
            {showExpModal && editingExp && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 100 }}>
                <div style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', background: '#0C1118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '32px' }}>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', marginBottom: '20px' }}>
                    {editingExp.id ? 'Edit Employment Record' : 'Add New Employment Record'}
                  </h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (editingExp.id) {
                        await cmsService.updateExperience(editingExp.id, editingExp);
                        showNotification('Experience updated.');
                      } else {
                        await cmsService.addExperience(editingExp);
                        showNotification('Experience created.');
                      }
                      setShowExpModal(false);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>EMPLOYER</label>
                      <input type="text" required value={editingExp.employer} onChange={(e) => setEditingExp({ ...editingExp, employer: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>JOB TITLE</label>
                      <input type="text" required value={editingExp.jobTitle} onChange={(e) => setEditingExp({ ...editingExp, jobTitle: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>START DATE</label>
                        <input type="text" required value={editingExp.startDate} onChange={(e) => setEditingExp({ ...editingExp, startDate: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>END DATE</label>
                        <input type="text" required value={editingExp.endDate} onChange={(e) => setEditingExp({ ...editingExp, endDate: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>DESCRIPTION</label>
                      <textarea rows={3} required value={editingExp.description} onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <button type="submit" style={{ flex: 1, padding: '10px', background: '#45D6FF', color: '#07090D', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Save Record
                      </button>
                      <button type="button" onClick={() => setShowExpModal(false)} style={{ flex: 1, padding: '10px', background: '#151E29', color: '#A7B2C0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. PROJECT MANAGEMENT (CRUD) */}
        {activeModule === 'projects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
                  Project Management
                </h1>
                <p style={{ color: '#A7B2C0', fontSize: '14px' }}>
                  Manage Orion-9, ApplyVise AI, and other architectural platforms.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProj({
                    id: '',
                    name: '',
                    category: 'Systems Tech',
                    subtitle: '',
                    description: '',
                    screenshots: [],
                    technologyStack: [],
                    features: [],
                    developmentStatus: 'Active Development',
                    featured: false,
                    displayOrder: projects.length + 1,
                    status: 'published',
                  });
                  setShowProjModal(true);
                }}
                style={{
                  backgroundColor: 'rgba(69, 214, 255, 0.15)',
                  border: '1px solid #45D6FF',
                  color: '#45D6FF',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                }}
              >
                <Plus size={16} />
                <span>Add Project</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  style={{
                    background: '#111923',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>
                      {proj.name}
                    </h3>
                    <div style={{ fontSize: '13px', color: '#A78BFA', margin: '4px 0 6px' }}>
                      {proj.subtitle}
                    </div>
                    <p style={{ fontSize: '13px', color: '#A7B2C0', maxWidth: '720px' }}>
                      {proj.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingProj(proj);
                        setShowProjModal(true);
                      }}
                      style={{ background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#45D6FF', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete project: ${proj.name}?`)) {
                          await cmsService.deleteProject(proj.id);
                          showNotification('Project deleted.');
                        }
                      }}
                      style={{ background: 'rgba(255, 107, 117, 0.1)', border: '1px solid rgba(255, 107, 117, 0.3)', color: '#FF6B75', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Proj Modal */}
            {showProjModal && editingProj && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 100 }}>
                <div style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', background: '#0C1118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '32px' }}>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', marginBottom: '20px' }}>
                    {editingProj.id ? 'Edit Project' : 'Add New Project'}
                  </h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (editingProj.id) {
                        await cmsService.updateProject(editingProj.id, editingProj);
                        showNotification('Project updated.');
                      } else {
                        await cmsService.addProject(editingProj);
                        showNotification('Project created.');
                      }
                      setShowProjModal(false);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>PROJECT NAME</label>
                      <input type="text" required value={editingProj.name} onChange={(e) => setEditingProj({ ...editingProj, name: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>SUBTITLE</label>
                      <input type="text" required value={editingProj.subtitle} onChange={(e) => setEditingProj({ ...editingProj, subtitle: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>DESCRIPTION</label>
                      <textarea rows={3} required value={editingProj.description} onChange={(e) => setEditingProj({ ...editingProj, description: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <button type="submit" style={{ flex: 1, padding: '10px', background: '#45D6FF', color: '#07090D', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Save Project
                      </button>
                      <button type="button" onClick={() => setShowProjModal(false)} style={{ flex: 1, padding: '10px', background: '#151E29', color: '#A7B2C0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. CERTIFICATION MANAGEMENT (CRUD) */}
        {activeModule === 'certifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
                  Certification Management
                </h1>
                <p style={{ color: '#A7B2C0', fontSize: '14px' }}>
                  Manage verified credentials and official verification links.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCert({
                    id: '',
                    title: '',
                    issuer: '',
                    completionDate: 'Verified Credential',
                    category: 'Cloud & Systems',
                    highlightTag: 'VERIFIED CREDENTIAL',
                    status: 'published',
                  });
                  setShowCertModal(true);
                }}
                style={{
                  backgroundColor: 'rgba(229, 185, 78, 0.15)',
                  border: '1px solid #E5B94E',
                  color: '#E5B94E',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                }}
              >
                <Plus size={16} />
                <span>Add Certification</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {certifications.map((cert) => (
                <div key={cert.id} style={{ background: '#111923', padding: '20px', borderRadius: '8px', border: '1px solid rgba(229, 185, 78, 0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#E5B94E', fontFamily: 'JetBrains Mono, monospace' }}>
                      {cert.highlightTag}
                    </span>
                    <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: '6px 0' }}>
                      {cert.title}
                    </h3>
                    <div style={{ fontSize: '13px', color: '#A7B2C0' }}>{cert.issuer}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button onClick={() => { setEditingCert(cert); setShowCertModal(true); }} style={{ background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#E5B94E', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                      <Edit size={13} />
                    </button>
                    <button onClick={async () => { if (confirm(`Delete: ${cert.title}?`)) { await cmsService.deleteCertification(cert.id); showNotification('Certification deleted.'); } }} style={{ background: 'rgba(255, 107, 117, 0.1)', border: '1px solid rgba(255, 107, 117, 0.3)', color: '#FF6B75', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cert Modal */}
            {showCertModal && editingCert && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 100 }}>
                <div style={{ width: '100%', maxWidth: '520px', background: '#0C1118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '32px' }}>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', marginBottom: '20px' }}>
                    {editingCert.id ? 'Edit Certification' : 'Add Certification'}
                  </h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (editingCert.id) {
                        await cmsService.updateCertification(editingCert.id, editingCert);
                        showNotification('Certification updated.');
                      } else {
                        await cmsService.addCertification(editingCert);
                        showNotification('Certification created.');
                      }
                      setShowCertModal(false);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>TITLE</label>
                      <input type="text" required value={editingCert.title} onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>ISSUER</label>
                      <input type="text" required value={editingCert.issuer} onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>VERIFICATION URL</label>
                      <input type="url" value={editingCert.verificationUrl || ''} onChange={(e) => setEditingCert({ ...editingCert, verificationUrl: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <button type="submit" style={{ flex: 1, padding: '10px', background: '#E5B94E', color: '#07090D', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Save
                      </button>
                      <button type="button" onClick={() => setShowCertModal(false)} style={{ flex: 1, padding: '10px', background: '#151E29', color: '#A7B2C0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. SKILLS MANAGEMENT */}
        {activeModule === 'skills' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
                Skills & Knowledge Management
              </h1>
              <p style={{ color: '#A7B2C0', fontSize: '14px' }}>
                Manage domain capabilities without misleading proficiency percentages.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newSkillName) return;
                await cmsService.addSkill({
                  name: newSkillName,
                  category: newSkillCategory,
                  description: newSkillDesc,
                  displayOrder: skills.length + 1,
                });
                setNewSkillName('');
                setNewSkillDesc('');
                showNotification('Skill added successfully.');
              }}
              style={{
                background: '#111923',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                marginBottom: '28px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
                alignItems: 'end',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>SKILL NAME</label>
                <input type="text" required placeholder="e.g. Cross-Docking" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>CATEGORY</label>
                <select value={newSkillCategory} onChange={(e) => setNewSkillCategory(e.target.value as any)} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }}>
                  <option value="Supply Chain & Logistics Systems">Supply Chain & Logistics Systems</option>
                  <option value="Business Operations & Strategy">Business Operations & Strategy</option>
                  <option value="AI & Applied Product Innovation">AI & Applied Product Innovation</option>
                  <option value="Full-Stack & Cloud Architecture">Full-Stack & Cloud Architecture</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>DESCRIPTION</label>
                <input type="text" placeholder="Operational context..." value={newSkillDesc} onChange={(e) => setNewSkillDesc(e.target.value)} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
              </div>
              <button type="submit" style={{ padding: '10px 18px', background: '#45D6FF', color: '#07090D', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer', height: '42px' }}>
                Add Skill
              </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {skills.map((sk) => (
                <div key={sk.id} style={{ background: '#111923', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '14px' }}>{sk.name}</div>
                    <div style={{ fontSize: '11px', color: '#45D6FF' }}>{sk.category}</div>
                  </div>
                  <button onClick={async () => { await cmsService.deleteSkill(sk.id); showNotification('Skill removed.'); }} style={{ background: 'none', border: 'none', color: '#738195', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. EDUCATION MANAGEMENT (CRUD) */}
        {activeModule === 'education' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
                  Education Management
                </h1>
                <p style={{ color: '#A7B2C0', fontSize: '14px' }}>
                  Manage verified academic qualifications and degree honors.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingEdu({
                    id: 'edu-' + Date.now(),
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
                style={{
                  backgroundColor: 'rgba(69, 214, 255, 0.15)',
                  border: '1px solid #45D6FF',
                  color: '#45D6FF',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                }}
              >
                <Plus size={16} />
                <span>Add Education Record</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {education.map((edu) => (
                <div key={edu.id} style={{ background: '#111923', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>{edu.degree}</h3>
                    <div style={{ fontSize: '14px', color: '#8AB4FF' }}>{edu.fieldOfStudy} • {edu.institution}</div>
                    <div style={{ fontSize: '12px', color: '#738195', marginTop: '4px' }}>{edu.startYear} — {edu.endYear}</div>
                  </div>
                  <button onClick={() => { setEditingEdu(edu); setShowEduModal(true); }} style={{ background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#45D6FF', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                    <Edit size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Edu Modal */}
            {showEduModal && editingEdu && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 100 }}>
                <div style={{ width: '100%', maxWidth: '520px', background: '#0C1118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '32px' }}>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', marginBottom: '20px' }}>
                    Edit Academic Record
                  </h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await cmsService.updateEducation(editingEdu.id, editingEdu);
                      showNotification('Education record saved.');
                      setShowEduModal(false);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>DEGREE</label>
                      <input type="text" required value={editingEdu.degree} onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>FIELD OF STUDY</label>
                      <input type="text" required value={editingEdu.fieldOfStudy} onChange={(e) => setEditingEdu({ ...editingEdu, fieldOfStudy: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>INSTITUTION</label>
                      <input type="text" required value={editingEdu.institution} onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>START YEAR</label>
                        <input type="text" required value={editingEdu.startYear} onChange={(e) => setEditingEdu({ ...editingEdu, startYear: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>END YEAR</label>
                        <input type="text" required value={editingEdu.endYear} onChange={(e) => setEditingEdu({ ...editingEdu, endYear: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <button type="submit" style={{ flex: 1, padding: '10px', background: '#45D6FF', color: '#07090D', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Save Education
                      </button>
                      <button type="button" onClick={() => setShowEduModal(false)} style={{ flex: 1, padding: '10px', background: '#151E29', color: '#A7B2C0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. MEDIA LIBRARY */}
        {activeModule === 'media' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
                Media Library
              </h1>
              <p style={{ color: '#A7B2C0', fontSize: '14px' }}>
                Manage project screenshots, certificates, and assets.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {media.map((item) => (
                <div key={item.id} style={{ background: '#111923', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '120px', background: '#151E29', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', wordBreak: 'break-all', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#738195', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{(item.sizeBytes / 1024).toFixed(0)} KB</span>
                      <button onClick={async () => { await cmsService.deleteMediaAsset(item.id); showNotification('Asset deleted.'); }} style={{ background: 'none', border: 'none', color: '#FF6B75', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. RESUME PDF */}
        {activeModule === 'resume' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
                Resume Management
              </h1>
              <p style={{ color: '#A7B2C0', fontSize: '14px' }}>
                Manage and preview the active PDF resume linked across the public website.
              </p>
            </div>

            <div style={{ background: '#111923', padding: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '8px', backgroundColor: 'rgba(69, 214, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#45D6FF' }}>
                  <FileText size={28} />
                </div>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#42D6A4' }}>● ACTIVE RESUME LOADED</div>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', color: '#FFFFFF', margin: '4px 0' }}>Ayush_Prakash_Resume.pdf</h3>
                  <div style={{ fontSize: '13px', color: '#738195' }}>Target: <code style={{ color: '#45D6FF' }}>{profile.resumeUrl}</code></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <a href={profile.resumeUrl} target="_blank" rel="noreferrer" style={{ backgroundColor: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', padding: '10px 20px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', textDecoration: 'none' }}>
                  <Eye size={15} />
                  <span>Download Test / Preview Active</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 10. CONTACT MESSAGES */}
        {activeModule === 'messages' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
                Contact Messages
              </h1>
              <p style={{ color: '#A7B2C0', fontSize: '14px' }}>
                Review incoming dispatches from the public editorial contact form.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#111923', borderRadius: '8px', color: '#738195' }}>
                  No messages in inbox.
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} style={{ background: msg.read ? '#111923' : '#151E29', padding: '24px', borderRadius: '8px', border: msg.read ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(69, 214, 255, 0.4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '16px' }}>{msg.name}</span>
                          {msg.organization && <span style={{ fontSize: '12px', color: '#45D6FF' }}>({msg.organization})</span>}
                          {!msg.read && <span style={{ fontSize: '10px', background: '#FF6B75', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px' }}>NEW</span>}
                        </div>
                        <div style={{ fontSize: '13px', color: '#738195' }}>{msg.email} • {new Date(msg.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={async () => { await cmsService.markMessageRead(msg.id, !msg.read); showNotification(msg.read ? 'Marked unread' : 'Marked read'); }} style={{ background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#A7B2C0', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                          {msg.read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        <button onClick={async () => { await cmsService.deleteMessage(msg.id); showNotification('Message deleted.'); }} style={{ background: 'rgba(255, 107, 117, 0.1)', border: '1px solid rgba(255, 107, 117, 0.3)', color: '#FF6B75', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#F5F7FA', margin: '8px 0' }}>{msg.subject}</div>
                    <p style={{ fontSize: '13px', color: '#A7B2C0', lineHeight: 1.6 }}>{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 11. WEBSITE SETTINGS */}
        {activeModule === 'settings' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
                Website Settings
              </h1>
              <p style={{ color: '#A7B2C0', fontSize: '14px' }}>
                Global navigation labels, availability note, and footer configuration.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await cmsService.updateSiteSettings(settings);
                showNotification('Site settings updated.');
              }}
              style={{ background: '#111923', padding: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>AVAILABILITY NOTE</label>
                <input type="text" value={settings.availabilityNote} onChange={(e) => setSettings({ ...settings, availabilityNote: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>FOOTER CONTENT</label>
                <input type="text" value={settings.footerNote} onChange={(e) => setSettings({ ...settings, footerNote: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
              </div>
              <button type="submit" style={{ alignSelf: 'flex-start', backgroundColor: '#45D6FF', color: '#07090D', fontWeight: 600, padding: '12px 28px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={16} />
                <span>Save Settings</span>
              </button>
            </form>
          </div>
        )}

        {/* 12. SEO MANAGEMENT */}
        {activeModule === 'seo' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
                SEO & Metadata Management
              </h1>
              <p style={{ color: '#A7B2C0', fontSize: '14px' }}>
                Search engine indexing tags, Open Graph meta, and page titles.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await cmsService.updateSiteSettings(settings);
                showNotification('SEO parameters saved.');
              }}
              style={{ background: '#111923', padding: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>GLOBAL META TITLE</label>
                <input type="text" value={settings.siteTitle} onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#738195', marginBottom: '4px' }}>META DESCRIPTION</label>
                <textarea rows={3} value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} style={{ width: '100%', padding: '10px', background: '#151E29', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', borderRadius: '6px' }} />
              </div>
              <button type="submit" style={{ alignSelf: 'flex-start', backgroundColor: '#45D6FF', color: '#07090D', fontWeight: 600, padding: '12px 28px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={16} />
                <span>Save SEO Parameters</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
