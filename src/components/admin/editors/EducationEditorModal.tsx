import React, { useState } from 'react';
import { Trash2, GraduationCap, Plus } from 'lucide-react';
import { EducationRecord, SkillRecord } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';
import { InstitutionSelector } from '../common/InstitutionSelector';
import { DegreeSelector } from '../common/DegreeSelector';
import { FieldOfStudySelector } from '../common/FieldOfStudySelector';
import { YearSelector } from '../common/YearSelector';
import { GradeTypeSelector } from '../common/GradeTypeSelector';
import { SkillsMultiSelector } from '../common/SkillsMultiSelector';
import {
  AdminModal,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminFormField,
  AdminInput,
} from '../common/AdminModal';

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
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<Omit<EducationRecord, 'id'>>(() => {
    if (initialEducation) {
      return {
        institution: initialEducation.institution || '',
        associatedCollege: initialEducation.associatedCollege || '',
        degree: initialEducation.degree || '',
        fieldOfStudy: initialEducation.fieldOfStudy || '',
        startYear: initialEducation.startYear || '',
        endYear: initialEducation.endYear || '',
        grade: initialEducation.grade || '',
        description: initialEducation.description || '',
        skillsUsed: initialEducation.skillsUsed || [],
        logoUrl: initialEducation.logoUrl || '',
        highlights: initialEducation.highlights || [],
        displayOrder: initialEducation.displayOrder || 1,
        requiresDateConfirmation: initialEducation.requiresDateConfirmation ?? (!initialEducation.startYear && !!initialEducation.endYear),
        dateConfirmationNotes: initialEducation.dateConfirmationNotes || '',
      };
    }
    return {
      institution: '',
      associatedCollege: '',
      degree: '',
      fieldOfStudy: '',
      startYear: '',
      endYear: '',
      grade: '',
      description: '',
      skillsUsed: [],
      logoUrl: '',
      highlights: [],
      displayOrder: 1,
      requiresDateConfirmation: false,
      dateConfirmationNotes: '',
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

    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!initialEducation || !onDelete) return;
    if (window.confirm(`Delete education at ${initialEducation.institution}?`)) {
      onDelete(initialEducation.id);
      onClose();
    }
  };

  return (
    <AdminModal isOpen={true} onClose={onClose} size="lg" ariaLabel={isEditing ? 'Edit Education' : 'Add Education'}>
      <AdminModalHeader
        title={isEditing ? 'Edit Education' : 'Add Education'}
        subtitle="Academic foundation, specialized concentrations, and formal credentials."
        icon={<GraduationCap size={18} />}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <AdminModalBody padding="24px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Institution Selector */}
            <div>
              <InstitutionSelector
                value={form.institution}
                onChange={(val) => updateField('institution', val)}
                required={true}
              />
            </div>

            {/* Associated College / Affiliated Institute */}
            <AdminFormField
              label="Associated College / Institute (Optional)"
              helpText="Specify affiliated college (e.g. IPS Academy, Indore or GS College, Jabalpur) under the awarding university."
            >
              <AdminInput
                type="text"
                value={form.associatedCollege || ''}
                onChange={(e) => updateField('associatedCollege', e.target.value)}
                placeholder="e.g. IPS Academy, Indore"
              />
            </AdminFormField>

            {/* Degree and Field of Study (2-column grid with generous width) */}
            <div className="admin-grid-2col">
              <div>
                <DegreeSelector
                  value={form.degree}
                  onChange={(val) => updateField('degree', val)}
                  required={true}
                />
              </div>

              <div>
                <FieldOfStudySelector
                  value={form.fieldOfStudy}
                  onChange={(val) => updateField('fieldOfStudy', val)}
                />
              </div>
            </div>

            {/* Start Year, End Year, and Grade/Honors (Intelligent content-proportional grid) */}
            <div className="admin-grid-dates-grade">
              <div>
                <YearSelector
                  label="Start Year (Optional)"
                  value={form.startYear}
                  onChange={(val) => updateField('startYear', val)}
                  placeholder="e.g. 2019"
                  required={false}
                />
              </div>

              <div>
                <YearSelector
                  label="End Year / Completion Year"
                  value={form.endYear}
                  onChange={(val) => updateField('endYear', val)}
                  placeholder="e.g. 2021"
                  required={true}
                />
              </div>

              <div>
                <GradeTypeSelector
                  value={form.grade || ''}
                  onChange={(val) => updateField('grade', val)}
                />
              </div>
            </div>

            {/* Associated Skills */}
            <div>
              <SkillsMultiSelector
                value={form.skillsUsed || []}
                onChange={(skills) => updateField('skillsUsed', skills)}
                allSkills={allSkills}
                label="Skills & Competencies Acquired"
                placeholder="Select or type competencies acquired during studies..."
              />
            </div>

            {/* Highlights */}
            <AdminFormField
              label="Activities, Honors & Coursework Highlights"
              helpText="Add key distinctions, research topics, or institutional honors."
            >
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <AdminInput
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
                  placeholder="Add academic achievement or coursework highlight..."
                />
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F4F3EE',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
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
                        padding: '8px 12px',
                        backgroundColor: '#0E1412',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#C1C4BE',
                      }}
                    >
                      <span style={{ lineHeight: 1.4 }}>• {h}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        title="Remove highlight"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#E06C75',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </AdminFormField>
          </div>
        </AdminModalBody>

        <AdminModalFooter
          onCancel={onClose}
          onDelete={isEditing && onDelete ? handleDelete : undefined}
          deleteText="Delete"
          saveText={isEditing ? 'Save Education' : 'Create Record'}
          isSaving={isSaving}
          saveType="submit"
        />
      </form>
    </AdminModal>
  );
};
