import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { sanitizeForFirestore } from '../src/utils/firestoreSerializer.ts';

test('EXPERIENCE CLASSIFICATION & EMPLOYMENT TYPE BUG FIX SUITE', async (t) => {
  await t.test('1. ExperienceRecord interface definition has optional employmentType and showEmploymentTypeBadge', () => {
    const cmsTypesPath = path.resolve('src/types/cms.ts');
    const content = fs.readFileSync(cmsTypesPath, 'utf8');
    assert.match(content, /employmentType\?: string/, 'ExperienceRecord should have optional employmentType');
    assert.match(content, /showEmploymentTypeBadge\?: boolean/, 'ExperienceRecord should have optional showEmploymentTypeBadge');
  });

  await t.test('2. ExperienceEditorModal does NOT fallback to "Full-time" or hardcoded strings when employmentType is empty', () => {
    const modalPath = path.resolve('src/components/admin/editors/ExperienceEditorModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf8');
    // Ensure it does not use `employmentType || 'Full-time'`
    assert.doesNotMatch(content, /employmentType:\s*initialExperience\.employmentType\s*\|\|\s*'Full-time'/,
      'Modal must not fallback to Full-time when editing experience with empty string');
    // Ensure None / Not Specified option exists
    assert.match(content, /<option value="">None \/ Not Specified \(No Badge\)<\/option>/,
      'Modal must provide None / Not Specified option');
    // Ensure Clear button exists
    assert.match(content, /Clear \/ Remove Badge/, 'Modal must provide a Clear / Remove Badge action');
    // Ensure showEmploymentTypeBadge toggle exists
    assert.match(content, /showEmploymentTypeBadge/, 'Modal must provide showEmploymentTypeBadge toggle');
  });

  await t.test('3. EditorialExperience & AdminConsole respect empty employmentType and showEmploymentTypeBadge', () => {
    const editorialPath = path.resolve('src/components/editorial/EditorialExperience.tsx');
    const editorialContent = fs.readFileSync(editorialPath, 'utf8');
    assert.match(editorialContent, /exp\.employmentType && exp\.showEmploymentTypeBadge !== false/,
      'EditorialExperience must check employmentType and showEmploymentTypeBadge');

    const adminPath = path.resolve('src/components/admin/AdminConsole.tsx');
    const adminContent = fs.readFileSync(adminPath, 'utf8');
    assert.match(adminContent, /exp\.employmentType && exp\.showEmploymentTypeBadge !== false/,
      'AdminConsole must check employmentType and showEmploymentTypeBadge');
  });

  await t.test('4. Seed data does NOT hardcode "Founder / Self-employed"', () => {
    const seedPath = path.resolve('src/data/seedData.ts');
    const seedContent = fs.readFileSync(seedPath, 'utf8');
    assert.doesNotMatch(seedContent, /employmentType:\s*'Founder \/ Self-employed'/,
      'Seed data must not hardcode Founder / Self-employed');
  });

  await t.test('5. sanitizeForFirestore preserves empty string for employmentType', () => {
    const payload = {
      jobTitle: 'Associate Project Manager',
      employer: 'ESP Softtech Pvt Ltd',
      employmentType: '',
      showEmploymentTypeBadge: true,
      undefinedField: undefined
    };
    const sanitized = sanitizeForFirestore(payload);
    assert.equal(sanitized.employmentType, '', 'Empty string must be strictly preserved');
    assert.equal(sanitized.showEmploymentTypeBadge, true);
    assert.equal('undefinedField' in sanitized, false);
  });
});
