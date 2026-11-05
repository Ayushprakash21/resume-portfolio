import React, { useState } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  FileText,
  Video,
  Link as LinkIcon,
  Search,
  CheckCircle2,
  Save,
  Star,
  Layers,
  ChevronUp,
  ChevronDown,
  Crop,
} from 'lucide-react';
import {
  ProjectRecord,
  ProjectContentBlocks,
  ProjectMediaItem,
  SkillRecord,
} from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';
import { optimizeImageFile } from '../../../utils/imageOptimizer';
import { ImageCropModal } from '../common/ImageCropModal';
import { ImageUploadWithCrop } from '../common/ImageUploadWithCrop';
import { ProjectCategorySelector } from '../common/ProjectCategorySelector';
import { DevelopmentStatusSelector } from '../common/DevelopmentStatusSelector';
import { CompanySelector } from '../common/CompanySelector';
import { SkillsMultiSelector } from '../common/SkillsMultiSelector';

interface ProjectEditorModalProps {
  initialProject: ProjectRecord | null;
  allSkills: SkillRecord[];
  onSave: (saved: ProjectRecord) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProjectEditorModal: React.FC<ProjectEditorModalProps> = ({
  initialProject,
  allSkills,
  onSave,
  onDelete,
  onClose,
  showNotification,
}) => {
  const isEditing = !!initialProject;

  const [activeSectionTab, setActiveSectionTab] = useState<'basic' | 'contentBlocks' | 'media' | 'skills'>(
    'basic'
  );

  const [form, setForm] = useState<Omit<ProjectRecord, 'id'>>(() => {
    if (initialProject) {
      return {
        name: initialProject.name,
        category: initialProject.category,
        subtitle: initialProject.subtitle,
        shortDescription: initialProject.shortDescription || '',
        description: initialProject.description,
        problemStatement: initialProject.problemStatement || '',
        solution: initialProject.solution || '',
        coverImage: initialProject.coverImage || '',
        logoUrl: initialProject.logoUrl || '',
        screenshots: initialProject.screenshots || [],
        technologyStack: initialProject.technologyStack || [],
        features: initialProject.features || [],
        developmentStatus: initialProject.developmentStatus,
        projectUrl: initialProject.projectUrl || '',
        repositoryUrl: initialProject.repositoryUrl || '',
        demoUrl: initialProject.demoUrl || '',
        startDate: initialProject.startDate || '',
        endDate: initialProject.endDate || '',
        isCurrent: initialProject.isCurrent ?? false,
        contributors: initialProject.contributors || 'Ayush Prakash (Lead)',
        associatedOrganization: initialProject.associatedOrganization || 'Independent Research',
        featured: initialProject.featured ?? true,
        displayOrder: initialProject.displayOrder || 1,
        status: initialProject.status || 'published',
        skillsUsed: initialProject.skillsUsed || [],
        contentBlocks: initialProject.contentBlocks || {
          overview: initialProject.description,
          problemStatement: initialProject.problemStatement || '',
          proposedSolution: initialProject.solution || '',
          features: initialProject.features || [],
          architecture: '',
          technologyStack: initialProject.technologyStack || [],
          contribution: 'Lead Architect & Full-Stack Developer',
          outcomes: '',
          futureRoadmap: '',
        },
        mediaItems: initialProject.mediaItems || [],
      };
    }
    return {
      name: '',
      category: 'Enterprise AI & Systems',
      subtitle: '',
      shortDescription: '',
      description: '',
      problemStatement: '',
      solution: '',
      coverImage: '',
      logoUrl: '',
      screenshots: [],
      technologyStack: [],
      features: [],
      developmentStatus: 'Active Architectural Prototype',
      projectUrl: '',
      repositoryUrl: '',
      demoUrl: '',
      startDate: '2024',
      endDate: 'Present',
      isCurrent: true,
      contributors: 'Ayush Prakash',
      associatedOrganization: 'Independent Project',
      featured: true,
      displayOrder: 1,
      status: 'published',
      skillsUsed: [],
      contentBlocks: {
        overview: '',
        problemStatement: '',
        proposedSolution: '',
        features: [],
        architecture: '',
        technologyStack: [],
        contribution: 'Founder & Architect',
        outcomes: '',
        futureRoadmap: '',
      },
      mediaItems: [],
    };
  });

  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [newTechInput, setNewTechInput] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [cropTargetScreenshotIdx, setCropTargetScreenshotIdx] = useState<number | null>(null);

  const handleApplyCroppedScreenshot = async (croppedFile: File) => {
    if (cropTargetScreenshotIdx === null) return;
    try {
      const asset = await cmsService.uploadMediaFile(
        croppedFile,
        'screenshot',
        `${form.name || 'Project'} Screenshot (Cropped)`
      );
      const updated = [...(form.screenshots || [])];
      updated[cropTargetScreenshotIdx] = asset.url;
      updateField('screenshots', updated);
      showNotification('Screenshot cropped and updated.', 'success');
    } catch (err: any) {
      showNotification('Failed to update cropped screenshot: ' + (err.message || 'Error'), 'error');
    } finally {
      setCropTargetScreenshotIdx(null);
    }
  };
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Dedicated Project Logo Upload (PNG, SVG, WebP, JPG)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const optimized = await optimizeImageFile(file, 1024);
      const asset = await cmsService.uploadMediaFile(
        optimized,
        'logo',
        `${form.name || 'Project'} Official Logo`
      );
      updateField('logoUrl', asset.url);
      showNotification('Project branding logo uploaded and preview updated.');
    } catch (err: any) {
      showNotification('Logo upload error: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleRemoveLogo = () => {
    updateField('logoUrl', '');
    showNotification('Project logo removed.');
  };

  // Optional Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const optimized = await optimizeImageFile(file, 1920);
      const asset = await cmsService.uploadMediaFile(
        optimized,
        'screenshot',
        `${form.name || 'Project'} Cover Image`
      );
      updateField('coverImage', asset.url);
      showNotification('Cover image updated.');
    } catch (err: any) {
      showNotification('Cover image error: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleRemoveCover = () => {
    updateField('coverImage', '');
    showNotification('Project cover image removed.');
  };

  // Reorder Screenshots
  const handleMoveScreenshot = (fromIdx: number, toIdx: number) => {
    const currentScreenshots = [...(form.screenshots || [])];
    if (toIdx < 0 || toIdx >= currentScreenshots.length) return;
    const item = currentScreenshots.splice(fromIdx, 1)[0];
    currentScreenshots.splice(toIdx, 0, item);
    updateField('screenshots', currentScreenshots);
    showNotification('Screenshot order updated.');
  };

  const handleRemoveScreenshot = (idx: number) => {
    const currentScreenshots = [...(form.screenshots || [])].filter((_, i) => i !== idx);
    updateField('screenshots', currentScreenshots);
    showNotification('Screenshot removed.');
  };

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateBlock = <K extends keyof ProjectContentBlocks>(
    blockKey: K,
    val: ProjectContentBlocks[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      contentBlocks: {
        ...(prev.contentBlocks || {}),
        [blockKey]: val,
      },
    }));
  };

  // Feature list helper
  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    const currentFeatures = form.contentBlocks?.features || form.features || [];
    const updated = [...currentFeatures, newFeatureInput.trim()];
    updateBlock('features', updated);
    updateField('features', updated);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    const currentFeatures = form.contentBlocks?.features || form.features || [];
    const updated = currentFeatures.filter((_, i) => i !== idx);
    updateBlock('features', updated);
    updateField('features', updated);
  };

  // Tech stack helper
  const handleAddTech = () => {
    if (!newTechInput.trim()) return;
    const currentTech = form.contentBlocks?.technologyStack || form.technologyStack || [];
    if (!currentTech.includes(newTechInput.trim())) {
      const updated = [...currentTech, newTechInput.trim()];
      updateBlock('technologyStack', updated);
      updateField('technologyStack', updated);
    }
    setNewTechInput('');
  };

  const handleRemoveTech = (tech: string) => {
    const currentTech = form.contentBlocks?.technologyStack || form.technologyStack || [];
    const updated = currentTech.filter((t) => t !== tech);
    updateBlock('technologyStack', updated);
    updateField('technologyStack', updated);
  };

  // Skills helper
  const handleAddSkill = async (skillName: string) => {
    const trimmed = skillName.trim();
    const current = form.skillsUsed || [];
    if (!trimmed || current.includes(trimmed)) return;

    await cmsService.ensureSkill(trimmed, 'Projects & Case Studies');
    updateField('skillsUsed', [...current, trimmed]);
    setSkillSearchQuery('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    updateField(
      'skillsUsed',
      (form.skillsUsed || []).filter((s) => s !== skillToRemove)
    );
  };

  // Media upload handler
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    try {
      const newItems: ProjectMediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isDoc = file.type === 'application/pdf';
        const asset = await cmsService.uploadMediaFile(
          file,
          isDoc ? 'work-sample' : 'screenshot',
          `${form.name || 'Project'} - ${file.name}`
        );

        newItems.push({
          id: 'proj-med-' + Date.now() + '-' + i,
          url: asset.url,
          title: file.name.replace(/\.[^/.]+$/, ''),
          caption: `${form.name} screenshot`,
          altText: file.name,
          type: isDoc ? 'document' : 'image',
          isThumbnail: (form.mediaItems || []).length === 0 && i === 0,
        });
      }

      const combined = [...(form.mediaItems || []), ...newItems];
      updateField('mediaItems', combined);
      if (!form.coverImage && combined.length > 0) {
        updateField('coverImage', combined[0].url);
      }
      showNotification(`${newItems.length} media asset(s) added to project gallery.`);
    } catch (err: any) {
      showNotification('Project media upload failed: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleSetThumbnail = (mediaUrl: string) => {
    updateField('coverImage', mediaUrl);
    updateField(
      'mediaItems',
      (form.mediaItems || []).map((m) => ({
        ...m,
        isThumbnail: m.url === mediaUrl,
      }))
    );
    showNotification('Primary project thumbnail updated.');
  };

  const handleSetLogo = (mediaUrl: string) => {
    updateField('logoUrl', mediaUrl);
    updateField(
      'mediaItems',
      (form.mediaItems || []).map((m) => ({
        ...m,
        isLogo: m.url === mediaUrl,
      }))
    );
    showNotification('Project branding logo updated.');
  };

  const handleRemoveMedia = (mediaId: string) => {
    updateField(
      'mediaItems',
      (form.mediaItems || []).filter((m) => m.id !== mediaId)
    );
  };

  const handleSubmit = async (targetStatus: 'published' | 'draft') => {
    if (!form.name.trim() || !form.subtitle.trim()) {
      showNotification('Project name and subtitle are required.', 'error');
      return;
    }

    const payload = {
      ...form,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (isEditing && initialProject) {
        await cmsService.updateProject(initialProject.id, payload);
        onSave({ ...payload, id: initialProject.id });
        showNotification(
          targetStatus === 'published'
            ? 'Project updated and published to live site.'
            : 'Project draft saved.'
        );
      } else {
        const created = await cmsService.addProject(payload);
        onSave(created);
        showNotification(
          targetStatus === 'published'
            ? 'Project created and published.'
            : 'Project draft saved.'
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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
          borderRadius: '12px',
          maxWidth: '880px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Sticky Header */}
        <div
          style={{
            padding: '16px 20px',
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
              {isEditing ? `Edit Project: ${form.name}` : 'Add New Project'}
            </h3>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#A7B0A9' }}>
              LinkedIn-style project management with structured narrative blocks and media gallery.
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#A7B0A9',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Section Navigation Pills */}
        <div
          style={{
            padding: '10px 24px',
            backgroundColor: '#121A17',
            borderBottom: '1px solid rgba(244, 243, 238, 0.06)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'basic', label: '1. Basic Information' },
            { id: 'contentBlocks', label: '2. Detailed Content Blocks' },
            { id: 'media', label: `3. Project Media (${(form.mediaItems || []).length})` },
            { id: 'skills', label: `4. Associated Skills (${(form.skillsUsed || []).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSectionTab(tab.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor:
                  activeSectionTab === tab.id ? 'rgba(130, 148, 166, 0.2)' : 'transparent',
                color: activeSectionTab === tab.id ? '#F4F3EE' : '#8E948D',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: activeSectionTab === tab.id ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: BASIC INFORMATION */}
          {activeSectionTab === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    Project Name <span style={{ color: '#D9534F' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g. Orion-9"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#0E1412',
                      border: '1px solid rgba(244, 243, 238, 0.12)',
                      color: '#F4F3EE',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <ProjectCategorySelector
                    value={form.category}
                    onChange={(val) => updateField('category', val)}
                  />
                </div>
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
                  Project Subtitle / Elevator Pitch <span style={{ color: '#D9534F' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="e.g. AI-Powered Supply Chain Operating System"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
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
                  Short Summary
                </label>
                <textarea
                  rows={2}
                  value={form.shortDescription || ''}
                  onChange={(e) => updateField('shortDescription', e.target.value)}
                  placeholder="1-2 sentences summarizing the breakthrough and scope..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                }}
              >
                <div>
                  <DevelopmentStatusSelector
                    value={form.developmentStatus}
                    onChange={(val) => updateField('developmentStatus', val)}
                  />
                </div>

                <div>
                  <CompanySelector
                    label="Associated Organization"
                    value={form.associatedOrganization || ''}
                    onChange={(val) => updateField('associatedOrganization', val)}
                    required={false}
                  />
                </div>
              </div>

              {/* URLs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                    Live Project / Landing URL
                  </label>
                  <input
                    type="url"
                    value={form.projectUrl || ''}
                    onChange={(e) => updateField('projectUrl', e.target.value)}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#0E1412',
                      border: '1px solid rgba(244, 243, 238, 0.12)',
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
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    value={form.repositoryUrl || ''}
                    onChange={(e) => updateField('repositoryUrl', e.target.value)}
                    placeholder="https://github.com/..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#0E1412',
                      border: '1px solid rgba(244, 243, 238, 0.12)',
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
                    Interactive Demo / Video URL
                  </label>
                  <input
                    type="url"
                    value={form.demoUrl || ''}
                    onChange={(e) => updateField('demoUrl', e.target.value)}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#0E1412',
                      border: '1px solid rgba(244, 243, 238, 0.12)',
                      color: '#F4F3EE',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  padding: '14px',
                  backgroundColor: '#0E1412',
                  borderRadius: '6px',
                }}
              >
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
                    checked={form.featured}
                    onChange={(e) => updateField('featured', e.target.checked)}
                    style={{ accentColor: '#4A5749', width: '16px', height: '16px' }}
                  />
                  <span>Featured Case Study (Display prominently)</span>
                </label>

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
                    checked={form.isCurrent}
                    onChange={(e) => updateField('isCurrent', e.target.checked)}
                    style={{ accentColor: '#4A5749', width: '16px', height: '16px' }}
                  />
                  <span>Currently Active Project</span>
                </label>
              </div>

              {/* ========================================================
                  DEDICATED PROJECT LOGO UPLOAD & MANAGEMENT
                  ======================================================== */}
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#0E1412',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                      Project Logo (80–100px Squircle)
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      Supported formats: PNG, SVG, WebP, JPG. Transparent logos preserved. Displays at 80–100px on cards.
                    </div>
                  </div>

                  <ImageUploadWithCrop
                    currentImageUrl={form.logoUrl}
                    category="logo"
                    caption={`${form.name || 'Project'} Logo`}
                    altText={`${form.name || 'Project'} Logo`}
                    buttonLabel={form.logoUrl ? 'Replace Logo' : '+ Upload Logo'}
                    initialAspect={1}
                    initialShape="rect"
                    modalTitle="Project Logo — Drag, Position & Crop"
                    contextHint="Position and frame the project logo inside the squircle container. Drag and zoom as needed."
                    onSuccess={(url) => {
                      updateField('logoUrl', url);
                      showNotification('Project logo updated successfully.');
                    }}
                    showNotification={showNotification}
                  />
                </div>

                {form.logoUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Consistent 92px squircle logo preview */}
                    <div
                      style={{
                        width: '92px',
                        height: '92px',
                        borderRadius: '18px',
                        background: 'linear-gradient(135deg, #181920 0%, #0A0B0E 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        padding: '8px',
                      }}
                    >
                      <img
                        src={form.logoUrl}
                        alt="Project logo preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                        Active Branding Logo
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        URL: {form.logoUrl.slice(0, 48)}...
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '4px',
                          color: '#F87171',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={12} />
                        <span>Remove Logo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '24px',
                      textAlign: 'center',
                      border: '1px dashed rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                    }}
                  >
                    No logo uploaded yet. Upload a high-resolution PNG, SVG, or WebP logo.
                  </div>
                )}
              </div>

              {/* ========================================================
                  OPTIONAL COVER IMAGE
                  ======================================================== */}
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#0E1412',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                      Optional Cover Image
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      Optional — not required if you only want to display a logo.
                    </div>
                  </div>

                  <ImageUploadWithCrop
                    currentImageUrl={form.coverImage}
                    category="screenshot"
                    caption={`${form.name || 'Project'} Cover`}
                    altText={`${form.name || 'Project'} Cover`}
                    buttonLabel={form.coverImage ? 'Replace Cover' : '+ Upload Cover'}
                    initialAspect={16 / 9}
                    initialShape="rect"
                    modalTitle="Project Cover Image — Drag, Position & Crop"
                    contextHint="Click and drag to position your cover screenshot in 16:9 widescreen format."
                    onSuccess={(url) => {
                      updateField('coverImage', url);
                      showNotification('Project cover image updated.');
                    }}
                    showNotification={showNotification}
                  />
                </div>

                {form.coverImage ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '140px',
                        height: '80px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      <img
                        src={form.coverImage}
                        alt="Project cover preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '4px',
                          color: '#F87171',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={12} />
                        <span>Remove Cover Image</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
                    No cover image set (project will display logo-led card).
                  </div>
                )}
              </div>

              {/* Publication Status Selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: '#0E1412',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                    Publication Status
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Published projects appear live on the public portfolio.
                  </div>
                </div>

                <select
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value as 'published' | 'draft')}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: form.status === 'published' ? 'rgba(74, 87, 73, 0.6)' : 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '6px',
                    color: form.status === 'published' ? '#8CE8A0' : '#D0D0D8',
                    fontWeight: 600,
                    fontSize: '12px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="published">Published (Live on Website)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED CONTENT BLOCKS */}
          {activeSectionTab === 'contentBlocks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                  Overview Narrative
                </label>
                <textarea
                  rows={3}
                  value={form.contentBlocks?.overview || ''}
                  onChange={(e) => updateBlock('overview', e.target.value)}
                  placeholder="Executive narrative introducing the platform origin..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
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
                  Problem Statement
                </label>
                <textarea
                  rows={3}
                  value={form.contentBlocks?.problemStatement || ''}
                  onChange={(e) => updateBlock('problemStatement', e.target.value)}
                  placeholder="What operational or technical friction does this address? (No invented metrics)..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
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
                  Proposed Solution
                </label>
                <textarea
                  rows={3}
                  value={form.contentBlocks?.proposedSolution || ''}
                  onChange={(e) => updateBlock('proposedSolution', e.target.value)}
                  placeholder="Architectural approach and technical solution design..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Features List */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#A7B0A9',
                    marginBottom: '8px',
                  }}
                >
                  Key Architectural Features &amp; Capabilities
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    placeholder="Add verified feature capability..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#0E1412',
                      border: '1px solid rgba(244, 243, 238, 0.12)',
                      color: '#F4F3EE',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(244, 243, 238, 0.08)',
                      border: '1px solid rgba(244, 243, 238, 0.15)',
                      color: '#F4F3EE',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    + Add Feature
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(form.contentBlocks?.features || form.features || []).map((feat, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 12px',
                        backgroundColor: '#0E1412',
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: '#C1C4BE',
                      }}
                    >
                      <span>• {feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#E06C75',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technology Stack Tags */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#A7B0A9',
                    marginBottom: '8px',
                  }}
                >
                  Technology Stack
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={newTechInput}
                    onChange={(e) => setNewTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                    placeholder="e.g. Cloudflare Workers, TypeScript, React 19..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#0E1412',
                      border: '1px solid rgba(244, 243, 238, 0.12)',
                      color: '#F4F3EE',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(244, 243, 238, 0.08)',
                      border: '1px solid rgba(244, 243, 238, 0.15)',
                      color: '#F4F3EE',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    + Add Tech
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(form.contentBlocks?.technologyStack || form.technologyStack || []).map((t) => (
                    <span
                      key={t}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        backgroundColor: 'rgba(244, 243, 238, 0.05)',
                        border: '1px solid rgba(244, 243, 238, 0.12)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#F4F3EE',
                      }}
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(t)}
                        style={{ background: 'none', border: 'none', color: '#8E948D', cursor: 'pointer' }}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
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
                  My Contribution &amp; Role Mandate
                </label>
                <textarea
                  rows={2}
                  value={form.contentBlocks?.contribution || ''}
                  onChange={(e) => updateBlock('contribution', e.target.value)}
                  placeholder="Specifically what did you engineer, design, or lead?"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
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
                  Outcomes &amp; Validated Results (No Fake Metrics)
                </label>
                <textarea
                  rows={2}
                  value={form.contentBlocks?.outcomes || ''}
                  onChange={(e) => updateBlock('outcomes', e.target.value)}
                  placeholder="Factual validation, latency tests, schema verification, simulated lifecycle results..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
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
                  Future Architecture Roadmap
                </label>
                <textarea
                  rows={2}
                  value={form.contentBlocks?.futureRoadmap || ''}
                  onChange={(e) => updateBlock('futureRoadmap', e.target.value)}
                  placeholder="Planned integrations, BLE protocol handoffs, candidate verification..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT MEDIA & SCREENSHOTS */}
          {activeSectionTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Dedicated Screenshots Manager */}
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#0E1412',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                      Case Study Screenshots &amp; Diagrams ({(form.screenshots || []).length})
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      Upload multiple screenshots. Reorder them or select which image appears in the case study showcase.
                    </div>
                  </div>

                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={13} />
                    <span>{isUploadingMedia ? 'Uploading...' : '+ Upload Screenshots'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/svg+xml,image/webp,image/jpeg,.svg,.png,.webp,.jpg"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        setIsUploadingMedia(true);
                        try {
                          const newUrls: string[] = [];
                          for (let i = 0; i < files.length; i++) {
                            const file = files[i];
                            const optimized = await optimizeImageFile(file, 1920);
                            const asset = await cmsService.uploadMediaFile(
                              optimized,
                              'screenshot',
                              `${form.name || 'Project'} Screenshot ${i + 1}`
                            );
                            newUrls.push(asset.url);
                          }
                          const updated = [...(form.screenshots || []), ...newUrls];
                          updateField('screenshots', updated);
                          showNotification(`${newUrls.length} screenshot(s) added.`);
                        } catch (err: any) {
                          showNotification('Upload error: ' + (err.message || 'Error'), 'error');
                        } finally {
                          setIsUploadingMedia(false);
                          e.target.value = '';
                        }
                      }}
                      style={{ display: 'none' }}
                      disabled={isUploadingMedia}
                    />
                  </label>
                </div>

                {/* Screenshots List with Reordering */}
                {(form.screenshots || []).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(form.screenshots || []).map((scUrl, scIdx) => (
                      <div
                        key={scIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          padding: '10px 14px',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', width: '20px' }}>
                            #{scIdx + 1}
                          </span>
                          <div
                            style={{
                              width: '90px',
                              height: '54px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={scUrl}
                              alt={`Screenshot ${scIdx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {scUrl}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              Position {scIdx + 1} of {(form.screenshots || []).length}
                            </div>
                          </div>
                        </div>

                        {/* Reorder and Delete Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            disabled={scIdx === 0}
                            onClick={() => handleMoveScreenshot(scIdx, scIdx - 1)}
                            title="Move Up"
                            style={{
                              padding: '5px 8px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px',
                              color: scIdx === 0 ? 'rgba(255, 255, 255, 0.2)' : '#FFFFFF',
                              cursor: scIdx === 0 ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <ChevronUp size={14} />
                          </button>

                          <button
                            type="button"
                            disabled={scIdx === (form.screenshots || []).length - 1}
                            onClick={() => handleMoveScreenshot(scIdx, scIdx + 1)}
                            title="Move Down"
                            style={{
                              padding: '5px 8px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px',
                              color: scIdx === (form.screenshots || []).length - 1 ? 'rgba(255, 255, 255, 0.2)' : '#FFFFFF',
                              cursor: scIdx === (form.screenshots || []).length - 1 ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <ChevronDown size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCropTargetScreenshotIdx(scIdx)}
                            title="Crop / Reposition Screenshot"
                            style={{
                              padding: '5px 8px',
                              backgroundColor: 'rgba(212, 56, 75, 0.15)',
                              border: '1px solid rgba(212, 56, 75, 0.35)',
                              borderRadius: '4px',
                              color: '#FF8888',
                              cursor: 'pointer',
                            }}
                          >
                            <Crop size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(scIdx)}
                            title="Delete Screenshot"
                            style={{
                              padding: '5px 8px',
                              backgroundColor: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '4px',
                              color: '#F87171',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '24px',
                      textAlign: 'center',
                      border: '1px dashed rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                    }}
                  >
                    No screenshots uploaded yet. Use the upload button above to add case study captures.
                  </div>
                )}
              </div>

              {/* General Media & Documents Section */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#0E1412',
                  borderRadius: '6px',
                  border: '1px solid rgba(244, 243, 238, 0.08)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#F4F3EE',
                    }}
                  >
                    Supporting Documents &amp; External Media
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#8E948D' }}>
                    Attach whitepapers, PDFs, or architectural specs.
                  </div>
                </div>

                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    color: '#F4F3EE',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={13} />
                  {isUploadingMedia ? 'Uploading...' : '+ Upload Document'}
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,image/*"
                    onChange={handleMediaUpload}
                    style={{ display: 'none' }}
                    disabled={isUploadingMedia}
                  />
                </label>
              </div>

              {/* Gallery Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '16px',
                }}
              >
                {(form.mediaItems || []).map((med) => {
                  const isThumb = form.coverImage === med.url || med.isThumbnail;
                  const isLog = form.logoUrl === med.url || med.isLogo;
                  return (
                    <div
                      key={med.id}
                      style={{
                        backgroundColor: '#0E1412',
                        border: isThumb
                          ? '2px solid var(--accent-gold)'
                          : '1px solid rgba(244, 243, 238, 0.08)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* Image / Icon Preview */}
                      {med.type === 'image' ? (
                        <img
                          src={med.url}
                          alt={med.altText || med.title}
                          style={{
                            width: '100%',
                            height: '130px',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: '130px',
                            backgroundColor: '#1E2822',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#8294A6',
                          }}
                        >
                          <FileText size={36} />
                        </div>
                      )}

                      {/* Badges */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          display: 'flex',
                          gap: '4px',
                        }}
                      >
                        {isThumb && (
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(214, 168, 84, 0.9)',
                              color: '#111514',
                              fontSize: '10px',
                              fontWeight: 700,
                            }}
                          >
                            Thumbnail
                          </span>
                        )}
                        {isLog && (
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(130, 148, 166, 0.9)',
                              color: '#111514',
                              fontSize: '10px',
                              fontWeight: 700,
                            }}
                          >
                            Logo
                          </span>
                        )}
                      </div>

                      <div style={{ padding: '10px' }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#F4F3EE',
                            marginBottom: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {med.title || 'Asset'}
                        </div>
                        <input
                          type="text"
                          value={med.caption || ''}
                          onChange={(e) => {
                            const updated = (form.mediaItems || []).map((m) =>
                              m.id === med.id ? { ...m, caption: e.target.value } : m
                            );
                            updateField('mediaItems', updated);
                          }}
                          placeholder="Caption..."
                          style={{
                            width: '100%',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(18, 18, 22, 0.72)',
                            border: '1px solid rgba(244, 243, 238, 0.08)',
                            color: '#A7B0A9',
                            fontSize: '11px',
                            outline: 'none',
                            marginBottom: '8px',
                          }}
                        />

                        {/* Action Pills */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleSetThumbnail(med.url)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: isThumb ? 'rgba(214, 168, 84, 0.2)' : 'rgba(244, 243, 238, 0.05)',
                              border: '1px solid rgba(244, 243, 238, 0.1)',
                              color: isThumb ? '#E8CE7D' : '#C1C4BE',
                              fontSize: '10px',
                              cursor: 'pointer',
                            }}
                          >
                            Set Thumbnail
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetLogo(med.url)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: isLog ? 'rgba(130, 148, 166, 0.2)' : 'rgba(244, 243, 238, 0.05)',
                              border: '1px solid rgba(244, 243, 238, 0.1)',
                              color: isLog ? '#8294A6' : '#C1C4BE',
                              fontSize: '10px',
                              cursor: 'pointer',
                            }}
                          >
                            Set Logo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(med.id)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(217, 83, 79, 0.1)',
                              border: '1px solid rgba(217, 83, 79, 0.2)',
                              color: '#E06C75',
                              fontSize: '10px',
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ASSOCIATED SKILLS */}
          {activeSectionTab === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <SkillsMultiSelector
                value={form.skillsUsed || []}
                onChange={(skills) => updateField('skillsUsed', skills)}
                allSkills={allSkills}
                label="Skills Associated With This Project"
                placeholder="Select skills or type a new project capability..."
              />
            </div>
          )}
        </div>

        {/* Sticky Footer Actions */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid rgba(244, 243, 238, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#18211D',
            flexShrink: 0,
          }}
        >
          {isEditing && onDelete && initialProject ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${initialProject.name}"?`)) {
                  onDelete(initialProject.id);
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
              Delete Project
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-glass-secondary" style={{
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
              className="btn-glass-primary" style={{
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
              className="btn-luxury-primary" style={{
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
              Publish Project
            </button>
          </div>
        </div>
      </div>

      {cropTargetScreenshotIdx !== null && form.screenshots?.[cropTargetScreenshotIdx] && (
        <ImageCropModal
          isOpen={cropTargetScreenshotIdx !== null}
          imageSrc={form.screenshots[cropTargetScreenshotIdx]}
          fileName={`screenshot-${cropTargetScreenshotIdx + 1}.jpg`}
          initialAspect={16 / 9}
          initialShape="rect"
          title={`Screenshot #${cropTargetScreenshotIdx + 1} — Drag, Position & Crop`}
          contextHint="Position and scale the project screenshot. Use mouse drag or zoom slider."
          onClose={() => setCropTargetScreenshotIdx(null)}
          onApplyCrop={handleApplyCroppedScreenshot}
        />
      )}
    </div>
  );
};
