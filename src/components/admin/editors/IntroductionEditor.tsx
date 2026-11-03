import React, { useState, useEffect } from 'react';
import {
  User,
  Upload,
  Image as ImageIcon,
  Eye,
  Save,
  CheckCircle2,
  X,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Github,
  AlertCircle,
} from 'lucide-react';
import { ProfileData } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';

interface IntroductionEditorProps {
  initialProfile: ProfileData;
  onSave: (saved: ProfileData) => void;
  onCancel: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const IntroductionEditor: React.FC<IntroductionEditorProps> = ({
  initialProfile,
  onSave,
  onCancel,
  showNotification,
}) => {
  const [form, setForm] = useState<ProfileData>(() => ({
    ...initialProfile,
    firstName: initialProfile.firstName || initialProfile.name.split(' ')[0] || 'Ayush',
    lastName: initialProfile.lastName || initialProfile.name.split(' ').slice(1).join(' ') || 'Prakash',
    additionalName: initialProfile.additionalName || '',
    pronouns: initialProfile.pronouns || 'He/Him',
    headline:
      initialProfile.headline ||
      'AI & Automation Professional | Supply Chain & Operations | Generative AI | Claude AI | AI Agents | Building AI-Powered Products & Intelligent Business Solutions',
    countryRegion: initialProfile.countryRegion || 'India',
    city: initialProfile.city || 'Bengaluru',
    location: initialProfile.location || 'Bengaluru, Karnataka, India',
    profilePhoto: initialProfile.profilePhoto || '/images/creator/creator_1793142386775_044ada53_wall.png',
    coverImage: initialProfile.coverImage || '/images/creator/creator_1793142386775_044ada53_wall.png',
    email: initialProfile.email || 'ayushprakash0021@gmail.com',
    phone: initialProfile.phone || '+91 (Available on request)',
    linkedinUrl: initialProfile.linkedinUrl || 'https://www.linkedin.com/in/ayushprakash',
    githubUrl: initialProfile.githubUrl || 'https://github.com/Ayushprakash21',
    portfolioUrl: initialProfile.portfolioUrl || 'https://resume-portfolio.ayushprakash0021.workers.dev',
    status: initialProfile.status || 'published',
  }));

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const updateField = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'firstName' || key === 'lastName') {
        next.name = `${next.firstName || ''} ${next.lastName || ''}`.trim();
      }
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'profile' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Please upload a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showNotification('Image size exceeds 8MB limit.', 'error');
      return;
    }

    if (type === 'profile') setIsUploadingPhoto(true);
    else setIsUploadingCover(true);

    try {
      const asset = await cmsService.uploadMediaFile(
        file,
        type === 'profile' ? 'photo' : 'general',
        `${form.name} ${type === 'profile' ? 'Profile Photo' : 'Background Cover'}`
      );
      if (type === 'profile') {
        updateField('profilePhoto', asset.url);
      } else {
        updateField('coverImage', asset.url);
      }
      showNotification(`${type === 'profile' ? 'Profile photo' : 'Cover image'} uploaded successfully.`);
    } catch (err: any) {
      showNotification('Upload failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      if (type === 'profile') setIsUploadingPhoto(false);
      else setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (targetStatus: 'published' | 'draft') => {
    if (!form.firstName?.trim() || !form.lastName?.trim()) {
      showNotification('First name and Last name are required.', 'error');
      return;
    }
    if (!form.headline?.trim()) {
      showNotification('Professional headline is required.', 'error');
      return;
    }

    const payload: ProfileData = {
      ...form,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    };

    await cmsService.updateProfile(payload);
    setHasUnsavedChanges(false);
    onSave(payload);
    showNotification(
      targetStatus === 'published'
        ? 'Introduction published to live portfolio.'
        : 'Introduction draft saved successfully.'
    );
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: 600,
                color: '#F4F3EE',
                margin: 0,
              }}
            >
              Edit Introduction
            </h2>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                backgroundColor:
                  form.status === 'published'
                    ? 'rgba(74, 180, 120, 0.15)'
                    : 'rgba(214, 168, 84, 0.15)',
                color: form.status === 'published' ? '#6CE098' : '#E8CE7D',
                border: `1px solid ${
                  form.status === 'published'
                    ? 'rgba(74, 180, 120, 0.3)'
                    : 'rgba(214, 168, 84, 0.3)'
                }`,
              }}
            >
              {form.status === 'published' ? '● Published' : '○ Draft'}
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#A7B0A9',
              margin: '4px 0 0',
            }}
          >
            Manage your public personal identity, long professional headline, and contact coordinates.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(244, 243, 238, 0.05)',
              border: '1px solid rgba(244, 243, 238, 0.12)',
              color: '#F4F3EE',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(130, 148, 166, 0.12)',
              border: '1px solid rgba(130, 148, 166, 0.25)',
              color: '#8294A6',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Save size={14} />
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '6px',
              backgroundColor: '#4A5749',
              border: 'none',
              color: '#F4F3EE',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <CheckCircle2 size={14} />
            Publish
          </button>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(214, 168, 84, 0.1)',
            border: '1px solid rgba(214, 168, 84, 0.25)',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#E8CE7D',
            fontFamily: 'var(--font-body)',
          }}
        >
          <AlertCircle size={14} />
          You have unsaved changes in your introduction. Remember to Save Draft or Publish.
        </div>
      )}

      {/* Main Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Visual Assets (Cover + Avatar) */}
        <div
          style={{
            backgroundColor: '#141C19',
            border: '1px solid rgba(244, 243, 238, 0.08)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 600,
              color: '#F4F3EE',
              marginBottom: '16px',
            }}
          >
            Media &amp; Photographs
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Profile Photo */}
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
                Profile Photograph
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img
                  src={form.profilePhoto}
                  alt={form.name}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(244, 243, 238, 0.15)',
                    backgroundColor: '#1F2A23',
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: 'rgba(244, 243, 238, 0.06)',
                      border: '1px solid rgba(244, 243, 238, 0.12)',
                      borderRadius: '4px',
                      color: '#F4F3EE',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={12} />
                    {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'profile')}
                      style={{ display: 'none' }}
                      disabled={isUploadingPhoto}
                    />
                  </label>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: '#8E948D',
                      marginTop: '4px',
                    }}
                  >
                    Recommended: Square 800×800px JPG/PNG
                  </div>
                </div>
              </div>
            </div>

            {/* Background / Cover Image */}
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
                Background / Cover Image
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '120px',
                    height: '60px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    backgroundColor: '#1F2A23',
                  }}
                >
                  <img
                    src={form.coverImage || form.profilePhoto}
                    alt="Cover preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: 'rgba(244, 243, 238, 0.06)',
                      border: '1px solid rgba(244, 243, 238, 0.12)',
                      borderRadius: '4px',
                      color: '#F4F3EE',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <ImageIcon size={12} />
                    {isUploadingCover ? 'Uploading...' : 'Change Cover'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'cover')}
                      style={{ display: 'none' }}
                      disabled={isUploadingCover}
                    />
                  </label>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: '#8E948D',
                      marginTop: '4px',
                    }}
                  >
                    Aspect ratio 3:1 or 16:9 landscape
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Names & Pronouns */}
        <div
          style={{
            backgroundColor: '#141C19',
            border: '1px solid rgba(244, 243, 238, 0.08)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 600,
              color: '#F4F3EE',
              marginBottom: '16px',
            }}
          >
            Personal Information
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '18px',
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
                First Name <span style={{ color: '#D9534F' }}>*</span>
              </label>
              <input
                type="text"
                value={form.firstName || ''}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="e.g. Ayush"
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
                Last Name <span style={{ color: '#D9534F' }}>*</span>
              </label>
              <input
                type="text"
                value={form.lastName || ''}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="e.g. Prakash"
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
                Additional Name (Optional)
              </label>
              <input
                type="text"
                value={form.additionalName || ''}
                onChange={(e) => updateField('additionalName', e.target.value)}
                placeholder="e.g. Nickname or Native script"
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
                Pronouns (Optional)
              </label>
              <select
                value={form.pronouns || 'He/Him'}
                onChange={(e) => updateField('pronouns', e.target.value)}
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
              >
                <option value="He/Him">He / Him</option>
                <option value="She/Her">She / Her</option>
                <option value="They/Them">They / Them</option>
                <option value="Custom">Custom / Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Professional Headline (LinkedIn-style long description) */}
        <div
          style={{
            backgroundColor: '#141C19',
            border: '1px solid rgba(244, 243, 238, 0.08)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <label
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#F4F3EE',
              }}
            >
              Professional Headline <span style={{ color: '#D9534F' }}>*</span>
            </label>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: form.headline.length > 220 ? '#E8CE7D' : '#8E948D',
              }}
            >
              {form.headline.length} / 280 characters
            </span>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: '#8E948D',
              marginBottom: '10px',
            }}
          >
            Summarize your technical identity, core focus, platforms, and specialties across multi-disciplinary domains.
          </p>

          <textarea
            rows={4}
            value={form.headline}
            onChange={(e) => updateField('headline', e.target.value)}
            placeholder="AI & Automation Professional | Supply Chain & Operations | Generative AI | Claude AI | AI Agents..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: '#0E1412',
              border: '1px solid rgba(244, 243, 238, 0.12)',
              color: '#F4F3EE',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.5,
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Location & Region */}
        <div
          style={{
            backgroundColor: '#141C19',
            border: '1px solid rgba(244, 243, 238, 0.08)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 600,
              color: '#F4F3EE',
              marginBottom: '16px',
            }}
          >
            Location Coordinates
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px',
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
                Country / Region
              </label>
              <input
                type="text"
                value={form.countryRegion || ''}
                onChange={(e) => updateField('countryRegion', e.target.value)}
                placeholder="e.g. India"
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
                City
              </label>
              <input
                type="text"
                value={form.city || ''}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="e.g. Bengaluru"
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
                Formatted Public Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="e.g. Bengaluru, Karnataka, India"
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
          </div>
        </div>

        {/* Public Contact Details & Social Coordinates */}
        <div
          style={{
            backgroundColor: '#141C19',
            border: '1px solid rgba(244, 243, 238, 0.08)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 600,
              color: '#F4F3EE',
              marginBottom: '16px',
            }}
          >
            Public Contact &amp; Coordinates
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '18px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                  marginBottom: '6px',
                }}
              >
                <Mail size={12} />
                Public Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                  marginBottom: '6px',
                }}
              >
                <Phone size={12} />
                Phone / Availability Note
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                  marginBottom: '6px',
                }}
              >
                <Linkedin size={12} />
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={form.linkedinUrl}
                onChange={(e) => updateField('linkedinUrl', e.target.value)}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                  marginBottom: '6px',
                }}
              >
                <Github size={12} />
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={form.githubUrl}
                onChange={(e) => updateField('githubUrl', e.target.value)}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                  marginBottom: '6px',
                }}
              >
                <Globe size={12} />
                Custom Portfolio URL
              </label>
              <input
                type="url"
                value={form.portfolioUrl || ''}
                onChange={(e) => updateField('portfolioUrl', e.target.value)}
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
          </div>
        </div>

        {/* Sticky Footer Action Bar */}
        <div
          style={{
            position: 'sticky',
            bottom: '16px',
            backgroundColor: 'rgba(20, 28, 25, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(244, 243, 238, 0.12)',
            borderRadius: '8px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            zIndex: 10,
          }}
        >
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#A7B0A9' }}>
            {hasUnsavedChanges ? (
              <span style={{ color: '#E8CE7D' }}>● Unsaved changes</span>
            ) : (
              <span>All changes synchronized</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid rgba(244, 243, 238, 0.15)',
                color: '#C1C4BE',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: 'rgba(130, 148, 166, 0.12)',
                border: '1px solid rgba(130, 148, 166, 0.25)',
                color: '#8294A6',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                backgroundColor: '#4A5749',
                border: 'none',
                color: '#F4F3EE',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Publish Changes
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {showPreviewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#141C19',
              border: '1px solid rgba(244, 243, 238, 0.15)',
              borderRadius: '12px',
              maxWidth: '680px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#F4F3EE',
                }}
              >
                Public Introduction Preview
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A7B0A9',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview Card */}
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  position: 'relative',
                  height: '140px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#1E2822',
                  marginBottom: '50px',
                }}
              >
                <img
                  src={form.coverImage || form.profilePhoto}
                  alt="Cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <img
                  src={form.profilePhoto}
                  alt={form.name}
                  style={{
                    position: 'absolute',
                    bottom: '-35px',
                    left: '24px',
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #141C19',
                    backgroundColor: '#141C19',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#F4F3EE',
                    margin: 0,
                  }}
                >
                  {form.name}
                </h3>
                {form.pronouns && (
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: '#8E948D',
                    }}
                  >
                    ({form.pronouns})
                  </span>
                )}
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: '#C1C4BE',
                  lineHeight: 1.5,
                  margin: '8px 0 14px',
                }}
              >
                {form.headline}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#8294A6',
                  flexWrap: 'wrap',
                }}
              >
                <span>{form.location}</span>
                <span>&bull;</span>
                <span>{form.email}</span>
                <span>&bull;</span>
                <span style={{ color: '#6CE098' }}>{form.availabilityStatus}</span>
              </div>
            </div>

            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(244, 243, 238, 0.08)',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#4A5749',
                  border: 'none',
                  color: '#F4F3EE',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
