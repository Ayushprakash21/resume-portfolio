import type {
  AppearanceSettings,
  ResponsiveSizeValue,
  TypographyScaleSettings,
  TypographySettings,
} from '../types/cms';

export interface FontCatalogOption {
  id: string;
  label: string;
  cssFamily: string;
  stack: string;
  source: string;
  licenseNote: string;
  isLocalFont?: boolean;
  isBenzinova?: boolean;
  widthVariant?: 'standard' | 'condensed' | 'extra-condensed' | 'extended';
}

export const HEADING_FONT_OPTIONS: FontCatalogOption[] = [
  {
    id: 'Benzinova',
    label: 'Benzinova — Standard (Thin Regular)',
    cssFamily: 'Benzinova',
    stack: "'Benzinova', 'Plus Jakarta Sans', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Local OTF (/public/fonts/benzinova/Benzinova-Thin.otf)',
    licenseNote: 'SIL Open Font License 1.1 — Authentic Bundled Open Font.',
    isLocalFont: true,
    isBenzinova: true,
    widthVariant: 'standard',
  },
  {
    id: 'Benzinova Condensed',
    label: 'Benzinova — Condensed (Thin Condensed)',
    cssFamily: 'Benzinova Condensed',
    stack: "'Benzinova Condensed', 'Benzinova', 'Plus Jakarta Sans', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Local OTF (/public/fonts/benzinova/Benzinova-ThinCondensed.otf)',
    licenseNote: 'SIL Open Font License 1.1 — Authentic Bundled Open Font.',
    isLocalFont: true,
    isBenzinova: true,
    widthVariant: 'condensed',
  },
  {
    id: 'Benzinova Extra Condensed',
    label: 'Benzinova — Extra Condensed (Thin Extra Condensed)',
    cssFamily: 'Benzinova Extra Condensed',
    stack: "'Benzinova Extra Condensed', 'Benzinova Condensed', 'Plus Jakarta Sans', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Local OTF (/public/fonts/benzinova/Benzinova-ThinExtraCondensed.otf)',
    licenseNote: 'SIL Open Font License 1.1 — Authentic Bundled Open Font.',
    isLocalFont: true,
    isBenzinova: true,
    widthVariant: 'extra-condensed',
  },
  {
    id: 'Benzinova Extended',
    label: 'Benzinova — Extended (Thin Extended)',
    cssFamily: 'Benzinova Extended',
    stack: "'Benzinova Extended', 'Benzinova', 'Plus Jakarta Sans', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Local OTF (/public/fonts/benzinova/Benzinova-ThinExtended.otf)',
    licenseNote: 'SIL Open Font License 1.1 — Authentic Bundled Open Font.',
    isLocalFont: true,
    isBenzinova: true,
    widthVariant: 'extended',
  },
  {
    id: 'Plus Jakarta Sans',
    label: 'Plus Jakarta Sans (Geometric Sans)',
    cssFamily: 'Plus Jakarta Sans',
    stack: "'Plus Jakarta Sans', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Bundled Local WOFF2 (@fontsource/plus-jakarta-sans)',
    licenseNote: 'SIL Open Font License 1.1',
  },
  {
    id: 'Manrope',
    label: 'Manrope (Modern Sans)',
    cssFamily: 'Manrope',
    stack: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Google Fonts Webfont',
    licenseNote: 'SIL Open Font License 1.1',
  },
  {
    id: 'Outfit',
    label: 'Outfit (Minimalist Display Sans)',
    cssFamily: 'Outfit',
    stack: "'Outfit', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Google Fonts Webfont',
    licenseNote: 'SIL Open Font License 1.1',
  },
  {
    id: 'DM Sans',
    label: 'DM Sans (Clean Editorial Sans)',
    cssFamily: 'DM Sans',
    stack: "'DM Sans', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Google Fonts Webfont',
    licenseNote: 'SIL Open Font License 1.1',
  },
  {
    id: 'Space Grotesk',
    label: 'Space Grotesk (Technical Display Sans)',
    cssFamily: 'Space Grotesk',
    stack: "'Space Grotesk', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Google Fonts Webfont',
    licenseNote: 'SIL Open Font License 1.1',
  },
  {
    id: 'Inter',
    label: 'Inter (Neutral Architectural Sans)',
    cssFamily: 'Inter',
    stack: "'Inter', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Google Fonts Webfont',
    licenseNote: 'SIL Open Font License 1.1',
  },
  {
    id: 'Cormorant Garamond',
    label: 'Cormorant Garamond (Editorial Serif)',
    cssFamily: 'Cormorant Garamond',
    stack: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    source: 'Google Fonts Webfont',
    licenseNote: 'SIL Open Font License 1.1',
  },
];

export const BODY_FONT_OPTIONS: FontCatalogOption[] = [
  {
    id: 'Manrope',
    label: 'Manrope (Default UI & Body)',
    cssFamily: 'Manrope',
    stack: "'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Google Fonts Webfont',
    licenseNote: 'SIL Open Font License 1.1',
  },
  {
    id: 'Inter',
    label: 'Inter (Clean UI & Paragraphs)',
    cssFamily: 'Inter',
    stack: "'Inter', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Google Fonts Webfont',
    licenseNote: 'SIL Open Font License 1.1',
  },
  {
    id: 'Plus Jakarta Sans',
    label: 'Plus Jakarta Sans (Unified Sans)',
    cssFamily: 'Plus Jakarta Sans',
    stack: "'Plus Jakarta Sans', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Bundled Local WOFF2 (@fontsource/plus-jakarta-sans)',
    licenseNote: 'SIL Open Font License 1.1',
  },
  {
    id: 'DM Sans',
    label: 'DM Sans (Soft Editorial Body)',
    cssFamily: 'DM Sans',
    stack: "'DM Sans', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    source: 'Google Fonts Webfont',
    licenseNote: 'SIL Open Font License 1.1',
  },
];

export const TYPOGRAPHY_RANGES = {
  hero: { min: 34, max: 120, step: 1 },
  h1: { min: 28, max: 88, step: 1 },
  h2: { min: 22, max: 72, step: 1 },
  h3: { min: 18, max: 52, step: 1 },
  h4: { min: 16, max: 40, step: 1 },
  card: { min: 14, max: 34, step: 1 },
  eyebrow: { min: 9, max: 18, step: 1 },
  headingFontWeight: { min: 100, max: 700, step: 100 },
  headingLetterSpacing: { min: -0.06, max: 0.12, step: 0.005 },
  headingLineHeight: { min: 0.9, max: 1.6, step: 0.02 },
  bodyFontSize: { min: 14, max: 22, step: 1 },
  bodyLineHeight: { min: 1.3, max: 2.0, step: 0.05 },
} as const;

export const DEFAULT_TYPOGRAPHY_SCALE: TypographyScaleSettings = {
  hero: { desktop: 76, tablet: 64, mobile: 50 },
  h1: { desktop: 56, tablet: 46, mobile: 38 },
  h2: { desktop: 44, tablet: 36, mobile: 30 },
  h3: { desktop: 32, tablet: 27, mobile: 22 },
  h4: { desktop: 25, tablet: 21, mobile: 18 },
  card: { desktop: 22, tablet: 19, mobile: 16 },
  eyebrow: { desktop: 11, tablet: 11, mobile: 10 },
};

export const DEFAULT_TYPOGRAPHY_SETTINGS: TypographySettings = {
  headingFont: 'Benzinova',
  bodyFont: 'Manrope',
  scale: {
    hero: { ...DEFAULT_TYPOGRAPHY_SCALE.hero },
    h1: { ...DEFAULT_TYPOGRAPHY_SCALE.h1 },
    h2: { ...DEFAULT_TYPOGRAPHY_SCALE.h2 },
    h3: { ...DEFAULT_TYPOGRAPHY_SCALE.h3 },
    h4: { ...DEFAULT_TYPOGRAPHY_SCALE.h4 },
    card: { ...DEFAULT_TYPOGRAPHY_SCALE.card },
    eyebrow: { ...DEFAULT_TYPOGRAPHY_SCALE.eyebrow },
  },
  headingFontWeight: 400,
  headingLetterSpacing: 0.02,
  headingLineHeight: 1.14,
  headingTextTransform: 'none',
  bodyFontSize: 16,
  bodyLineHeight: 1.6,
};

export function clampTypographyNumber(value: unknown, min: number, max: number, fallback: number, precision = 0): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  const clamped = Math.min(max, Math.max(min, num));
  return precision > 0 ? Number(clamped.toFixed(precision)) : Math.round(clamped);
}

function normalizeResponsiveSize(
  input: Partial<ResponsiveSizeValue> | undefined,
  defaults: ResponsiveSizeValue,
  bounds: { min: number; max: number }
): ResponsiveSizeValue {
  return {
    desktop: clampTypographyNumber(input?.desktop, bounds.min, bounds.max, defaults.desktop),
    tablet: clampTypographyNumber(input?.tablet, bounds.min, bounds.max, defaults.tablet),
    mobile: clampTypographyNumber(input?.mobile, bounds.min, bounds.max, defaults.mobile),
  };
}

export function getFontOption(fontId: string, kind: 'heading' | 'body'): FontCatalogOption | undefined {
  const list = kind === 'heading' ? HEADING_FONT_OPTIONS : BODY_FONT_OPTIONS;
  return list.find((opt) => opt.id.toLowerCase() === fontId.trim().toLowerCase());
}

export function resolveFontStack(fontId: string, kind: 'heading' | 'body'): string {
  const opt = getFontOption(fontId, kind);
  if (opt) return opt.stack;
  const trimmed = fontId.trim();
  if (!trimmed) {
    return kind === 'heading' ? HEADING_FONT_OPTIONS[0].stack : BODY_FONT_OPTIONS[0].stack;
  }
  const sanitized = trimmed.replace(/['";<>]/g, '');
  return `'${sanitized}', 'Benzinova', 'Plus Jakarta Sans', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
}

export function normalizeTypographySettings(
  input?: Partial<TypographySettings> | null,
  fallbackOverrides?: { headingFont?: string; bodyFont?: string }
): TypographySettings {
  const d = DEFAULT_TYPOGRAPHY_SETTINGS;
  const scaleIn = input?.scale;
  const rawHeading =
    (typeof input?.headingFont === 'string' && input.headingFont.trim()) ||
    (fallbackOverrides?.headingFont && fallbackOverrides.headingFont.trim()) ||
    d.headingFont;
  
  // Clean deprecated Limerock or Cravelo entries to Benzinova
  const headingFont =
    rawHeading.toLowerCase().includes('limerock') || rawHeading.toLowerCase().includes('cravelo')
      ? 'Benzinova'
      : rawHeading;

  const bodyFont =
    (typeof input?.bodyFont === 'string' && input.bodyFont.trim()) ||
    (fallbackOverrides?.bodyFont && fallbackOverrides.bodyFont.trim()) ||
    d.bodyFont;

  const transformRaw = input?.headingTextTransform;
  const headingTextTransform: TypographySettings['headingTextTransform'] =
    transformRaw === 'uppercase' || transformRaw === 'capitalize' || transformRaw === 'none'
      ? transformRaw
      : d.headingTextTransform;

  return {
    headingFont,
    bodyFont,
    scale: {
      hero: normalizeResponsiveSize(scaleIn?.hero, d.scale.hero, TYPOGRAPHY_RANGES.hero),
      h1: normalizeResponsiveSize(scaleIn?.h1, d.scale.h1, TYPOGRAPHY_RANGES.h1),
      h2: normalizeResponsiveSize(scaleIn?.h2, d.scale.h2, TYPOGRAPHY_RANGES.h2),
      h3: normalizeResponsiveSize(scaleIn?.h3, d.scale.h3, TYPOGRAPHY_RANGES.h3),
      h4: normalizeResponsiveSize(scaleIn?.h4, d.scale.h4, TYPOGRAPHY_RANGES.h4),
      card: normalizeResponsiveSize(scaleIn?.card, d.scale.card, TYPOGRAPHY_RANGES.card),
      eyebrow: normalizeResponsiveSize(scaleIn?.eyebrow, d.scale.eyebrow, TYPOGRAPHY_RANGES.eyebrow),
    },
    headingFontWeight: clampTypographyNumber(
      input?.headingFontWeight,
      TYPOGRAPHY_RANGES.headingFontWeight.min,
      TYPOGRAPHY_RANGES.headingFontWeight.max,
      d.headingFontWeight
    ),
    headingLetterSpacing: clampTypographyNumber(
      input?.headingLetterSpacing,
      TYPOGRAPHY_RANGES.headingLetterSpacing.min,
      TYPOGRAPHY_RANGES.headingLetterSpacing.max,
      d.headingLetterSpacing,
      3
    ),
    headingLineHeight: clampTypographyNumber(
      input?.headingLineHeight,
      TYPOGRAPHY_RANGES.headingLineHeight.min,
      TYPOGRAPHY_RANGES.headingLineHeight.max,
      d.headingLineHeight,
      2
    ),
    headingTextTransform,
    bodyFontSize: clampTypographyNumber(
      input?.bodyFontSize,
      TYPOGRAPHY_RANGES.bodyFontSize.min,
      TYPOGRAPHY_RANGES.bodyFontSize.max,
      d.bodyFontSize
    ),
    bodyLineHeight: clampTypographyNumber(
      input?.bodyLineHeight,
      TYPOGRAPHY_RANGES.bodyLineHeight.min,
      TYPOGRAPHY_RANGES.bodyLineHeight.max,
      d.bodyLineHeight,
      2
    ),
  };
}

export function normalizeAppearanceSettings(
  raw: Partial<AppearanceSettings> | null | undefined,
  defaults: AppearanceSettings
): AppearanceSettings {
  const safeRaw = raw || {};
  const publishedTypography = safeRaw.typography
    ? normalizeTypographySettings(safeRaw.typography)
    : normalizeTypographySettings(defaults.typography);

  const draftTypography = safeRaw.draftTypography
    ? normalizeTypographySettings(safeRaw.draftTypography)
    : normalizeTypographySettings(publishedTypography);

  return {
    ...defaults,
    ...safeRaw,
    headingFont: publishedTypography.headingFont,
    bodyFont: publishedTypography.bodyFont,
    typography: publishedTypography,
    draftTypography,
  };
}

export function buildTypographyCssVars(settings: TypographySettings): Record<string, string> {
  const s = normalizeTypographySettings(settings);
  return {
    '--font-display': resolveFontStack(s.headingFont, 'heading'),
    '--font-heading': 'var(--font-display)',
    '--font-body': resolveFontStack(s.bodyFont, 'body'),
    '--typo-desktop-hero': `${s.scale.hero.desktop}px`,
    '--typo-tablet-hero': `${s.scale.hero.tablet}px`,
    '--typo-mobile-hero': `${s.scale.hero.mobile}px`,
    '--typo-desktop-h1': `${s.scale.h1.desktop}px`,
    '--typo-tablet-h1': `${s.scale.h1.tablet}px`,
    '--typo-mobile-h1': `${s.scale.h1.mobile}px`,
    '--typo-desktop-h2': `${s.scale.h2.desktop}px`,
    '--typo-tablet-h2': `${s.scale.h2.tablet}px`,
    '--typo-mobile-h2': `${s.scale.h2.mobile}px`,
    '--typo-desktop-h3': `${s.scale.h3.desktop}px`,
    '--typo-tablet-h3': `${s.scale.h3.tablet}px`,
    '--typo-mobile-h3': `${s.scale.h3.mobile}px`,
    '--typo-desktop-h4': `${s.scale.h4.desktop}px`,
    '--typo-tablet-h4': `${s.scale.h4.tablet}px`,
    '--typo-mobile-h4': `${s.scale.h4.mobile}px`,
    '--typo-desktop-card': `${s.scale.card.desktop}px`,
    '--typo-tablet-card': `${s.scale.card.tablet}px`,
    '--typo-mobile-card': `${s.scale.card.mobile}px`,
    '--typo-desktop-eyebrow': `${s.scale.eyebrow.desktop}px`,
    '--typo-tablet-eyebrow': `${s.scale.eyebrow.tablet}px`,
    '--typo-mobile-eyebrow': `${s.scale.eyebrow.mobile}px`,
    '--heading-font-weight': `${s.headingFontWeight}`,
    '--heading-letter-spacing': `${s.headingLetterSpacing}em`,
    '--heading-line-height': `${s.headingLineHeight}`,
    '--heading-text-transform': s.headingTextTransform,
    '--font-size-body': `${s.bodyFontSize}px`,
    '--line-height-body': `${s.bodyLineHeight}`,
  };
}

export function applyTypographyToDocument(
  settings: TypographySettings,
  target: HTMLElement | null = typeof document !== 'undefined' ? document.documentElement : null
): void {
  if (!target) return;
  const vars = buildTypographyCssVars(settings);
  for (const [key, value] of Object.entries(vars)) {
    target.style.setProperty(key, value);
  }
}

export function areTypographySettingsEqual(a: TypographySettings, b: TypographySettings): boolean {
  return JSON.stringify(normalizeTypographySettings(a)) === JSON.stringify(normalizeTypographySettings(b));
}
