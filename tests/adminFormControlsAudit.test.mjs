import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('ADMIN-WIDE FORM CONTROL & DROPDOWN AUDIT SUITE', async (t) => {
  await t.test('1. SearchableSelect implements Portal rendering and intelligent flip positioning', () => {
    const filePath = path.resolve('src/components/admin/common/SearchableSelect.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    // Verify React Portal usage to document.body
    assert.match(content, /ReactDOM\.createPortal/, 'SearchableSelect must use ReactDOM.createPortal to prevent modal clipping');
    assert.match(content, /document\.body/, 'Dropdown popup must be appended directly to document.body');

    // Verify fixed position and high z-index
    assert.match(content, /position:\s*'fixed'/, 'Portal popup must have position fixed');
    assert.match(content, /zIndex:\s*999999/, 'Popup must have z-index 999999 above all modals');

    // Verify intelligent boundary and flip logic
    assert.match(content, /getBoundingClientRect/, 'Must measure trigger element bounding rect');
    assert.match(content, /shouldFlip/, 'Must calculate intelligent vertical flip');
    assert.match(content, /spaceBelow\s*<\s*220/, 'Must detect when space below trigger is tight (< 220px)');

    // Verify multi-select support
    assert.match(content, /isMulti\?: boolean/, 'Must accept isMulti prop');
    assert.match(content, /handleRemoveChip/, 'Must allow removing individual multi-select chips');

    // Verify keyboard navigation
    assert.match(content, /handleKeyDown/, 'Must handle keyboard navigation');
    assert.match(content, /ArrowDown/, 'Must support ArrowDown');
    assert.match(content, /ArrowUp/, 'Must support ArrowUp');
    assert.match(content, /Escape/, 'Must support Escape key to close');
  });

  await t.test('2. InstitutionSelector renders immediate options, search filter, and custom entries', () => {
    const filePath = path.resolve('src/components/admin/common/InstitutionSelector.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.match(content, /Devi Ahilya University/, 'Must include resume MBA institution');
    assert.match(content, /Rani Durgavati University/, 'Must include resume B.Com institution');
    assert.match(content, /SearchableSelect/, 'Must wrap SearchableSelect');
    assert.match(content, /allowCustom=\{true\}/, 'Must allow custom institutions');
  });

  await t.test('3. DegreeSelector & FieldOfStudySelector support full academic fields', () => {
    const degPath = path.resolve('src/components/admin/common/DegreeSelector.tsx');
    const degContent = fs.readFileSync(degPath, 'utf8');
    assert.match(degContent, /Master of Business Administration \(MBA\)/, 'Must include MBA');
    assert.match(degContent, /Bachelor of Commerce \(B\.Com\.\)/, 'Must include B.Com');

    const fieldPath = path.resolve('src/components/admin/common/FieldOfStudySelector.tsx');
    const fieldContent = fs.readFileSync(fieldPath, 'utf8');
    assert.match(fieldContent, /IT & Marketing/, 'Must include resume exact IT & Marketing');
    assert.match(fieldContent, /Computer Applications/, 'Must include resume exact Computer Applications');
    assert.match(fieldContent, /allowCustom=\{true\}/, 'Must allow custom fields of study');
  });

  await t.test('4. YearSelector and GradeTypeSelector provide clean controlled academic options', () => {
    const yearPath = path.resolve('src/components/admin/common/YearSelector.tsx');
    const yearContent = fs.readFileSync(yearPath, 'utf8');
    assert.match(yearContent, /minYear/, 'YearSelector must support minYear');
    assert.match(yearContent, /maxYear/, 'YearSelector must support maxYear');

    const gradePath = path.resolve('src/components/admin/common/GradeTypeSelector.tsx');
    const gradeContent = fs.readFileSync(gradePath, 'utf8');
    assert.match(gradeContent, /First Class with Distinction/, 'Must support honors distinction');
    assert.match(gradeContent, /CGPA \(out of 10\.0\)/, 'Must support CGPA scale');
  });

  await t.test('5. JobTitleSelector provides authoritative resume roles and custom entry', () => {
    const jobPath = path.resolve('src/components/admin/common/JobTitleSelector.tsx');
    const jobContent = fs.readFileSync(jobPath, 'utf8');
    assert.match(jobContent, /Operations & Systems Specialist/, 'Must include resume primary title');
    assert.match(jobContent, /Lead System Architect & Founder/, 'Must include resume founder title');
    assert.match(jobContent, /allowCustom=\{true\}/, 'Must allow custom job titles');
  });

  await t.test('6. EmploymentTypeSelector & WorkplaceTypeSelector provide controlled options', () => {
    const empPath = path.resolve('src/components/admin/common/EmploymentTypeSelector.tsx');
    const empContent = fs.readFileSync(empPath, 'utf8');
    assert.match(empContent, /Full-time/, 'Must support Full-time');
    assert.match(empContent, /Contract/, 'Must support Contract');
    assert.match(empContent, /Founder/, 'Must support Founder');

    const workPath = path.resolve('src/components/admin/common/WorkplaceTypeSelector.tsx');
    const workContent = fs.readFileSync(workPath, 'utf8');
    assert.match(workContent, /On-site/, 'Must support On-site');
    assert.match(workContent, /Hybrid/, 'Must support Hybrid');
    assert.match(workContent, /Remote/, 'Must support Remote');
  });

  await t.test('7. ProjectCategorySelector & DevelopmentStatusSelector provide technical project options', () => {
    const catPath = path.resolve('src/components/admin/common/ProjectCategorySelector.tsx');
    const catContent = fs.readFileSync(catPath, 'utf8');
    assert.match(catContent, /Enterprise AI & Systems/, 'Must support Enterprise AI');
    assert.match(catContent, /Supply Chain Operating System/, 'Must support Supply Chain OS');

    const statPath = path.resolve('src/components/admin/common/DevelopmentStatusSelector.tsx');
    const statContent = fs.readFileSync(statPath, 'utf8');
    assert.match(statContent, /Active Architectural Prototype & Research/, 'Must support Research Prototype');
    assert.match(statContent, /Production System/, 'Must support Production System');
  });

  await t.test('8. SkillsMultiSelector implements multi-chip selection with central library sync', () => {
    const skillsPath = path.resolve('src/components/admin/common/SkillsMultiSelector.tsx');
    const skillsContent = fs.readFileSync(skillsPath, 'utf8');
    assert.match(skillsContent, /isMulti=\{true\}/, 'SkillsMultiSelector must enable isMulti');
    assert.match(skillsContent, /allowCustom=\{true\}/, 'Must allow custom skills');
  });

  await t.test('9. LocationSelector implements Portal rendering and geocoded search', () => {
    const locPath = path.resolve('src/components/admin/common/LocationSelector.tsx');
    const locContent = fs.readFileSync(locPath, 'utf8');
    assert.match(locContent, /ReactDOM\.createPortal/, 'LocationSelector must use portal for zero modal clipping');
    assert.match(locContent, /Indore/, 'Must include Indore');
    assert.match(locContent, /Anand/, 'Must include Anand');
    assert.match(locContent, /Jabalpur/, 'Must include Jabalpur');
  });

  await t.test('10. EducationEditorModal integrates new specialized selectors', () => {
    const eduPath = path.resolve('src/components/admin/editors/EducationEditorModal.tsx');
    const eduContent = fs.readFileSync(eduPath, 'utf8');
    assert.match(eduContent, /<InstitutionSelector/, 'Must mount InstitutionSelector');
    assert.match(eduContent, /<DegreeSelector/, 'Must mount DegreeSelector');
    assert.match(eduContent, /<FieldOfStudySelector/, 'Must mount FieldOfStudySelector');
    assert.match(eduContent, /<YearSelector/, 'Must mount YearSelector');
    assert.match(eduContent, /<GradeTypeSelector/, 'Must mount GradeTypeSelector');
    assert.match(eduContent, /<SkillsMultiSelector/, 'Must mount SkillsMultiSelector');
  });

  await t.test('11. ExperienceEditorModal integrates new specialized selectors', () => {
    const expPath = path.resolve('src/components/admin/editors/ExperienceEditorModal.tsx');
    const expContent = fs.readFileSync(expPath, 'utf8');
    assert.match(expContent, /<JobTitleSelector/, 'Must mount JobTitleSelector');
    assert.match(expContent, /<CompanySelector/, 'Must mount CompanySelector');
    assert.match(expContent, /<EmploymentTypeSelector/, 'Must mount EmploymentTypeSelector');
    assert.match(expContent, /<WorkplaceTypeSelector/, 'Must mount WorkplaceTypeSelector');
    assert.match(expContent, /<LocationSelector/, 'Must mount LocationSelector');
    assert.match(expContent, /<SkillsMultiSelector/, 'Must mount SkillsMultiSelector');
  });

  await t.test('12. ProjectEditorModal integrates new specialized selectors', () => {
    const projPath = path.resolve('src/components/admin/editors/ProjectEditorModal.tsx');
    const projContent = fs.readFileSync(projPath, 'utf8');
    assert.match(projContent, /<ProjectCategorySelector/, 'Must mount ProjectCategorySelector');
    assert.match(projContent, /<DevelopmentStatusSelector/, 'Must mount DevelopmentStatusSelector');
    assert.match(projContent, /<CompanySelector/, 'Must mount CompanySelector');
    assert.match(projContent, /<SkillsMultiSelector/, 'Must mount SkillsMultiSelector');
  });
});
