import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Trash2,
  ExternalLink,
  Save,
  CheckCircle2,
  Search,
  Globe,
  Sparkles,
  Building2,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { CertificationRecord, SkillRecord } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';
import { storageClient } from '../../../services/storage/storageClient';
import {
  issuerService,
  IssuerCandidate,
  isDeprecatedOrBrokenLogoUrl,
  isProbableWebpageUrl,
} from '../../../services/issuerService';
import { CertificationLogoMark } from '../../editorial/CertificationLogoMark';
import { ImageUploadWithCrop } from '../common/ImageUploadWithCrop';
import { SkillsMultiSelector } from '../common/SkillsMultiSelector';
import {
  AdminModal,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
} from '../common/AdminModal';

interface CertificationEditorModalProps {
  initialCertification: CertificationRecord | null;
  allSkills: SkillRecord[];
  onSave: (saved: CertificationRecord) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const POPULAR_ISSUERS = [
  'Google',
  'Anthropic',
  'Google Cloud',
  'DeepLearning.AI',
  'Professional Operations Institute',
  'AWS',
  'Microsoft',
  'Coursera',
  'IBM',
  'Cisco',
];

export const CertificationEditorModal: React.FC<CertificationEditorModalProps> = ({
  initialCertification,
  allSkills,
  onSave,
  onDelete,
  onClose,
  showNotification,
}) => {
  const isEditing = !!initialCertification;

  const [form, setForm] = useState<Omit<CertificationRecord, 'id'>>(() => {
    if (initialCertification) {
      return {
        title: initialCertification.title,
        issuer: initialCertification.issuer,
        issuerWebsite: initialCertification.issuerWebsite || '',
        issuerDomain: initialCertification.issuerDomain || '',
        issuerLogo: initialCertification.issuerLogo || '',
        issuerLogoKey: initialCertification.issuerLogoKey || '',
        issuerLogoSource: initialCertification.issuerLogoSource || 'directory',
        issuerLogoFormat: initialCertification.issuerLogoFormat || 'svg',
        issuerLogoAlt: initialCertification.issuerLogoAlt || '',
        issuerLogoMetadata: initialCertification.issuerLogoMetadata,
        issueMonth: initialCertification.issueMonth || '',
        issueYear: initialCertification.issueYear || '',
        completionDate: initialCertification.completionDate || '',
        expirationMonth: initialCertification.expirationMonth || '',
        expirationYear: initialCertification.expirationYear || '',
        expiryDate: initialCertification.expiryDate || '',
        doesNotExpire: initialCertification.doesNotExpire ?? true,
        credentialId: initialCertification.credentialId || '',
        verificationUrl: initialCertification.verificationUrl || '',
        description: initialCertification.description || '',
        skillsUsed: initialCertification.skillsUsed || [],
        certificateImage: initialCertification.certificateImage || '',
        certificatePdfUrl: initialCertification.certificatePdfUrl || '',
        category: initialCertification.category || 'Project Coordination',
        highlightTag: initialCertification.highlightTag || 'CREDENTIAL',
        displayOrder: initialCertification.displayOrder || 1,
        status: initialCertification.status || 'published',
      };
    }
    return {
      title: '',
      issuer: '',
      issuerWebsite: '',
      issuerDomain: '',
      issuerLogo: '',
      issuerLogoKey: '',
      issuerLogoSource: 'directory',
      issuerLogoFormat: 'svg',
      issuerLogoAlt: '',
      issueMonth: '',
      issueYear: '',
      completionDate: '',
      expirationMonth: '',
      expirationYear: '',
      expiryDate: '',
      doesNotExpire: true,
      credentialId: '',
      verificationUrl: '',
      description: '',
      skillsUsed: [],
      certificateImage: '',
      certificatePdfUrl: '',
      category: 'Project Coordination',
      highlightTag: 'CREDENTIAL',
      displayOrder: 1,
      status: 'published',
    };
  });

  const [issuerSearchQuery, setIssuerSearchQuery] = useState(form.issuer || '');
  const [issuerCandidates, setIssuerCandidates] = useState<IssuerCandidate[]>([]);
  const [isSearchingIssuer, setIsSearchingIssuer] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [persistingCandidateId, setPersistingCandidateId] = useState<string>('');
  const [failedCandidateThumbs, setFailedCandidateThumbs] = useState<Record<string, boolean>>({});
  const [pendingCustomUrl, setPendingCustomUrl] = useState<string>('');
  const [isValidatingCustomUrl, setIsValidatingCustomUrl] = useState<boolean>(false);
  const [logoSelectionError, setLogoSelectionError] = useState<{
    message: string;
    retryCandidate?: IssuerCandidate;
    retryUrl?: string;
  } | null>(null);
  const [previewLogoStatus, setPreviewLogoStatus] = useState<{
    renderedAs: 'image' | 'monogram';
    activeUrl: string | null;
    verified: boolean;
    failedUrls: string[];
  }>({ renderedAs: 'monogram', activeUrl: null, verified: false, failedUrls: [] });
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Trigger search when user types or clicks an issuer
  const handleSearchIssuer = async (query: string) => {
    setIssuerSearchQuery(query);
    setLogoSelectionError(null);
    if (!query.trim()) {
      setIssuerCandidates([]);
      return;
    }

    setIsSearchingIssuer(true);
    setFailedCandidateThumbs({});
    try {
      const candidates = await issuerService.resolveLogoCandidates(query, cmsService.getIssuers());
      setIssuerCandidates(candidates);
    } catch (e) {
      console.warn('[Issuer Search Error]:', e);
    } finally {
      setIsSearchingIssuer(false);
    }
  };

  // Pre-load candidates on open if editing
  useEffect(() => {
    if (form.issuer) {
      issuerService.resolveLogoCandidates(form.issuer, cmsService.getIssuers()).then((res) => {
        setIssuerCandidates(res);
      });
    }
  }, []);

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectIssuerCandidate = async (cand: IssuerCandidate) => {
    if (persistingCandidateId) return;
    setLogoSelectionError(null);

    const browserFailed = failedCandidateThumbs[cand.id];
    if (!cand.verified || cand.validationState === 'failed' || cand.validationState === 'unsupported' || browserFailed) {
      const reason = browserFailed
        ? 'Browser could not decode this candidate image.'
        : cand.validationMessage || 'Candidate image failed server validation.';
      setLogoSelectionError({
        message: `Cannot use candidate "${cand.name}" (${cand.domain}): ${reason} Previous logo preserved.`,
      });
      showNotification(reason, 'error');
      return;
    }

    setPersistingCandidateId(cand.id);
    try {
      const persisted = await issuerService.persistCandidateToR2(cand);

      setForm((prev) => ({
        ...prev,
        issuer: cand.name,
        issuerDomain: cand.domain,
        issuerWebsite: cand.website,
        issuerLogo: persisted.publicUrl,
        issuerLogoKey: persisted.objectKey,
        issuerLogoSource: 'upload',
        issuerLogoFormat: persisted.format,
        issuerLogoAlt: cand.altText,
        issuerLogoMetadata: persisted.metadata,
      }));
      setSelectedCandidateId(cand.id);
      setIssuerSearchQuery(cand.name);
      showNotification(
        `Verified & stored ${cand.name} logo in Cloudflare R2 (${Math.round(persisted.metadata.sizeBytes / 1024)} KB).`
      );
    } catch (err: any) {
      const reason = err?.message || 'Failed to validate and persist logo into Cloudflare R2.';
      setLogoSelectionError({
        message: `${reason} Previous logo preserved.`,
        retryCandidate: cand,
      });
      showNotification(reason, 'error');
    } finally {
      setPersistingCandidateId('');
    }
  };

  const handleValidateAndPersistCustomUrl = async (overrideUrl?: string) => {
    const rawUrl = (overrideUrl ?? pendingCustomUrl).trim();
    if (!rawUrl || isValidatingCustomUrl) return;

    setIsValidatingCustomUrl(true);
    setLogoSelectionError(null);

    try {
      const validation = await issuerService.validateExternalLogoUrl(
        rawUrl,
        form.issuer || issuerSearchQuery
      );

      if (!validation.ok || !validation.imageUrl) {
        if (validation.extractedCandidates && validation.extractedCandidates.length > 0) {
          setIssuerCandidates((prev) => {
            const existingIds = new Set(validation.extractedCandidates!.map((e) => e.imageUrl));
            return [...validation.extractedCandidates!, ...prev.filter((p) => !existingIds.has(p.imageUrl))];
          });
        }
        setLogoSelectionError({
          message: `${validation.reason} Previous logo preserved.`,
          retryUrl: validation.isWebpage ? undefined : rawUrl,
        });
        showNotification(validation.reason, 'error');
        return;
      }

      const cand: IssuerCandidate = {
        id: `custom-${Date.now()}`,
        name: form.issuer || issuerSearchQuery || validation.domain || 'Custom Issuer',
        domain: validation.domain || form.issuerDomain || '',
        website: validation.domain ? `https://${validation.domain}` : form.issuerWebsite || '',
        sourcePageUrl: validation.sourcePageUrl || rawUrl,
        imageUrl: validation.imageUrl,
        logoUrl: validation.imageUrl,
        format: validation.format || 'png',
        logoFormat: validation.format || 'png',
        sourceType: 'official_website',
        source: 'url',
        altText: `${form.issuer || validation.domain || 'Issuer'} Official Brand Logo`,
        badge: 'Validated External Image',
        verified: true,
        validationState: 'verified',
        mimeType: validation.mimeType,
        sizeBytes: validation.sizeBytes,
        width: validation.width,
        height: validation.height,
      };

      const persisted = await issuerService.persistCandidateToR2(cand);
      setForm((prev) => ({
        ...prev,
        issuer: prev.issuer || cand.name,
        issuerDomain: cand.domain || prev.issuerDomain,
        issuerWebsite: cand.website || prev.issuerWebsite,
        issuerLogo: persisted.publicUrl,
        issuerLogoKey: persisted.objectKey,
        issuerLogoSource: 'upload',
        issuerLogoFormat: persisted.format,
        issuerLogoAlt: cand.altText,
        issuerLogoMetadata: persisted.metadata,
      }));
      setPendingCustomUrl('');
      showNotification(`Custom logo validated and persisted to Cloudflare R2 (${persisted.objectKey}).`);
    } catch (err: any) {
      const reason = err?.message || 'Unable to validate or persist external logo URL.';
      setLogoSelectionError({
        message: `${reason} Previous logo preserved.`,
        retryUrl: rawUrl,
      });
      showNotification(reason, 'error');
    } finally {
      setIsValidatingCustomUrl(false);
    }
  };

  const handleCustomLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsUploadingLogo(true);
    setLogoSelectionError(null);
    try {
      // Upload logo directly to Cloudflare R2 under certifications/
      const stored = await storageClient.uploadFile(file, {
        category: 'certifications',
        customFileName: `issuer_${Date.now()}_${file.name.replace(/\s+/g, '_')}`,
        visibility: 'public',
      });

      const ext = file.name.split('.').pop()?.toLowerCase();
      const format = ext === 'svg' ? 'svg' : ext === 'webp' ? 'webp' : ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : 'png';
      const logoUrl = stored.publicUrl || `/api/storage/files/${stored.objectKey}`;
      const nowIso = new Date().toISOString();

      setForm((prev) => ({
        ...prev,
        issuerLogo: logoUrl,
        issuerLogoKey: stored.objectKey,
        issuerLogoSource: 'upload',
        issuerLogoFormat: format as any,
        issuerLogoAlt: `${prev.issuer || 'Issuer'} Official Logo`,
        issuerLogoMetadata: {
          storageProvider: 'cloudflare-r2',
          objectKey: stored.objectKey,
          mimeType: stored.mimeType || (format === 'svg' ? 'image/svg+xml' : `image/${format}`),
          sizeBytes: stored.sizeBytes || file.size,
          issuerDomain: prev.issuerDomain || '',
          verifiedAt: nowIso,
          uploadedAt: stored.createdAt || nowIso,
        },
      }));

      showNotification(`Logo uploaded to Cloudflare R2 (${stored.objectKey}).`);
    } catch (err: any) {
      showNotification('Logo upload failed: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleAddSkill = async (skillName: string) => {
    const trimmed = skillName.trim();
    const current = form.skillsUsed || [];
    if (!trimmed || current.includes(trimmed)) return;

    await cmsService.ensureSkill(trimmed, 'Certifications & Accreditations');
    updateField('skillsUsed', [...current, trimmed]);
    setSkillSearchQuery('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    updateField(
      'skillsUsed',
      (form.skillsUsed || []).filter((s) => s !== skillToRemove)
    );
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    try {
      const isPdf = file.type === 'application/pdf';
      const asset = await cmsService.uploadMediaFile(
        file,
        'certificate',
        `${form.title || 'Certificate'} - ${file.name}`
      );

      if (isPdf) {
        updateField('certificatePdfUrl', asset.url);
      } else {
        updateField('certificateImage', asset.url);
      }
      showNotification(`Certificate document "${file.name}" uploaded successfully.`);
    } catch (err: any) {
      showNotification('Certificate upload failed: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleSubmit = async (targetStatus: 'published' | 'draft') => {
    if (!form.title.trim()) {
      showNotification('Certification name is required.', 'error');
      return;
    }

    const computedCompletionDate =
      form.issueMonth?.trim() && form.issueYear?.trim()
        ? `${form.issueMonth.trim()} ${form.issueYear.trim()}`
        : form.issueYear?.trim() || form.issueMonth?.trim() || form.completionDate?.trim() || '';
    const computedExpiryDate = form.doesNotExpire
      ? ''
      : form.expirationMonth?.trim() && form.expirationYear?.trim()
      ? `${form.expirationMonth.trim()} ${form.expirationYear.trim()}`
      : form.expirationYear?.trim() || '';

    const requiresConfirm =
      (!form.issueMonth?.trim() && !!form.issueYear?.trim()) ||
      (!form.issueYear && !form.issueMonth);

    const hasBrokenUrl =
      !!form.issuerLogo &&
      (isDeprecatedOrBrokenLogoUrl(form.issuerLogo) || isProbableWebpageUrl(form.issuerLogo));
    const cleanedLogo = hasBrokenUrl ? '' : (form.issuerLogo || '').trim();
    const cleanedSource = cleanedLogo ? (form.issuerLogoSource || 'upload') : 'monogram';

    const payload = {
      ...form,
      issuerLogo: cleanedLogo,
      issuerLogoKey: cleanedLogo ? (form.issuerLogoKey || initialCertification?.issuerLogoKey || '') : '',
      issuerLogoMetadata: cleanedLogo ? form.issuerLogoMetadata : undefined,
      issuerLogoSource: cleanedSource as any,
      completionDate: computedCompletionDate,
      expiryDate: computedExpiryDate,
      requiresDateConfirmation: requiresConfirm,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      if (isEditing && initialCertification) {
        await cmsService.updateCertification(initialCertification.id, payload);
        onSave({ ...payload, id: initialCertification.id });
        showNotification(
          targetStatus === 'published'
            ? cleanedSource === 'monogram'
              ? 'Certification updated and published (using clean issuer monogram).'
              : 'Certification updated and published.'
            : 'Certification draft saved.'
        );
      } else {
        const created = await cmsService.addCertification(payload);
        onSave(created);
        showNotification(
          targetStatus === 'published'
            ? 'Certification added and published.'
            : 'Certification draft saved.'
        );
      }
      onClose();
    } catch (err: any) {
      showNotification('Save failed: ' + (err.message || 'Firebase error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSkills = allSkills
    .map((s) => s.name)
    .filter(
      (name) =>
        name.toLowerCase().includes(skillSearchQuery.toLowerCase()) &&
        !(form.skillsUsed || []).includes(name)
    );

  return (
    <AdminModal
      isOpen={true}
      onClose={onClose}
      size="lg"
      maxWidth="880px"
      ariaLabel={isEditing ? 'Edit Accreditation & Brand Identity' : 'Add Accreditation & Brand Identity'}
    >
      <AdminModalHeader
        title={isEditing ? 'Edit Accreditation & Brand Identity' : 'Add Accreditation & Brand Identity'}
        subtitle="Cloudflare R2 Persistent Storage • Verified Brand Logos • React Bits Circular Carousel"
        onClose={onClose}
      />

      <AdminModalBody padding="24px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* 1. BASIC INFORMATION */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#A7B0A9',
                    marginBottom: '6px',
                  }}
                >
                  Certification / Credential Name <span style={{ color: '#E06C75' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. Claude AI Architecture & Agent Systems"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#14151C',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#A7B0A9',
                    marginBottom: '6px',
                  }}
                >
                  Highlight Tag (Badge on Card)
                </label>
                <input
                  type="text"
                  value={form.highlightTag}
                  onChange={(e) => updateField('highlightTag', e.target.value)}
                  placeholder="e.g. CLAUDE AGENTS"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#14151C',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* 2. DEDICATED ISSUER & BRAND IDENTITY SECTION */}
            <div
              style={{
                backgroundColor: 'rgba(20, 22, 28, 0.85)',
                border: '1px solid rgba(220, 80, 95, 0.25)',
                borderRadius: '12px',
                padding: '20px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={16} color="#DC505F" />
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Issuer &amp; Brand Identity Search
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#DC505F', fontWeight: 500 }}>
                  Live Logo Discovery &bull; Multi-Cert Reusable
                </span>
              </div>

              {/* Quick Select Popular Issuers */}
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', color: '#A7B0A9', display: 'block', marginBottom: '8px' }}>
                  Quick Search Verified Brands:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {POPULAR_ISSUERS.map((iss) => (
                    <button
                      key={iss}
                      type="button"
                      onClick={() => handleSearchIssuer(iss)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '14px',
                        backgroundColor:
                          form.issuer.toLowerCase() === iss.toLowerCase()
                            ? 'rgba(220, 80, 95, 0.25)'
                            : 'rgba(255, 255, 255, 0.05)',
                        border:
                          form.issuer.toLowerCase() === iss.toLowerCase()
                            ? '1px solid rgba(220, 80, 95, 0.5)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                        color: form.issuer.toLowerCase() === iss.toLowerCase() ? '#FFFFFF' : '#D2D6DC',
                        fontSize: '11px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {iss}
                    </button>
                  ))}
                </div>
              </div>

              {/* Organization Search Input */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#A7B0A9',
                    marginBottom: '6px',
                  }}
                >
                  Search Organization Name or Domain <span style={{ color: '#E06C75' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={issuerSearchQuery}
                    onChange={(e) => handleSearchIssuer(e.target.value)}
                    placeholder="Type brand name (e.g. Anthropic, Google Cloud, DeepLearning.AI, AWS, Microsoft, Coursera)..."
                    style={{
                      width: '100%',
                      padding: '10px 38px 10px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#0F1015',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#F4F3EE',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#A7B0A9',
                      pointerEvents: 'none',
                    }}
                  >
                    {isSearchingIssuer ? <RefreshCw size={15} className="spin" /> : <Search size={15} />}
                  </div>
                </div>
              </div>

              {/* Logo Candidates Grid */}
              {issuerCandidates.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '11px', color: '#D4D7DC', fontWeight: 600, marginBottom: '8px' }}>
                    Discovered Brand Assets ({issuerCandidates.length}):
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(235px, 1fr))',
                      gap: '10px',
                    }}
                  >
                    {issuerCandidates.map((cand) => {
                      const isPersisting = persistingCandidateId === cand.id;
                      const isBrowserFailed = !!failedCandidateThumbs[cand.id];
                      const effectiveState = isPersisting
                        ? 'loading'
                        : isBrowserFailed
                        ? 'failed'
                        : cand.validationState;
                      const isSelected =
                        selectedCandidateId === cand.id ||
                        (!!form.issuerLogo &&
                          (form.issuerLogo === cand.imageUrl ||
                            form.issuerLogoMetadata?.originalSourceUrl === cand.imageUrl));

                      return (
                        <div
                          key={cand.id}
                          onClick={() => handleSelectIssuerCandidate(cand)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? 'rgba(220, 80, 95, 0.18)' : '#14151C',
                            border: isSelected
                              ? '1px solid rgba(220, 80, 95, 0.6)'
                              : effectiveState === 'failed' || effectiveState === 'unsupported'
                              ? '1px solid rgba(217, 83, 79, 0.25)'
                              : '1px solid rgba(255, 255, 255, 0.08)',
                            cursor: isPersisting ? 'wait' : 'pointer',
                            opacity: effectiveState === 'failed' || effectiveState === 'unsupported' ? 0.68 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.2s',
                          }}
                        >
                          {/* Logo Preview Box */}
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              padding: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            {cand.imageUrl && effectiveState !== 'failed' && effectiveState !== 'unsupported' ? (
                              <img
                                src={cand.imageUrl}
                                alt={cand.altText}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  objectFit: 'contain',
                                }}
                                onError={() => {
                                  setFailedCandidateThumbs((prev) => ({ ...prev, [cand.id]: true }));
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: '10px', fontWeight: 700, color: '#E06C75' }}>
                                ERR
                              </span>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#FFFFFF',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {cand.name}
                            </div>
                            <div style={{ fontSize: '10px', color: '#8E948D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {cand.domain} &bull; {cand.format.toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                              <span
                                style={{
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontSize: '9px',
                                  fontWeight: 600,
                                  backgroundColor:
                                    effectiveState === 'loading'
                                      ? 'rgba(130, 148, 166, 0.2)'
                                      : effectiveState === 'verified'
                                      ? 'rgba(74, 180, 120, 0.16)'
                                      : 'rgba(217, 83, 79, 0.18)',
                                  color:
                                    effectiveState === 'loading'
                                      ? '#B8C7D6'
                                      : effectiveState === 'verified'
                                      ? '#6CE098'
                                      : '#E06C75',
                                }}
                              >
                                {effectiveState === 'loading'
                                  ? 'Persisting to R2...'
                                  : effectiveState === 'verified'
                                  ? 'Verified'
                                  : effectiveState === 'unsupported'
                                  ? 'Unsupported'
                                  : 'Failed'}
                              </span>
                              <span
                                style={{
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontSize: '9px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                  color: '#A7B0A9',
                                }}
                              >
                                {cand.badge}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <CheckCircle2 size={16} color="#6CE098" style={{ flexShrink: 0 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Candidate / R2 Selection Error Banner (Previous Valid Logo Preserved) */}
              {logoSelectionError && (
                <div
                  role="alert"
                  style={{
                    marginBottom: '14px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(217, 83, 79, 0.12)',
                    border: '1px solid rgba(217, 83, 79, 0.35)',
                    color: '#F38B96',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>{logoSelectionError.message}</span>
                  {(logoSelectionError.retryCandidate || logoSelectionError.retryUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (logoSelectionError.retryCandidate) {
                          handleSelectIssuerCandidate(logoSelectionError.retryCandidate);
                        } else if (logoSelectionError.retryUrl) {
                          handleValidateAndPersistCustomUrl(logoSelectionError.retryUrl);
                        }
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}

              {/* Selected Logo & Fallback Controls */}
              <div
                style={{
                  backgroundColor: '#0F1015',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                  padding: '14px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                {/* Current Logo Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <CertificationLogoMark
                    cert={{
                      id: initialCertification?.id || 'preview',
                      title: form.title,
                      issuer: form.issuer,
                      issuerDomain: form.issuerDomain,
                      issuerLogo: form.issuerLogo,
                      issuerLogoSource: form.issuerLogoSource,
                      issuerLogoAlt: form.issuerLogoAlt,
                      highlightTag: form.highlightTag,
                    }}
                    cmsIssuers={cmsService.getIssuers()}
                    variant="admin"
                    onStatusChange={setPreviewLogoStatus}
                  />

                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#F4F3EE' }}>
                      {form.issuer || 'No organization selected'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8E948D', marginTop: '2px' }}>
                      {form.issuerDomain ? `Domain: ${form.issuerDomain}` : 'Search above, upload SVG/PNG to R2, or use monogram'}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '5px' }}>
                      {form.issuerLogo && isDeprecatedOrBrokenLogoUrl(form.issuerLogo) ? (
                        <span
                          style={{
                            padding: '1px 7px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            backgroundColor: 'rgba(220, 80, 95, 0.22)',
                            color: '#F38B96',
                            fontWeight: 600,
                          }}
                        >
                          Deprecated Clearbit URL — Select verified SVG, upload to R2, or clear for monogram
                        </span>
                      ) : previewLogoStatus.failedUrls.length > 0 && previewLogoStatus.renderedAs === 'monogram' ? (
                        <span
                          style={{
                            padding: '1px 7px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            backgroundColor: 'rgba(214, 168, 84, 0.2)',
                            color: '#E8CE7D',
                            fontWeight: 600,
                          }}
                        >
                          Logo URL failed to load — Designed Monogram active
                        </span>
                      ) : previewLogoStatus.renderedAs === 'image' ? (
                        <>
                          <span
                            style={{
                              padding: '1px 7px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              backgroundColor: previewLogoStatus.verified
                                ? 'rgba(74, 180, 120, 0.16)'
                                : 'rgba(255, 255, 255, 0.08)',
                              color: previewLogoStatus.verified ? '#6CE098' : '#D4D7DC',
                            }}
                          >
                            {previewLogoStatus.verified
                              ? form.issuerLogoSource === 'upload'
                                ? 'Verified • Stored in Cloudflare R2'
                                : 'Verified Directory SVG'
                              : 'External URL (Unverified)'}
                          </span>
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              color: '#A7B0A9',
                              textTransform: 'uppercase',
                            }}
                          >
                            {form.issuerLogoFormat || 'svg'}
                          </span>
                          {form.issuerLogoMetadata?.objectKey && (
                            <span
                              title={form.issuerLogoMetadata.objectKey}
                              style={{
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                backgroundColor: 'rgba(74, 180, 120, 0.12)',
                                color: '#8EE4AF',
                              }}
                            >
                              R2 Key Saved ({Math.max(1, Math.round(form.issuerLogoMetadata.sizeBytes / 1024))} KB)
                            </span>
                          )}
                        </>
                      ) : (
                        <span
                          style={{
                            padding: '1px 7px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: '#C1C4BE',
                          }}
                        >
                          Designed Issuer Monogram Active (No Uploaded Image)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Manual Upload & URL Fallbacks */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      color: '#F4F3EE',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: isUploadingLogo ? 'wait' : 'pointer',
                    }}
                  >
                    <Upload size={13} />
                    <span>{isUploadingLogo ? 'Uploading...' : 'Direct SVG / PNG'}</span>
                    <input
                      type="file"
                      accept=".svg,image/svg+xml,image/png,image/webp,image/jpeg"
                      onChange={handleCustomLogoUpload}
                      disabled={isUploadingLogo}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <ImageUploadWithCrop
                    currentImageUrl={form.issuerLogo}
                    category="certification-logo"
                    caption={`${form.issuer || 'Issuer'} Logo`}
                    altText={`${form.issuer || 'Issuer'} Logo`}
                    buttonLabel="Upload & Crop Logo"
                    initialAspect={1}
                    initialShape="rect"
                    modalTitle="Issuer Logo — Drag, Position & Crop"
                    contextHint="Center and crop the accreditation issuer logo in a crisp 1:1 frame."
                    onSuccess={(url, asset) => {
                      setForm((prev) => ({
                        ...prev,
                        issuerLogo: url,
                        issuerLogoKey: asset?.objectKey || prev.issuerLogoKey || '',
                        issuerLogoSource: 'upload',
                        issuerLogoFormat: url.toLowerCase().endsWith('.webp') ? 'webp' : 'png',
                        issuerLogoAlt: `${prev.issuer || 'Issuer'} Official Logo`,
                      }));
                      showNotification('Issuer logo cropped and saved to Cloudflare R2.');
                    }}
                    showNotification={showNotification}
                  />

                  {form.issuerLogo && (
                    <button
                      type="button"
                      onClick={() => {
                        updateField('issuerLogo', '');
                        updateField('issuerLogoKey', '');
                        updateField('issuerLogoSource', 'monogram');
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(217, 83, 79, 0.3)',
                        color: '#E06C75',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Clear Logo
                    </button>
                  )}
                </div>
              </div>

              {/* Optional Custom Logo URL Validation & R2 Import */}
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="url"
                  value={pendingCustomUrl}
                  onChange={(e) => setPendingCustomUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleValidateAndPersistCustomUrl();
                    }
                  }}
                  placeholder="Or paste HTTPS image URL to validate & store in R2 (https://...)"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0F1015',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#C1C4BE',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleValidateAndPersistCustomUrl()}
                  disabled={!pendingCustomUrl.trim() || isValidatingCustomUrl}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: !pendingCustomUrl.trim() || isValidatingCustomUrl ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isValidatingCustomUrl ? 'Validating...' : 'Validate & Save to R2'}
                </button>
              </div>
            </div>

            {/* 3. DATES & DOES NOT EXPIRE TOGGLE */}
            <div
              style={{
                backgroundColor: '#14151C',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: '#F4F3EE',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.doesNotExpire}
                    onChange={(e) => updateField('doesNotExpire', e.target.checked)}
                    style={{ accentColor: '#DC505F', width: '16px', height: '16px' }}
                  />
                  <span>This credential does not expire</span>
                </label>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: '#A7B0A9',
                      marginBottom: '6px',
                    }}
                  >
                    Issue Date
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={form.issueMonth || ''}
                      onChange={(e) => updateField('issueMonth', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#0F1015',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: form.issueMonth ? '#F4F3EE' : '#9296A1',
                        fontSize: '13px',
                      }}
                    >
                      <option value="">— Month Not Specified (Year Only) —</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={form.issueYear}
                      onChange={(e) => updateField('issueYear', e.target.value)}
                      placeholder="YYYY"
                      style={{
                        width: '80px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#0F1015',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#F4F3EE',
                        fontSize: '13px',
                        textAlign: 'center',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: form.doesNotExpire ? '#6B7F72' : '#A7B0A9',
                      marginBottom: '6px',
                    }}
                  >
                    Expiration Date {form.doesNotExpire && '(No Expiry)'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      disabled={form.doesNotExpire}
                      value={form.expirationMonth || ''}
                      onChange={(e) => updateField('expirationMonth', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: form.doesNotExpire ? '#0A0A0C' : '#0F1015',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: form.doesNotExpire ? '#6B7F72' : form.expirationMonth ? '#F4F3EE' : '#9296A1',
                        fontSize: '13px',
                      }}
                    >
                      <option value="">— Month Not Specified (Year Only) —</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      disabled={form.doesNotExpire}
                      value={form.doesNotExpire ? 'None' : form.expirationYear}
                      onChange={(e) => updateField('expirationYear', e.target.value)}
                      placeholder="YYYY"
                      style={{
                        width: '80px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: form.doesNotExpire ? '#0A0A0C' : '#0F1015',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: form.doesNotExpire ? '#6B7F72' : '#F4F3EE',
                        fontSize: '13px',
                        textAlign: 'center',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. CREDENTIAL ID & VERIFICATION URL */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#A7B0A9',
                    marginBottom: '6px',
                  }}
                >
                  Credential ID (Optional)
                </label>
                <input
                  type="text"
                  value={form.credentialId || ''}
                  onChange={(e) => updateField('credentialId', e.target.value)}
                  placeholder="e.g. AUTH-2025-9481"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#14151C',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#A7B0A9',
                    marginBottom: '6px',
                  }}
                >
                  Verification URL (Public verification link)
                </label>
                <input
                  type="url"
                  value={form.verificationUrl || ''}
                  onChange={(e) => updateField('verificationUrl', e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#14151C',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* 5. DESCRIPTION */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                  marginBottom: '6px',
                }}
              >
                Description / Core Topics Covered
              </label>
              <textarea
                value={form.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                placeholder="Comprehensive study and practical verification of models, prompt caching, tool use..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#14151C',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#F4F3EE',
                  fontSize: '13px',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </div>

            {/* 6. ASSOCIATED SKILLS */}
            <div>
              <SkillsMultiSelector
                value={form.skillsUsed || []}
                onChange={(skills) => updateField('skillsUsed', skills)}
                allSkills={allSkills}
                label="Associated Skills & Competencies"
                placeholder="Select skills or type a new competency..."
              />
            </div>

            {/* 7. CERTIFICATE ATTACHMENT */}
            <div
              style={{
                backgroundColor: '#14151C',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#F4F3EE', display: 'block' }}>
                    Certificate Attachment (PDF or Image)
                  </span>
                  <span style={{ fontSize: '11px', color: '#8E948D' }}>
                    Upload credential artifact for verification modal preview.
                  </span>
                </div>

                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F4F3EE',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={13} />
                  <span>{isUploadingDoc ? 'Uploading...' : 'Upload File'}</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleCertificateUpload}
                    style={{ display: 'none' }}
                    disabled={isUploadingDoc}
                  />
                </label>
              </div>

              {(form.certificatePdfUrl || form.certificateImage) && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0F1015',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#6CE098',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '80%',
                    }}
                  >
                    Attached: {form.certificatePdfUrl || form.certificateImage}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updateField('certificatePdfUrl', '');
                      updateField('certificateImage', '');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E06C75',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* 8. LIVE CREDENTIAL CARD PREVIEW */}
            <div
              style={{
                backgroundColor: '#090A0E',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <div style={{ fontSize: '11px', color: '#D4D7DC', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Live Circular Carousel Card Preview:
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    width: '268px',
                    height: '268px',
                    borderRadius: '23px',
                    background: 'linear-gradient(145deg, rgba(18, 20, 26, 0.95) 0%, rgba(10, 11, 15, 0.98) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(140, 21, 36, 0.18)',
                    padding: '20px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '9.5px',
                        color: '#D4D7DC',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                      }}
                    >
                      {form.highlightTag || 'ACCREDITATION'}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: '#6CE098', fontWeight: 600 }}>
                      <CheckCircle2 size={12} />
                      <span>Verified</span>
                    </div>
                  </div>

                  {/* Logo Center */}
                  <CertificationLogoMark
                    cert={{
                      id: initialCertification?.id || 'live-preview',
                      title: form.title,
                      issuer: form.issuer,
                      issuerDomain: form.issuerDomain,
                      issuerLogo: form.issuerLogo,
                      issuerLogoSource: form.issuerLogoSource,
                      issuerLogoAlt: form.issuerLogoAlt,
                      highlightTag: form.highlightTag,
                    }}
                    cmsIssuers={cmsService.getIssuers()}
                    variant="card"
                  />

                  {/* Details */}
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        lineHeight: 1.25,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '4px',
                      }}
                    >
                      {form.title || 'Certification Title'}
                    </div>

                    <div style={{ fontSize: '11px', color: '#A7B0A9' }}>
                      {form.issuer || 'Issuing Body'} &bull; {form.issueMonth} {form.issueYear}
                    </div>
                  </div>

                  {/* Inspect Credential pill */}
                  <div
                    style={{
                      padding: '5px 10px',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontSize: '10.5px',
                      color: '#FFFFFF',
                      textAlign: 'center',
                      fontWeight: 500,
                    }}
                  >
                    Inspect Credential ↗
                  </div>
                </div>
              </div>
            </div>

          </div>
        </AdminModalBody>

        <AdminModalFooter
          onCancel={onClose}
          onDelete={
            isEditing && onDelete && initialCertification
              ? () => {
                  if (window.confirm(`Delete certification "${initialCertification.title}"?`)) {
                    onDelete(initialCertification.id);
                    onClose();
                  }
                }
              : undefined
          }
          deleteText="Delete"
          isSaving={isSaving}
        >
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={isSaving}
            className="btn-glass-primary"
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#E5E5EA',
              fontSize: '13px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              minHeight: '38px',
            }}
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={isSaving}
            className="btn-luxury-primary"
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              border: 'none',
              color: '#050505',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              minHeight: '38px',
            }}
          >
            Publish Credential
          </button>
        </AdminModalFooter>
    </AdminModal>
  );
};

export default CertificationEditorModal;
