import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('MASTER ACCEPTANCE SUITE: AYUSH PRAKASH — CINEMATIC DIGITAL PORTFOLIO (LE:MMA DIRECTION)', async (t) => {
  // Test 1: Full-screen Cinematic Natural 3D Scene (Section 3 & 8)
  await t.test('1. Cinematic 3D Scene has natural landscape, mountains, reflective water, rocks, vegetation, and human figure viewed from behind', () => {
    const file = fs.readFileSync('src/components/cinematic/CinematicHeroScene.tsx', 'utf-8');
    assert.ok(file.includes('THREE.PerspectiveCamera'), 'Must use Three.js perspective camera');
    assert.ok(file.includes('THREE.WebGLRenderer'), 'Must use WebGLRenderer');
    assert.ok(file.includes('createMountainRidge'), 'Must generate natural mountain silhouettes');
    assert.ok(file.includes('waterGeo'), 'Must have reflective water surface plane');
    assert.ok(file.includes('rockMat'), 'Must have natural foreground dark rocks');
    assert.ok(file.includes('foliageGroup'), 'Must have dense shoreline vegetation / foliage');
    assert.ok(file.includes('figureGroup'), 'Must include single human figure viewed from behind');
    assert.ok(file.includes('FogExp2'), 'Must have atmospheric fog');
  });

  // Test 2: Exact Homepage Layout (Section 4)
  await t.test('2. Exact Homepage Layout strictly matches Section 4 specifications', () => {
    const layout = fs.readFileSync('src/components/cinematic/CinematicHeroLayout.tsx', 'utf-8');
    // Top Left
    assert.ok(layout.includes('AYUSH PRAKASH'), 'Top Left must have AYUSH PRAKASH');
    // Top Nav
    assert.ok(layout.includes('Work'), 'Nav must have Work');
    assert.ok(layout.includes('Experience'), 'Nav must have Experience');
    assert.ok(layout.includes('About'), 'Nav must have About');
    assert.ok(layout.includes('Projects'), 'Nav must have Projects');
    assert.ok(layout.includes('Contact'), 'Nav must have Contact');
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

  // Test 8: Private Admin CMS Preservation (Section 10)
  await t.test('8. Private Admin CMS supports all 12 operational modules at /admin', () => {
    const admin = fs.readFileSync('src/components/admin/AdminConsole.tsx', 'utf-8');
    assert.ok(admin.includes('1. Dashboard'), 'Module 1: Dashboard');
    assert.ok(admin.includes('2. Profile Manager'), 'Module 2: Profile');
    assert.ok(admin.includes('3. Experience'), 'Module 3: Experience');
    assert.ok(admin.includes('4. Projects'), 'Module 4: Projects');
    assert.ok(admin.includes('5. Certifications'), 'Module 5: Certifications');
    assert.ok(admin.includes('6. Skills & Knowledge'), 'Module 6: Skills');
    assert.ok(admin.includes('7. Education'), 'Module 7: Education');
    assert.ok(admin.includes('8. Media Library'), 'Module 8: Media Library');
    assert.ok(admin.includes('9. Resume PDF'), 'Module 9: Resume');
    assert.ok(admin.includes('10. Contact Messages'), 'Module 10: Messages');
    assert.ok(admin.includes('11. Site Settings'), 'Module 11: Settings');
    assert.ok(admin.includes('12. SEO Management'), 'Module 12: SEO');
  });

  // Test 9: Cloudflare & Security Rules Preservation
  await t.test('9. Cloudflare deployment config and Firestore security rules are verified', () => {
    const wrangler = fs.readFileSync('wrangler.jsonc', 'utf-8');
    assert.ok(wrangler.includes('"directory": "./dist"'), 'Static assets directory set to dist');
    assert.ok(wrangler.includes('"not_found_handling": "single-page-application"'), 'SPA routing enabled');

    const rules = fs.readFileSync('firestore.rules', 'utf-8');
    assert.ok(rules.includes('request.auth != null'), 'Firestore locks mutations to authenticated admin');
  });

  // Test 10: Production Bundle Verification
  await t.test('10. Production bundle is successfully compiled in dist directory', () => {
    assert.ok(fs.existsSync('dist/index.html'), 'dist/index.html must exist');
    assert.ok(fs.existsSync('dist/assets'), 'dist/assets directory must exist');
  });
});
