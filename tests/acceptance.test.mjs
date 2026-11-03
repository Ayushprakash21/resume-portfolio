import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('MASTER ACCEPTANCE SUITE: AYUSH PRAKASH — AP PERSONAL BRAND IDENTITY & BLACK LUXURY PORTFOLIO', async (t) => {
  // Test 1: Full-screen Cinematic 3D Scene in Black Luxury Obsidian
  await t.test('1. Cinematic 3D Scene has luxury obsidian landscape, crisp silver rim lighting, and no green tints', () => {
    const file = fs.readFileSync('src/components/cinematic/CinematicHeroScene.tsx', 'utf-8');
    assert.ok(file.includes('THREE.PerspectiveCamera'), 'Must use Three.js perspective camera');
    assert.ok(file.includes('THREE.WebGLRenderer'), 'Must use WebGLRenderer');
    assert.ok(file.includes('ambientLight'), 'Must have soft ambient illumination');
    assert.ok(file.includes('keyLight'), 'Must have key directional light');
    assert.ok(file.includes('rimLight'), 'Must have crisp silver rim lighting behind the human figure');
    assert.ok(file.includes('waterGeo'), 'Must have reflective liquid obsidian water surface');
    assert.ok(file.includes('rockMat'), 'Must have natural foreground graphite rocks');
    assert.ok(file.includes('figureGroup'), 'Must include human figure in liquid metallic cloak');
    assert.ok(file.includes('FogExp2'), 'Must have atmospheric fog');
    // Verify removal of artificial blue/yellow particle line
    assert.ok(!file.includes('goldInstanced'), 'Distracting blue/yellow particle line removed');
    assert.ok(!file.includes('blueInstanced'), 'Distracting blue/yellow particle line removed');
    // Verify rejection of dull green colors in 3D scene
    assert.ok(!file.includes('#4E5B53'), 'Dull green sky background removed');
    assert.ok(!file.includes('#1F2A23'), 'Dull green hill removed');
    assert.ok(!file.includes('#19221C'), 'Dull green conifers removed');
  });

  // Test 2: Homepage Layout strictly matches Hero specifications
  await t.test('2. Homepage Layout contains branding, intro, headline, and scroll explorer', () => {
    const layout = fs.readFileSync('src/components/cinematic/CinematicHeroLayout.tsx', 'utf-8');
    assert.ok(layout.includes('AYUSH PRAKASH'), 'Top Left default has AYUSH PRAKASH');
    assert.ok(layout.includes('ApMonogram'), 'Header and Hero must integrate ApMonogram component');
    assert.ok(layout.includes('experience') && layout.includes('about') && layout.includes('contact'), 'Nav links present');
    assert.ok(layout.includes('opentowork'), 'Open to Work navigation link present');
    assert.ok(
      layout.includes(
        'Business operations professional exploring the intersection of supply chain management, enterprise systems, artificial intelligence and digital product innovation.'
      ),
      'Must contain exact left intro text'
    );
    assert.ok(layout.includes('BUSINESS. SYSTEMS.'), 'Must have uppercase headline BUSINESS. SYSTEMS.');
    assert.ok(layout.includes('Intelligence &amp; Innovation.') || layout.includes('Intelligence & Innovation.'), 'Must have serif italic line');
    assert.ok(layout.includes("Let's Connect") || layout.includes("Let&apos;s Connect"), 'Must have Let\'s Connect ↗ button');
    assert.ok(layout.includes('SCROLL TO EXPLORE'), 'Must have SCROLL TO EXPLORE indicator');
  });

  // Test 3: Rejection of Futuristic Dashboard / Cyberpunk Aesthetic
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

  // Test 4: Black Luxury Palette & Typography
  await t.test('4. Design tokens match Black Luxury Glassmorphism specifications', () => {
    const tokens = fs.readFileSync('src/styles/tokens.css', 'utf-8');
    assert.ok(tokens.includes('--brand-obsidian: #050505'), 'Must have #050505 obsidian');
    assert.ok(tokens.includes('--brand-deep-black: #09090B'), 'Must have #09090B deep black');
    assert.ok(tokens.includes('--brand-graphite: #151518'), 'Must have #151518 graphite');
    assert.ok(tokens.includes('--brand-glass-surface: rgba(255, 255, 255, 0.055)'), 'Must have glass surface');
    assert.ok(tokens.includes('--brand-glass-border: rgba(255, 255, 255, 0.12)'), 'Must have glass border');
    assert.ok(tokens.includes('--brand-silver: #C8C8CE'), 'Must have metallic silver');
    assert.ok(tokens.includes('--brand-bright-silver: #F2F2F4'), 'Must have bright silver');
    assert.ok(tokens.includes('--brand-muted-silver: #929299'), 'Must have muted silver');
    assert.ok(tokens.includes('--brand-white: #FFFFFF'), 'Must have pure white');
    assert.ok(tokens.includes('Manrope'), 'Must use Manrope for body text & display');
    assert.ok(tokens.includes('Cormorant Garamond'), 'Must use Cormorant Garamond for italic editorial emphasis');

    // Verify rejection of dull green palette tokens
    assert.ok(!tokens.includes('#111514'), 'Old #111514 green charcoal removed');
    assert.ok(!tokens.includes('#18211D'), 'Old #18211D dark forest removed');
    assert.ok(!tokens.includes('#4A5749'), 'Old #4A5749 muted forest removed');
    assert.ok(!tokens.includes('#222B27'), 'Old #222B27 elevated forest removed');
  });

  // Test 5: Refined Editorial Inner Pages with Open to Work
  await t.test('5. Editorial sections mount cleanly including Open to Work', () => {
    const appFile = fs.readFileSync('src/App.tsx', 'utf-8');
    assert.ok(appFile.includes('EditorialAbout'), 'Must mount EditorialAbout');
    assert.ok(appFile.includes('EditorialOpenToWork'), 'Must mount EditorialOpenToWork');
    assert.ok(appFile.includes('EditorialExperience'), 'Must mount EditorialExperience');
    assert.ok(appFile.includes('EditorialCapabilities'), 'Must mount EditorialCapabilities');
    assert.ok(appFile.includes('EditorialOrion9'), 'Must mount EditorialOrion9');
    assert.ok(appFile.includes('EditorialApplyVise'), 'Must mount EditorialApplyVise');
    assert.ok(appFile.includes('EditorialCertifications'), 'Must mount EditorialCertifications');
    assert.ok(appFile.includes('EditorialEducation'), 'Must mount EditorialEducation');
    assert.ok(appFile.includes('EditorialContact'), 'Must mount EditorialContact');
  });

  // Test 6: Orion-9 Case Study
  await t.test('6. Orion-9 case study presents verified supply chain OS with real screenshots and lifecycle', () => {
    const file = fs.readFileSync('src/components/editorial/EditorialOrion9.tsx', 'utf-8');
    assert.ok(file.includes('admin-page.png'), 'Must reference actual screenshots');
    assert.ok(file.includes('OrionSupplyChainFlow'), 'Must include interactive supply chain process');
    assert.ok(file.includes('Production / Completed'), 'Must display completed status');
    assert.ok(file.includes('In Development') && file.includes('Architecture Roadmap'), 'Must display planned roadmap');
  });

  // Test 7: ApplyVise AI Case Study
  await t.test('7. ApplyVise AI case study presents career platform with real logo and pipeline', () => {
    const file = fs.readFileSync('src/components/editorial/EditorialApplyVise.tsx', 'utf-8');
    assert.ok(file.includes('applyvise-logo.png'), 'Must reference authentic branding asset');
    assert.ok(file.includes('ApplyViseCareerFlow'), 'Must include career intelligence flow');
    assert.ok(file.includes('Active') && file.includes('Functional'), 'Must display active status');
    assert.ok(file.includes('Planned Architecture'), 'Must display planned roadmap');
  });

  // Test 8: Complete Profile Management System at /admin
  await t.test('8. Admin System supports Introduction, Open to Work, and all career modules', () => {
    const admin = fs.readFileSync('src/components/admin/AdminConsole.tsx', 'utf-8');
    assert.ok(admin.includes('Overview'), 'Overview Dashboard');
    assert.ok(admin.includes('Introduction'), 'Introduction Editor');
    assert.ok(admin.includes('Open to Work'), 'Open to Work Editor in sidebar');
    assert.ok(admin.includes('About'), 'About Editor');
    assert.ok(admin.includes('Experience'), 'Experience Editor');
    assert.ok(admin.includes('Projects'), 'Projects Editor');
    assert.ok(admin.includes('Education'), 'Education Editor');
    assert.ok(admin.includes('Licenses & Certifications'), 'Licenses & Certifications');
    assert.ok(admin.includes('Skills'), 'Central Skills Manager');
    assert.ok(admin.includes('Resume'), 'Dedicated Resume Manager');
    assert.ok(admin.includes('Media Library'), 'Media Library');
    assert.ok(admin.includes('Website Sections'), 'Website Sections Manager');
    assert.ok(admin.includes('Settings'), 'Settings & SEO');

    // Verify modular editor implementations
    assert.ok(fs.existsSync('src/components/admin/editors/OpenToWorkEditor.tsx'), 'OpenToWorkEditor exists');
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

  // Test 9: Resume Management & Upload Capabilities
  await t.test('9. Resume management supports PDF upload, replace, and public toggle', () => {
    const cms = fs.readFileSync('src/services/cmsService.ts', 'utf-8');
    assert.ok(cms.includes('uploadResumeFile'), 'Must have uploadResumeFile service method');
    assert.ok(cms.includes('getResumeRecord'), 'Must have getResumeRecord service method');
    assert.ok(cms.includes('updateResumeRecord'), 'Must have updateResumeRecord service method');
  });

  // Test 10: Section Management & Dynamic Ordering
  await t.test('10. Section Manager supports reordering and dynamic visibility', () => {
    const cms = fs.readFileSync('src/services/cmsService.ts', 'utf-8');
    assert.ok(cms.includes('getSectionsConfig'), 'Must have getSectionsConfig');
    assert.ok(cms.includes('updateSectionsConfig'), 'Must have updateSectionsConfig');
    assert.ok(cms.includes('toggleSectionVisibility'), 'Must have toggleSectionVisibility');

    const appFile = fs.readFileSync('src/App.tsx', 'utf-8');
    assert.ok(appFile.includes('sortedSections'), 'App dynamically orders and renders visible sections');
  });

  // Test 11: Cloudflare & Security Rules Preservation
  await t.test('11. Cloudflare deployment config and Firestore security rules are verified', () => {
    const wrangler = fs.readFileSync('wrangler.jsonc', 'utf-8');
    assert.ok(wrangler.includes('"directory": "./dist"'), 'Static assets directory set to dist');
    assert.ok(wrangler.includes('"not_found_handling": "single-page-application"'), 'SPA routing enabled');

    const rules = fs.readFileSync('firestore.rules', 'utf-8');
    assert.ok(rules.includes('request.auth != null'), 'Firestore locks mutations to authenticated admin');
  });

  // Test 12: Complete Removal of CMS Button from Public Website
  await t.test('12. CMS button is completely hidden from public navigation and footer', () => {
    const heroLayout = fs.readFileSync('src/components/cinematic/CinematicHeroLayout.tsx', 'utf-8');
    const footer = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

    // Ensure no public CMS button exists
    assert.ok(!heroLayout.includes('>CMS<') && !heroLayout.includes('>CMS </button>'), 'Public nav must NOT contain CMS link');
    assert.ok(!footer.includes('CMS Admin'), 'Footer must NOT contain CMS Admin link');
  });

  // Test 13: Dedicated Open to Work Career Section and CMS Service
  await t.test('13. Dedicated Open to Work section renders career preferences and dynamic locations', () => {
    const otw = fs.readFileSync('src/components/editorial/EditorialOpenToWork.tsx', 'utf-8');
    assert.ok(otw.includes('OPEN TO OPPORTUNITIES'), 'Must render section heading OPEN TO OPPORTUNITIES');
    assert.ok(otw.includes("Building What's Next."), 'Must render headline Building What\'s Next.');
    assert.ok(otw.includes('preferredLocations'), 'Must render preferred locations');
    assert.ok(otw.includes('employmentPreferences'), 'Must render employment preferences');
    assert.ok(otw.includes('preferredJobCategories'), 'Must render job categories');
    assert.ok(otw.includes('primaryCta'), 'Must render primary bouncy CTA');
    assert.ok(otw.includes('secondaryCta'), 'Must render secondary bouncy CTA');

    const cms = fs.readFileSync('src/services/cmsService.ts', 'utf-8');
    assert.ok(cms.includes('getOpenToWorkSettings'), 'Must have getOpenToWorkSettings');
    assert.ok(cms.includes('updateOpenToWorkSettings'), 'Must have updateOpenToWorkSettings');
  });

  // Test 14: Black Luxury Glassmorphism & Spring Physics Utility Styles
  await t.test('14. Glassmorphism blur and spring physics buttons are configured in CSS', () => {
    const css = fs.readFileSync('src/styles/index.css', 'utf-8');
    assert.ok(css.includes('.glass-panel'), 'Must have .glass-panel utility class');
    assert.ok(css.includes('.glass-card'), 'Must have .glass-card utility class');
    assert.ok(css.includes('.glass-pill'), 'Must have .glass-pill utility class');
    assert.ok(css.includes('cubic-bezier(0.34, 1.56, 0.64, 1)'), 'Must have spring physics bezier curve');
    assert.ok(css.includes('scale(1.035)'), 'Must have spring bouncy hover scale');
    assert.ok(css.includes('scale(0.965)'), 'Must have active press scale');
  });

  // Test 15: Official AP Monogram Brand Asset Variants
  await t.test('15. All 6 AP brand monogram logo variants are generated in public/brand/', () => {
    assert.ok(fs.existsSync('public/brand/ap-primary.png'), 'ap-primary.png must exist');
    assert.ok(fs.existsSync('public/brand/ap-compact.png'), 'ap-compact.png must exist');
    assert.ok(fs.existsSync('public/brand/ap-transparent.png'), 'ap-transparent.png must exist');
    assert.ok(fs.existsSync('public/brand/ap-monochrome.png'), 'ap-monochrome.png must exist');
    assert.ok(fs.existsSync('public/brand/ap-favicon.png'), 'ap-favicon.png must exist');
    assert.ok(fs.existsSync('public/brand/ap-og-image.png'), 'ap-og-image.png must exist');
    assert.ok(fs.existsSync('public/favicon.png'), 'public/favicon.png must exist');
    assert.ok(fs.existsSync('src/components/brand/ApMonogram.tsx'), 'ApMonogram component must exist');
  });

  // Test 16: Browser Branding & HTML Metadata
  await t.test('16. Browser title, favicon link, theme color, and Open Graph meta tags match brand specifications', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('Ayush Prakash | Business, Systems &amp; AI') || html.includes('Ayush Prakash | Business, Systems & AI'), 'Title matches brand name & positioning');
    assert.ok(html.includes('ap-favicon.png'), 'Favicon links to ap-favicon.png');
    assert.ok(html.includes('ap-og-image.png'), 'OG image links to ap-og-image.png');
    assert.ok(html.includes('#050505'), 'Theme color set to #050505');
  });

  // Test 17: Header & Hero AP Brand Treatment
  await t.test('17. Header has [AP MONOGRAM] AYUSH PRAKASH and Hero has AP monogram emblem', () => {
    const layout = fs.readFileSync('src/components/cinematic/CinematicHeroLayout.tsx', 'utf-8');
    assert.ok(layout.includes('<ApMonogram'), 'Must render ApMonogram in header');
    assert.ok(layout.includes('{name}'), 'Must render full name beside monogram');
    assert.ok(layout.includes('BUSINESS. SYSTEMS.'), 'Must preserve core positioning');
    assert.ok(layout.includes('Intelligence & Innovation.') || layout.includes('Intelligence &amp; Innovation.'), 'Must preserve italic positioning');
  });

  // Test 18: Footer AP Monogram & Positioning
  await t.test('18. Footer renders AP monogram, full name, positioning, and social links', () => {
    const footer = fs.readFileSync('src/components/Footer.tsx', 'utf-8');
    assert.ok(footer.includes('ApMonogram'), 'Footer must render ApMonogram');
    assert.ok(footer.includes('AYUSH PRAKASH'), 'Footer must render full name');
    assert.ok(footer.includes('Business. Systems. Intelligence &amp; Innovation.') || footer.includes('Business. Systems. Intelligence & Innovation.'), 'Footer must render positioning statement');
    assert.ok(footer.includes('LinkedIn'), 'Footer has LinkedIn');
    assert.ok(footer.includes('GitHub'), 'Footer has GitHub');
    assert.ok(footer.includes('Email'), 'Footer has Email');
    assert.ok(footer.includes('Back to Top'), 'Footer has Back to Top button');
  });

  // Test 19: Admin Login & Dashboard AP Monogram Branding
  await t.test('19. Admin login screen and dashboard header display AP Monogram and Portfolio Administration', () => {
    const adminLogin = fs.readFileSync('src/components/admin/AdminLogin.tsx', 'utf-8');
    assert.ok(adminLogin.includes('ApMonogram'), 'AdminLogin has ApMonogram');
    assert.ok(adminLogin.includes('AYUSH PRAKASH'), 'AdminLogin has AYUSH PRAKASH');
    assert.ok(adminLogin.includes('Portfolio Administration'), 'AdminLogin has Portfolio Administration title');

    const adminConsole = fs.readFileSync('src/components/admin/AdminConsole.tsx', 'utf-8');
    assert.ok(adminConsole.includes('ApMonogram'), 'AdminConsole has ApMonogram');
    assert.ok(adminConsole.includes('AYUSH PRAKASH'), 'AdminConsole has AYUSH PRAKASH');
    assert.ok(adminConsole.includes('Portfolio Administration'), 'AdminConsole has Portfolio Administration in sidebar');
  });
});
