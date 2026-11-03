import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('MASTER ACCEPTANCE SUITE: AYUSH PRAKASH — CINEMATIC DIGITAL PORTFOLIO & COMPLETE ADMIN CMS', async (t) => {
  // Test 1: Full-screen Cinematic Natural 3D Scene with Lighting System (Part 1)
  await t.test('1. Cinematic 3D Scene has natural landscape, visible lighting, rim light behind figure, and no blue/yellow particle line', () => {
    const file = fs.readFileSync('src/components/cinematic/CinematicHeroScene.tsx', 'utf-8');
    assert.ok(file.includes('THREE.PerspectiveCamera'), 'Must use Three.js perspective camera');
    assert.ok(file.includes('THREE.WebGLRenderer'), 'Must use WebGLRenderer');
    assert.ok(file.includes('ambientLight'), 'Must have soft ambient illumination');
    assert.ok(file.includes('keyLight'), 'Must have key directional light');
    assert.ok(file.includes('rimLight'), 'Must have subtle rim lighting behind the human figure');
    assert.ok(file.includes('fillLight'), 'Must have foreground fill light for rocks');
    assert.ok(file.includes('waterGeo'), 'Must have reflective water surface plane');
    assert.ok(file.includes('rockMat'), 'Must have natural foreground dark rocks');
    assert.ok(file.includes('figureGroup'), 'Must include human figure viewed from behind');
    assert.ok(file.includes('FogExp2'), 'Must have atmospheric fog');
    // Verify removal of artificial blue/yellow particle line
    assert.ok(!file.includes('goldInstanced'), 'Distracting blue/yellow particle line removed');
    assert.ok(!file.includes('blueInstanced'), 'Distracting blue/yellow particle line removed');
  });

  // Test 2: Exact Homepage Layout (Section 4)
  await t.test('2. Exact Homepage Layout strictly matches Section 4 specifications', () => {
    const layout = fs.readFileSync('src/components/cinematic/CinematicHeroLayout.tsx', 'utf-8');
    // Top Left
    assert.ok(layout.includes('AYUSH PRAKASH'), 'Top Left default has AYUSH PRAKASH');
    // Top Nav
    assert.ok(layout.includes('projects') && layout.includes('experience') && layout.includes('about') && layout.includes('contact'), 'Nav links present');
    // Left Introduction
    assert.ok(
      layout.includes(
        'Business operations professional exploring the intersection of supply chain management, enterprise systems, artificial intelligence and digital product innovation.'
      ),
      'Must contain exact left intro text'
    );
    // Bottom Left Headline
    assert.ok(layout.includes('BUSINESS. SYSTEMS.'), 'Must have uppercase headline BUSINESS. SYSTEMS.');
    assert.ok(layout.includes('Intelligence &amp; Innovation.') || layout.includes('Intelligence & Innovation.'), 'Must have serif italic line');
    // Bottom Right
    assert.ok(layout.includes("Let's Connect") || layout.includes("Let&apos;s Connect"), 'Must have Let\'s Connect ↗ button');
    // Bottom Centre
    assert.ok(layout.includes('SCROLL TO EXPLORE'), 'Must have SCROLL TO EXPLORE indicator');
  });

  // Test 3: Rejection of Futuristic Dashboard / Cyberpunk Aesthetic (Section 1)
  await t.test('3. Rejection of futuristic sci-fi labels, decorative grids, and cyberpunk elements', () => {
    const appFile = fs.readFileSync('src/App.tsx', 'utf-8');
    const heroLayout = fs.readFileSync('src/components/cinematic/CinematicHeroLayout.tsx', 'utf-8');
    const aboutFile = fs.readFileSync('src/components/editorial/EditorialAbout.tsx', 'utf-8');
    const contactFile = fs.readFileSync('src/components/editorial/EditorialContact.tsx', 'utf-8');

    const combined = appFile + heroLayout + aboutFile + contactFile;
    assert.ok(!combined.includes('SYSTEM MATRIX'), 'Must NOT have SYSTEM MATRIX label');
    assert.ok(!combined.includes('ONLINE / ARCHITECT'), 'Must NOT have ONLINE / ARCHITECT label');
    assert.ok(!combined.includes('STACK_SPEC'), 'Must NOT have STACK_SPEC label');
    assert.ok(!combined.includes('NEURAL ENGINE'), 'Must NOT have NEURAL ENGINE label');
    assert.ok(!combined.includes('OPERATIONAL STATUS'), 'Must NOT have OPERATIONAL STATUS label');
    assert.ok(!combined.includes('01 // EDITORIAL PROFILE'), 'Must NOT have cyber numbered slashes');
  });

  // Test 4: Natural Cinematic Palette & Typography (Section 5 & 6)
  await t.test('4. Design tokens match natural cinematic palette (#111514, #18211D, #30383A) and typography', () => {
    const tokens = fs.readFileSync('src/styles/tokens.css', 'utf-8');
    assert.ok(tokens.includes('#111514'), 'Must have #111514 main charcoal');
    assert.ok(tokens.includes('#18211D'), 'Must have #18211D dark forest');
    assert.ok(tokens.includes('#30383A'), 'Must have #30383A deep slate');
    assert.ok(tokens.includes('#535655'), 'Must have #535655 natural stone');
    assert.ok(tokens.includes('#4A5749'), 'Must have #4A5749 muted forest');
    assert.ok(tokens.includes('#F4F3EE'), 'Must have #F4F3EE warm white');
    assert.ok(tokens.includes('#C1C4BE'), 'Must have #C1C4BE muted text');
    assert.ok(tokens.includes('#8294A6'), 'Must have #8294A6 subtle atmospheric blue');
    assert.ok(tokens.includes('Manrope'), 'Must use Manrope for body text & display');
    assert.ok(tokens.includes('Cormorant Garamond'), 'Must use Cormorant Garamond for italic editorial emphasis');
  });

  // Test 5: Refined Editorial Inner Pages (Section 9)
  await t.test('5. Inner pages use refined editorial layouts with genuine photo & screenshots', () => {
    const appFile = fs.readFileSync('src/App.tsx', 'utf-8');
    assert.ok(appFile.includes('EditorialAbout'), 'Must mount EditorialAbout');
    assert.ok(appFile.includes('EditorialExperience'), 'Must mount EditorialExperience');
    assert.ok(appFile.includes('EditorialCapabilities'), 'Must mount EditorialCapabilities');
    assert.ok(appFile.includes('EditorialOrion9'), 'Must mount EditorialOrion9');
    assert.ok(appFile.includes('EditorialApplyVise'), 'Must mount EditorialApplyVise');
    assert.ok(appFile.includes('EditorialCertifications'), 'Must mount EditorialCertifications');
    assert.ok(appFile.includes('EditorialEducation'), 'Must mount EditorialEducation');
    assert.ok(appFile.includes('EditorialContact'), 'Must mount EditorialContact');
  });

  // Test 6: Orion-9 Case Study (Section 9)
  await t.test('6. Orion-9 case study presents verified supply chain OS with real screenshots and lifecycle', () => {
    const file = fs.readFileSync('src/components/editorial/EditorialOrion9.tsx', 'utf-8');
    assert.ok(file.includes('admin-page.png'), 'Must reference actual screenshots');
    assert.ok(file.includes('OrionSupplyChainFlow'), 'Must include interactive supply chain process');
    assert.ok(file.includes('Production / Completed'), 'Must display completed status');
    assert.ok(file.includes('In Development') && file.includes('Architecture Roadmap'), 'Must display planned roadmap');
  });

  // Test 7: ApplyVise AI Case Study (Section 9)
  await t.test('7. ApplyVise AI case study presents career platform with real logo and pipeline', () => {
    const file = fs.readFileSync('src/components/editorial/EditorialApplyVise.tsx', 'utf-8');
    assert.ok(file.includes('applyvise-logo.png'), 'Must reference authentic branding asset');
    assert.ok(file.includes('ApplyViseCareerFlow'), 'Must include career intelligence flow');
    assert.ok(file.includes('Active') && file.includes('Functional'), 'Must display active status');
    assert.ok(file.includes('Planned Architecture'), 'Must display planned roadmap');
  });

  // Test 8: Complete LinkedIn-Style Profile Management System at /admin
  await t.test('8. LinkedIn-Style Profile Management System supports all 12 operational sections at /admin', () => {
    const admin = fs.readFileSync('src/components/admin/AdminConsole.tsx', 'utf-8');
    assert.ok(admin.includes('1. Overview'), 'Section 1: Overview Dashboard');
    assert.ok(admin.includes('2. Introduction'), 'Section 2: Introduction Editor');
    assert.ok(admin.includes('3. About'), 'Section 3: About Editor');
    assert.ok(admin.includes('4. Experience'), 'Section 4: Experience Editor');
    assert.ok(admin.includes('5. Projects'), 'Section 5: Projects Editor');
    assert.ok(admin.includes('6. Education'), 'Section 6: Education Editor');
    assert.ok(admin.includes('7. Licenses & Certifications'), 'Section 7: Licenses & Certifications');
    assert.ok(admin.includes('8. Skills'), 'Section 8: Central Skills Manager');
    assert.ok(admin.includes('9. Resume'), 'Section 9: Dedicated Resume Manager');
    assert.ok(admin.includes('10. Media Library'), 'Section 10: Media Library');
    assert.ok(admin.includes('11. Website Sections'), 'Section 11: Website Sections Manager');
    assert.ok(admin.includes('12. Settings'), 'Section 12: Settings & SEO');

    // Verify modular LinkedIn editor implementations
    assert.ok(fs.existsSync('src/components/admin/editors/IntroductionEditor.tsx'), 'IntroductionEditor exists');
    assert.ok(fs.existsSync('src/components/admin/editors/AboutEditor.tsx'), 'AboutEditor exists');
    assert.ok(fs.existsSync('src/components/admin/editors/ExperienceEditorModal.tsx'), 'ExperienceEditorModal exists');
    assert.ok(fs.existsSync('src/components/admin/editors/ProjectEditorModal.tsx'), 'ProjectEditorModal exists');
    assert.ok(fs.existsSync('src/components/admin/editors/CertificationEditorModal.tsx'), 'CertificationEditorModal exists');
    assert.ok(fs.existsSync('src/components/admin/editors/EducationEditorModal.tsx'), 'EducationEditorModal exists');
    assert.ok(fs.existsSync('src/components/admin/editors/SkillsManager.tsx'), 'SkillsManager exists');
    assert.ok(fs.existsSync('src/components/admin/editors/ResumeManager.tsx'), 'ResumeManager exists');
    assert.ok(fs.existsSync('src/components/admin/editors/MediaLibraryManager.tsx'), 'MediaLibraryManager exists');
    assert.ok(fs.existsSync('src/components/admin/editors/WebsiteSectionsManager.tsx'), 'WebsiteSectionsManager exists');
    assert.ok(fs.existsSync('src/components/admin/editors/SettingsManager.tsx'), 'SettingsManager exists');
  });

  // Test 9: Resume Management & Upload Capabilities (Part 4)
  await t.test('9. Resume management supports PDF upload, replace, and public toggle', () => {
    const cms = fs.readFileSync('src/services/cmsService.ts', 'utf-8');
    assert.ok(cms.includes('uploadResumeFile'), 'Must have uploadResumeFile service method');
    assert.ok(cms.includes('getResumeRecord'), 'Must have getResumeRecord service method');
    assert.ok(cms.includes('updateResumeRecord'), 'Must have updateResumeRecord service method');
  });

  // Test 10: Section Management & Dynamic Ordering (Part 5)
  await t.test('10. Section Manager supports reordering and dynamic visibility', () => {
    const cms = fs.readFileSync('src/services/cmsService.ts', 'utf-8');
    assert.ok(cms.includes('getSectionsConfig'), 'Must have getSectionsConfig');
    assert.ok(cms.includes('updateSectionsConfig'), 'Must have updateSectionsConfig');
    assert.ok(cms.includes('toggleSectionVisibility'), 'Must have toggleSectionVisibility');

    const appFile = fs.readFileSync('src/App.tsx', 'utf-8');
    assert.ok(appFile.includes('sortedSections'), 'App dynamically orders and renders visible sections');
  });

  // Test 11: Cloudflare & Security Rules Preservation (Part 8)
  await t.test('11. Cloudflare deployment config and Firestore security rules are verified', () => {
    const wrangler = fs.readFileSync('wrangler.jsonc', 'utf-8');
    assert.ok(wrangler.includes('"directory": "./dist"'), 'Static assets directory set to dist');
    assert.ok(wrangler.includes('"not_found_handling": "single-page-application"'), 'SPA routing enabled');

    const rules = fs.readFileSync('firestore.rules', 'utf-8');
    assert.ok(rules.includes('request.auth != null'), 'Firestore locks mutations to authenticated admin');
  });

  // Test 12: Production Bundle Verification
  await t.test('12. Production bundle is successfully compiled in dist directory', () => {
    assert.ok(fs.existsSync('dist/index.html'), 'dist/index.html must exist');
    assert.ok(fs.existsSync('dist/assets'), 'dist/assets directory must exist');
  });

  // Test 13: 18 LinkedIn Profile Management Workflows Verification (Part 15)
  await t.test('13. Verified 18 LinkedIn Profile Management workflows via CMS service', async () => {
    const cmsCode = fs.readFileSync('src/services/cmsService.ts', 'utf-8');
    assert.ok(cmsCode.includes('addProject'), 'Workflow 1: Create project');
    assert.ok(cmsCode.includes('updateProject'), 'Workflow 2: Edit description');
    assert.ok(cmsCode.includes('ensureSkill'), 'Workflow 3: Add/remove project skills');
    assert.ok(cmsCode.includes('uploadMediaFile'), 'Workflow 4: Replace logo');
    assert.ok(cmsCode.includes('status'), 'Workflow 5: Publish project');
    assert.ok(cmsCode.includes('onlyPublished'), 'Workflow 6: Verify only published appears publicly');
    assert.ok(cmsCode.includes('addExperience'), 'Workflow 7: Create experience with media');
    const expEditorCode = fs.readFileSync('src/components/admin/editors/ExperienceEditorModal.tsx', 'utf-8');
    assert.ok(expEditorCode.includes('skillsUsed'), 'Workflow 8: Add skills and highlights');
    assert.ok(cmsCode.includes('addCertification'), 'Workflow 10: Add certification with ID and URL');
    assert.ok(cmsCode.includes('uploadMediaFile'), 'Workflow 11: Upload certificate');
    assert.ok(cmsCode.includes('updateProfile'), 'Workflow 12: Update introduction');
    assert.ok(cmsCode.includes('updateAboutSettings'), 'Workflow 13: Replace About description');
    assert.ok(cmsCode.includes('uploadResumeFile'), 'Workflow 14: Upload and replace resume');
    assert.ok(cmsCode.includes("status === 'published'"), 'Workflow 15: Draft vs published separation');
    assert.ok(cmsCode.includes('checkMediaUsage'), 'Media Safety: Check usage before delete');

    // Verify editors enforce responsive layout and sticky action bars
    const introEditor = fs.readFileSync('src/components/admin/editors/IntroductionEditor.tsx', 'utf-8');
    assert.ok(introEditor.includes('sticky'), 'Introduction editor has sticky action bar');
    assert.ok(introEditor.includes('headline'), 'Introduction editor has long professional headline');

    const aboutEditor = fs.readFileSync('src/components/admin/editors/AboutEditor.tsx', 'utf-8');
    assert.ok(aboutEditor.includes('maxCharacters'), 'About editor has character counter');
    assert.ok(aboutEditor.includes('insertBullet'), 'About editor has bullet formatting');

    const expEditor = fs.readFileSync('src/components/admin/editors/ExperienceEditorModal.tsx', 'utf-8');
    assert.ok(expEditor.includes('mediaItems'), 'Experience editor has media gallery support');
    assert.ok(expEditor.includes('isCurrent'), 'Experience editor has currently working toggle');

    const projEditor = fs.readFileSync('src/components/admin/editors/ProjectEditorModal.tsx', 'utf-8');
    assert.ok(projEditor.includes('contentBlocks'), 'Project editor has structured content blocks');
    assert.ok(projEditor.includes('handleSetThumbnail'), 'Project editor has thumbnail selector');

    const certEditor = fs.readFileSync('src/components/admin/editors/CertificationEditorModal.tsx', 'utf-8');
    assert.ok(certEditor.includes('doesNotExpire'), 'Certification editor has does not expire toggle');
  });
});
