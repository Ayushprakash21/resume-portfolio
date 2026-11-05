import React, { useState } from 'react';
import {
  Save,
  Eye,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Globe,
  Briefcase,
  CheckCircle2,
  X,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { OpenToWorkSettings, PreferredLocation } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';
import { LocationSelector } from '../common/LocationSelector';
import {
  AdminModal,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
} from '../common/AdminModal';

interface OpenToWorkEditorProps {
  initialSettings: OpenToWorkSettings;
  onSave: (saved: OpenToWorkSettings) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const OpenToWorkEditor: React.FC<OpenToWorkEditorProps> = ({
  initialSettings,
  onSave,
  showNotification,
}) => {
  const [form, setForm] = useState<OpenToWorkSettings>(() => ({
    ...initialSettings,
    preferredLocations: initialSettings.preferredLocations || [],
    employmentPreferences: initialSettings.employmentPreferences || [],
    workArrangements: initialSettings.workArrangements || [],
    preferredJobCategories: initialSettings.preferredJobCategories || [],
  }));

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // New location inputs
  const [newLocName, setNewLocName] = useState('');
  const [newLocCity, setNewLocCity] = useState('');
  const [newLocRemote, setNewLocRemote] = useState(true);
  const [newLocRelocate, setNewLocRelocate] = useState(true);

  // New category input
  const [newCategory, setNewCategory] = useState('');

  // New employment preference input
  const [newPreference, setNewPreference] = useState('');

  // New work arrangement input
  const [newArrangement, setNewArrangement] = useState('');

  const updateField = <K extends keyof OpenToWorkSettings>(key: K, value: OpenToWorkSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  // Location management
  const handleAddLocation = () => {
    if (!newLocName.trim()) {
      showNotification('Please enter a country or region name.', 'error');
      return;
    }
    const newLoc: PreferredLocation = {
      id: 'loc-' + Date.now(),
      name: newLocName.trim(),
      city: newLocCity.trim() || undefined,
      remoteAvailable: newLocRemote,
      relocationWilling: newLocRelocate,
      isVisible: true,
      displayOrder: form.preferredLocations.length + 1,
    };
    updateField('preferredLocations', [...form.preferredLocations, newLoc]);
    setNewLocName('');
    setNewLocCity('');
    showNotification(`Added ${newLoc.name} to preferred locations.`);
  };

  const handleRemoveLocation = (id: string) => {
    const updated = form.preferredLocations.filter((l) => l.id !== id);
    updateField('preferredLocations', updated);
  };

  const handleToggleLocationVisibility = (id: string) => {
    const updated = form.preferredLocations.map((l) =>
      l.id === id ? { ...l, isVisible: !l.isVisible } : l
    );
    updateField('preferredLocations', updated);
  };

  const handleMoveLocation = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= form.preferredLocations.length) return;
    const items = [...form.preferredLocations];
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;
    // update display order
    const ordered = items.map((it, idx) => ({ ...it, displayOrder: idx + 1 }));
    updateField('preferredLocations', ordered);
  };

  // Category management
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (form.preferredJobCategories.includes(newCategory.trim())) {
      showNotification('Category already added.', 'info');
      return;
    }
    updateField('preferredJobCategories', [...form.preferredJobCategories, newCategory.trim()]);
    setNewCategory('');
  };

  const handleRemoveCategory = (cat: string) => {
    updateField(
      'preferredJobCategories',
      form.preferredJobCategories.filter((c) => c !== cat)
    );
  };

  // Employment preference management
  const handleAddPreference = () => {
    if (!newPreference.trim()) return;
    if (form.employmentPreferences.includes(newPreference.trim())) return;
    updateField('employmentPreferences', [...form.employmentPreferences, newPreference.trim()]);
    setNewPreference('');
  };

  const handleRemovePreference = (pref: string) => {
    updateField(
      'employmentPreferences',
      form.employmentPreferences.filter((p) => p !== pref)
    );
  };

  // Work arrangement management
  const handleAddArrangement = () => {
    if (!newArrangement.trim()) return;
    if (form.workArrangements.includes(newArrangement.trim())) return;
    updateField('workArrangements', [...form.workArrangements, newArrangement.trim()]);
    setNewArrangement('');
  };

  const handleRemoveArrangement = (arr: string) => {
    updateField(
      'workArrangements',
      form.workArrangements.filter((a) => a !== arr)
    );
  };

  const handleSave = async (statusOverride?: 'published' | 'draft') => {
    const payload: OpenToWorkSettings = {
      ...form,
      status: statusOverride || form.status,
      updatedAt: new Date().toISOString(),
    };
    try {
      if (payload.status === 'published') {
        await cmsService.publishOpenToWorkSettings(payload);
      } else {
        await cmsService.saveOpenToWorkDraft(payload);
      }
      setForm(payload);
      setHasUnsavedChanges(false);
      onSave(payload);
      showNotification(
        `Open to Work settings ${payload.status === 'published' ? 'published globally' : 'saved as draft'}.`
      );
    } catch (err: any) {
      showNotification('Save failed: ' + (err.message || 'Firebase error'), 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: '#F5F5F5' }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
            }}
          >
            Open to Work &amp; Career Opportunities
          </h2>
          <p style={{ fontSize: '13px', color: '#A5A5A9', marginTop: '4px' }}>
            Manage career availability status, target locations, job disciplines, and engagement preferences.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowPreviewModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: '#F5F5F5',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>

          <button
            onClick={() => handleSave('draft')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: '#A5A5A9',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Save Draft
          </button>

          <button
            onClick={() => handleSave('published')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#FFFFFF',
              color: '#050505',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Save size={14} />
            <span>Publish Changes</span>
          </button>
        </div>
      </div>

      {/* Main Form Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Card: Availability & Section Master Toggle */}
        <div
          style={{
            padding: '28px',
            borderRadius: '14px',
            backgroundColor: '#0F1014',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                Public Section Status
              </div>
              <div style={{ fontSize: '12px', color: '#73737A', marginTop: '2px' }}>
                Toggle visibility on the public portfolio website.
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => updateField('enabled', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 500, color: form.enabled ? '#34D399' : '#A5A5A9' }}>
                {form.enabled ? 'Section Active & Visible' : 'Section Hidden'}
              </span>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A5A5A9', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Availability Status
              </label>
              <select
                value={form.availabilityStatus}
                onChange={(e) => updateField('availabilityStatus', e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#181920',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                <option value="Actively looking">Actively looking</option>
                <option value="Open to opportunities">Open to opportunities</option>
                <option value="Available for discussion">Available for discussion</option>
                <option value="Not currently looking">Not currently looking</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A5A5A9', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Badge Text
              </label>
              <input
                type="text"
                value={form.badgeText}
                onChange={(e) => updateField('badgeText', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#181920',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                }}
                placeholder="OPEN TO WORK"
              />
            </div>
          </div>
        </div>

        {/* Card: Section Copywriting */}
        <div
          style={{
            padding: '28px',
            borderRadius: '14px',
            backgroundColor: '#0F1014',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>
            Section Headings &amp; Narrative
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A5A5A9', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Section Eyebrow
              </label>
              <input
                type="text"
                value={form.sectionHeading}
                onChange={(e) => updateField('sectionHeading', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#181920',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                }}
                placeholder="OPEN TO OPPORTUNITIES"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A5A5A9', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Headline
              </label>
              <input
                type="text"
                value={form.headline}
                onChange={(e) => updateField('headline', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#181920',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                }}
                placeholder="Building What's Next."
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#A5A5A9', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Supporting Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#181920',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontSize: '13px',
                lineHeight: 1.6,
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        {/* Card: Preferred Target Locations */}
        <div
          style={{
            padding: '28px',
            borderRadius: '14px',
            backgroundColor: '#0F1014',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                Preferred International Locations ({form.preferredLocations.length})
              </div>
              <div style={{ fontSize: '12px', color: '#73737A', marginTop: '2px' }}>
                Add, toggle remote availability, indicate international relocation preferences, and reorder.
              </div>
            </div>
          </div>

          {/* Location List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {form.preferredLocations.map((loc, idx) => (
              <div
                key={loc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#15161C',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  opacity: loc.isVisible ? 1 : 0.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <MapPin size={16} color="var(--accent-silver)" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                      {loc.name}
                      {loc.city && <span style={{ fontSize: '12px', color: '#A5A5A9', fontWeight: 400 }}> &bull; {loc.city}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#73737A', marginTop: '2px' }}>
                      {loc.remoteAvailable && <span>Remote Eligible</span>}
                      {loc.relocationWilling && <span>&bull; Relocation Willing</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleToggleLocationVisibility(loc.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: loc.isVisible ? '#34D399' : '#73737A',
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    {loc.isVisible ? 'Visible' : 'Hidden'}
                  </button>

                  <button
                    onClick={() => handleMoveLocation(idx, 'up')}
                    disabled={idx === 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: idx === 0 ? '#444' : '#A5A5A9',
                      cursor: idx === 0 ? 'default' : 'pointer',
                      padding: '4px',
                    }}
                  >
                    <ChevronUp size={16} />
                  </button>

                  <button
                    onClick={() => handleMoveLocation(idx, 'down')}
                    disabled={idx === form.preferredLocations.length - 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: idx === form.preferredLocations.length - 1 ? '#444' : '#A5A5A9',
                      cursor: idx === form.preferredLocations.length - 1 ? 'default' : 'pointer',
                      padding: '4px',
                    }}
                  >
                    <ChevronDown size={16} />
                  </button>

                  <button
                    onClick={() => handleRemoveLocation(loc.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Location Row */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#121318',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#A5A5A9', marginBottom: '12px' }}>
              Add Preferred Location
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto auto auto', gap: '12px', alignItems: 'center' }}>
              <div>
                <LocationSelector
                  value={newLocName}
                  onChange={(loc, parts) => {
                    if (parts?.countryRegion) {
                      setNewLocName(parts.countryRegion);
                      setNewLocCity(parts.city || parts.stateProvince || '');
                    } else {
                      setNewLocName(loc);
                    }
                  }}
                  placeholder="Search country or city (e.g. Switzerland, Zurich, London)..."
                />
              </div>
              <input
                type="text"
                placeholder="Cities / Regions (e.g. Zurich / Geneva)"
                value={newLocCity}
                onChange={(e) => setNewLocCity(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#1A1B22',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#A5A5A9', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newLocRemote}
                  onChange={(e) => setNewLocRemote(e.target.checked)}
                />
                Remote
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#A5A5A9', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newLocRelocate}
                  onChange={(e) => setNewLocRelocate(e.target.checked)}
                />
                Relocate
              </label>
              <button
                onClick={handleAddLocation}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#050505',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card: Target Disciplines & Job Categories */}
        <div
          style={{
            padding: '28px',
            borderRadius: '14px',
            backgroundColor: '#0F1014',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
            Preferred Job Categories &amp; Disciplines ({form.preferredJobCategories.length})
          </div>
          <div style={{ fontSize: '12px', color: '#73737A', marginBottom: '20px' }}>
            Tags displayed in the target disciplines showcase.
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {form.preferredJobCategories.map((cat, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#181920',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '12px',
                  color: '#FFFFFF',
                }}
              >
                {cat}
                <button
                  onClick={() => handleRemoveCategory(cat)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#73737A',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Add job discipline..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#1A1B22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleAddCategory}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#FFFFFF',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Card: Dual CTAs */}
        <div
          style={{
            padding: '28px',
            borderRadius: '14px',
            backgroundColor: '#0F1014',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>
            Call to Action Buttons
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A5A5A9', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Primary CTA Button Text
              </label>
              <input
                type="text"
                value={form.primaryCtaText}
                onChange={(e) => updateField('primaryCtaText', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#181920',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                }}
                placeholder="Discuss an Opportunity ↗"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A5A5A9', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Secondary CTA Button Text
              </label>
              <input
                type="text"
                value={form.secondaryCtaText}
                onChange={(e) => updateField('secondaryCtaText', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#181920',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                }}
                placeholder="Download Resume ↓"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {showPreviewModal && (
        <AdminModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          size="lg"
          maxWidth="840px"
          ariaLabel="Open to Work Public Preview"
        >
          <AdminModalHeader
            title="Open to Work Public Preview"
            subtitle="Preview how your availability status, preferred roles, and relocation hubs render."
            icon={<Briefcase size={18} />}
            onClose={() => setShowPreviewModal(false)}
          />

          <AdminModalBody padding="28px">
            <div style={{ marginBottom: '24px' }}>
              <span
                style={{
                  fontSize: '11px',
                  color: '#4ADE80',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                }}
              >
                Preview Mode &bull; Live Card Rendering
              </span>
              <h3 style={{ fontSize: '24px', color: '#FFFFFF', marginTop: '6px', fontFamily: 'var(--font-display)', margin: '6px 0 0' }}>
                {form.headline}
              </h3>
              <p style={{ fontSize: '14.5px', color: '#A5A5A9', marginTop: '10px', lineHeight: 1.6 }}>
                {form.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {form.preferredJobCategories.map((c, i) => (
                <span
                  key={i}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                >
                  {c}
                </span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {form.preferredLocations.map((l) => (
                <div
                  key={l.id}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: '#0E1412',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFF' }}>{l.name}</div>
                  {l.city && <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{l.city}</div>}
                </div>
              ))}
            </div>
          </AdminModalBody>

          <AdminModalFooter
            onCancel={() => setShowPreviewModal(false)}
            cancelText="Close Preview"
          />
        </AdminModal>
      )}
    </div>
  );
};
