import React, { useState } from 'react';
import { X, Trash2, GraduationCap, Plus } from 'lucide-react';
import { EducationRecord, SkillRecord } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';

interface EducationEditorModalProps {
  initialEducation: EducationRecord | null;
  allSkills: SkillRecord[];
  onSave: (saved: EducationRecord) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const EducationEditorModal: React.FC<EducationEditorModalProps> = ({
  initialEducation,
  allSkills,
  onSave,
  onDelete,
  onClose,
  showNotification,
}) => {
  const isEditing = !!initialEducation;

  const [form, setForm] = useState<Omit<EducationRecord, 'id'>>(() => {
    if (initialEducation) {
      return {
        institution: initialEducation.institution,
        degree: initialEducation.degree,
        fieldOfStudy: initialEducation.fieldOfStudy,
        startYear: initialEducation.startYear,
        endYear: initialEducation.endYear,
        grade: initialEducation.grade || '',
        description: initialEducation.description || '',
        skillsUsed: initialEducation.skillsUsed || [],
        logoUrl: initialEducation.logoUrl || '',
        highlights: initialEducation.highlights || [],
        displayOrder: initialEducation.displayOrder || 1,
      };
    }
    return {
      institution: '',
      degree: 'Bachelor of Technology (B.Tech)',
      fieldOfStudy: 'Operations, Systems & Technology Management',
      startYear: '2019',
      endYear: '2023',
      grade: 'First Class with Distinction',
      description: '',
      skillsUsed: [],
      logoUrl: '',
      highlights: [],
      displayOrder: 1,
    };
  });

  const [newHighlight, setNewHighlight] = useState('');

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    updateField('highlights', [...form.highlights, newHighlight.trim()]);
    setNewHighlight('');
  };

  const handleRemoveHighlight = (idx: number) => {
    updateField(
      'highlights',
      form.highlights.filter((_, i) => i !== idx)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.institution.trim() || !form.degree.trim()) {
      showNotification('Institution name and Degree are required.', 'error');
      return;
    }

    try {
      if (isEditing && initialEducation) {
        await cmsService.updateEducation(initialEducation.id, form);
        onSave({ ...form, id: initialEducation.id });
        showNotification('Education record updated.');
      } else {
        const created = await cmsService.addEducation(form);
        onSave(created);
        showNotification('Education record created.');
      }
      onClose();
    } catch (err: any) {
      showNotification('Save failed: ' + (err.message || 'Firebase error'), 'error');
    }
  };

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
          maxWidth: '720px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#14151C',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 600,
              color: '#F4F3EE',
              margin: 0,
            }}
          >
            {isEditing ? 'Edit Education' : 'Add Education'}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#A7B0A9', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                School / University / Institute <span style={{ color: '#D9534F' }}>*</span>
              </label>
              <input
                type="text"
                value={form.institution}
                onChange={(e) => updateField('institution', e.target.value)}
                placeholder="e.g. Institute of Technology"
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

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                  Degree <span style={{ color: '#D9534F' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.degree}
                  onChange={(e) => updateField('degree', e.target.value)}
                  placeholder="e.g. Bachelor of Technology (B.Tech)"
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
                  Field of Study
                </label>
                <input
                  type="text"
                  value={form.fieldOfStudy}
                  onChange={(e) => updateField('fieldOfStudy', e.target.value)}
                  placeholder="e.g. Operations & Systems Management"
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

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                  Start Year
                </label>
                <input
                  type="text"
                  value={form.startYear}
                  onChange={(e) => updateField('startYear', e.target.value)}
                  placeholder="2019"
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
                  End Year (or Expected)
                </label>
                <input
                  type="text"
                  value={form.endYear}
                  onChange={(e) => updateField('endYear', e.target.value)}
                  placeholder="2023"
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
                  Grade / Honors (Optional)
                </label>
                <input
                  type="text"
                  value={form.grade || ''}
                  onChange={(e) => updateField('grade', e.target.value)}
                  placeholder="e.g. First Class with Distinction"
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

            {/* Highlights */}
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
                Activities, Honors &amp; Coursework Highlights
              </label>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
                  placeholder="Add academic achievement or coursework highlight..."
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
                  onClick={handleAddHighlight}
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
                  <Plus size={14} /> Add
                </button>
              </div>

              {form.highlights.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {form.highlights.map((h, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 12px',
                        backgroundColor: '#0E1412',
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: '#C1C4BE',
                      }}
                    >
                      <span>• {h}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        style={{ background: 'none', border: 'none', color: '#E06C75', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              paddingTop: '20px',
              marginTop: '20px',
              borderTop: '1px solid rgba(244, 243, 238, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {isEditing && onDelete && initialEducation ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete education at ${initialEducation.institution}?`)) {
                    onDelete(initialEducation.id);
                    onClose();
                  }
                }}
                className="btn-glass-destructive" style={{
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
                <Trash2 size={13} /> Delete
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-glass-secondary" style={{
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
                type="submit"
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
                Save Education
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
