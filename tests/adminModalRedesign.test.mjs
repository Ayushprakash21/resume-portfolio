import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('MASTER ADMIN MODAL & POPUP REDESIGN SUITE', async (t) => {
  await t.test('1. AdminModal design system exports all unified layout components', () => {
    const modalPath = path.resolve('src/components/admin/common/AdminModal.tsx');
    assert.ok(fs.existsSync(modalPath), 'AdminModal.tsx must exist');
    const content = fs.readFileSync(modalPath, 'utf8');

    assert.match(content, /export const AdminModal:/, 'Must export AdminModal');
    assert.match(content, /export const AdminModalHeader:/, 'Must export AdminModalHeader');
    assert.match(content, /export const AdminModalBody:/, 'Must export AdminModalBody');
    assert.match(content, /export const AdminModalFooter:/, 'Must export AdminModalFooter');
    assert.match(content, /export const AdminFormField:/, 'Must export AdminFormField');
    assert.match(content, /export const AdminInput/, 'Must export AdminInput');
    assert.match(content, /export const AdminTextarea/, 'Must export AdminTextarea');
    assert.match(content, /export const AdminConfirmDialog:/, 'Must export AdminConfirmDialog');

    // Portal to document.body and body scroll lock
    assert.match(content, /ReactDOM\.createPortal/, 'Must use React Portal for detachment');
    assert.match(content, /document\.body\.style\.overflow = 'hidden'/, 'Must lock body scroll when open');
    assert.match(content, /e\.key === 'Escape'/, 'Must support Escape key to close');
  });

  await t.test('2. EducationEditorModal integrates unified AdminModal and uncompressed grid layouts', () => {
    const eduPath = path.resolve('src/components/admin/editors/EducationEditorModal.tsx');
    const content = fs.readFileSync(eduPath, 'utf8');

    assert.match(content, /import \{[^}]*AdminModal[^}]*\} from '\.\.\/common\/AdminModal'/, 'Must import AdminModal');
    assert.match(content, /<AdminModal/, 'Must mount AdminModal');
    assert.match(content, /<AdminModalHeader/, 'Must mount AdminModalHeader');
    assert.match(content, /<AdminModalBody/, 'Must mount AdminModalBody');
    assert.match(content, /<AdminModalFooter/, 'Must mount AdminModalFooter');

    // Layout grids ensuring zero truncation
    assert.match(content, /admin-grid-2col/, 'Must use admin-grid-2col for Degree and Field of Study');
    assert.match(content, /admin-grid-dates-grade/, 'Must use admin-grid-dates-grade for Start Year, End Year and Grade');
  });

  await t.test('3. ExperienceEditorModal integrates unified AdminModal with clean footer action hierarchy', () => {
    const expPath = path.resolve('src/components/admin/editors/ExperienceEditorModal.tsx');
    const content = fs.readFileSync(expPath, 'utf8');

    assert.match(content, /import \{[^}]*AdminModal[^}]*\} from '\.\.\/common\/AdminModal'/, 'Must import AdminModal');
    assert.match(content, /<AdminModal/, 'Must mount AdminModal');
    assert.match(content, /<AdminModalHeader/, 'Must mount AdminModalHeader');
    assert.match(content, /<AdminModalBody/, 'Must mount AdminModalBody');
    assert.match(content, /<AdminModalFooter/, 'Must mount AdminModalFooter');
  });

  await t.test('4. CertificationEditorModal integrates unified AdminModal', () => {
    const certPath = path.resolve('src/components/admin/editors/CertificationEditorModal.tsx');
    const content = fs.readFileSync(certPath, 'utf8');

    assert.match(content, /import \{[^}]*AdminModal[^}]*\} from '\.\.\/common\/AdminModal'/, 'Must import AdminModal');
    assert.match(content, /<AdminModal/, 'Must mount AdminModal');
    assert.match(content, /<AdminModalHeader/, 'Must mount AdminModalHeader');
    assert.match(content, /<AdminModalBody/, 'Must mount AdminModalBody');
    assert.match(content, /<AdminModalFooter/, 'Must mount AdminModalFooter');
  });

  await t.test('5. ProjectEditorModal integrates unified AdminModal', () => {
    const projPath = path.resolve('src/components/admin/editors/ProjectEditorModal.tsx');
    const content = fs.readFileSync(projPath, 'utf8');

    assert.match(content, /import \{[^}]*AdminModal[^}]*\} from '\.\.\/common\/AdminModal'/, 'Must import AdminModal');
    assert.match(content, /<AdminModal/, 'Must mount AdminModal');
    assert.match(content, /<AdminModalHeader/, 'Must mount AdminModalHeader');
    assert.match(content, /<AdminModalBody/, 'Must mount AdminModalBody');
    assert.match(content, /<AdminModalFooter/, 'Must mount AdminModalFooter');
  });

  await t.test('6. SkillsManager, ResumeManager, MediaLibraryManager & AdminLogin integrate unified modals', () => {
    const skillsPath = path.resolve('src/components/admin/editors/SkillsManager.tsx');
    assert.match(fs.readFileSync(skillsPath, 'utf8'), /<AdminModal/, 'SkillsManager must mount AdminModal');

    const resumePath = path.resolve('src/components/admin/editors/ResumeManager.tsx');
    assert.match(fs.readFileSync(resumePath, 'utf8'), /<AdminModal/, 'ResumeManager must mount AdminModal');

    const mediaPath = path.resolve('src/components/admin/editors/MediaLibraryManager.tsx');
    assert.match(fs.readFileSync(mediaPath, 'utf8'), /<AdminModal/, 'MediaLibraryManager must mount AdminModal');

    const loginPath = path.resolve('src/components/admin/AdminLogin.tsx');
    assert.match(fs.readFileSync(loginPath, 'utf8'), /<AdminModal/, 'AdminLogin must mount AdminModal');
  });

  await t.test('7. SearchableSelect avoids selected-value truncation and refines badge layout', () => {
    const selectPath = path.resolve('src/components/admin/common/SearchableSelect.tsx');
    const content = fs.readFileSync(selectPath, 'utf8');

    assert.match(content, /title=\{displayLabel\}/, 'Must provide native tooltip on selected label');
    assert.match(content, /WebkitLineClamp:\s*2/, 'Must support flexible 2-line display without single line chop');
    assert.match(content, /flexShrink:\s*0/, 'Badge must have flexShrink 0 to prevent crushing text');
  });
});
