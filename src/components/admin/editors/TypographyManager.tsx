import React, { useEffect, useMemo, useState } from 'react';
import {
  Type,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Save,
  Send,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Eye,
} from 'lucide-react';
import {
  AppearanceSettings,
  TypographyScaleSettings,
  TypographySettings,
} from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';
import {
  BODY_FONT_OPTIONS,
  DEFAULT_TYPOGRAPHY_SETTINGS,
  HEADING_FONT_OPTIONS,
  TYPOGRAPHY_RANGES,
  areTypographySettingsEqual,
  clampTypographyNumber,
  getFontOption,
  normalizeTypographySettings,
  resolveFontStack,
} from '../../../utils/typography';

interface TypographyManagerProps {
  appearance: AppearanceSettings;
  onUpdateAppearance: (updated: AppearanceSettings) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

type BreakpointKey = 'desktop' | 'tablet' | 'mobile';
type ScaleFieldKey = keyof TypographyScaleSettings;

const SCALE_ITEMS: {
  key: ScaleFieldKey;
  label: string;
  description: string;
  bounds: { min: number; max: number; step: number };
}[] = [
  {
    key: 'hero',
    label: 'Hero Main Heading',
    description: 'Primary homepage display identity (AYUSH PRAKASH)',
    bounds: TYPOGRAPHY_RANGES.hero,
  },
  {
    key: 'h1',
    label: 'H1 Display Heading',
    description: 'Top-level display headings and modal banners',
    bounds: TYPOGRAPHY_RANGES.h1,
  },
  {
    key: 'h2',
    label: 'H2 Section Heading',
    description: 'About, Experience, Capabilities, Projects, Education & Contact',
    bounds: TYPOGRAPHY_RANGES.h2,
  },
  {
    key: 'h3',
    label: 'H3 Project & Sub-Section Heading',
    description: 'Featured project titles & case study headers',
    bounds: TYPOGRAPHY_RANGES.h3,
  },
  {
    key: 'h4',
    label: 'H4 Subheading',
    description: 'Secondary editorial subheadings & detail blocks',
    bounds: TYPOGRAPHY_RANGES.h4,
  },
  {
    key: 'card',
    label: 'Card Headings',
    description: 'Experience roles, education degrees, capability & cert card titles',
    bounds: TYPOGRAPHY_RANGES.card,
  },
  {
    key: 'eyebrow',
    label: 'Section Eyebrow',
    description: 'Uppercase section labels above editorial headings',
    bounds: TYPOGRAPHY_RANGES.eyebrow,
  },
];

const BREAKPOINT_META: { id: BreakpointKey; label: string; widthHint: string; icon: any }[] = [
  { id: 'desktop', label: 'Desktop', widthHint: '1025px – 1920px+', icon: Monitor },
  { id: 'tablet', label: 'Tablet', widthHint: '768px – 1024px', icon: Tablet },
  { id: 'mobile', label: 'Mobile', widthHint: '320px – 767px', icon: Smartphone },
];

export const TypographyManager: React.FC<TypographyManagerProps> = ({
  appearance,
  onUpdateAppearance,
  showNotification,
  onDirtyChange,
}) => {
  const publishedTypography = useMemo(
    () => normalizeTypographySettings(appearance.typography),
    [appearance.typography]
  );

  const persistedDraft = useMemo(
    () => normalizeTypographySettings(appearance.draftTypography || appearance.typography),
    [appearance.draftTypography, appearance.typography]
  );

  const [draft, setDraft] = useState<TypographySettings>(persistedDraft);
  const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointKey>('desktop');
  const [previewBreakpoint, setPreviewBreakpoint] = useState<BreakpointKey>('desktop');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [headingFontStatus, setHeadingFontStatus] = useState<'loaded' | 'loading' | 'missing'>('loading');
  const [bodyFontStatus, setBodyFontStatus] = useState<'loaded' | 'loading' | 'missing'>('loading');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync incoming Firestore changes only when local form matches prior persisted draft
  useEffect(() => {
    setDraft(persistedDraft);
  }, [persistedDraft]);

  const hasUnsavedChanges = useMemo(
    () => !areTypographySettingsEqual(draft, persistedDraft),
    [draft, persistedDraft]
  );

  const hasUnpublishedDraft = useMemo(
    () => !areTypographySettingsEqual(persistedDraft, publishedTypography),
    [persistedDraft, publishedTypography]
  );

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Real browser font-loading check via document.fonts
  useEffect(() => {
    let cancelled = false;
    const checkFonts = async () => {
      if (typeof document === 'undefined' || !('fonts' in document)) {
        setHeadingFontStatus('loaded');
        setBodyFontStatus('loaded');
        return;
      }

      const verifyFamily = async (
        family: string,
        setStatus: React.Dispatch<React.SetStateAction<'loaded' | 'loading' | 'missing'>>
      ) => {
        setStatus('loading');
        try {
          const loadedFaces = await document.fonts.load(`600 16px "${family}"`);
          if (cancelled) return;
          const isLoaded = loadedFaces.length > 0 || document.fonts.check(`600 16px "${family}"`);
          setStatus(isLoaded ? 'loaded' : 'missing');
        } catch {
          if (!cancelled) setStatus('missing');
        }
      };

      await Promise.all([
        verifyFamily(draft.headingFont, setHeadingFontStatus),
        verifyFamily(draft.bodyFont, setBodyFontStatus),
      ]);
    };

    checkFonts();
    return () => {
      cancelled = true;
    };
  }, [draft.headingFont, draft.bodyFont]);

  const selectedHeadingMeta = useMemo(
    () => getFontOption(draft.headingFont, 'heading'),
    [draft.headingFont]
  );

  const selectedBodyMeta = useMemo(
    () => getFontOption(draft.bodyFont, 'body'),
    [draft.bodyFont]
  );

  const updateScaleValue = (key: ScaleFieldKey, bp: BreakpointKey, rawVal: string | number) => {
    const num = Number(rawVal);
    const bounds = TYPOGRAPHY_RANGES[key];
    if (!Number.isFinite(num)) {
      setValidationError(`Please enter a numeric pixel value for ${key}.`);
      return;
    }
    if (num < bounds.min || num > bounds.max) {
      setValidationError(`${key.toUpperCase()} (${bp}) must be between ${bounds.min}px and ${bounds.max}px.`);
    } else {
      setValidationError(null);
    }
    const clamped = clampTypographyNumber(num, bounds.min, bounds.max, draft.scale[key][bp]);
    setDraft((prev) => ({
      ...prev,
      scale: {
        ...prev.scale,
        [key]: {
          ...prev.scale[key],
          [bp]: clamped,
        },
      },
    }));
  };

  const handleSaveDraft = async () => {
    if (isSavingDraft || isPublishing) return;
    setIsSavingDraft(true);
    try {
      const normalized = normalizeTypographySettings(draft);
      const updated = await cmsService.saveTypographyDraft(normalized);
      onUpdateAppearance(updated);
      setDraft(normalized);
      setValidationError(null);
      showNotification('Typography draft saved. Public website stays unchanged until published.', 'info');
    } catch (err: any) {
      showNotification('Failed to save typography draft: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublishChanges = async () => {
    if (isSavingDraft || isPublishing) return;
    setIsPublishing(true);
    try {
      const normalized = normalizeTypographySettings(draft);
      const updated = await cmsService.publishTypographySettings(normalized);
      onUpdateAppearance(updated);
      setDraft(normalized);
      setValidationError(null);
      showNotification('Typography settings published live across the website.', 'success');
    } catch (err: any) {
      showNotification('Failed to publish typography settings: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleResetToDefaults = () => {
    setDraft(normalizeTypographySettings(DEFAULT_TYPOGRAPHY_SETTINGS));
    setValidationError(null);
    showNotification('Preview reset to default typography scale. Save Draft or Publish Changes to persist.', 'info');
  };

  const headingStack = resolveFontStack(draft.headingFont, 'heading');
  const bodyStack = resolveFontStack(draft.bodyFont, 'body');

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(18, 18, 22, 0.72)',
    border: '1px solid rgba(244, 243, 238, 0.08)',
    borderRadius: '10px',
    padding: '22px',
  };

  const renderFontStatusPill = (status: 'loaded' | 'loading' | 'missing', family: string) => {
    const isBenzinova = family.toLowerCase().includes('benzinova');
    const colors =
      status === 'loaded'
        ? { bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.35)', text: '#6CE098' }
        : status === 'loading'
          ? { bg: 'rgba(200, 200, 206, 0.12)', border: 'rgba(200, 200, 206, 0.3)', text: '#D4D7DC' }
          : { bg: 'rgba(239, 68, 68, 0.16)', border: 'rgba(239, 68, 68, 0.42)', text: '#F87171' };

    return (
      <span
        data-testid={`font-status-${family.toLowerCase().replace(/\s+/g, '-')}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '11.5px',
          fontWeight: 600,
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          color: colors.text,
        }}
      >
        {status === 'loaded' ? (
          <CheckCircle2 size={12} />
        ) : status === 'loading' ? (
          <Loader2 size={12} className="spin" />
        ) : (
          <AlertTriangle size={12} />
        )}
        {status === 'loaded'
          ? 'Loaded & Ready (Bundled Local OFL)'
          : status === 'loading'
            ? 'Checking Local Font Assets...'
            : isBenzinova
              ? 'Local Font Missing — Check /public/fonts/benzinova'
              : 'Using System Fallback'}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} data-testid="typography-manager">
      {/* Top Status & Action Bar */}
      <div
        style={{
          ...cardStyle,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Type size={18} color="#C8C8CE" />
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 600,
                color: '#F4F3EE',
                margin: 0,
              }}
            >
              Typography &amp; Appearance
            </h3>
            {hasUnsavedChanges ? (
              <span
                data-testid="typography-unsaved-badge"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(245, 158, 11, 0.16)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#FBBF24',
                }}
              >
                Unsaved Edits
              </span>
            ) : hasUnpublishedDraft ? (
              <span
                data-testid="typography-draft-badge"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(130, 148, 166, 0.18)',
                  border: '1px solid rgba(130, 148, 166, 0.45)',
                  color: '#D4D7DC',
                }}
              >
                Draft Differs From Published
              </span>
            ) : (
              <span
                data-testid="typography-synced-badge"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(16, 185, 129, 0.14)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#6CE098',
                }}
              >
                Published &amp; Synced
              </span>
            )}
          </div>
          <p style={{ fontSize: '12.5px', color: '#929299', margin: '6px 0 0' }}>
            Configure global heading &amp; body typefaces and per-breakpoint sizes. Drafts remain isolated from the public site until published.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleResetToDefaults}
            data-testid="typography-reset-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 13px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#D4D7DC',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} /> Reset to Defaults
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isPublishing}
            data-testid="typography-save-draft-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.09)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: isSavingDraft || isPublishing ? 'not-allowed' : 'pointer',
            }}
          >
            {isSavingDraft ? <Loader2 size={13} className="spin" /> : <Save size={13} />}
            {isSavingDraft ? 'Saving Draft...' : 'Save Draft'}
          </button>

          <button
            type="button"
            onClick={handlePublishChanges}
            disabled={isSavingDraft || isPublishing}
            data-testid="typography-publish-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: '#F2F2F4',
              border: '1px solid #FFFFFF',
              color: '#050505',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: isSavingDraft || isPublishing ? 'not-allowed' : 'pointer',
            }}
          >
            {isPublishing ? <Loader2 size={13} className="spin" /> : <Send size={13} />}
            {isPublishing ? 'Publishing...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      {/* Unsaved changes warning banner */}
      {hasUnsavedChanges && (
        <div
          data-testid="typography-unsaved-warning"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '11px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.10)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#FDE68A',
            fontSize: '12.5px',
          }}
        >
          <AlertTriangle size={15} color="#FBBF24" />
          <span>
            You have unsaved typography adjustments in the editor. Click <strong>Save Draft</strong> to preserve your draft or <strong>Publish Changes</strong> to apply them on the public portfolio.
          </span>
        </div>
      )}

      {validationError && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(188, 53, 69, 0.14)',
            border: '1px solid rgba(188, 53, 69, 0.45)',
            color: '#FCA5A5',
            fontSize: '12.5px',
          }}
        >
          {validationError}
        </div>
      )}

      {/* 1. Global Heading & Body Font Selectors */}
      <div style={cardStyle}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#F4F3EE', margin: '0 0 16px 0' }}>
          Global Typeface Selection
        </h4>

        <div className="admin-grid-2col" style={{ gap: '18px' }}>
          {/* Heading Display Font */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '12px', color: '#C8C8CE', fontWeight: 600 }}>
                Global Heading / Display Font (`--font-display`)
              </label>
              {renderFontStatusPill(headingFontStatus, draft.headingFont)}
            </div>

            <select
              aria-label="Global Heading Font"
              data-testid="heading-font-select"
              value={draft.headingFont}
              onChange={(e) => setDraft((prev) => ({ ...prev, headingFont: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: '#0E1412',
                border: '1px solid rgba(244, 243, 238, 0.14)',
                color: '#F4F3EE',
                fontSize: '13.5px',
              }}
            >
              {HEADING_FONT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontSize: '11px', color: '#929299', marginBottom: '4px' }}>
                {selectedHeadingMeta?.source || 'Custom Typeface'} &bull; {selectedHeadingMeta?.licenseNote}
              </div>
              <div
                style={{
                  fontFamily: headingStack,
                  fontSize: '20px',
                  fontWeight: draft.headingFontWeight,
                  letterSpacing: `${draft.headingLetterSpacing}em`,
                  color: '#FFFFFF',
                  marginTop: '6px',
                }}
              >
                Aa Bb Cc 123 &mdash; {draft.headingFont}
              </div>
              {draft.headingFont.toLowerCase().includes('benzinova') && (
                <div style={{ fontSize: '11.5px', color: '#929299', marginTop: '8px', lineHeight: 1.45 }}>
                  Authentic SIL OFL 1.1 Benzinova typeface active. Note: Benzinova is crafted as a geometric Thin typeface; weights 100–400 render its authentic natural strokes without synthetic boldness distortion.
                </div>
              )}
            </div>
          </div>

          {/* Body / UI Font */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '12px', color: '#C8C8CE', fontWeight: 600 }}>
                Global Body &amp; UI Font (`--font-body`)
              </label>
              {renderFontStatusPill(bodyFontStatus, draft.bodyFont)}
            </div>

            <select
              aria-label="Global Body Font"
              data-testid="body-font-select"
              value={draft.bodyFont}
              onChange={(e) => setDraft((prev) => ({ ...prev, bodyFont: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: '#0E1412',
                border: '1px solid rgba(244, 243, 238, 0.14)',
                color: '#F4F3EE',
                fontSize: '13.5px',
              }}
            >
              {BODY_FONT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontSize: '11px', color: '#929299', marginBottom: '4px' }}>
                {selectedBodyMeta?.source || 'Webfont'} &bull; Preserved for paragraphs, nav, buttons, forms &amp; metadata
              </div>
              <div
                style={{
                  fontFamily: bodyStack,
                  fontSize: `${draft.bodyFontSize}px`,
                  lineHeight: draft.bodyLineHeight,
                  color: '#D4D7DC',
                  marginTop: '6px',
                }}
              >
                Applied strictly to body copy, navigation, labels, and CMS descriptions.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Per-Breakpoint Heading Scale Sliders & Numeric Inputs */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#F4F3EE', margin: 0 }}>
              Responsive Heading &amp; Eyebrow Scale (px)
            </h4>
            <p style={{ fontSize: '12px', color: '#929299', margin: '4px 0 0' }}>
              Configure Desktop, Tablet, and Mobile sizes independently with live range validation.
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              gap: '4px',
            }}
          >
            {BREAKPOINT_META.map((bp) => {
              const Icon = bp.icon;
              const isActive = activeBreakpoint === bp.id;
              return (
                <button
                  key={bp.id}
                  type="button"
                  data-testid={`bp-tab-${bp.id}`}
                  onClick={() => {
                    setActiveBreakpoint(bp.id);
                    setPreviewBreakpoint(bp.id);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#929299',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={13} />
                  <span>{bp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {SCALE_ITEMS.map((item) => {
            const val = draft.scale[item.key][activeBreakpoint];
            return (
              <div
                key={item.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(200px, 1.3fr) minmax(180px, 2fr) auto',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#F4F3EE' }}>{item.label}</div>
                  <div style={{ fontSize: '11.5px', color: '#8E948D', marginTop: '2px' }}>{item.description}</div>
                  <div style={{ fontSize: '11px', color: '#929299', marginTop: '4px' }}>
                    D: {draft.scale[item.key].desktop}px &bull; T: {draft.scale[item.key].tablet}px &bull; M: {draft.scale[item.key].mobile}px
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input
                    type="range"
                    aria-label={`${item.label} ${activeBreakpoint} slider`}
                    data-testid={`slider-${item.key}-${activeBreakpoint}`}
                    min={item.bounds.min}
                    max={item.bounds.max}
                    step={item.bounds.step}
                    value={val}
                    onChange={(e) => updateScaleValue(item.key, activeBreakpoint, e.target.value)}
                    style={{ width: '100%', accentColor: '#C8C8CE', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#71717A' }}>
                    <span>Min {item.bounds.min}px</span>
                    <span>Max {item.bounds.max}px</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="number"
                    aria-label={`${item.label} ${activeBreakpoint} px`}
                    data-testid={`input-${item.key}-${activeBreakpoint}`}
                    min={item.bounds.min}
                    max={item.bounds.max}
                    step={item.bounds.step}
                    value={val}
                    onChange={(e) => updateScaleValue(item.key, activeBreakpoint, e.target.value)}
                    style={{
                      width: '72px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#0E1412',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      textAlign: 'right',
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#929299' }}>px</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Additional Heading & Body Parameters */}
      <div style={cardStyle}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#F4F3EE', margin: '0 0 16px 0' }}>
          Heading Weight, Spacing, Line Height &amp; Body Rhythm
        </h4>

        <div className="admin-grid-2col" style={{ gap: '16px' }}>
          {/* Heading Weight */}
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '12.5px', color: '#C8C8CE', fontWeight: 600 }}>Heading Font Weight</label>
              <span style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 600 }}>{draft.headingFontWeight}</span>
            </div>
            <input
              type="range"
              aria-label="Heading Font Weight"
              min={TYPOGRAPHY_RANGES.headingFontWeight.min}
              max={TYPOGRAPHY_RANGES.headingFontWeight.max}
              step={TYPOGRAPHY_RANGES.headingFontWeight.step}
              value={draft.headingFontWeight}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  headingFontWeight: clampTypographyNumber(
                    e.target.value,
                    TYPOGRAPHY_RANGES.headingFontWeight.min,
                    TYPOGRAPHY_RANGES.headingFontWeight.max,
                    prev.headingFontWeight
                  ),
                }))
              }
              style={{ width: '100%', accentColor: '#C8C8CE' }}
            />
          </div>

          {/* Heading Text Transform */}
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <label style={{ display: 'block', fontSize: '12.5px', color: '#C8C8CE', fontWeight: 600, marginBottom: '8px' }}>
              Heading Text Transformation
            </label>
            <select
              aria-label="Heading Text Transformation"
              value={draft.headingTextTransform}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  headingTextTransform: e.target.value as TypographySettings['headingTextTransform'],
                }))
              }
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: '#0E1412',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#F4F3EE',
                fontSize: '13px',
              }}
            >
              <option value="none">Natural Case (None)</option>
              <option value="capitalize">Title Capitalize</option>
              <option value="uppercase">ALL UPPERCASE</option>
            </select>
          </div>

          {/* Heading Letter Spacing */}
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '12.5px', color: '#C8C8CE', fontWeight: 600 }}>Heading Letter Spacing (em)</label>
              <span style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 600 }}>{draft.headingLetterSpacing}em</span>
            </div>
            <input
              type="range"
              aria-label="Heading Letter Spacing"
              min={TYPOGRAPHY_RANGES.headingLetterSpacing.min}
              max={TYPOGRAPHY_RANGES.headingLetterSpacing.max}
              step={TYPOGRAPHY_RANGES.headingLetterSpacing.step}
              value={draft.headingLetterSpacing}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  headingLetterSpacing: clampTypographyNumber(
                    e.target.value,
                    TYPOGRAPHY_RANGES.headingLetterSpacing.min,
                    TYPOGRAPHY_RANGES.headingLetterSpacing.max,
                    prev.headingLetterSpacing,
                    3
                  ),
                }))
              }
              style={{ width: '100%', accentColor: '#C8C8CE' }}
            />
          </div>

          {/* Heading Line Height */}
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '12.5px', color: '#C8C8CE', fontWeight: 600 }}>Heading Line Height</label>
              <span style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 600 }}>{draft.headingLineHeight}</span>
            </div>
            <input
              type="range"
              aria-label="Heading Line Height"
              min={TYPOGRAPHY_RANGES.headingLineHeight.min}
              max={TYPOGRAPHY_RANGES.headingLineHeight.max}
              step={TYPOGRAPHY_RANGES.headingLineHeight.step}
              value={draft.headingLineHeight}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  headingLineHeight: clampTypographyNumber(
                    e.target.value,
                    TYPOGRAPHY_RANGES.headingLineHeight.min,
                    TYPOGRAPHY_RANGES.headingLineHeight.max,
                    prev.headingLineHeight,
                    2
                  ),
                }))
              }
              style={{ width: '100%', accentColor: '#C8C8CE' }}
            />
          </div>

          {/* Body Font Size */}
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '12.5px', color: '#C8C8CE', fontWeight: 600 }}>Body Font Size (px)</label>
              <span style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 600 }}>{draft.bodyFontSize}px</span>
            </div>
            <input
              type="range"
              aria-label="Body Font Size"
              min={TYPOGRAPHY_RANGES.bodyFontSize.min}
              max={TYPOGRAPHY_RANGES.bodyFontSize.max}
              step={TYPOGRAPHY_RANGES.bodyFontSize.step}
              value={draft.bodyFontSize}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  bodyFontSize: clampTypographyNumber(
                    e.target.value,
                    TYPOGRAPHY_RANGES.bodyFontSize.min,
                    TYPOGRAPHY_RANGES.bodyFontSize.max,
                    prev.bodyFontSize
                  ),
                }))
              }
              style={{ width: '100%', accentColor: '#C8C8CE' }}
            />
          </div>

          {/* Body Line Height */}
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '12.5px', color: '#C8C8CE', fontWeight: 600 }}>Body Line Height</label>
              <span style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 600 }}>{draft.bodyLineHeight}</span>
            </div>
            <input
              type="range"
              aria-label="Body Line Height"
              min={TYPOGRAPHY_RANGES.bodyLineHeight.min}
              max={TYPOGRAPHY_RANGES.bodyLineHeight.max}
              step={TYPOGRAPHY_RANGES.bodyLineHeight.step}
              value={draft.bodyLineHeight}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  bodyLineHeight: clampTypographyNumber(
                    e.target.value,
                    TYPOGRAPHY_RANGES.bodyLineHeight.min,
                    TYPOGRAPHY_RANGES.bodyLineHeight.max,
                    prev.bodyLineHeight,
                    2
                  ),
                }))
              }
              style={{ width: '100%', accentColor: '#C8C8CE' }}
            />
          </div>
        </div>
      </div>

      {/* 4. Responsive Live Preview */}
      <div style={cardStyle} data-testid="typography-live-preview">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '18px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={16} color="#C8C8CE" />
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#F4F3EE', margin: 0 }}>
              Live Typography Specimen Preview ({previewBreakpoint.toUpperCase()})
            </h4>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {BREAKPOINT_META.map((bp) => (
              <button
                key={bp.id}
                type="button"
                onClick={() => setPreviewBreakpoint(bp.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '5px',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  backgroundColor: previewBreakpoint === bp.id ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                  color: previewBreakpoint === bp.id ? '#FFFFFF' : '#929299',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                {bp.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#050505',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: previewBreakpoint === 'mobile' ? '22px 18px' : '28px 32px',
            maxWidth: previewBreakpoint === 'mobile' ? '390px' : previewBreakpoint === 'tablet' ? '780px' : '100%',
            transition: 'max-width 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
          }}
        >
          {/* 1. Large Hero Heading */}
          <div>
            <div
              style={{
                fontFamily: bodyStack,
                fontSize: `${draft.scale.eyebrow[previewBreakpoint]}px`,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#929299',
                fontWeight: 600,
                marginBottom: '6px',
              }}
            >
              HERO HEADING &bull; {draft.scale.hero[previewBreakpoint]}PX
            </div>
            <div
              data-testid="preview-hero-heading"
              style={{
                fontFamily: headingStack,
                fontSize: `${draft.scale.hero[previewBreakpoint]}px`,
                fontWeight: draft.headingFontWeight,
                letterSpacing: `${draft.headingLetterSpacing}em`,
                lineHeight: 0.96,
                textTransform: 'uppercase',
                color: '#F2F2F4',
              }}
            >
              AYUSH PRAKASH
            </div>
          </div>

          {/* 2. About Section Heading */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div
              style={{
                fontFamily: bodyStack,
                fontSize: `${draft.scale.eyebrow[previewBreakpoint]}px`,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#D4D7DC',
                fontWeight: 600,
                marginBottom: '6px',
              }}
            >
              ABOUT &bull; BACKGROUND ({draft.scale.h2[previewBreakpoint]}PX)
            </div>
            <div
              data-testid="preview-about-heading"
              style={{
                fontFamily: headingStack,
                fontSize: `${draft.scale.h2[previewBreakpoint]}px`,
                fontWeight: draft.headingFontWeight,
                letterSpacing: `${draft.headingLetterSpacing}em`,
                lineHeight: draft.headingLineHeight,
                textTransform: draft.headingTextTransform,
                color: '#FFFFFF',
              }}
            >
              Supply chain operations, project coordination, and practical enterprise systems.
            </div>
          </div>

          {/* 3. Project & 4. Certification Headings */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: previewBreakpoint === 'mobile' ? '1fr' : '1fr 1fr',
              gap: '16px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              style={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontFamily: bodyStack, fontSize: '11px', color: '#929299', marginBottom: '4px' }}>
                PROJECT HEADING (H3 &bull; {draft.scale.h3[previewBreakpoint]}PX)
              </div>
              <div
                data-testid="preview-project-heading"
                style={{
                  fontFamily: headingStack,
                  fontSize: `${draft.scale.h3[previewBreakpoint]}px`,
                  fontWeight: draft.headingFontWeight,
                  letterSpacing: `${draft.headingLetterSpacing}em`,
                  lineHeight: draft.headingLineHeight,
                  textTransform: draft.headingTextTransform,
                  color: '#FFFFFF',
                }}
              >
                Orion-9
              </div>
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontFamily: bodyStack, fontSize: '11px', color: '#929299', marginBottom: '4px' }}>
                CERTIFICATION CARD TITLE (CARD &bull; {draft.scale.card[previewBreakpoint]}PX)
              </div>
              <div
                data-testid="preview-cert-heading"
                style={{
                  fontFamily: headingStack,
                  fontSize: `${draft.scale.card[previewBreakpoint]}px`,
                  fontWeight: draft.headingFontWeight,
                  letterSpacing: `${draft.headingLetterSpacing}em`,
                  lineHeight: 1.24,
                  textTransform: draft.headingTextTransform,
                  color: '#FFFFFF',
                }}
              >
                Google Project Management Certificate
              </div>
            </div>
          </div>

          {/* 5. Body Font Paragraph */}
          <div style={{ paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontFamily: bodyStack, fontSize: '11px', color: '#929299', marginBottom: '6px' }}>
              BODY PARAGRAPH ({draft.bodyFont} &bull; {draft.bodyFontSize}PX &bull; Line-Height {draft.bodyLineHeight})
            </div>
            <p
              data-testid="preview-body-paragraph"
              style={{
                fontFamily: bodyStack,
                fontSize: `${draft.bodyFontSize}px`,
                lineHeight: draft.bodyLineHeight,
                color: '#C8C8CE',
                margin: 0,
              }}
            >
              Business operations professional exploring the intersection of supply chain execution, enterprise systems, and applied artificial intelligence to convert operational bottlenecks into clean digital workflows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
