import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  DEFAULT_TYPOGRAPHY_SCALE,
  DEFAULT_TYPOGRAPHY_SETTINGS,
  HEADING_FONT_OPTIONS,
  BODY_FONT_OPTIONS,
  TYPOGRAPHY_RANGES,
  buildTypographyCssVars,
  normalizeAppearanceSettings,
  normalizeTypographySettings,
  resolveFontStack,
} from '../src/utils/typography.ts';
import { DEFAULT_APPEARANCE_SETTINGS } from '../src/data/seedData.ts';
import { cmsService } from '../src/services/cmsService.ts';

test('Typography System: Default desktop, tablet & mobile scales meet spec', () => {
  assert.equal(DEFAULT_TYPOGRAPHY_SCALE.hero.desktop, 76);
  assert.equal(DEFAULT_TYPOGRAPHY_SCALE.h1.desktop, 56);
  assert.equal(DEFAULT_TYPOGRAPHY_SCALE.h2.desktop, 44);
  assert.equal(DEFAULT_TYPOGRAPHY_SCALE.h3.desktop, 32);
  assert.equal(DEFAULT_TYPOGRAPHY_SCALE.h4.desktop, 25);
  assert.equal(DEFAULT_TYPOGRAPHY_SCALE.eyebrow.desktop, 11);
  assert.equal(DEFAULT_TYPOGRAPHY_SCALE.card.desktop, 22);
  assert.equal(DEFAULT_TYPOGRAPHY_SETTINGS.bodyFontSize, 16);

  // Verify responsive tablet (80–90%) & mobile (65–75%) proportions for H1..Card
  for (const key of ['hero', 'h1', 'h2', 'h3', 'h4', 'card']) {
    const s = DEFAULT_TYPOGRAPHY_SCALE[key];
    const tabletRatio = s.tablet / s.desktop;
    const mobileRatio = s.mobile / s.desktop;
    assert.ok(tabletRatio >= 0.80 && tabletRatio <= 0.90, `${key} tablet ratio ${tabletRatio}`);
    assert.ok(mobileRatio >= 0.65 && mobileRatio <= 0.75, `${key} mobile ratio ${mobileRatio}`);
  }
});

test('Typography System: Honest font catalog and local Benzinova OFL 1.1 font family', () => {
  assert.equal(DEFAULT_TYPOGRAPHY_SETTINGS.headingFont, 'Benzinova');
  assert.equal(DEFAULT_TYPOGRAPHY_SETTINGS.bodyFont, 'Manrope');

  const benzinovaOpt = HEADING_FONT_OPTIONS.find((f) => f.id === 'Benzinova');
  assert.ok(benzinovaOpt, 'Benzinova option must exist as primary local font');
  assert.equal(benzinovaOpt.isLocalFont, true);
  assert.ok(benzinovaOpt.licenseNote.includes('SIL Open Font License 1.1'));

  // Width variants must all be available in HEADING_FONT_OPTIONS
  const variants = ['Benzinova', 'Benzinova Condensed', 'Benzinova Extra Condensed', 'Benzinova Extended'];
  for (const v of variants) {
    const opt = HEADING_FONT_OPTIONS.find((f) => f.id === v);
    assert.ok(opt, `Variant ${v} must exist in font options`);
    assert.ok(opt.isBenzinova, `Variant ${v} must be marked as Benzinova`);
  }

  // Verify Limerock and Cravelo are removed
  assert.ok(!HEADING_FONT_OPTIONS.some((f) => f.id.toLowerCase().includes('limerock')), 'Limerock removed');
  assert.ok(!HEADING_FONT_OPTIONS.some((f) => f.id.toLowerCase().includes('cravelo')), 'Cravelo removed');

  const fontsCss = fs.readFileSync('src/styles/fonts.css', 'utf-8');
  assert.ok(fontsCss.includes("font-family: 'Benzinova'"), 'fonts.css declares Benzinova @font-face');
  assert.ok(fontsCss.includes('/fonts/benzinova/Benzinova-Thin.otf'), 'fonts.css targets Benzinova-Thin.otf');
  assert.ok(fontsCss.includes('/fonts/benzinova/Benzinova-ThinCondensed.otf'), 'fonts.css targets Benzinova-ThinCondensed.otf');
  assert.ok(fontsCss.includes('/fonts/benzinova/Benzinova-ThinExtraCondensed.otf'), 'fonts.css targets Benzinova-ThinExtraCondensed.otf');
  assert.ok(fontsCss.includes('/fonts/benzinova/Benzinova-ThinExtended.otf'), 'fonts.css targets Benzinova-ThinExtended.otf');

  // Verify physical files exist in public/fonts/benzinova
  assert.ok(fs.existsSync('public/fonts/benzinova/Benzinova-Thin.otf'), 'Benzinova-Thin.otf on disk');
  assert.ok(fs.existsSync('public/fonts/benzinova/Benzinova-ThinCondensed.otf'), 'Benzinova-ThinCondensed.otf on disk');
  assert.ok(fs.existsSync('public/fonts/benzinova/Benzinova-ThinExtended.otf'), 'Benzinova-ThinExtended.otf on disk');
  assert.ok(fs.existsSync('public/fonts/benzinova/Benzinova-ThinExtraCondensed.otf'), 'Benzinova-ThinExtraCondensed.otf on disk');
  assert.ok(fs.existsSync('public/fonts/benzinova/OFL.txt'), 'OFL.txt on disk');

  const mainTsx = fs.readFileSync('src/main.tsx', 'utf-8');
  assert.ok(mainTsx.includes('@fontsource/plus-jakarta-sans/400.css'));
  assert.ok(mainTsx.includes('@fontsource/plus-jakarta-sans/600.css'));
  assert.ok(BODY_FONT_OPTIONS.some((b) => b.id === 'Manrope'));
});

test('Typography System: Range clamping & invalid numeric validation', () => {
  const dirty = {
    headingFont: 'Outfit',
    bodyFont: 'Inter',
    scale: {
      hero: { desktop: 999, tablet: 10, mobile: Number.NaN },
      h1: { desktop: 58, tablet: 48, mobile: 38 },
      h2: { desktop: 42, tablet: 35, mobile: 28 },
      h3: { desktop: 30, tablet: 26, mobile: 21 },
      h4: { desktop: 24, tablet: 20, mobile: 17 },
      card: { desktop: 21, tablet: 18, mobile: 15 },
      eyebrow: { desktop: 2, tablet: 99, mobile: 11 },
    },
    headingFontWeight: 1200,
    headingLetterSpacing: -0.5,
    headingLineHeight: 3.5,
    bodyFontSize: 8,
    bodyLineHeight: 5.0,
  };

  const clean = normalizeTypographySettings(dirty);
  assert.equal(clean.headingFont, 'Outfit');
  assert.equal(clean.bodyFont, 'Inter');
  assert.equal(clean.scale.hero.desktop, TYPOGRAPHY_RANGES.hero.max);
  assert.equal(clean.scale.hero.tablet, TYPOGRAPHY_RANGES.hero.min);
  assert.equal(clean.scale.hero.mobile, DEFAULT_TYPOGRAPHY_SCALE.hero.mobile);
  assert.equal(clean.scale.eyebrow.desktop, TYPOGRAPHY_RANGES.eyebrow.min);
  assert.equal(clean.scale.eyebrow.tablet, TYPOGRAPHY_RANGES.eyebrow.max);
  assert.equal(clean.headingFontWeight, TYPOGRAPHY_RANGES.headingFontWeight.max);
  assert.equal(clean.headingLetterSpacing, TYPOGRAPHY_RANGES.headingLetterSpacing.min);
  assert.equal(clean.headingLineHeight, TYPOGRAPHY_RANGES.headingLineHeight.max);
  assert.equal(clean.bodyFontSize, TYPOGRAPHY_RANGES.bodyFontSize.min);
  assert.equal(clean.bodyLineHeight, TYPOGRAPHY_RANGES.bodyLineHeight.max);
});

test('Typography System: CSS custom properties generation & legacy appearance preservation', () => {
  const custom = normalizeTypographySettings({
    headingFont: 'Outfit',
    bodyFont: 'Inter',
    scale: {
      ...DEFAULT_TYPOGRAPHY_SCALE,
      h2: { desktop: 40, tablet: 34, mobile: 28 },
    },
  });
  const vars = buildTypographyCssVars(custom);
  assert.equal(vars['--font-display'], resolveFontStack('Outfit', 'heading'));
  assert.equal(vars['--font-body'], resolveFontStack('Inter', 'body'));
  assert.equal(vars['--typo-desktop-h2'], '40px');
  assert.equal(vars['--typo-tablet-h2'], '34px');
  assert.equal(vars['--typo-mobile-h2'], '28px');
  assert.equal(vars['--font-size-body'], '16px');

  // Legacy doc without `typography` preserves colors/spacing while safely defaulting typography
  const legacyNormalized = normalizeAppearanceSettings(
    {
      primaryBg: '#08080A',
      accentColor: '#E5E0D8',
      headingFont: 'Manrope',
      bodyFont: 'Manrope',
      sectionSpacing: 'spacious',
    },
    DEFAULT_APPEARANCE_SETTINGS
  );
  assert.equal(legacyNormalized.primaryBg, '#08080A');
  assert.equal(legacyNormalized.accentColor, '#E5E0D8');
  assert.equal(legacyNormalized.sectionSpacing, 'spacious');
  assert.equal(legacyNormalized.typography?.headingFont, 'Benzinova');
  assert.equal(legacyNormalized.typography?.scale.h2.desktop, 44);
});

test('Typography System: Draft vs Published isolation in CMS service', async () => {
  const initialPublished = cmsService.getPublishedTypographySettings();

  const draftCandidate = normalizeTypographySettings({
    ...initialPublished,
    headingFont: 'Space Grotesk',
    scale: {
      ...initialPublished.scale,
      h2: { desktop: 41, tablet: 35, mobile: 29 },
    },
  });

  await cmsService.saveTypographyDraft(draftCandidate);

  // Public published typography must remain untouched
  const publishedAfterDraft = cmsService.getPublishedTypographySettings();
  const draftAfterSave = cmsService.getDraftTypographySettings();
  assert.equal(publishedAfterDraft.headingFont, initialPublished.headingFont);
  assert.equal(publishedAfterDraft.scale.h2.desktop, initialPublished.scale.h2.desktop);
  assert.equal(draftAfterSave.headingFont, 'Space Grotesk');
  assert.equal(draftAfterSave.scale.h2.desktop, 41);

  // Publish promotes draft live while preserving unrelated appearance colors
  await cmsService.publishTypographySettings(draftCandidate);
  const publishedNow = cmsService.getPublishedTypographySettings();
  assert.equal(publishedNow.headingFont, 'Space Grotesk');
  assert.equal(publishedNow.scale.h2.desktop, 41);
  assert.equal(cmsService.getAppearanceSettings().primaryBg, DEFAULT_APPEARANCE_SETTINGS.primaryBg);

  // Restore defaults cleanly
  await cmsService.resetTypographyDefaults('publish');
  assert.equal(cmsService.getPublishedTypographySettings().headingFont, 'Benzinova');
  assert.equal(cmsService.getPublishedTypographySettings().scale.h2.desktop, 44);
});

test('Typography System: Public components & stylesheets consume centralized CSS tokens', () => {
  const tokens = fs.readFileSync('src/styles/tokens.css', 'utf-8');
  for (const token of [
    '--font-display:',
    '--font-body:',
    '--font-size-hero:',
    '--font-size-h1:',
    '--font-size-h2:',
    '--font-size-h3:',
    '--font-size-h4:',
    '--font-size-card:',
    '--font-size-eyebrow:',
  ]) {
    assert.ok(tokens.includes(token), `tokens.css defines ${token}`);
  }

  const indexCss = fs.readFileSync('src/styles/index.css', 'utf-8');
  assert.ok(!indexCss.includes('font-size: clamp(44px, 9.2vw, 68px) !important'), 'No hardcoded mobile hero override');
  assert.ok(indexCss.includes('font-size: var(--font-size-h2)'), 'Headings consume --font-size-h2');
  assert.ok(indexCss.includes('font-size: var(--font-size-eyebrow)'), 'Eyebrows consume --font-size-eyebrow');

  const certs = fs.readFileSync('src/components/editorial/EditorialCertifications.tsx', 'utf-8');
  assert.ok(certs.includes('var(--font-size-card)'), 'Certification titles consume --font-size-card');

  const projects = fs.readFileSync('src/components/editorial/EditorialProjects.tsx', 'utf-8');
  assert.ok(projects.includes('var(--font-size-h3)'), 'Project titles consume --font-size-h3');
});

test('Typography System: Hero founder name typography is strictly isolated from global heading font', () => {
  const heroLayout = fs.readFileSync('src/components/cinematic/CinematicHeroLayout.tsx', 'utf-8');
  assert.ok(
    heroLayout.includes("fontFamily: \"'Orenza Bold', 'Orenza', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif\""),
    'CinematicHeroLayout specifies original hero name font stack'
  );
  assert.ok(heroLayout.includes('fontWeight: 800'), 'Hero name uses original 800 bold weight');
  assert.ok(heroLayout.includes("letterSpacing: '-0.03em'"), 'Hero name uses original tight -0.03em letter spacing');
  assert.ok(heroLayout.includes('lineHeight: 0.90'), 'Hero name uses original 0.90 line height');

  const indexCss = fs.readFileSync('src/styles/index.css', 'utf-8');
  assert.ok(indexCss.includes('.hero-founder-name'), 'index.css defines .hero-founder-name');
  assert.ok(
    indexCss.includes("font-family: var(--font-hero-name, 'Orenza Bold', 'Orenza', 'Manrope'"),
    'index.css isolates hero name font from global heading font'
  );
  assert.ok(indexCss.includes('font-weight: 800 !important;'), 'Hero name CSS enforces 800 font weight');

  const tokensCss = fs.readFileSync('src/styles/tokens.css', 'utf-8');
  assert.ok(tokensCss.includes('--font-hero-name:'), 'tokens.css defines --font-hero-name');
});
