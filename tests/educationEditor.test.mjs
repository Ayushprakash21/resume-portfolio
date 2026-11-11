import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cmsService, normalizeEducationRecord } from '../src/services/cmsService.ts';
import { sanitizeForFirestore } from '../src/utils/firestoreSerializer.ts';

describe('Education Editor & Academic Details Suite', () => {
  it('1. AdminModalFooter renders primary save button for saveType="submit" even without onSave prop and shows Saving... state', () => {
    const adminModal = fs.readFileSync('src/components/admin/common/AdminModal.tsx', 'utf-8');
    assert.ok(
      adminModal.includes('Boolean(onSave || saveType === \'submit\')'),
      'AdminModalFooter must render Save button when saveType is submit'
    );
    assert.ok(
      adminModal.includes("savingText = 'Saving...'"),
      'AdminModalFooter must default savingText to Saving...'
    );
    assert.ok(
      adminModal.includes('{isSaving ? savingText : saveText}'),
      'AdminModalFooter must display Saving... indicator while submitting'
    );
    assert.ok(
      adminModal.includes('className="admin-modal-footer"') && adminModal.includes('flexShrink: 0'),
      'AdminModalFooter must remain sticky/pinned outside scrollable body'
    );
  });

  it('2. EducationEditorModal provides Update Education / Add Education footer, Delete, Cancel, About This Qualification, unsaved guard, and error retry', () => {
    const modal = fs.readFileSync('src/components/admin/editors/EducationEditorModal.tsx', 'utf-8');
    assert.ok(modal.includes("isEditing ? 'Update Education' : 'Add Education'"));
    assert.ok(modal.includes('savingText="Saving..."'));
    assert.ok(modal.includes('About This Qualification'));
    assert.ok(modal.includes('Course Overview'));
    assert.ok(modal.includes('Specialization / Major'));
    assert.ok(modal.includes('Subjects & Areas of Study'));
    assert.ok(modal.includes('Relevant Coursework'));
    assert.ok(modal.includes('Academic Focus'));
    assert.ok(modal.includes('Key Learning Outcomes'));
    assert.ok(modal.includes('Projects / Research / Dissertation'));
    assert.ok(modal.includes('Academic Achievements'));
    assert.ok(modal.includes('Additional Notes'));
    assert.ok(modal.includes('Skills & Competencies Acquired'));
    assert.ok(modal.includes('Activities, Honors & Coursework Highlights'));
    assert.ok(modal.includes('if (isSaving || isDeleting) return;'), 'Must guard against duplicate submissions');
    assert.ok(modal.includes('if (isDirty)'), 'Must warn on unsaved changes when closing/cancelling');
    assert.ok(modal.includes('role="alert"') && modal.includes('setSaveError'), 'Must display inline save error and keep modal open on failure');
  });

  it('3. normalizeEducationRecord handles Firestore Timestamps and preserves empty/legacy fields safely', () => {
    const mockTimestamp = { toDate: () => new Date('2026-11-11T12:00:00.000Z') };
    const normalized = normalizeEducationRecord(
      {
        institution: 'Devi Ahilya University',
        degree: 'Master of Business Administration (MBA)',
        fieldOfStudy: 'IT & Marketing',
        startYear: '',
        endYear: '2021',
        grade: '',
        courseOverview: 'Graduate program blending enterprise IT systems with marketing management.',
        specialization: 'IT & Marketing',
        subjects: ['Supply Chain Management', 'Business Analytics'],
        relevantCoursework: ['Enterprise Systems & ERP'],
        academicFocus: 'Operational systems and strategic execution.',
        learningOutcomes: ['Design cross-functional supply chain workflows'],
        highlights: [],
        displayOrder: 1,
        requiresDateConfirmation: false,
        createdAt: mockTimestamp,
        updatedAt: { seconds: 1794400000 },
      },
      'edu-1'
    );

    assert.equal(normalized.id, 'edu-1');
    assert.equal(normalized.startYear, '');
    assert.equal(normalized.requiresDateConfirmation, false);
    assert.equal(normalized.status, 'published');
    assert.equal(normalized.createdAt, '2026-11-11T12:00:00.000Z');
    assert.ok(typeof normalized.updatedAt === 'string' && normalized.updatedAt.endsWith('Z'));
    assert.deepEqual(normalized.subjects, ['Supply Chain Management', 'Business Analytics']);

    const sanitized = sanitizeForFirestore({ ...normalized, optionalUnset: undefined });
    assert.equal('optionalUnset' in sanitized, false);
    assert.equal(sanitized.startYear, '');
    assert.equal(sanitized.requiresDateConfirmation, false);
  });

  it('4. cmsService supports create, edit, draft isolation, and delete for education records cleanly', async () => {
    const initialCount = cmsService.getEducation(false).length;
    assert.ok(initialCount >= 2, 'Default MBA and B.Com records exist');

    // Create draft education record
    const created = await cmsService.addEducation({
      institution: 'Test Institute of Operations',
      degree: 'Executive Certificate',
      fieldOfStudy: 'Logistics',
      startYear: '2022',
      endYear: '2023',
      grade: 'Distinction',
      courseOverview: 'Focused executive program in logistics optimization.',
      specialization: 'Global Supply Chains',
      subjects: ['Inventory Control'],
      relevantCoursework: ['Demand Forecasting'],
      academicFocus: 'Quantitative fulfillment modeling.',
      learningOutcomes: ['Reduce lead time variance'],
      projectsResearch: 'Network Optimization Capstone',
      academicAchievements: ['Top Cohort Performer'],
      additionalNotes: 'Verified test record.',
      status: 'draft',
      highlights: ['Capstone Distinction'],
      skillsUsed: ['Order Management'],
      displayOrder: 99,
    });

    assert.ok(created.id.startsWith('edu-'));
    assert.equal(cmsService.getEducation(false).length, initialCount + 1);
    assert.equal(
      cmsService.getEducation(true).some((e) => e.id === created.id),
      false,
      'Draft record must remain hidden from published public list'
    );

    // Publish and verify visibility & persistence
    const updated = await cmsService.updateEducation(created.id, {
      status: 'published',
      courseOverview: 'Updated executive logistics curriculum.',
      learningOutcomes: ['Reduce lead time variance', 'Optimize multi-echelon stock'],
    });
    assert.equal(updated.status, 'published');
    assert.equal(updated.courseOverview, 'Updated executive logistics curriculum.');
    assert.equal(
      cmsService.getEducation(true).some((e) => e.id === created.id),
      true,
      'Published record must appear in public getEducation(true)'
    );

    // Cleanup delete
    await cmsService.deleteEducation(created.id);
    assert.equal(
      cmsService.getEducation(false).some((e) => e.id === created.id),
      false,
      'Deleted record must be removed cleanly'
    );
  });

  it('5. EditorialEducation renders approved academic detail sections only when populated', () => {
    const pubEdu = fs.readFileSync('src/components/editorial/EditorialEducation.tsx', 'utf-8');
    assert.ok(pubEdu.includes('About the Qualification'));
    assert.ok(pubEdu.includes('Areas of Study'));
    assert.ok(pubEdu.includes('Academic Focus'));
    assert.ok(pubEdu.includes('Key Learning Outcomes'));
    assert.ok(pubEdu.includes("filter((e) => e.status !== 'draft')"));
  });
});
