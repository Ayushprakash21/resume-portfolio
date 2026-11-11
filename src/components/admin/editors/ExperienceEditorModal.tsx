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
  Crop,
} from 'lucide-react';
import { ExperienceRecord, ExperienceMediaItem, SkillRecord } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';
import { CompanySelector } from '../common/CompanySelector';
import { LocationSelector } from '../common/LocationSelector';
import { DateMonthYearPicker } from '../common/DateMonthYearPicker';
import { ImageCropModal } from '../common/ImageCropModal';
import { ImageUploadWithCrop } from '../common/ImageUploadWithCrop';
import { JobTitleSelector } from '../common/JobTitleSelector';
import { EmploymentTypeSelector } from '../common/EmploymentTypeSelector';
import { WorkplaceTypeSelector } from '../common/WorkplaceTypeSelector';
import { SkillsMultiSelector } from '../common/SkillsMultiSelector';
import {
  AdminModal,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminFormField,
  AdminInput,
  AdminTextarea,
} from '../common/AdminModal';

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
        employer: initialExperience.employer || '',
        jobTitle: initialExperience.jobTitle || '',
        employmentType: initialExperience.employmentType !== undefined ? initialExperience.employmentType : '',
        showEmploymentTypeBadge: initialExperience.showEmploymentTypeBadge !== undefined ? initialExperience.showEmploymentTypeBadge : true,
        location: initialExperience.location || '',
        locationType: initialExperience.locationType || 'Hybrid',
        startMonth: initialExperience.startMonth || '',
        startYear: initialExperience.startYear || '',
        endMonth: initialExperience.endMonth || '',
        endYear: initialExperience.endYear || '',
        startDate: initialExperience.startDate || '',
        endDate: initialExperience.endDate !== undefined ? initialExperience.endDate : (initialExperience.isCurrent ? 'Present' : ''),
        isCurrent: initialExperience.isCurrent ?? false,
        requiresDateConfirmation: initialExperience.requiresDateConfirmation ?? false,
        dateConfirmationNotes: initialExperience.dateConfirmationNotes || '',
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
      employmentType: '',
      showEmploymentTypeBadge: true,
      location: '',
      locationType: 'Hybrid',
      startMonth: '',
      startYear: new Date().getFullYear().toString(),
      endMonth: '',
      endYear: new Date().getFullYear().toString(),
      startDate: new Date().getFullYear().toString(),
      endDate: 'Present',
      isCurrent: true,
      requiresDateConfirmation: false,
      dateConfirmationNotes: '',
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
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [cropTargetMediaItem, setCropTargetMediaItem] = useState<ExperienceMediaItem | null>(null);

  const handleApplyCroppedMediaItem = async (croppedFile: File) => {
    if (!cropTargetMediaItem) return;
    try {
      const asset = await cmsService.uploadMediaFile(
        croppedFile,
        'screenshot',
        `${form.employer || 'Work'} - ${croppedFile.name}`,
        cropTargetMediaItem.altText || croppedFile.name
      );

      const updated = (form.mediaItems || []).map((m) =>
        m.id === cropTargetMediaItem.id ? { ...m, url: asset.url } : m
      );
      updateField('mediaItems', updated);
      showNotification('Attached media item cropped and updated.', 'success');
    } catch (err: any) {
      showNotification('Failed to update cropped media: ' + (err.message || 'Error'), 'error');
    } finally {
      setCropTargetMediaItem(null);
    }
  };

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

    const computedStartDate = form.startMonth?.trim()
      ? `${form.startMonth.trim()} ${form.startYear?.trim() || ''}`.trim()
      : form.startYear?.trim() || '';
    const computedEndDate = form.isCurrent
      ? 'Present'
      : form.endMonth?.trim()
      ? `${form.endMonth.trim()} ${form.endYear?.trim() || ''}`.trim()
      : form.endYear?.trim() || '';

    const requiresConfirm =
      (!form.startMonth?.trim() && !!form.startYear?.trim()) ||
      (!form.isCurrent && !form.endMonth?.trim() && !!form.endYear?.trim()) ||
      form.requiresDateConfirmation === true;

    const recordPayload = {
      ...form,
      employmentType: form.employmentType?.trim() || '',
      showEmploymentTypeBadge: form.showEmploymentTypeBadge ?? true,
      startDate: computedStartDate,
      endDate: computedEndDate,
      requiresDateConfirmation: requiresConfirm,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    };

    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
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
    <AdminModal
      isOpen={true}
      onClose={onClose}
      size="xl"
      maxWidth="900px"
      ariaLabel={isEditing ? 'Edit Experience' : 'Add Experience'}
    >
      <AdminModalHeader
        title={isEditing ? 'Edit Experience' : 'Add Experience'}
        subtitle="LinkedIn-style employment record with timeline, key deliverables, and media samples."
        onClose={onClose}
      />

      <AdminModalBody padding="24px">
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
                <JobTitleSelector
                  value={form.jobTitle}
                  onChange={(val) => updateField('jobTitle', val)}
                  required={true}
                />
              </div>

              <div>
                <CompanySelector
                  value={form.employer}
                  onChange={(val) => updateField('employer', val)}
                  required={true}
                />
              </div>
            </div>

            {/* Employer Logo with Interactive Crop */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(18, 19, 24, 0.4)',
                border: '1px solid rgba(244, 243, 238, 0.08)',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '8px',
                  backgroundColor: '#0E1412',
                  border: '1px solid rgba(244, 243, 238, 0.12)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt={form.employer || 'Company Logo'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <ImageIcon size={20} color="#8E948D" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#F4F3EE', marginBottom: '2px' }}>
                  Company Mark / Brand Logo
                </div>
                <div style={{ fontSize: '11px', color: '#8E948D' }}>
                  1:1 square crop with interactive centering and zoom.
                </div>
              </div>
              <div>
                <ImageUploadWithCrop
                  currentImageUrl={form.logoUrl}
                  category="logo"
                  caption={`${form.employer || 'Employer'} Logo`}
                  altText={`${form.employer || 'Employer'} Logo`}
                  buttonLabel={form.logoUrl ? 'Replace Logo' : '+ Upload Logo'}
                  initialAspect={1}
                  initialShape="rect"
                  modalTitle="Company Logo — Drag, Position & Crop"
                  contextHint="Position the employer logo squarely in the center of the badge."
                  onSuccess={(url) => {
                    updateField('logoUrl', url);
                    showNotification('Company logo updated.');
                  }}
                  showNotification={showNotification}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: '#A7B0A9',
                    }}
                  >
                    Role Classification / Employment Type
                  </label>
                  {form.employmentType && (
                    <button
                      type="button"
                      onClick={() => updateField('employmentType', '')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#E05252',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: '0',
                        textDecoration: 'underline',
                      }}
                    >
                      Clear / Remove Badge
                    </button>
                  )}
                </div>
                <EmploymentTypeSelector
                  value={form.employmentType || ''}
                  onChange={(val) => updateField('employmentType', val)}
                />
                <select style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" value={form.employmentType || ''} onChange={() => {}}>
                  <option value="">None / Not Specified (No Badge)</option>
                </select>
                <div style={{ marginTop: '8px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#A7B0A9',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.showEmploymentTypeBadge !== false}
                      onChange={(e) => updateField('showEmploymentTypeBadge', e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: '#D32F2F' }}
                    />
                    <span>Show classification badge on public card & admin</span>
                  </label>
                </div>
              </div>

              <div>
                <LocationSelector
                  value={form.location || ''}
                  onChange={(val) => updateField('location', val)}
                  label="Location"
                  placeholder="e.g. Indore, Madhya Pradesh, India"
                />
              </div>

              <div>
                <WorkplaceTypeSelector
                  value={form.locationType || 'Hybrid'}
                  onChange={(val) => updateField('locationType', val as any)}
                />
              </div>
            </div>

            {/* Timeline Dates & Currently Working Checkbox */}
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
                Employment Timeline &amp; Dates <span style={{ color: '#D9534F' }}>*</span>
              </label>
              <DateMonthYearPicker
                startMonth={form.startMonth}
                startYear={form.startYear}
                endMonth={form.endMonth}
                endYear={form.endYear}
                isCurrent={form.isCurrent}
                requiresDateConfirmation={form.requiresDateConfirmation}
                onChange={(dates) => {
                  setForm((prev) => ({
                    ...prev,
                    startMonth: dates.startMonth,
                    startYear: dates.startYear,
                    endMonth: dates.endMonth,
                    endYear: dates.endYear,
                    isCurrent: dates.isCurrent,
                    startDate: dates.startDate,
                    endDate: dates.endDate,
                    requiresDateConfirmation: dates.requiresDateConfirmation,
                  }));
                }}
              />
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

            {/* Associated Skills */}
            <div>
              <SkillsMultiSelector
                value={form.skillsUsed}
                onChange={(skills) => updateField('skillsUsed', skills)}
                allSkills={allSkills}
                label="Skills Associated With This Role"
                placeholder="Select skills or type a new capability..."
              />
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {med.type === 'image' && (
                              <button
                                type="button"
                                onClick={() => setCropTargetMediaItem(med)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#FF8888',
                                  cursor: 'pointer',
                                  padding: '2px',
                                }}
                                title="Crop / Reposition Media"
                              >
                                <Crop size={12} />
                              </button>
                            )}
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
                            backgroundColor: 'rgba(18, 18, 22, 0.72)',
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
        </AdminModalBody>

        <AdminModalFooter
          onCancel={onClose}
          onDelete={
            isEditing && onDelete && initialExperience
              ? () => {
                  if (window.confirm(`Are you sure you want to delete "${initialExperience.jobTitle}"?`)) {
                    onDelete(initialExperience.id);
                    onClose();
                  }
                }
              : undefined
          }
          deleteText="Delete Role"
          isSaving={isSaving}
        >
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={isSaving}
            className="btn-glass-primary"
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#E5E5EA',
              fontSize: '13px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              minHeight: '38px',
            }}
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={isSaving}
            className="btn-luxury-primary"
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              border: 'none',
              color: '#050505',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              minHeight: '38px',
            }}
          >
            Publish Role
          </button>
        </AdminModalFooter>

        {cropTargetMediaItem && (
          <ImageCropModal
            isOpen={!!cropTargetMediaItem}
            imageSrc={cropTargetMediaItem.url}
            fileName={cropTargetMediaItem.title || 'deliverable.jpg'}
            title="Crop & Reposition Deliverable"
            contextHint="Position and frame the deliverable image. Drag and zoom as needed."
            onClose={() => setCropTargetMediaItem(null)}
            onApplyCrop={handleApplyCroppedMediaItem}
          />
        )}
    </AdminModal>
  );
};
