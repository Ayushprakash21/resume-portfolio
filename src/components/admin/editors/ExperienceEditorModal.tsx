import React, { useState } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Search,
  CheckCircle2,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { ExperienceRecord, ExperienceMediaItem, SkillRecord } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';

interface ExperienceEditorModalProps {
  initialExperience: ExperienceRecord | null;
  allSkills: SkillRecord[];
  onSave: (saved: ExperienceRecord) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const ExperienceEditorModal: React.FC<ExperienceEditorModalProps> = ({
  initialExperience,
  allSkills,
  onSave,
  onDelete,
  onClose,
  showNotification,
}) => {
  const isEditing = !!initialExperience;

  const [form, setForm] = useState<Omit<ExperienceRecord, 'id'>>(() => {
    if (initialExperience) {
      return {
        employer: initialExperience.employer,
        jobTitle: initialExperience.jobTitle,
        employmentType: initialExperience.employmentType || 'Full-time',
        location: initialExperience.location || 'Bengaluru, India',
        locationType: initialExperience.locationType || 'Hybrid',
        startMonth: initialExperience.startMonth || 'January',
        startYear: initialExperience.startYear || '2024',
        endMonth: initialExperience.endMonth || 'December',
        endYear: initialExperience.endYear || '2024',
        startDate: initialExperience.startDate || 'Jan 2024',
        endDate: initialExperience.endDate || 'Present',
        isCurrent: initialExperience.isCurrent ?? true,
        description: initialExperience.description || '',
        responsibilities: initialExperience.responsibilities || [],
        achievements: initialExperience.achievements || [],
        impact: initialExperience.impact || '',
        skillsUsed: initialExperience.skillsUsed || [],
        logoUrl: initialExperience.logoUrl || '',
        mediaItems: initialExperience.mediaItems || [],
        displayOrder: initialExperience.displayOrder || 1,
        status: initialExperience.status || 'published',
      };
    }
    return {
      employer: '',
      jobTitle: '',
      employmentType: 'Full-time',
      location: 'Bengaluru, India',
      locationType: 'Hybrid',
      startMonth: 'January',
      startYear: new Date().getFullYear().toString(),
      endMonth: 'December',
      endYear: new Date().getFullYear().toString(),
      startDate: 'Jan ' + new Date().getFullYear(),
      endDate: 'Present',
      isCurrent: true,
      description: '',
      responsibilities: [],
      achievements: [],
      impact: '',
      skillsUsed: [],
      logoUrl: '',
      mediaItems: [],
      displayOrder: 1,
      status: 'published',
    };
  });

  // Skills input state
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [newResponsibilityInput, setNewResponsibilityInput] = useState('');

  // Media upload state
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddResponsibility = () => {
    if (!newResponsibilityInput.trim()) return;
    updateField('responsibilities', [...form.responsibilities, newResponsibilityInput.trim()]);
    setNewResponsibilityInput('');
  };

  const handleRemoveResponsibility = (idx: number) => {
    updateField(
      'responsibilities',
      form.responsibilities.filter((_, i) => i !== idx)
    );
  };

  // Skill tag add/remove
  const handleAddSkill = async (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed || form.skillsUsed.includes(trimmed)) return;

    // Automatically ensure skill is in central library
    await cmsService.ensureSkill(trimmed, 'Experience Capabilities');
    updateField('skillsUsed', [...form.skillsUsed, trimmed]);
    setSkillSearchQuery('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    updateField(
      'skillsUsed',
      form.skillsUsed.filter((s) => s !== skillToRemove)
    );
  };

  // Media upload handler
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    try {
      const newItems: ExperienceMediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isDoc = file.type === 'application/pdf';
        const asset = await cmsService.uploadMediaFile(
          file,
          isDoc ? 'work-sample' : 'screenshot',
          `${form.employer || 'Work'} - ${file.name}`
        );

        newItems.push({
          id: 'exp-med-' + Date.now() + '-' + i,
          url: asset.url,
          title: file.name.replace(/\.[^/.]+$/, ''),
          caption: `${form.jobTitle || 'Role'} work deliverable`,
          altText: file.name,
          type: isDoc ? 'document' : 'image',
        });
      }

      updateField('mediaItems', [...(form.mediaItems || []), ...newItems]);
      showNotification(`${newItems.length} media file(s) attached to experience.`);
    } catch (err: any) {
      showNotification('Media upload failed: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    updateField(
      'mediaItems',
      (form.mediaItems || []).filter((m) => m.id !== mediaId)
    );
  };

  const handleUpdateMediaCaption = (mediaId: string, caption: string) => {
    updateField(
      'mediaItems',
      (form.mediaItems || []).map((m) => (m.id === mediaId ? { ...m, caption } : m))
    );
  };

  const handleSubmit = async (targetStatus: 'published' | 'draft') => {
    if (!form.jobTitle.trim() || !form.employer.trim()) {
      showNotification('Job title and Organization name are required.', 'error');
      return;
    }

    const computedStartDate = `${form.startMonth?.slice(0, 3)} ${form.startYear}`;
    const computedEndDate = form.isCurrent
      ? 'Present'
      : `${form.endMonth?.slice(0, 3)} ${form.endYear}`;

    const recordPayload = {
      ...form,
      startDate: computedStartDate,
      endDate: computedEndDate,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (isEditing && initialExperience) {
        await cmsService.updateExperience(initialExperience.id, recordPayload);
        onSave({ ...recordPayload, id: initialExperience.id });
        showNotification(
          targetStatus === 'published'
            ? 'Experience updated and published.'
            : 'Experience draft saved.'
        );
      } else {
        const created = await cmsService.addExperience(recordPayload);
        onSave(created);
        showNotification(
          targetStatus === 'published'
            ? 'Experience created and published.'
            : 'Experience draft saved.'
        );
      }
      onClose();
    } catch (err: any) {
      showNotification('Save failed: ' + (err.message || 'Firebase error'), 'error');
    }
  };

  // Filter skills query
  const filteredSkills = allSkills
    .map((s) => s.name)
    .filter(
      (name) =>
        name.toLowerCase().includes(skillSearchQuery.toLowerCase()) &&
        !form.skillsUsed.includes(name)
    );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 'clamp(8px, 2.5vw, 20px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#0F1015',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '12px',
          maxWidth: '820px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Sticky Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#18211D',
            flexShrink: 0,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 600,
                color: '#F4F3EE',
                margin: 0,
              }}
            >
              {isEditing ? 'Edit Experience' : 'Add Experience'}
            </h3>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: '#A7B0A9',
              }}
            >
              LinkedIn-style employment record with timeline, key deliverables, and media samples.
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#A7B0A9',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Title & Employer */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#A7B0A9',
                    marginBottom: '6px',
                  }}
                >
                  Job Title <span style={{ color: '#D9534F' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  placeholder="e.g. Operations & Systems Specialist"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#A7B0A9',
                    marginBottom: '6px',
                  }}
                >
                  Company / Organization <span style={{ color: '#D9534F' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.employer}
                  onChange={(e) => updateField('employer', e.target.value)}
                  placeholder="e.g. Enterprise Operations Logistics"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Employment Type, Location & Location Type */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#A7B0A9',
                    marginBottom: '6px',
                  }}
                >
                  Employment Type
                </label>
                <select
                  value={form.employmentType}
                  onChange={(e) => updateField('employmentType', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Self-employed / Founder">Self-employed / Founder</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#A7B0A9',
                    marginBottom: '6px',
                  }}
                >
                  Location
                </label>
                <input
                  type="text"
                  value={form.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g. Bengaluru, India"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#A7B0A9',
                    marginBottom: '6px',
                  }}
                >
                  Location Type
                </label>
                <select
                  value={form.locationType}
                  onChange={(e) => updateField('locationType', e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>

            {/* Timeline Dates & Currently Working Checkbox */}
            <div
              style={{
                backgroundColor: '#0E1412',
                border: '1px solid rgba(244, 243, 238, 0.08)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: '#F4F3EE',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.isCurrent}
                    onChange={(e) => updateField('isCurrent', e.target.checked)}
                    style={{ accentColor: '#4A5749', width: '16px', height: '16px' }}
                  />
                  <span>I am currently working in this role</span>
                </label>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                }}
              >
                {/* Start Date */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: '#A7B0A9',
                      marginBottom: '6px',
                    }}
                  >
                    Start Date
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={form.startMonth}
                      onChange={(e) => updateField('startMonth', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#141C19',
                        border: '1px solid rgba(244, 243, 238, 0.12)',
                        color: '#F4F3EE',
                        fontSize: '13px',
                      }}
                    >
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={form.startYear}
                      onChange={(e) => updateField('startYear', e.target.value)}
                      placeholder="YYYY"
                      style={{
                        width: '80px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#141C19',
                        border: '1px solid rgba(244, 243, 238, 0.12)',
                        color: '#F4F3EE',
                        fontSize: '13px',
                        textAlign: 'center',
                      }}
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: form.isCurrent ? '#6B7F72' : '#A7B0A9',
                      marginBottom: '6px',
                    }}
                  >
                    End Date {form.isCurrent && '(Present)'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      disabled={form.isCurrent}
                      value={form.endMonth}
                      onChange={(e) => updateField('endMonth', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: form.isCurrent ? '#111514' : '#141C19',
                        border: '1px solid rgba(244, 243, 238, 0.12)',
                        color: form.isCurrent ? '#6B7F72' : '#F4F3EE',
                        fontSize: '13px',
                      }}
                    >
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      disabled={form.isCurrent}
                      value={form.isCurrent ? 'Present' : form.endYear}
                      onChange={(e) => updateField('endYear', e.target.value)}
                      placeholder="YYYY"
                      style={{
                        width: '80px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: form.isCurrent ? '#111514' : '#141C19',
                        border: '1px solid rgba(244, 243, 238, 0.12)',
                        color: form.isCurrent ? '#6B7F72' : '#F4F3EE',
                        fontSize: '13px',
                        textAlign: 'center',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description / Highlights */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                  marginBottom: '6px',
                }}
              >
                Role Overview &amp; Executive Summary
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="High-level summary of your responsibilities, mandate, and cross-functional teams managed..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#0E1412',
                  border: '1px solid rgba(244, 243, 238, 0.12)',
                  color: '#F4F3EE',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  outline: 'none',
                }}
              />
            </div>

            {/* Deliverables & Responsibilities (Bullet Items) */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                  marginBottom: '8px',
                }}
              >
                Key Responsibilities &amp; Deliverables
              </label>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={newResponsibilityInput}
                  onChange={(e) => setNewResponsibilityInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResponsibility())}
                  placeholder="e.g. Documenting and standardizing procurement workflows..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddResponsibility}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(244, 243, 238, 0.08)',
                    border: '1px solid rgba(244, 243, 238, 0.15)',
                    color: '#F4F3EE',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Add Bullet
                </button>
              </div>

              {form.responsibilities.length > 0 && (
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  {form.responsibilities.map((resp, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 12px',
                        backgroundColor: '#0E1412',
                        borderRadius: '4px',
                        border: '1px solid rgba(244, 243, 238, 0.06)',
                        fontSize: '13px',
                        color: '#C1C4BE',
                      }}
                    >
                      <span>• {resp}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveResponsibility(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#E06C75',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Associated Skills (Search & Add + Create New) */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                  marginBottom: '6px',
                }}
              >
                Skills Associated With This Role
              </label>

              {/* Tag pill list */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '10px',
                  minHeight: '28px',
                }}
              >
                {form.skillsUsed.map((sk) => (
                  <span
                    key={sk}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      backgroundColor: 'rgba(130, 148, 166, 0.15)',
                      border: '1px solid rgba(130, 148, 166, 0.3)',
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: '#F4F3EE',
                    }}
                  >
                    {sk}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8294A6',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Search + Create Input */}
              <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    placeholder="Search existing skills or type a new capability..."
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      borderRadius: '6px',
                      backgroundColor: '#0E1412',
                      border: '1px solid rgba(244, 243, 238, 0.12)',
                      color: '#F4F3EE',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <Search
                    size={13}
                    color="#8E948D"
                    style={{ position: 'absolute', left: '10px', top: '10px' }}
                  />
                </div>
                {skillSearchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => handleAddSkill(skillSearchQuery)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      backgroundColor: '#4A5749',
                      border: 'none',
                      color: '#F4F3EE',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    + Create &ldquo;{skillSearchQuery}&rdquo;
                  </button>
                )}
              </div>

              {/* Autocomplete Suggestions */}
              {skillSearchQuery && filteredSkills.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#18211D',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    borderRadius: '6px',
                    marginTop: '4px',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    padding: '4px',
                  }}
                >
                  {filteredSkills.slice(0, 6).map((sk) => (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => handleAddSkill(sk)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 10px',
                        background: 'none',
                        border: 'none',
                        color: '#C1C4BE',
                        fontSize: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(244, 243, 238, 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      + {sk}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Media & Work Samples (Images / PDFs / Links) */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <label
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: '#A7B0A9',
                    }}
                  >
                    Media, Deliverables &amp; Work Samples
                  </label>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: '#8E948D',
                      marginLeft: '8px',
                    }}
                  >
                    (Recommended: 4–5 items, unlimited supported)
                  </span>
                </div>

                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: 'rgba(244, 243, 238, 0.06)',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    borderRadius: '4px',
                    color: '#F4F3EE',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={12} />
                  {isUploadingMedia ? 'Uploading...' : '+ Attach Media'}
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleMediaUpload}
                    style={{ display: 'none' }}
                    disabled={isUploadingMedia}
                  />
                </label>
              </div>

              {form.mediaItems && form.mediaItems.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {form.mediaItems.map((med) => (
                    <div
                      key={med.id}
                      style={{
                        backgroundColor: '#0E1412',
                        border: '1px solid rgba(244, 243, 238, 0.08)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      {med.type === 'image' ? (
                        <img
                          src={med.url}
                          alt={med.altText || med.title}
                          style={{
                            width: '100%',
                            height: '110px',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: '110px',
                            backgroundColor: '#1E2822',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#8294A6',
                          }}
                        >
                          <FileText size={32} />
                        </div>
                      )}

                      <div style={{ padding: '10px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '4px',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#F4F3EE',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '160px',
                            }}
                          >
                            {med.title || 'Attachment'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(med.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#E06C75',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={med.caption || ''}
                          onChange={(e) => handleUpdateMediaCaption(med.id, e.target.value)}
                          placeholder="Add caption..."
                          style={{
                            width: '100%',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#141C19',
                            border: '1px solid rgba(244, 243, 238, 0.08)',
                            color: '#A7B0A9',
                            fontSize: '11px',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#0E1412',
                    borderRadius: '6px',
                    border: '1px dashed rgba(244, 243, 238, 0.1)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#8E948D',
                  }}
                >
                  No media attached yet. Attach screenshots, system diagrams, or PDFs to showcase work artifacts.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid rgba(244, 243, 238, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#18211D',
            flexShrink: 0,
          }}
        >
          {isEditing && onDelete && initialExperience ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${initialExperience.jobTitle}"?`)) {
                  onDelete(initialExperience.id);
                  onClose();
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                backgroundColor: 'rgba(217, 83, 79, 0.12)',
                border: '1px solid rgba(217, 83, 79, 0.3)',
                color: '#E06C75',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={13} />
              Delete Role
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#C1C4BE',
                fontSize: '13px',
                cursor: 'pointer',
                minHeight: '40px',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#E5E5EA',
                fontSize: '13px',
                cursor: 'pointer',
                minHeight: '40px',
              }}
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              style={{
                padding: '10px 22px',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                border: 'none',
                color: '#050505',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '40px',
              }}
            >
              Publish Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
