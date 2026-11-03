import React, { useState } from 'react';
import {
  X,
  Upload,
  Trash2,
  Award,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { CertificationRecord, SkillRecord } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';

interface CertificationEditorModalProps {
  initialCertification: CertificationRecord | null;
  allSkills: SkillRecord[];
  onSave: (saved: CertificationRecord) => void;
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

export const CertificationEditorModal: React.FC<CertificationEditorModalProps> = ({
  initialCertification,
  allSkills,
  onSave,
  onDelete,
  onClose,
  showNotification,
}) => {
  const isEditing = !!initialCertification;

  const [form, setForm] = useState<Omit<CertificationRecord, 'id'>>(() => {
    if (initialCertification) {
      return {
        title: initialCertification.title,
        issuer: initialCertification.issuer,
        issueMonth: initialCertification.issueMonth || 'January',
        issueYear: initialCertification.issueYear || '2024',
        completionDate: initialCertification.completionDate || 'Jan 2024',
        expirationMonth: initialCertification.expirationMonth || 'December',
        expirationYear: initialCertification.expirationYear || '2027',
        expiryDate: initialCertification.expiryDate || '',
        doesNotExpire: initialCertification.doesNotExpire ?? true,
        credentialId: initialCertification.credentialId || '',
        verificationUrl: initialCertification.verificationUrl || '',
        description: initialCertification.description || '',
        skillsUsed: initialCertification.skillsUsed || [],
        certificateImage: initialCertification.certificateImage || '',
        certificatePdfUrl: initialCertification.certificatePdfUrl || '',
        category: initialCertification.category || 'Applied Artificial Intelligence',
        highlightTag: initialCertification.highlightTag || 'CERTIFIED CREDENTIAL',
        displayOrder: initialCertification.displayOrder || 1,
        status: initialCertification.status || 'published',
      };
    }
    return {
      title: '',
      issuer: '',
      issueMonth: 'January',
      issueYear: new Date().getFullYear().toString(),
      completionDate: 'Jan ' + new Date().getFullYear(),
      expirationMonth: 'December',
      expirationYear: (new Date().getFullYear() + 3).toString(),
      expiryDate: '',
      doesNotExpire: true,
      credentialId: '',
      verificationUrl: '',
      description: '',
      skillsUsed: [],
      certificateImage: '',
      certificatePdfUrl: '',
      category: 'Applied Artificial Intelligence',
      highlightTag: 'ACCREDITATION',
      displayOrder: 1,
      status: 'published',
    };
  });

  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddSkill = async (skillName: string) => {
    const trimmed = skillName.trim();
    const current = form.skillsUsed || [];
    if (!trimmed || current.includes(trimmed)) return;

    await cmsService.ensureSkill(trimmed, 'Certifications & Accreditations');
    updateField('skillsUsed', [...current, trimmed]);
    setSkillSearchQuery('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    updateField(
      'skillsUsed',
      (form.skillsUsed || []).filter((s) => s !== skillToRemove)
    );
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    try {
      const isPdf = file.type === 'application/pdf';
      const asset = await cmsService.uploadMediaFile(
        file,
        'certificate',
        `${form.title || 'Certificate'} - ${file.name}`
      );

      if (isPdf) {
        updateField('certificatePdfUrl', asset.url);
      } else {
        updateField('certificateImage', asset.url);
      }
      showNotification(`Certificate document "${file.name}" uploaded successfully.`);
    } catch (err: any) {
      showNotification('Certificate upload failed: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleSubmit = async (targetStatus: 'published' | 'draft') => {
    if (!form.title.trim() || !form.issuer.trim()) {
      showNotification('Certification name and Issuing organization are required.', 'error');
      return;
    }

    const computedCompletionDate = `${form.issueMonth} ${form.issueYear}`;
    const computedExpiryDate = form.doesNotExpire
      ? 'Does not expire'
      : `${form.expirationMonth} ${form.expirationYear}`;

    const payload = {
      ...form,
      completionDate: computedCompletionDate,
      expiryDate: computedExpiryDate,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (isEditing && initialCertification) {
        await cmsService.updateCertification(initialCertification.id, payload);
        onSave({ ...payload, id: initialCertification.id });
        showNotification(
          targetStatus === 'published'
            ? 'Certification updated and published.'
            : 'Certification draft saved.'
        );
      } else {
        const created = await cmsService.addCertification(payload);
        onSave(created);
        showNotification(
          targetStatus === 'published'
            ? 'Certification added and published.'
            : 'Certification draft saved.'
        );
      }
      onClose();
    } catch (err: any) {
      showNotification('Save failed: ' + (err.message || 'Firebase error'), 'error');
    }
  };

  const filteredSkills = allSkills
    .map((s) => s.name)
    .filter(
      (name) =>
        name.toLowerCase().includes(skillSearchQuery.toLowerCase()) &&
        !(form.skillsUsed || []).includes(name)
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
          maxWidth: '760px',
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
            backgroundColor: '#14151C',
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
              {isEditing ? 'Edit License / Certification' : 'Add License / Certification'}
            </h3>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#A7B0A9' }}>
              LinkedIn Reference Screenshot 1: Verified credentials, credential ID, URLs, and PDF media.
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Title & Issuer */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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
                  Certification Name <span style={{ color: '#D9534F' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. Claude AI Architecture & Agent Systems"
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
                  Issuing Organization <span style={{ color: '#D9534F' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.issuer}
                  onChange={(e) => updateField('issuer', e.target.value)}
                  placeholder="e.g. Anthropic / Claude Academy"
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

            {/* Dates & Does Not Expire Toggle */}
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
                    checked={form.doesNotExpire}
                    onChange={(e) => updateField('doesNotExpire', e.target.checked)}
                    style={{ accentColor: '#4A5749', width: '16px', height: '16px' }}
                  />
                  <span>This credential does not expire</span>
                </label>
              </div>

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
                    Issue Date
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={form.issueMonth}
                      onChange={(e) => updateField('issueMonth', e.target.value)}
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
                      value={form.issueYear}
                      onChange={(e) => updateField('issueYear', e.target.value)}
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

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: form.doesNotExpire ? '#6B7F72' : '#A7B0A9',
                      marginBottom: '6px',
                    }}
                  >
                    Expiration Date {form.doesNotExpire && '(No Expiry)'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      disabled={form.doesNotExpire}
                      value={form.expirationMonth}
                      onChange={(e) => updateField('expirationMonth', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: form.doesNotExpire ? '#111514' : '#141C19',
                        border: '1px solid rgba(244, 243, 238, 0.12)',
                        color: form.doesNotExpire ? '#6B7F72' : '#F4F3EE',
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
                      disabled={form.doesNotExpire}
                      value={form.doesNotExpire ? 'None' : form.expirationYear}
                      onChange={(e) => updateField('expirationYear', e.target.value)}
                      placeholder="YYYY"
                      style={{
                        width: '80px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: form.doesNotExpire ? '#111514' : '#141C19',
                        border: '1px solid rgba(244, 243, 238, 0.12)',
                        color: form.doesNotExpire ? '#6B7F72' : '#F4F3EE',
                        fontSize: '13px',
                        textAlign: 'center',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Credential ID & Verification URL */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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
                  Credential ID (Leave blank if unassigned)
                </label>
                <input
                  type="text"
                  value={form.credentialId || ''}
                  onChange={(e) => updateField('credentialId', e.target.value)}
                  placeholder="e.g. AUTH-2025-9481"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '13px',
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
                  Verification URL
                </label>
                <input
                  type="url"
                  value={form.verificationUrl || ''}
                  onChange={(e) => updateField('verificationUrl', e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Description */}
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
                Credential Scope &amp; Verified Competencies
              </label>
              <textarea
                rows={3}
                value={form.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Curriculum covered, architectures mastered, evaluation criteria..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#0E1412',
                  border: '1px solid rgba(244, 243, 238, 0.12)',
                  color: '#F4F3EE',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Associated Skills */}
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
                Skills Associated With This Credential
              </label>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {(form.skillsUsed || []).map((sk) => (
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
                      style={{ background: 'none', border: 'none', color: '#8294A6', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                  placeholder="Search skills to associate with this credential..."
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
                    }}
                  >
                    + Add
                  </button>
                )}
              </div>

              {skillSearchQuery && filteredSkills.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#18211D',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    borderRadius: '6px',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    padding: '4px',
                    marginTop: '4px',
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
                    >
                      + {sk}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Media Support: Certificate Document / Image Upload */}
            <div
              style={{
                backgroundColor: '#0E1412',
                border: '1px solid rgba(244, 243, 238, 0.08)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#F4F3EE',
                    }}
                  >
                    Certificate PDF Document or Image
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#8E948D' }}>
                    Upload official certificate PDF or verification badge image
                  </div>
                </div>

                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#4A5749',
                    borderRadius: '4px',
                    color: '#F4F3EE',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={12} />
                  {isUploadingDoc ? 'Uploading...' : 'Upload File'}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleCertificateUpload}
                    style={{ display: 'none' }}
                    disabled={isUploadingDoc}
                  />
                </label>
              </div>

              {(form.certificateImage || form.certificatePdfUrl) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#141C19',
                    borderRadius: '6px',
                    border: '1px solid rgba(244, 243, 238, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#8294A6" />
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        color: '#F4F3EE',
                        maxWidth: '400px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {form.certificatePdfUrl || form.certificateImage}
                    </span>
                  </div>
                  <a
                    href={form.certificatePdfUrl || form.certificateImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      color: '#8294A6',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={11} /> View
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
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
          {isEditing && onDelete && initialCertification ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete certification "${initialCertification.title}"?`)) {
                  onDelete(initialCertification.id);
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
              Delete
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
              Publish Credential
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
