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
import { issuerService, IssuerCandidate, VERIFIED_ISSUERS_DIRECTORY } from '../../../services/issuerService';
import { ImageUploadWithCrop } from '../common/ImageUploadWithCrop';

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
        issueMonth: initialCertification.issueMonth || 'January',
        issueYear: initialCertification.issueYear || '2024',
        completionDate: initialCertification.completionDate || 'Jan 2024',
        expirationMonth: initialCertification.expirationMonth || 'December',
        expirationYear: initialCertification.expirationYear || '2027',
        expiryDate: initialCertification.expiryDate || '',
        doesNotExpire: initialCertification.doesNotExpire ?? true,
        credentialId: initialCertification.credentialId || '',
        verificationUrl: initialCertification.verificationUrl || '',
        description: initialCertification.description || '',
        skillsUsed: initialCertification.skillsUsed || [],
        certificateImage: initialCertification.certificateImage || '',
        certificatePdfUrl: initialCertification.certificatePdfUrl || '',
        category: initialCertification.category || 'Applied Artificial Intelligence',
        highlightTag: initialCertification.highlightTag || 'CERTIFIED CREDENTIAL',
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
      issueMonth: 'January',
      issueYear: new Date().getFullYear().toString(),
      completionDate: 'Jan ' + new Date().getFullYear(),
      expirationMonth: 'December',
      expirationYear: (new Date().getFullYear() + 3).toString(),
      expiryDate: '',
      doesNotExpire: true,
      credentialId: '',
      verificationUrl: '',
      description: '',
      skillsUsed: [],
      certificateImage: '',
      certificatePdfUrl: '',
      category: 'Applied Artificial Intelligence',
      highlightTag: 'ACCREDITATION',
      displayOrder: 1,
      status: 'published',
    };
  });

  const [issuerSearchQuery, setIssuerSearchQuery] = useState(form.issuer || '');
  const [issuerCandidates, setIssuerCandidates] = useState<IssuerCandidate[]>([]);
  const [isSearchingIssuer, setIsSearchingIssuer] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Trigger search when user types or clicks an issuer
  const handleSearchIssuer = async (query: string) => {
    setIssuerSearchQuery(query);
    if (!query.trim()) {
      setIssuerCandidates([]);
      return;
    }

    setIsSearchingIssuer(true);
    try {
      const candidates = await issuerService.resolveLogoCandidates(query);
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
      issuerService.resolveLogoCandidates(form.issuer).then((res) => {
        setIssuerCandidates(res);
      });
    }
  }, []);

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectIssuerCandidate = (cand: IssuerCandidate) => {
    setForm((prev) => ({
      ...prev,
      issuer: cand.name,
      issuerDomain: cand.domain,
      issuerWebsite: cand.website,
      issuerLogo: cand.logoUrl,
      issuerLogoSource: cand.source,
      issuerLogoFormat: cand.logoFormat,
      issuerLogoAlt: cand.altText,
    }));
    setIssuerSearchQuery(cand.name);
    showNotification(`Selected verified logo for ${cand.name}`);
  };

  const handleCustomLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      // Upload logo directly to Cloudflare R2
      const stored = await storageClient.uploadFile(file, {
        category: 'branding',
        customFileName: `issuer_${Date.now()}_${file.name.replace(/\s+/g, '_')}`,
        visibility: 'public',
      });

      const ext = file.name.split('.').pop()?.toLowerCase();
      const format = ext === 'svg' ? 'svg' : ext === 'webp' ? 'webp' : 'png';
      const logoUrl = stored.publicUrl || `/api/storage/files/${stored.objectKey}`;

      setForm((prev) => ({
        ...prev,
        issuerLogo: logoUrl,
        issuerLogoKey: stored.objectKey,
        issuerLogoSource: 'upload',
        issuerLogoFormat: format as any,
        issuerLogoAlt: `${prev.issuer || 'Issuer'} Official Logo`,
      }));

      showNotification(`Logo uploaded to Cloudflare R2 successfully.`);
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
    if (!form.title.trim() || !form.issuer.trim()) {
      showNotification('Certification name and Issuing organization are required.', 'error');
      return;
    }

    const computedCompletionDate = form.issueMonth?.trim()
      ? `${form.issueMonth} ${form.issueYear}`
      : form.issueYear?.trim() || form.completionDate || 'Certified';
    const computedExpiryDate = form.doesNotExpire
      ? 'Does not expire'
      : form.expirationMonth?.trim()
      ? `${form.expirationMonth} ${form.expirationYear}`
      : form.expirationYear?.trim() || 'Does not expire';

    const requiresConfirm =
      (!form.issueMonth?.trim() && !!form.issueYear?.trim()) ||
      (!form.issueYear && !form.issueMonth);

    const payload = {
      ...form,
      completionDate: computedCompletionDate,
      expiryDate: computedExpiryDate,
      requiresDateConfirmation: requiresConfirm,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (isEditing && initialCertification) {
        await cmsService.updateCertification(initialCertification.id, payload);
        onSave({ ...payload, id: initialCertification.id });
        showNotification(
          targetStatus === 'published'
            ? 'Certification updated and published with verified issuer logo.'
            : 'Certification draft saved.'
        );
      } else {
        const created = await cmsService.addCertification(payload);
        onSave(created);
        showNotification(
          targetStatus === 'published'
            ? 'Certification added and published with verified issuer logo.'
            : 'Certification draft saved.'
        );
      }
      onClose();
    } catch (err: any) {
      showNotification('Save failed: ' + (err.message || 'Firebase error'), 'error');
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 'clamp(8px, 2.5vw, 20px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#0F1015',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '16px',
          maxWidth: '840px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85)',
        }}
      >
        {/* Sticky Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#14151C',
            flexShrink: 0,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 600,
                color: '#F4F3EE',
                margin: 0,
              }}
            >
              {isEditing ? 'Edit Accreditation & Brand Identity' : 'Add Accreditation & Brand Identity'}
            </h3>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#A7B0A9' }}>
              Cloudflare R2 Persistent Storage &bull; Verified Brand Logos &bull; React Bits Circular Carousel
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#A7B0A9',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
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
                    Available Logo Candidates ({issuerCandidates.length}):
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '10px',
                    }}
                  >
                    {issuerCandidates.map((cand) => {
                      const isSelected = form.issuerLogo === cand.logoUrl;
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
                              : '1px solid rgba(255, 255, 255, 0.08)',
                            cursor: 'pointer',
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
                            <img
                              src={cand.logoUrl}
                              alt={cand.altText}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                              }}
                              onError={(e) => {
                                // Graceful fallback
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
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
                            <div style={{ fontSize: '10px', color: '#8E948D' }}>{cand.domain}</div>
                            <span
                              style={{
                                display: 'inline-block',
                                marginTop: '3px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '9px',
                                backgroundColor: cand.verified
                                  ? 'rgba(74, 180, 120, 0.15)'
                                  : 'rgba(255, 255, 255, 0.06)',
                                color: cand.verified ? '#6CE098' : '#A7B0A9',
                              }}
                            >
                              {cand.badge}
                            </span>
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
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    {form.issuerLogo ? (
                      <img
                        src={form.issuerLogo}
                        alt={form.issuerLogoAlt || form.issuer}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#A7B0A9',
                        }}
                      >
                        {form.issuer ? form.issuer.slice(0, 3).toUpperCase() : 'LOGO'}
                      </span>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#F4F3EE' }}>
                      {form.issuer || 'No organization selected'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8E948D', marginTop: '2px' }}>
                      {form.issuerDomain ? `Domain: ${form.issuerDomain}` : 'Search above or upload custom'}
                    </div>
                    {form.issuerLogo && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <span
                          style={{
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            backgroundColor: 'rgba(220, 80, 95, 0.2)',
                            color: '#FFFFFF',
                          }}
                        >
                          Source: {form.issuerLogoSource || 'directory'}
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
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual Upload & URL Fallbacks */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <ImageUploadWithCrop
                    currentImageUrl={form.issuerLogo}
                    category="logo"
                    caption={`${form.issuer || 'Issuer'} Logo`}
                    altText={`${form.issuer || 'Issuer'} Logo`}
                    buttonLabel="Upload & Crop Logo"
                    initialAspect={1}
                    initialShape="rect"
                    modalTitle="Issuer Logo — Drag, Position & Crop"
                    contextHint="Center and crop the accreditation issuer logo in a crisp 1:1 frame."
                    onSuccess={(url) => {
                      updateField('issuerLogo', url);
                      updateField('issuerLogoSource', 'upload');
                      showNotification('Issuer logo updated and cropped.');
                    }}
                    showNotification={showNotification}
                  />

                  {form.issuerLogo && (
                    <button
                      type="button"
                      onClick={() => {
                        updateField('issuerLogo', '');
                        updateField('issuerLogoKey', '');
                        updateField('issuerLogoSource', 'directory');
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

              {/* Optional Custom Logo URL input */}
              <div style={{ marginTop: '12px' }}>
                <input
                  type="text"
                  value={form.issuerLogo || ''}
                  onChange={(e) => {
                    updateField('issuerLogo', e.target.value);
                    updateField('issuerLogoSource', 'url');
                  }}
                  placeholder="Or paste direct image URL (https://...)"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0F1015',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#C1C4BE',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
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
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                  marginBottom: '6px',
                }}
              >
                Associated Skills &amp; Competencies
              </label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '10px',
                  minHeight: '32px',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: '#14151C',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                {(form.skillsUsed || []).map((sk) => (
                  <span
                    key={sk}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      fontSize: '12px',
                      color: '#F4F3EE',
                    }}
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#A7B0A9',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Skill Search */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (skillSearchQuery.trim()) {
                        handleAddSkill(skillSearchQuery);
                      }
                    }
                  }}
                  placeholder="Type to search or add new skill..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#14151C',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (skillSearchQuery.trim()) {
                      handleAddSkill(skillSearchQuery);
                    }
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F4F3EE',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Add Skill
                </button>
              </div>

              {filteredSkills.length > 0 && skillSearchQuery.trim() && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '8px',
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: '#14151C',
                  }}
                >
                  {filteredSkills.slice(0, 6).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleAddSkill(name)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#A7B0A9',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              )}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '64px', margin: '6px 0' }}>
                    {form.issuerLogo ? (
                      <img
                        src={form.issuerLogo}
                        alt={form.issuerLogoAlt || form.issuer}
                        style={{
                          maxHeight: '48px',
                          maxWidth: '180px',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {form.issuer || 'Issuer Name'}
                      </div>
                    )}
                  </div>

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
        </div>

        {/* Sticky Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#14151C',
            flexShrink: 0,
          }}
        >
          {isEditing && onDelete && initialCertification ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete certification "${initialCertification.title}"?`)) {
                  onDelete(initialCertification.id);
                  onClose();
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                backgroundColor: 'rgba(217, 83, 79, 0.12)',
                border: '1px solid rgba(217, 83, 79, 0.3)',
                color: '#E06C75',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={13} />
              Delete
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#C1C4BE',
                fontSize: '13px',
                cursor: 'pointer',
                minHeight: '40px',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#E5E5EA',
                fontSize: '13px',
                cursor: 'pointer',
                minHeight: '40px',
              }}
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              style={{
                padding: '10px 22px',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                border: 'none',
                color: '#050505',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '40px',
              }}
            >
              Publish Credential
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationEditorModal;
