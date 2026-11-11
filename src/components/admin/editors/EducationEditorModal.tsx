import React, { useMemo, useRef, useState } from 'react';
import { Trash2, GraduationCap, Plus, AlertCircle, BookOpen, CheckCircle2 } from 'lucide-react';
import { EducationRecord, SkillRecord } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';
import { InstitutionSelector } from '../common/InstitutionSelector';
import { DegreeSelector } from '../common/DegreeSelector';
import { FieldOfStudySelector } from '../common/FieldOfStudySelector';
import { YearSelector } from '../common/YearSelector';
import { GradeTypeSelector } from '../common/GradeTypeSelector';
import { SkillsMultiSelector } from '../common/SkillsMultiSelector';
import { SearchableSelect, SearchableOption } from '../common/SearchableSelect';
import {
  AdminModal,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminFormField,
  AdminInput,
  AdminTextarea,
} from '../common/AdminModal';

interface EducationEditorModalProps {
  initialEducation: EducationRecord | null;
  allSkills: SkillRecord[];
  onSave: (saved: EducationRecord) => void;
  onDelete?: (id: string) => void | Promise<void>;
  onClose: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_SUBJECT_SUGGESTIONS = [
  'Supply Chain Management',
  'Operations Research',
  'Business Analytics',
  'Information Technology',
  'Marketing Management',
  'Enterprise Resource Planning (ERP)',
  'Database Management Systems',
  'Management Information Systems',
  'Financial Accounting',
  'Business Statistics',
  'E-Commerce & Digital Systems',
  'Project Management',
  'Logistics & Distribution',
  'Corporate Strategy',
  'Economics & Quantitative Methods',
  'Computer Applications',
];

const DEFAULT_COURSEWORK_SUGGESTIONS = [
  'Operations & Supply Chain Strategy',
  'Enterprise Systems & ERP',
  'Marketing Analytics & Consumer Behavior',
  'Database Management & SQL',
  'Business Communication & Reporting',
  'Statistical Modeling for Business',
  'Project Planning & Execution',
  'Information Systems Governance',
  'Digital Marketing Systems',
  'Cost & Management Accounting',
];

function buildInitialForm(initialEducation: EducationRecord | null): Omit<EducationRecord, 'id'> {
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
      courseOverview: initialEducation.courseOverview || initialEducation.description || '',
      specialization: initialEducation.specialization || '',
      subjects: [...(initialEducation.subjects || [])],
      relevantCoursework: [...(initialEducation.relevantCoursework || [])],
      academicFocus: initialEducation.academicFocus || '',
      learningOutcomes: [...(initialEducation.learningOutcomes || [])],
      projectsResearch: initialEducation.projectsResearch || '',
      academicAchievements: [...(initialEducation.academicAchievements || [])],
      additionalNotes: initialEducation.additionalNotes || '',
      status: initialEducation.status === 'draft' ? 'draft' : 'published',
      skillsUsed: [...(initialEducation.skillsUsed || [])],
      logoUrl: initialEducation.logoUrl || '',
      highlights: [...(initialEducation.highlights || [])],
      displayOrder: initialEducation.displayOrder || 1,
      requiresDateConfirmation:
        initialEducation.requiresDateConfirmation ?? (!initialEducation.startYear && !!initialEducation.endYear),
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
    courseOverview: '',
    specialization: '',
    subjects: [],
    relevantCoursework: [],
    academicFocus: '',
    learningOutcomes: [],
    projectsResearch: '',
    academicAchievements: [],
    additionalNotes: '',
    status: 'published',
    skillsUsed: [],
    logoUrl: '',
    highlights: [],
    displayOrder: 1,
    requiresDateConfirmation: false,
    dateConfirmationNotes: '',
  };
}

interface RepeatableListFieldProps {
  label: string;
  helpText?: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}

const RepeatableListField: React.FC<RepeatableListFieldProps> = ({
  label,
  helpText,
  items,
  onChange,
  placeholder,
  disabled = false,
}) => {
  const [draftEntry, setDraftEntry] = useState('');

  const handleAdd = () => {
    const trimmed = draftEntry.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraftEntry('');
  };

  const handleUpdate = (idx: number, val: string) => {
    const updated = [...items];
    updated[idx] = val;
    onChange(updated);
  };

  const handleRemove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <AdminFormField label={label} helpText={helpText}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: items.length > 0 ? '10px' : '0' }}>
        <AdminInput
          type="text"
          value={draftEntry}
          disabled={disabled}
          onChange={(e) => setDraftEntry(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
        />
        <button
          type="button"
          disabled={disabled || !draftEntry.trim()}
          onClick={handleAdd}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#F4F3EE',
            fontSize: '13px',
            fontWeight: 500,
            cursor: disabled || !draftEntry.trim() ? 'not-allowed' : 'pointer',
            opacity: disabled || !draftEntry.trim() ? 0.5 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                backgroundColor: '#0E1412',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
              }}
            >
              <span style={{ color: '#8E948D', fontSize: '13px', flexShrink: 0 }}>&bull;</span>
              <input
                type="text"
                value={item}
                disabled={disabled}
                onChange={(e) => handleUpdate(idx, e.target.value)}
                aria-label={`${label} item ${idx + 1}`}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#E5E7EB',
                  fontSize: '13px',
                  fontFamily: 'var(--font-body)',
                  padding: '2px 0',
                }}
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleRemove(idx)}
                title="Remove entry"
                aria-label={`Remove ${label} item ${idx + 1}`}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#E06C75',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminFormField>
  );
};

function buildMultiOptions(suggestions: string[], selected: string[]): SearchableOption[] {
  const map = new Map<string, SearchableOption>();
  suggestions.forEach((label) => {
    const clean = label.trim();
    if (clean && !map.has(clean.toLowerCase())) {
      map.set(clean.toLowerCase(), {
        value: clean,
        label: clean,
        icon: <BookOpen size={13} color="#D5D2D6" />,
      });
    }
  });
  selected.forEach((label) => {
    const clean = label.trim();
    if (clean && !map.has(clean.toLowerCase())) {
      map.set(clean.toLowerCase(), {
        value: clean,
        label: clean,
        badge: 'Custom',
        icon: <BookOpen size={13} color="#E098A3" />,
      });
    }
  });
  return Array.from(map.values());
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const initialBaselineRef = useRef<string>(JSON.stringify(buildInitialForm(initialEducation)));
  const [form, setForm] = useState<Omit<EducationRecord, 'id'>>(() => buildInitialForm(initialEducation));

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== initialBaselineRef.current;
  }, [form]);

  const subjectOptions = useMemo(
    () => buildMultiOptions(DEFAULT_SUBJECT_SUGGESTIONS, form.subjects || []),
    [form.subjects]
  );

  const courseworkOptions = useMemo(
    () => buildMultiOptions(DEFAULT_COURSEWORK_SUGGESTIONS, form.relevantCoursework || []),
    [form.relevantCoursework]
  );

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setSaveError(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAttemptClose = () => {
    if (isSaving || isDeleting) return;
    if (isDirty) {
      const discard = window.confirm('You have unsaved changes to this education record. Discard changes and close?');
      if (!discard) return;
    }
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSaving || isDeleting) return;

    if (!form.institution.trim() || !form.degree.trim()) {
      const msg = 'School / University and Degree / Qualification are required.';
      setSaveError(msg);
      showNotification(msg, 'error');
      return;
    }

    const cleanArray = (arr?: string[]) =>
      (arr || []).map((item) => item.trim()).filter((item) => item.length > 0);

    const payload: Omit<EducationRecord, 'id'> = {
      ...form,
      institution: form.institution.trim(),
      associatedCollege: (form.associatedCollege || '').trim(),
      degree: form.degree.trim(),
      fieldOfStudy: (form.fieldOfStudy || '').trim(),
      startYear: (form.startYear || '').trim(),
      endYear: (form.endYear || '').trim(),
      grade: (form.grade || '').trim(),
      courseOverview: (form.courseOverview || '').trim(),
      description: (form.courseOverview || form.description || '').trim(),
      specialization: (form.specialization || '').trim(),
      subjects: cleanArray(form.subjects),
      relevantCoursework: cleanArray(form.relevantCoursework),
      academicFocus: (form.academicFocus || '').trim(),
      learningOutcomes: cleanArray(form.learningOutcomes),
      projectsResearch: (form.projectsResearch || '').trim(),
      academicAchievements: cleanArray(form.academicAchievements),
      additionalNotes: (form.additionalNotes || '').trim(),
      skillsUsed: cleanArray(form.skillsUsed),
      highlights: cleanArray(form.highlights),
      status: form.status === 'draft' ? 'draft' : 'published',
      requiresDateConfirmation: !form.startYear?.trim() && !!form.endYear?.trim()
        ? form.requiresDateConfirmation
        : false,
    };

    setIsSaving(true);
    setSaveError(null);

    try {
      if (isEditing && initialEducation) {
        const updated = await cmsService.updateEducation(initialEducation.id, payload);
        initialBaselineRef.current = JSON.stringify(payload);
        onSave(updated);
        showNotification(
          payload.status === 'published'
            ? 'Education record saved and published.'
            : 'Education draft saved.',
          'success'
        );
      } else {
        const created = await cmsService.addEducation(payload);
        initialBaselineRef.current = JSON.stringify(payload);
        onSave(created);
        showNotification(
          payload.status === 'published'
            ? 'Education record added and published.'
            : 'Education draft created.',
          'success'
        );
      }
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Unable to save to Firestore. Please retry.';
      setSaveError(`Save failed: ${msg}`);
      showNotification(`Save failed: ${msg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialEducation || !onDelete || isSaving || isDeleting) return;
    if (!window.confirm(`Delete education record at "${initialEducation.institution}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setSaveError(null);
    try {
      await onDelete(initialEducation.id);
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Unable to delete education record.';
      setSaveError(`Delete failed: ${msg}`);
      showNotification(`Delete failed: ${msg}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminModal
      isOpen={true}
      onClose={handleAttemptClose}
      size="lg"
      ariaLabel={isEditing ? 'Edit Education' : 'Add Education'}
    >
      <AdminModalHeader
        title={isEditing ? 'Edit Education' : 'Add Education'}
        subtitle="Academic credentials, specialization, coursework, and verified qualification overview."
        icon={<GraduationCap size={18} />}
        badge={isDirty ? 'Unsaved Changes' : form.status === 'draft' ? 'Draft' : 'Published'}
        onClose={handleAttemptClose}
      />

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <AdminModalBody padding="22px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {saveError && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(224, 108, 117, 0.12)',
                  border: '1px solid rgba(224, 108, 117, 0.38)',
                  color: '#FCA5A5',
                  fontSize: '13px',
                  lineHeight: 1.5,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{saveError}</span>
              </div>
            )}

            {/* ========================================================
                SECTION 1: INSTITUTION, DEGREE & TIMELINE
                ======================================================== */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <InstitutionSelector
                value={form.institution}
                onChange={(val) => updateField('institution', val)}
                required={true}
              />

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
                    required={false}
                  />
                </div>

                <div>
                  <GradeTypeSelector
                    value={form.grade || ''}
                    onChange={(val) => updateField('grade', val)}
                  />
                </div>
              </div>

              {/* Publishing Status */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2
                    size={15}
                    color={form.status === 'published' ? '#10B981' : '#8E948D'}
                  />
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#F4F3EE' }}>
                      Visibility on Public Website
                    </div>
                    <div style={{ fontSize: '11px', color: '#8E948D' }}>
                      {form.status === 'published'
                        ? 'Approved details appear immediately in the public Academics / Education section.'
                        : 'Saved as draft in Firestore; hidden from public visitors until published.'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => updateField('status', 'published')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border:
                        form.status === 'published'
                          ? '1px solid rgba(16, 185, 129, 0.45)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor:
                        form.status === 'published' ? 'rgba(16, 185, 129, 0.16)' : 'transparent',
                      color: form.status === 'published' ? '#34D399' : '#9CA3AF',
                    }}
                  >
                    Published
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => updateField('status', 'draft')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border:
                        form.status === 'draft'
                          ? '1px solid rgba(214, 168, 84, 0.45)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor:
                        form.status === 'draft' ? 'rgba(214, 168, 84, 0.14)' : 'transparent',
                      color: form.status === 'draft' ? '#E8CE7D' : '#9CA3AF',
                    }}
                  >
                    Draft
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================
                SECTION 2: ABOUT THIS QUALIFICATION
                ======================================================== */}
            <div
              style={{
                padding: '18px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.025)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.07)', paddingBottom: '10px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#F4F3EE',
                  }}
                >
                  About This Qualification
                </div>
                <div style={{ fontSize: '12px', color: '#8E948D', marginTop: '2px' }}>
                  Describe what was studied, core focus areas, subjects, coursework, outcomes, and academic achievements. All fields below are optional.
                </div>
              </div>

              <AdminFormField
                label="Course Overview"
                helpText="Provide a concise narrative explaining what the program covered and how it informs your work."
              >
                <AdminTextarea
                  rows={4}
                  value={form.courseOverview || ''}
                  disabled={isSaving}
                  onChange={(e) => updateField('courseOverview', e.target.value)}
                  placeholder="Describe the qualification scope, curriculum depth, and strategic emphasis..."
                />
              </AdminFormField>

              <AdminFormField
                label="Specialization / Major"
                helpText="Specific concentration or dual-major focus (e.g. IT & Marketing)."
              >
                <AdminInput
                  type="text"
                  value={form.specialization || ''}
                  disabled={isSaving}
                  onChange={(e) => updateField('specialization', e.target.value)}
                  placeholder="e.g. IT & Marketing"
                />
              </AdminFormField>

              <div className="admin-grid-2col">
                <div>
                  <SearchableSelect
                    label="Subjects & Areas of Study"
                    options={subjectOptions}
                    value={form.subjects || []}
                    onChange={(next) => updateField('subjects', next)}
                    placeholder="Select or add subjects..."
                    searchPlaceholder="Search subjects or type custom..."
                    allowCustom={true}
                    customPrompt="Add subject:"
                    clearable={true}
                    disabled={isSaving}
                    isMulti={true}
                    helpText="Choose academic subjects or type custom entries."
                  />
                </div>

                <div>
                  <SearchableSelect
                    label="Relevant Coursework"
                    options={courseworkOptions}
                    value={form.relevantCoursework || []}
                    onChange={(next) => updateField('relevantCoursework', next)}
                    placeholder="Select or add coursework..."
                    searchPlaceholder="Search coursework or type custom..."
                    allowCustom={true}
                    customPrompt="Add coursework:"
                    clearable={true}
                    disabled={isSaving}
                    isMulti={true}
                    helpText="Completed modules, seminars, or practicums."
                  />
                </div>
              </div>

              <AdminFormField
                label="Academic Focus"
                helpText="Primary domain emphasis and analytical frameworks studied during the program."
              >
                <AdminTextarea
                  rows={3}
                  value={form.academicFocus || ''}
                  disabled={isSaving}
                  onChange={(e) => updateField('academicFocus', e.target.value)}
                  placeholder="Summarize primary areas studied (e.g. enterprise systems architecture, operational analytics, digital commerce)..."
                />
              </AdminFormField>

              <RepeatableListField
                label="Key Learning Outcomes"
                helpText="Add applied competencies or analytical takeaways gained from the qualification."
                items={form.learningOutcomes || []}
                onChange={(next) => updateField('learningOutcomes', next)}
                placeholder="Add a key learning outcome..."
                disabled={isSaving}
              />

              <AdminFormField
                label="Projects / Research / Dissertation (Optional)"
                helpText="Capstone projects, thesis topics, or applied case research completed."
              >
                <AdminTextarea
                  rows={2}
                  value={form.projectsResearch || ''}
                  disabled={isSaving}
                  onChange={(e) => updateField('projectsResearch', e.target.value)}
                  placeholder="e.g. Capstone study on enterprise workflow automation..."
                />
              </AdminFormField>

              <RepeatableListField
                label="Academic Achievements (Optional)"
                helpText="Scholarships, rankings, competitions, or departmental distinctions."
                items={form.academicAchievements || []}
                onChange={(next) => updateField('academicAchievements', next)}
                placeholder="Add an academic achievement..."
                disabled={isSaving}
              />

              <AdminFormField
                label="Additional Notes (Optional)"
                helpText="Any supplemental context on accreditation, format, or affiliations."
              >
                <AdminTextarea
                  rows={2}
                  value={form.additionalNotes || ''}
                  disabled={isSaving}
                  onChange={(e) => updateField('additionalNotes', e.target.value)}
                  placeholder="Optional supplemental details..."
                />
              </AdminFormField>
            </div>

            {/* ========================================================
                SECTION 3: SKILLS & HIGHLIGHTS (EXISTING FIELDS PRESERVED)
                ======================================================== */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <SkillsMultiSelector
                value={form.skillsUsed || []}
                onChange={(skills) => updateField('skillsUsed', skills)}
                allSkills={allSkills}
                label="Skills & Competencies Acquired"
                placeholder="Select or type competencies acquired during studies..."
                disabled={isSaving}
              />

              <RepeatableListField
                label="Activities, Honors & Coursework Highlights"
                helpText="Key institutional activities, leadership roles, or coursework highlights."
                items={form.highlights || []}
                onChange={(next) => updateField('highlights', next)}
                placeholder="Add academic achievement or coursework highlight..."
                disabled={isSaving}
              />
            </div>
          </div>
        </AdminModalBody>

        <AdminModalFooter
          onCancel={handleAttemptClose}
          onDelete={isEditing && onDelete ? handleDelete : undefined}
          deleteText={isDeleting ? 'Deleting...' : 'Delete'}
          saveText={isEditing ? 'Update Education' : 'Add Education'}
          savingText="Saving..."
          isSaving={isSaving}
          isDeleting={isDeleting}
          saveType="submit"
          statusText={isDirty ? 'Unsaved edits' : undefined}
        />
      </form>
    </AdminModal>
  );
};
