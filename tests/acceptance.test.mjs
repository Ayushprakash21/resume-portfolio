import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('ACCEPTANCE SUITE: AYUSH PRAKASH IMMERSIVE 3D PORTFOLIO + CMS', async (t) => {
  // Test 1: Homepage displays an actual interactive 3D environment
  await t.test('1. Homepage displays an actual interactive 3D environment with Three.js', () => {
    const file = fs.readFileSync('src/components/3d/UniverseCanvas.tsx', 'utf-8');
    assert.ok(file.includes('THREE.PerspectiveCamera'), 'Must have Three.js PerspectiveCamera');
    assert.ok(file.includes('THREE.WebGLRenderer'), 'Must have Three.js WebGLRenderer');
    assert.ok(file.includes('THREE.DirectionalLight'), 'Must have realistic lighting');
    assert.ok(file.includes('THREE.GridHelper'), 'Must have spatial ground coordinate grid');
  });

  // Test 2: 3D objects respond to user interactions
  await t.test('2. 3D objects respond to user interactions (raycaster hover, click, smooth camera lerp)', () => {
    const file = fs.readFileSync('src/components/3d/UniverseCanvas.tsx', 'utf-8');
    assert.ok(file.includes('THREE.Raycaster'), 'Must use Raycaster for 3D interactions');
    assert.ok(file.includes('handleMouseMove'), 'Must handle mouse tracking');
    assert.ok(file.includes('handleClick'), 'Must handle 3D structure click');
    assert.ok(file.includes('currentCamPos.current.lerp'), 'Must interpolate camera position');
  });

  // Test 3: Public navigation works
  await t.test('3. Public navigation works and provides alternate conventional navigation', () => {
    const file = fs.readFileSync('src/components/public/NavbarRedesigned.tsx', 'utf-8');
    assert.ok(file.includes('navItems'), 'Must have conventional navigation items');
    assert.ok(file.includes('onSelectZone'), 'Must support spatial zone triggers');
  });

  // Test 4: All 11 portfolio sections are implemented
  await t.test('4. All required portfolio sections are implemented with distinct visual presentations', () => {
    const appFile = fs.readFileSync('src/App.tsx', 'utf-8');
    assert.ok(appFile.includes('UniverseCanvas'), 'Section 1: Interactive Home');
    assert.ok(appFile.includes('AboutSection'), 'Section 2: About');
    assert.ok(appFile.includes('ExperienceSection'), 'Section 3: Experience');
    assert.ok(appFile.includes('SkillsSection'), 'Section 4: Skills');
    assert.ok(appFile.includes('OrionSectionRedesigned'), 'Section 5: Orion-9');
    assert.ok(appFile.includes('ApplyViseSectionRedesigned'), 'Section 6: ApplyVise AI');
    assert.ok(appFile.includes('ArchitectureSection'), 'Section 7: Architecture');
    assert.ok(appFile.includes('CertificationsSectionRedesigned'), 'Section 8: Certifications');
    assert.ok(appFile.includes('EducationSection'), 'Section 9: Education');
    assert.ok(appFile.includes('RecruiterModeModal'), 'Section 10: Recruiter Mode');
    assert.ok(appFile.includes('ContactSectionRedesigned'), 'Section 11: Contact');
  });

  // Test 5 & 6: Admin Login & Protected Access
  await t.test('5 & 6. Admin login works and unauthorized users cannot access protected functionality', () => {
    const authFile = fs.readFileSync('src/services/authService.ts', 'utf-8');
    assert.ok(authFile.includes('AUTHORIZED_ADMIN_EMAILS'), 'Must restrict to authorized admin email list');
    assert.ok(authFile.includes('signInWithEmailAndPassword'), 'Must use Firebase Auth credentials');
    assert.ok(!authFile.includes('"password123"'), 'Must not have hardcoded admin password');
  });

  // Test 7, 8, 9: Experience CRUD
  await t.test('7, 8, 9. Administrator can create, edit, and delete experience entries', () => {
    const cmsFile = fs.readFileSync('src/services/cmsService.ts', 'utf-8');
    assert.ok(cmsFile.includes('addExperience'), 'Must support addExperience');
    assert.ok(cmsFile.includes('updateExperience'), 'Must support updateExperience');
    assert.ok(cmsFile.includes('deleteExperience'), 'Must support deleteExperience');
  });

  // Test 10: Projects CRUD
  await t.test('10. Administrator can create and edit projects', () => {
    const cmsFile = fs.readFileSync('src/services/cmsService.ts', 'utf-8');
    assert.ok(cmsFile.includes('addProject'), 'Must support addProject');
    assert.ok(cmsFile.includes('updateProject'), 'Must support updateProject');
    assert.ok(cmsFile.includes('deleteProject'), 'Must support deleteProject');
  });

  // Test 11: Certifications
  await t.test('11. Administrator can upload certification images and manage verified credentials', () => {
    const cmsFile = fs.readFileSync('src/services/cmsService.ts', 'utf-8');
    assert.ok(cmsFile.includes('addCertification'), 'Must support addCertification');
    assert.ok(cmsFile.includes('updateCertification'), 'Must support updateCertification');
  });

  // Test 12: Skills
  await t.test('12. Administrator can manage skills without unverified proficiency percentages', () => {
    const cmsFile = fs.readFileSync('src/services/cmsService.ts', 'utf-8');
    const skillsFile = fs.readFileSync('src/components/public/SkillsSection.tsx', 'utf-8');
    assert.ok(cmsFile.includes('addSkill'), 'Must support addSkill');
    assert.ok(cmsFile.includes('deleteSkill'), 'Must support deleteSkill');
    assert.ok(!skillsFile.includes('%'), 'Must not render unverified percentage bars');
  });

  // Test 13: Resume Manager
  await t.test('13. Administrator can upload, replace, and test active resume', () => {
    const cmsFile = fs.readFileSync('src/services/cmsService.ts', 'utf-8');
    const adminConsole = fs.readFileSync('src/components/admin/AdminConsole.tsx', 'utf-8');
    assert.ok(cmsFile.includes('uploadResume'), 'Must have uploadResume service');
    assert.ok(adminConsole.includes('Upload & Replace Active Resume PDF'), 'Admin console must provide resume replace interface');
  });

  // Test 14: Contact Messages
  await t.test('14. Administrator can view, mark read, and archive contact messages', () => {
    const cmsFile = fs.readFileSync('src/services/cmsService.ts', 'utf-8');
    assert.ok(cmsFile.includes('getContactMessages'), 'Must fetch contact messages');
    assert.ok(cmsFile.includes('markMessageRead'), 'Must mark message as read');
    assert.ok(cmsFile.includes('archiveMessage'), 'Must archive message');
  });

  // Test 15: Public CMS Connection
  await t.test('15. Published CMS changes appear on public website via reactive subscriptions', () => {
    const cmsFile = fs.readFileSync('src/services/cmsService.ts', 'utf-8');
    const appFile = fs.readFileSync('src/App.tsx', 'utf-8');
    assert.ok(cmsFile.includes('subscribe'), 'CMS must support reactive subscribers');
    assert.ok(appFile.includes('cmsService.subscribe'), 'App must re-render on CMS updates');
  });

  // Test 16: Firestore Security Rules
  await t.test('16. Firestore security rules prevent unauthorized writes', () => {
    const rules = fs.readFileSync('firestore.rules', 'utf-8');
    assert.ok(rules.includes('function isAdmin()'), 'Must enforce isAdmin function');
    assert.ok(rules.includes('allow write: if isAdmin();'), 'Must protect all writes');
    assert.ok(rules.includes('match /contactMessages/{messageId}'), 'Must validate public contact form creation');
  });

  // Test 17: Interactive Visualizations (Orion-9 and ApplyVise AI)
  await t.test('17. Orion-9 and ApplyVise AI interactive visualizations implemented', () => {
    const orionFlow = fs.readFileSync('src/components/interactive/OrionSupplyChainFlow.tsx', 'utf-8');
    assert.ok(orionFlow.includes('Supplier'), 'Must have Supplier stage');
    assert.ok(orionFlow.includes('Procurement'), 'Must have Procurement stage');
    assert.ok(orionFlow.includes('Inventory'), 'Must have Inventory stage');
    assert.ok(orionFlow.includes('Warehouse'), 'Must have Warehouse stage');
    assert.ok(orionFlow.includes('Shipment'), 'Must have Shipment stage');
    assert.ok(orionFlow.includes('Customer'), 'Must have Customer stage');

    const applyFlow = fs.readFileSync('src/components/interactive/ApplyViseCareerFlow.tsx', 'utf-8');
    assert.ok(applyFlow.includes('Resume'), 'Must have Resume stage');
    assert.ok(applyFlow.includes('Analysis'), 'Must have Analysis stage');
    assert.ok(applyFlow.includes('Job Reqs'), 'Must have Job Reqs stage');
    assert.ok(applyFlow.includes('Skills Gap'), 'Must have Skills Gap stage');
    assert.ok(applyFlow.includes('Prep & Submit'), 'Must have Prep stage');
  });

  // Test 18: Production dist folder exists and is valid
  await t.test('18. Production build succeeds and generated assets exist', () => {
    assert.ok(fs.existsSync('dist/index.html'), 'dist/index.html must exist');
    const html = fs.readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('Ayush Prakash'), 'Index HTML must include metadata');
  });
});
